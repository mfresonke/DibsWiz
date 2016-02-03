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

router.get('/', user.isAuthenticated, function (req, res) {
  res.render('schedule', {
    // Fun Stuff!
    weekends: ['Sun', 'Sat'],
    weekdays: ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri'],
    // Boring Stuff
    user: req.user,
    activePage: {schedule: true},
    scripts: [pickadate.base.js, pickadate.time.js, formHelpers.js, clientJS],
    stylesheets: [awesomeCheckboxCSS, pickadate.base.css, pickadate.time.css, formHelpers.css]
  })
})

const minValidNameLen = 1

function SubmittedMeetup (req) {
  this.isValid = false

  /* Perform Basic (Synchronous) Validation and Set Properties */

  // Meetup Name
  const name = req.body.meetupName
  if (typeof name !== 'string' && name.length < minValidNameLen) {
    return
  }
  this.name = name

  // Member Usernames.
  const usernames = req.body.memberUsernames
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
  const phoneNumbers = req.body.memberPhoneNumbers
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
  this.daysSelected = req.body.daysSelected
  this.timeBegin = req.body.timeBegin
  this.timeEnd = req.body.timeEnd
  this.submitType = req.body.submitType

}

router.post('/', user.isAuthenticated, function (req, res) {
  // Build the preview page and submit it ;)
  res.send('Dummy Test Text!')
})

module.exports = router
