'use strict'
const path = require('path')
const router = require('express').Router()

const components = require('../helpers/components')
const pickadate = components.pickadate
const formHelpers = components.formHelpers
const awesomeCheckboxCSS = components.awesomeCheckboxCSS

const clientJS = path.join(components.publicJS, 'schedule.js')

router.get('/', function (req, res) {
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

router.post('/', function (req, res) {
  const meetupName = req.body.meetupName
  const memberPhoneNumbers = req.body.memberPhoneNumbers
  const memberUsernames = req.body.memberUsernames
  const daysSelected = req.body.daysSelected
  const timeBegin = req.body.timeBegin
  const timeEnd = req.body.timeEnd
  const submitType = req.body.submitType


})

module.exports = router
