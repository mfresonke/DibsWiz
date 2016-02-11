/* global $ */
$(document).ready(function () {
  'use strict'
  // Add By Number Fields
  const modalAddByCell = $('#modalAddByCell')
  const btnAddUserByNum = $('#btnAddUserByNumber')
  const inputDisplayName = $('#inputDisplayName')
  const inputPhoneNumber = $('#inputPhoneNumber')
  const alertInvalidPhoneNum = $('#alertInvalidPhoneNumber')
  // Add By Username Fields
  const btnAddUserByUsername = $('#btnAddUserByUsername')
  const modalAddByUsername = $('#modalAddByUsername')
  const inputUsername = $('#inputUsername')
  const alertInvalidUsername = $('#alertInvalidUsername')
  // Other Elements
  const ctrMembers = $('#ctrMembers')

  const lookupDisplayNameURL = '/member/lookup'

  // addedUsers holds the primary key of the user: either their already-
  // registered username, or their to-be-registered phone number.
  // the current user's username is added by default.
  const addedUsers = new Map([[$('#userRep').find('#usernameSubtext').text(), true]])

  const hideModal = function (modal) {
    modal.modal('hide')
  }

  const clearFields = function () {
    inputDisplayName.val('')
    inputPhoneNumber.val('')
    inputUsername.val('')
    alertInvalidPhoneNum.addClass('hidden')
    alertInvalidUsername.addClass('hidden')
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
                          .attr('name', 'phone-numbers')
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

  // checkAndAddToMap takes in a user and checks if it part of the map,
  // returning true or false. If the user is not part of the map, in addition
  // to returning false, the user will be added to the map.
  const checkAndAddToMap = function (user) {
    let varToCheck = null
    if (user.username) {
      varToCheck = user.username
    } else if (user.phoneNumber) {
      varToCheck = user.phoneNumber
    } else {
      throw new Error('User Not Valid to Check')
    }

    const inMap = addedUsers.get(varToCheck)
    if (inMap) {
      return true
    }
    addedUsers.set(varToCheck, true)
    return false
  }

  const showModalErr = function (alert, input, message) {
    input.addClass('has-error')
    alert.text(message)
    alert.removeClass('hidden')
  }

  const addUserByNumErr = function (message) {
    showModalErr(alertInvalidPhoneNum, inputPhoneNumber, message)
  }

  const addUserByUsernameErr = function (message) {
    showModalErr(alertInvalidUsername, inputUsername, message)
  }

  /* Button Click Handlers */

  btnAddUserByNum.click(function () {
    // Create New User Object Based on Fields
    const user = {
      displayName: inputDisplayName.val(),
      phoneNumber: inputPhoneNumber.val()
    }
    checkUser(user, function (user) {
      // If the user is returned missing data...
      if (!user.username && !user.phoneNumber) {
        addUserByNumErr('The phone number you entered is invalid.')
      } else if (checkAndAddToMap(user)) {
        addUserByNumErr('The phone number you entered has already been added.')
      } else {
        // we gucci
        addToList(user)
        clearFields()
        hideModal(modalAddByCell)
      }
    })
  })

  btnAddUserByUsername.click(function () {
    const user = {
      username: inputUsername.val()
    }
    checkUser(user, function (user) {
      if (!user.username) {
        addUserByUsernameErr('Username is does not exist.')
      } else if (checkAndAddToMap(user)) {
        addUserByUsernameErr('Username has already been added.')
      } else {
        addToList(user)
        clearFields()
        hideModal(modalAddByUsername)
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
