/* global $ */
$(document).ready(function () {
  'use strict'
  const repeatingMeetupCheckbox = $('#repeatingMeetupCheckbox')

  // initalize switches
  repeatingMeetupCheckbox.bootstrapSwitch()

  // Initalize The Timepickers
  $('#pickadate-begin').pickatime()
  $('#pickadate-end').pickatime()

})
