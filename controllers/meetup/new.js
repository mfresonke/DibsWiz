'use strict'

const express = require('express')
const path = require('path')
const moment = require('moment')
const Group = require('../../models/Group')
const User = require('../../models/User')
const Library = require('../../models/Library')
const phone = require('../../helpers/phone')
const routes = require('./routes')

/* Components */
// lib helpers
const components = require('../../helpers/components')
const formHelpers = components.formHelpers
const awesomeCheckboxCSS = components.awesomeCheckboxCSS
const pickadate = components.pickadate
const bootstrapSwitch = components.bootstrapSwitch
// custom JS
const selectGroupJS = path.join(components.publicJS, 'meetup.js')
const chooseDateJS = path.join(components.publicJS, 'schedule.js')

/* Routers */

// Routes
const router = express.Router()
const prefix = routes.newPrefix
const selectGroupRoute = '/'
const selectDaysNoIDRoute = '/group'
const selectDaysWithIDRoute = path.join(selectDaysNoIDRoute, ':id')

// Paths (full URLs)
const selectDaysNoIDURL = path.join(prefix, selectDaysNoIDRoute)

/* STEP ONE: Select or Create a Group */

router.route(selectGroupRoute)
  // create new group page
  .get(function (req, res, next) {
    // TODO: Re-render prev-made group (in case user hit back)
    // const group = req.session.group
    const user = req.user
    // get groups assoc. with user.
    Group.find({'members.phone': user.phone}, function (err, groups) {
      if (err) {
        return next(err)
      }
      res.render('meetup/new/select-group', {
        // Data for template goes here.
        user: req.user,
        groups: groups,
        nextURL: selectDaysNoIDURL,
        scripts: [formHelpers.js, selectGroupJS],
        stylesheets: [formHelpers.css]
      })
    })
  })
  // when someone submits a new group
  .post(function (req, res, next) {
    const submission = req.body
    const newGroup = new Group({
      name: submission.groupName,
      // create base members object with user themselves as a member.
      members: [{
        phone: req.user.phone,
        role: 'admin'
      }]
    })
    // Let's start our callback doosey to process the things that have been given!
    // Why not usernames to start?
    processUsernameSubmissions(submission.usernames, function (err, phoneIDs) {
      if (err) {
        return next(err)
      }
      // Let's add the phoneIDs we've retrieved into our new group object!
      for (let phoneID of phoneIDs) {
        newGroup.members.push({phone: phoneID})
      }
      // OK Cool! Now that we took care of the usernames, let's do the phone submissions!
      processPhoneSubmissions(submission.phoneNumbers, submission.phoneNames, function (err, phoneIDs, nicknames) {
        if (err) {
          return next(err)
        }
        // very similar to usernames above, BUT, we also have nicknames to account for!
        for (let i = 0; i !== phoneIDs.length; ++i) {
          newGroup.members.push({
            phone: phoneIDs[i],
            nickname: nicknames[i]
          })
        }
        console.log(newGroup)
        // Nice! Let's save the group we made!
        newGroup.save()
          .then(function (group) {
            // save the group to the session.
            req.session.group = group
            // redirect them to the next page.
            res.redirect(path.join(selectDaysNoIDURL, group._id.toString()))
          })
          .catch(function (err) {
            return next(err)
          })
      })
    })
  })

// Processes the given usernames from the submission.
// finds the associated phone IDs from the users.
// callback is of form function (err, phoneIDs).
// If no error occurs, will always return at least an empty array.
const processUsernameSubmissions = function (usernames, callback) {
  if (!usernames) {
    return callback(null, [])
  }
  // do regular single-to-array conversion to generify code.
  if (typeof usernames === 'string') {
    usernames = [usernames]
  }
  User
    .find({username: {$in: usernames}})
    .select('phone')
    .exec(function (err, users) {
      if (err) {
        return callback(err)
      }
      // make sure we were able to find ALL of the users given.
      if (users.length !== usernames.length) {
        return callback(new Error('There was an error retrieving all users from the DB.'))
      }
      const phoneIDs = []
      // Extract the phone IDs from each user obj
      for (let user of users) {
        phoneIDs.push(user.phone)
      }
      return callback(null, phoneIDs)
    })
}

// Processes the raw phone names and phone nums from the submission.
// callback is of form function (err, phoneIDs, nicknames).
// If no error occurs, will always pass at a minimum two empty arrays.
const processPhoneSubmissions = function (phoneNums, phoneNames, callback) {
  // check if we even have any phone items to deal with.
  if (!phoneNums || !phoneNames) {
    // if not, simply call the callback with blank arrays.
    return callback(null, [], [])
  }
  // if we're dealing with the single case, let's put them in arrays to allow
  //  our code to be generic.
  if (typeof phoneNames === 'string' && typeof phoneNums === 'string') {
    phoneNames = [phoneNames]
    phoneNums = [phoneNums]
  }
  // perform some basic validation by checking that the arrays are of identical size.
  if (phoneNames.length !== phoneNums.length) {
    return callback(new Error('Phone Numbers and Phone Names from Post Not Of Equal Length!'))
  }
  // holds the to-be-inserted phone objects.
  const phoneIDs = []
  const phoneItr = phoneNums[Symbol.iterator]()
  let currItr = phoneItr.next()
  // here we define a callback that will loop through all the phones, add
  //  them to the phoneIDs array, and then finally call the ending callback
  //  when finished.
  const findPhonesCB = function (err, newPhone) {
    if (err) {
      return callback(err)
    }
    phoneIDs.push(newPhone._id)
    // now that we've pushed the phone ID, go to the next phone iteration
    currItr = phoneItr.next()
    if (currItr.done) {
      return callback(null, phoneIDs, phoneNames)
    }
    // otherwise, we're not done. let's call phone.findOrCreate again.
    phone.findOrCreate(currItr.value, findPhonesCB)
  }
  // now we kickstart the process by calling it once here!
  phone.findOrCreate(currItr.value, findPhonesCB)
}

/* STEP 2: Select Days */
router.route(selectDaysWithIDRoute)
  .get(function (req, res, next) {
    const user = req.user
    // Start off by creating the base select page off of info we already have.
    Promise.all([
      selectPage(user),
      retrieveAndVerifyGroup(user, req.params.id)
    ])
      .then(function (results) {
        const page = results[0]
        const group = results[1]
        page.group = group
        res.render('meetup/new/select-date', page)
      })
      .catch(function (err) {
        return next(err)
      })
  })

// Returns a promise containing a valid group or throws an error if not valid.
const retrieveAndVerifyGroup = function (user, groupID) {
  // Get and Verify Group
  return Group.findById(groupID).exec()
    .then(function (group) {
      // check if the group even exists
      if (!group) {
        throw new Error('Group not Found')
      }
      // check if the group was found
      if (!group.isMember(user.phone)) {
        throw new Error('User not a member of Group')
      }
      return group
    })
}
// Returns a promise for a page with filled in libraries.
const selectPage = function (user) {
  return Library.find().select('_id name').exec()
    .then(function (libraries) {
      return {
        // To Be Filled Info
        group: null,
        // User Defined Vars
        user: user,
        // Visual Helper Variables
        libraries: libraries,
        weekends: [new DispDay('Sun', 0), new DispDay('Sat', 6)],
        weekdays: [
          new DispDay('Mon', 1), new DispDay('Tues', 2), new DispDay('Wed', 3),
          new DispDay('Thurs', 4), new DispDay('Fri', 5)
        ],
        // Navbar Vars
        activePage: {schedule: true},
        // Scripts and CSS
        scripts: [pickadate.base.js, pickadate.time.js, formHelpers.js, chooseDateJS, bootstrapSwitch.js],
        stylesheets: [awesomeCheckboxCSS, pickadate.base.css, pickadate.time.css, formHelpers.css, bootstrapSwitch.css]
      }
    })
}

// Used for displaying a day with embedded day num info
function DispDay (display, dayNum) {
  this.disp = display
  this.day = dayNum
  // set the base object
  const todayNum = moment().day()
  let nextDateObj = moment().day(dayNum)
  if (dayNum <= todayNum) {
    nextDateObj.add(1, 'week')
  }
  this.nextDate = nextDateObj.format('M/D')
}

const minValidNameLen = 1

function SubmittedMeetup (body) {
  this.isValid = false

  /* Perform Basic (Synchronous) Validation and Set Properties */

  // Meetup Name
  const name = body.meetupName
  if (typeof name !== 'string' && name.length < minValidNameLen) {
    return
  }
  this.name = name

  // Member Usernames.
  const usernames = body.memberUsernames
  // Check the case that the usernames are in an Array
  if (usernames instanceof Array) {
    // If so, no manip. is necessary. Directly assign them.
    this.usernames = usernames
  } else if (typeof usernames === 'string') {
    // Put the lone username in an array.
    this.usernames = [usernames]
  } else {
    // Then there are no usernames. Make this.usernames an empty array.
    this.usernames = []
  }

  // Member Phone Numbers.
  const phoneNumbers = body.memberPhoneNumbers
  this.phoneNumbers = []
  if (phoneNumbers instanceof Array) {
    for (let phoneNumber of phoneNumbers) {
      const stdPhoneNum = phone.convertToStandard(phoneNumber)
      // if number is valid, add to array.
      if (stdPhoneNum) {
        this.phoneNumbers.push(stdPhoneNum)
      }
    }
  } else if (typeof phoneNumbers === 'string') {
    const stdPhoneNum = phone.convertToStandard(phoneNumbers)
    if (stdPhoneNum) {
      this.phoneNumbers.push(stdPhoneNum)
    }
  }

  // Check that there is at least one username or phone.
  if (this.usernames.length === 0 && this.phoneNumbers.length === 0) {
    // Then this submission is not valid. Return.
    return
  }

  // Begin Days Parse
  const daysSelectedStrs = body.daysSelected
  this.daysSelected = []
  for (let dayStr of daysSelectedStrs) {
    // Parse the day numbers into
    const day = parseInt(dayStr, 10)
    if (typeof day === 'number') {
      this.daysSelected.push(day)
    }
  }
  // Check that there is at least one day selected.
  if (this.daysSelected === 0) {
    return
  }
  console.log(body.timeBegin)
  console.log(body.timeEnd)
  this.timeBegin = body.timeBegin
  this.timeEnd = body.timeEnd
  this.submitType = body.submitType
}

module.exports = router
