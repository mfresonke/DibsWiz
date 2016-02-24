'use strict'

const router = require('express').Router()
const User = require('../models/User')
const Library = require('../models/Library')
const Meetup = require('../models/Meetup')
const Phone = require('../models/Phone')
const phone = require('../helpers/phone')
const moment = require('moment')
const config = require('../shared/config')

const userMaxBookAheadDays = config.userMaxBookAheadDays
const submitDateFormat = config.submitDateFormat

// Member Endpoint Looks Up Info about current Members
router.post('/member', function (req, res, next) {
  const username = req.body.username
  const phoneNumber = req.body.phoneNumber
  if (username) {
    User.findOne({username: username}, function (err, user, next) {
      if (err) {
        return next(err)
      }
      // If no user was found
      if (!user) {
        return res.json({invalid: 'username'})
      }
      // otherwise, we found the user. let's send it back!
      res.json({
        user: {
          username: user.username,
          displayName: user.name
        }
      })
    })
  } else if (phoneNumber) {
    const normPhoneNumber = phone.convertToStandard(phoneNumber)
    // If the phone number was bad,
    if (!normPhoneNumber) {
      console.log('Failed To Normalize Phone Number ' + phoneNumber)
      return res.json({invalid: 'phoneNumber'})
    }
    Phone
      .findOne({number: normPhoneNumber})
      .select({ _id: 1 })
      .exec(function (err, phone) {
        if (err) {
          return next(err)
        }
        if (!phone) {
          // Send a blank msg back with OK status, since this is not an error.
          return res.sendStatus(204)
        }
        // otherwise, the phone is valid, so let's find the user and send it back.
        User.findOne({phone: phone._id}, function (err, user) {
          if (err) {
            return next(err)
          }
          res.json({
            user: {
              username: user.username,
              displayName: user.name
            }
          })
        })
      })
  } else {
    res.sendStatus(400)
  }
})

// The Times Lookup Endpoint Looks up available library times based on
//  the given library and days/date
router.post('/times/repeating', function (req, res, next) {
  const libraryID = req.body.libraryID
  const selectedWeekdays = req.body.selectedWeekdays
})

router.post('/times/single', function (req, res, next) {
  const libraryID = req.body.libraryID
  // simply parse the given date
  const meetupDate = moment(req.body.meetupDate, submitDateFormat)
  // make a base TimeInclusionArray
  const timeArray = new TimeInclusionArray()
  dailyRoomSets(libraryID, [meetupDate])
    .then(function (dailyRoomSets) {
      if (dailyRoomSets.length !== 1) {
        throw new Error('Error: Daily Sets Longer than Anticipated.')
      }
      const dailyRoomSet = dailyRoomSets[0]
      // now we loop through what's left and build our array.
      for (let set of dailyRoomSet.roomSets) {
        if (set.roomSet.isEmpty()) {
          continue
        }
        // otherwise, add the time to the time array being built
        timeArray.addTime(set.time)
      }
      // return the time array. WHEW! WTF LOL
      res.json(timeArray.array)
    })
    .catch(function (err) {
      return next(err)
    })
})

function TimeInclusionArray () {
  this.array = [true]
}

TimeInclusionArray.prototype.addTime = function (timeMoment) {
  const hour = timeMoment.hour()
  const min = timeMoment.minute()
  if (min === 0) {
    this.array.push(hour)
    return
  }
  this.array.push([hour, min])
}

// dailyRoomSets takes in an array of dates (no time) and returns a promise holding
// an array of dailyRoomSets for those dates
const dailyRoomSets = function (libraryID, dates) {
  if (!(dates instanceof Array)) {
    throw new Error('Error! Dates parameter not an array.')
  } else if (dates.length === 0) {
    throw new Error('Empty Array Passed to Func')
  }
  // start searching for lib
  const libPromise = Library.findById(libraryID).exec()
  // build search dates for Meetup search
  const searchDates = []
  for (let date of dates) {
    searchDates.push({
      $gte: moment(date).startOf('day').toDate(),
      $lte: moment(date).endOf('day').toDate()
    })
  }
  // search meetup
  const meetupsPromise = Meetup.find({
    'reservations.time': {
      $or: searchDates
    }
  })
  return Promise.all([libPromise, meetupsPromise]).then(function (values) {
    const library = values[0]
    const meetups = values[1]
    if (!library) {
      throw new Error('Error. Library not found.')
    }
    const dailyRoomSets = []
    for (let date of dates) {
      dailyRoomSets.push(new DailyRoomSet(library, date))
    }
    // LOL. Dave Small would not be proud.
    for (let dailyRoomSet of dailyRoomSets) {
      for (let meetup of meetups) {
        dailyRoomSet.addReservationsToSet(meetup.targetRoom, meetup.reservations)
      }
    }
    // sweet! we're done. let's return the set.
    return dailyRoomSets
  })
}

// DailyRoomSet creates a base daily set based off of the given library and date!
function DailyRoomSet (library, date) {
  this.isWithinRange = function (inDate) {
    moment(date).isSame(inDate, 'day')
  }
  const hours = library.hoursOn(date)
  const increments = library.reservation.increments
  const lengths = library.reservation.lengths
  const currTime = moment(date).startOf('day')
  if (hours.open) {
    currTime.hour(hours.open.hour)
    currTime.minute(hours.open.minute)
  }
  const endTime = moment(currTime).add(1, 'day')
  if (hours.close) {
    // re-subtract that day added
    endTime.subtract(1, 'day')
    // set the hours absolutely.
    endTime.hour(hours.close.hour)
    endTime.minute(hours.close.minute)
    // now since the library actually closes, we must
    //  account for this in our reservations
    endTime.subtract(lengths.hours, 'hours')
    endTime.subtract(lengths.minutes, 'minutes')
  }
  const roomSets = []
  // now we begin the insane loop!
  while (currTime.isBefore(endTime)) {
    roomSets.push({
      time: moment(currTime),
      roomSet: new RoomSet(library.rooms)
    })
    // increment!
    currTime.add(increments.hours, 'hours')
    currTime.add(increments.minutes, 'minutes')
  }

  // export the availableRooms Var!
  this.roomSets = roomSets
  // add a method to add the reservation to the set.
  this.addReservationsToSet = function (targetRoom, reservations) {
    const roomSetItr = roomSets[Symbol.iterator]()
    let set = roomSetItr.next()
    for (let reservation of reservations) {
      if (!this.isWithinRange(reservation.time)) {
        continue
      }
      const reserveTime = moment(reservation.time)
      // find the right availSet
      while (!set.done &&
        !reserveTime.isSame(set.value.time, 'minute')) {
        set = roomSetItr.next()
      }
      // if we're done iterating, break the loop
      if (set.done) {
        break
      }
      // OK cool! So we've found our first reservation. Let's go ahead and remove all the rooms for this reservation
      const reserveTimeEnd = moment(reserveTime)
      reserveTimeEnd.add(increments.hours, 'hours')
      reserveTimeEnd.add(increments.minutes, 'minutes')

      while (!set.done &&
        set.value.time.isBefore(reserveTimeEnd)) {
        set.value.roomSet.delete(targetRoom)
        set = roomSetItr.next()
      }
    }
  }
}

function RoomSet (libraryRooms) {
  this.rawSet = new Set()
  for (let room of libraryRooms) {
    // Need to Stringify so Equality (===) Works Properly.
    this.rawSet.add(stringifyRoomID(room._id))
  }
}

// has is a helper method that automatically converts roomIDs to Strings
//  and checks for equality.
RoomSet.prototype.has = function (roomID) {
  return this.rawSet.has(stringifyRoomID(roomID))
}

RoomSet.prototype.delete = function (roomID) {
  return this.rawSet.delete(stringifyRoomID(roomID))
}

RoomSet.prototype.isEmpty = function () {
  return this.rawSet.size === 0
}

// Stringifies RoomID to string for set. Has no error if already string.
const stringifyRoomID = function (roomID) {
  if (typeof roomID !== 'string') {
    return roomID.toString()
  }
  return roomID
}
// The Rooms Lookup Endpoint Looks up What Rooms Are Available After a Specific
//  library, day/date, startTime, and endTime have been selected
// router.post('/rooms', function (req, res, next) {})

module.exports = router
