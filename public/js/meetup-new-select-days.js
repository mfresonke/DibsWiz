/* global $ */
$(document).ready(function () {
  'use strict'

  // TODO: Figure out more elegant method for this. Query Parameters? Something Else?
  // specifies the minimum days ahead that is possible to schedule in advance.
  const minScheduleDaysAhead = 3
  // specifies maximum days in advance to allow scheduling.
  const maxScheduleMonthsAhead = 2

  // inputs
  const repeatingMeetupSwitch = $('#repeatingMeetupSwitch')
  const singleMeetupDatepicker = $('#singleMeetupDatepicker')

  // divs
  const singleMeetupDiv = $('#singleMeetupDiv')
  const repeatingMeetupDiv = $('#repeatingMeetupDiv')

  // initalize switches
  repeatingMeetupSwitch.bootstrapSwitch()

  // initalize datepickers
  ;(function () {
    // find what day a week from now is.
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + minScheduleDaysAhead)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + maxScheduleMonthsAhead)
    singleMeetupDatepicker.pickadate({
      // set dates calc'd earlier
      min: minDate,
      max: maxDate,
      // set formats
      format: 'dddd mmmm dd, yyyy',
      formatSubmit: 'yyyy-mm-dd'
    })
  })()

  // Initalize The Timepickers
  $('#pickadate-begin').pickatime()
  $('#pickadate-end').pickatime()

  const repeatingSwitchToggleFunction = function (event, enabled) {
    if (enabled) {
      singleMeetupDiv.prop('hidden', true)
      repeatingMeetupDiv.prop('hidden', false)
    } else {
      singleMeetupDiv.prop('hidden', false)
      repeatingMeetupDiv.prop('hidden', true)
    }
  }

  // Add Event Handlers to Repeating Meetup Switch
  repeatingMeetupSwitch.on('init.bootstrapSwitch', repeatingSwitchToggleFunction)
  repeatingMeetupSwitch.on('switchChange.bootstrapSwitch', repeatingSwitchToggleFunction)
})
