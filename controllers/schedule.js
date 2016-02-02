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
    daysOfWeek: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
    // Boring Stuff
    user: req.user,
    activePage: {schedule: true},
    scripts: [pickadate.base.js, pickadate.time.js, formHelpers.js, clientJS],
    stylesheets: [awesomeCheckboxCSS, pickadate.base.css, pickadate.time.css, formHelpers.css]
  })
})

router.post('/', function (req, res) {
  console.log('Meetup Name: ' + req.body.meetupName)
  console.log('Member Information: ' + req.body.memberInfo)
  console.log('Days Selected: ' + req.body.daysSelected.toString())
  console.log('Beginning Time Selected: ' + req.body.timeBegin)
  console.log('End Time Selected: ' + req.body.timeEnd)
  console.log('Submission Type: ' + req.body.submitType)
})

module.exports = router
