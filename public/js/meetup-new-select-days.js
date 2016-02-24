/* global $ */
$(document).ready(function () {
  'use strict'

  // TODO: Figure out more elegant method for this. Query Parameters? Something Else?
  // specifies the minimum days ahead that is possible to schedule in advance.
  const minScheduleDaysAhead = 3
  // specifies maximum days in advance to allow scheduling.
  const maxScheduleMonthsAhead = 2
  const lookupTimesRepeatingURL = '/lookup/times/repeating'
  const lookupTimesSingleURL = '/lookup/times/single'

  // inputs
  const repeatingMeetupSwitch = $('#repeatingMeetupSwitch')
  const librarySelect = $('#librarySelect')
  const roomSelect = $('#roomSelect')
  const repeatingMeetupWeekdayPicker = $('[name="daysSelected"]')
  const singleMeetupDatepickerElem = $('#singleMeetupDatepicker')
  const singleMeetupDatepicker = (function () {
    // find what day a week from now is.
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + minScheduleDaysAhead)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + maxScheduleMonthsAhead)
    singleMeetupDatepickerElem.pickadate({
      // set dates calc'd earlier
      min: minDate,
      max: maxDate,
      // set formats
      format: 'dddd mmmm dd, yyyy',
      formatSubmit: submitDateFormat,
      // make it only send the hidden date format
      hiddenName: true
    })
    return singleMeetupDatepickerElem.pickadate('picker')
  })()

  // divs
  const singleMeetupDiv = $('#singleMeetupDiv')
  const repeatingMeetupDiv = $('#repeatingMeetupDiv')

  // Initalize The Timepickers
  const meetupTimeBeginElem = $('#meetupTimeBegin')
  const meetupTimeEndElem = $('#meetupTimeEnd')

  // initalize switches
  repeatingMeetupSwitch.bootstrapSwitch()

  const isRepeatingMeetup = function () {
    if (repeatingMeetupSwitch.prop('checked') === true) {
      return true
    }
    return false
  }

  // this function is assigned to various events to update the rooms and times
  //  depending on the current inputs
  const updateAvailableTimes = function () {
    const libraryID = librarySelect.val()
    // determine whether we are in single or repeating meetup mode
    if (isRepeatingMeetup()) {
      const selectedWeekdays = []
      repeatingMeetupWeekdayPicker.each(function (index, data) {
        const curr = $(this)
        if (curr.is(':checked')) {
          selectedWeekdays.push(curr.val())
        }
      })
      const payload = {
        libraryID: libraryID,
        selectedWeekdays: selectedWeekdays
      }
      $.post(lookupTimesSingleURL, payload, function (data, textStatus) {
        setTimepicker(meetupTimeBeginElem, data)
      })
    } else {
      // push date and lib to server
      const payload = {
        libraryID: libraryID,
        meetupDate: singleMeetupDatepicker.get('select')
      }
      $.post(lookupTimesRepeatingURL, payload, function (data, textStatus) {
        setTimepicker(meetupTimeEndElem, data)
      })
    }
  }

  const setTimepicker = function (meetupTimeElem, timesToDisplay) {
    meetupTimeElem.pickatime({
      disable: [true].concat(timesToDisplay)
    })
  }

  // // updateRoomsSelector updates the dropdown of the rooms with the specified
  // //  object. If left blank, will clear rooms selection and disable input.
  // const updateRoomsSelector = function (rooms) {
  //   if (!rooms) {
  //     // delete all rooms
  //     roomSelect
  //       .find('option')
  //       .remove()
  //       .end()
  //     // disable selector
  //     roomSelect.prop('disabled', true)
  //     return
  //   }
  //   for (let room of rooms) {
  //     roomSelect.append($('<option/>').val(key).text(value))
  //   }
  // }

  // add a function that keeps the page state correct depending on the state of the toggle.
  const repeatingSwitchToggleFunction = function (event, enabled) {
    if (enabled) {
      singleMeetupDiv.prop('hidden', true)
      repeatingMeetupDiv.prop('hidden', false)
    } else {
      singleMeetupDiv.prop('hidden', false)
      repeatingMeetupDiv.prop('hidden', true)
    }
    // update the times since the toggle state has changed.
    updateAvailableTimes()
  }

  // Add Event Handlers to SingleMeetupDatePicker
  singleMeetupDatepicker.on('set', updateAvailableTimes)

  // Add Event Handlers to Library Selector
  librarySelect.change(updateAvailableTimes)

  // Add Event Handlers to Repeating Meetup Switch
  repeatingMeetupSwitch.on('init.bootstrapSwitch', repeatingSwitchToggleFunction)
  repeatingMeetupSwitch.on('switchChange.bootstrapSwitch', repeatingSwitchToggleFunction)

  // Add Listeners to Weekday "Buttons" (actually checkboxes)
  repeatingMeetupWeekdayPicker.change(updateAvailableTimes)
})
