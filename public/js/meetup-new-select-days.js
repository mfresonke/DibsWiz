/* global $ */
$(document).ready(function () {
  'use strict'

  // inputs
  const repeatingMeetupSwitch = $('#repeatingMeetupSwitch')
  const singleMeetupDatepicker = $('#singleMeetupDatepicker')

  // divs
  const singleMeetupDiv = $('#singleMeetupDiv')
  const repeatingMeetupDiv = $('#repeatingMeetupDiv')

  // initalize switches
  repeatingMeetupSwitch.bootstrapSwitch()

  // initalize datepickers
  singleMeetupDatepicker.pickadate()

  // Initalize The Timepickers
  $('#pickadate-begin').pickatime()
  $('#pickadate-end').pickatime()

  // Add Event Handler to Repeating Meetup Switch
  repeatingMeetupSwitch.on('switchChange.bootstrapSwitch', function (event, enabled) {
    if (enabled) {
      singleMeetupDiv.prop('hidden', true)
      repeatingMeetupDiv.prop('hidden', false)
    } else {
      singleMeetupDiv.prop('hidden', false)
      repeatingMeetupDiv.prop('hidden', true)
    }
  })
})
