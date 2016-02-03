'use strict'
const path = require('path')
const router = require('express').Router()
const user = require('../helpers/user')
const phone = require('../helpers/phone')

const components = require('../helpers/components')
const pickadate = components.pickadate
const formHelpers = components.formHelpers
const awesomeCheckboxCSS = components.awesomeCheckboxCSS

const clientJS = path.join(components.publicJS, 'schedule.js')

// Used for displaying a day with embedded day num info
function DispDay (display, dayNum) {
  this.disp = display
  this.day = dayNum
}

router.get('/', user.isAuthenticated, function (req, res) {
  res.render('schedule', {
    // Fun Stuff!
    weekends: [new DispDay('Sun', 0), new DispDay('Sat', 6)],
    weekdays: [
      new DispDay('Mon', 1), new DispDay('Tues', 2), new DispDay('Wed', 3),
      new DispDay('Thurs', 4), new DispDay('Fri', 5)
    ],
    // Boring Stuff
    user: req.user,
    activePage: {schedule: true},
    scripts: [pickadate.base.js, pickadate.time.js, formHelpers.js, clientJS],
    stylesheets: [awesomeCheckboxCSS, pickadate.base.css, pickadate.time.css, formHelpers.css]
  })
})

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
  // Check that there is at least one day.
  if (this.daysSelected === 0) {
    return
  }
  this.timeBegin = body.timeBegin
  this.timeEnd = body.timeEnd
  this.submitType = body.submitType
}

router.post('/', user.isAuthenticated, function (req, res) {
  // Build the preview page and submit it ;)
  const meetup = new SubmittedMeetup(req.body)
})

module.exports = router
