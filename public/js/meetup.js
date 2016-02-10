/* global $ */
$(document).ready(function () {
  'use strict'
  // Add By Number Fields
  const modalAddByCell = $('#modalAddByCell')
  const btnAddUserByNum = $('#btnAddUserByNumber')
  const inputDisplayName = $('#inputDisplayName')
  const inputPhoneNumber = $('#inputPhoneNumber')
  // Add By Username Fields
  const btnAddUserByUsername = $('#btnAddUserByUsername')
  const modalAddByUsername = $('#modalAddByUsername')
  const inputUsername = $('#inputUsername')
  // Other Elements
  const ctrMembers = $('#ctrMembers')

  const lookupDisplayNameURL = '/member/lookup'
  // const formhelpersURL = '/bower_components/bootstrap-formhelpers/dist/js/bootstrap-formhelpers.min.js'

  const hideModal = function (modal) {
    modal.modal('hide')
  }

  const clearFields = function () {
    inputDisplayName.val('')
    inputPhoneNumber.val('')
    inputUsername.val('')
    $('.alert-danger').addClass('hidden')
    $('#divUsername').removeClass('has-error')
    $('#divPhoneNumber').removeClass('has-error')
  }

  const addToList = function (user) {
    const displayName = user.displayName
    if (!displayName) {
      throw new Error('Error. No valid display name in user.')
    }
    if (user.username) {
      newUserRep(displayName, user.username)
    } else if (user.phoneNumber) {
      newPhoneRep(displayName, user.phoneNumber)
    }
  }

  const newUserRep = function (displayName, username) {
    const userRep = $('#userRep').clone()
    userRep.find('#usernameSubtext').text(username)
    userRep.removeAttr('id')
    userRep.removeClass('hidden')
    // Show the hidden button.
    const button = userRep.find('button')
    button.removeClass('disabled')
    // Set Display Vals Properly
    userRep.find('input')
            .attr('name', 'users')
            .val(displayName)
    // Create a Hidden Form Element to Transfer Add'tl data
    const hiddenForm = $('<input>')
                          .attr('type', 'hidden')
                          .attr('name', 'usernames')
                          .val(username)
    // Add an OnClick to Remove the Element and it's associated hidden form
    button.click(function () {
      userRep.remove()
      hiddenForm.remove()
    })
    // Add both elements to page.
    ctrMembers.append(userRep)
    ctrMembers.append($(hiddenForm))
  }

  const newPhoneRep = function (displayName, phoneNumber) {
    const newUserRep = $('#newUserRep').clone()
    newUserRep.find('#phoneSubtext').text(phoneNumber)
    newUserRep.removeAttr('id')
    newUserRep.removeClass('hidden')
    const button = newUserRep.find('button')
    button.removeClass('disabled')
    // Set Display Vals Properly
    newUserRep.find('input')
            .attr('name', 'phones')
            .val(displayName)

    // Create a Hidden Form Element to Transfer Add'tl data
    const hiddenForm = $('<input>')
                          .attr('type', 'hidden')
                          .attr('name', 'phones-numbers')
                          .val(phoneNumber)
    // Add an OnClick to Remove the Element
    button.click(function () {
      newUserRep.remove()
      hiddenForm.remove()
    })
    // Add both elements to page.
    ctrMembers.append(newUserRep)
    ctrMembers.append($(hiddenForm))
  }

  // Checks if user already exists based on information.
  // callback is of form callback = function(user)
  // Is guaranteed to send back a user of some form.
  const checkUser = function (user, callback) {
    // Query the Server to see if user already exists.
    $.post({
      url: lookupDisplayNameURL,
      data: user,
      success: function (data, status, rand) {
        if (!data) {
          console.log('User does not exist on server, but is valid. Sending back original user.')
          return callback(user)
        }
        // If an already-valid user was found,
        if (data.user) {
          // overwrite the user object with the found user.
          user = data.user
          // Otherwise, check if any of the data was invalid.
        } else if (data.invalid) {
          // If so, erase that the invalid data.
          user[data.invalid] = null
        }
        return callback(user)
      }
    })
  }

  /* Button Click Handlers */

  btnAddUserByNum.click(function () {
    // Create New User Object Based on Fields
    const user = {
      displayName: inputDisplayName.val(),
      phoneNumber: inputPhoneNumber.val()
    }
    checkUser(user, function (user) {
      if (user.phoneNumber) {
        addToList(user)
        clearFields()
        hideModal(modalAddByCell)
      } else {
        $('#divPhoneNumber').addClass('has-error')
        $('.alert-danger').removeClass('hidden')
      }
    })
  })

  btnAddUserByUsername.click(function () {
    const user = {
      username: inputUsername.val()
    }
    checkUser(user, function (user) {
      if (user.username) {
        addToList(user)
        clearFields()
        hideModal(modalAddByUsername)
      } else {
        $('.alert-danger').removeClass('hidden')
        $('#divUsername').addClass('has-error')
      }
    })
  })

  /* Modal Show Handlers */
  modalAddByCell.on('shown.bs.modal', function (e) {
    // load the cell helper script
    // $.getScript(formhelpersURL)
  })
  modalAddByUsername.on('hidden.bs.modal', function (e) {
  // do something...
  })
})
