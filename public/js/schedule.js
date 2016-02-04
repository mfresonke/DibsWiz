/* global $ */
$(document).ready(function () {
  'use strict'
  // Initalize The Timepickers
  $('#pickadate-begin').pickatime()
  $('#pickadate-end').pickatime()

  // Button HTML
  const phoneFormHTML = `
  <div class="input-group">
    <span class="input-group-addon glyphicon glyphicon-phone" id="basic-addon1"></span>
    <input name="memberPhoneNumbers" type="text" class="form-control bfh-phone" data-format="+1 (ddd) ddd-dddd">
  </div>
  <br />`
  const userFormHTML = `
  <div class="input-group">
    <span class="input-group-addon glyphicon glyphicon-user" id="basic-addon1"></span>
    <input name="memberUsernames" type="text" class="form-control">
  </div>
  <br />`

  // Phone Variables
  const memberInfoDiv = $('#memberInfoContainer')

  // Add Phone Click Listener
  $('#btnAddPhone').click(function () {
    memberInfoDiv.append(phoneFormHTML)
    $.getScript('/bower_components/bootstrap-formhelpers/dist/js/bootstrap-formhelpers.min.js')
  })

  $('#btnAddUser').click(function () {
    memberInfoDiv.append(userFormHTML)
  })

  // Do Some jQuery
  $(document).on('click', 'p', function () {

  })
})
