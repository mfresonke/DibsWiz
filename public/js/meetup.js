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

  const ctrMembers = $('#ctrMembers')

  const lookupDisplayNameURL = '/member/lookup'

  const hideModal = function (modal) {
    modal.modal('hide')
  }

  const clearFields = function () {
    inputDisplayName.val('')
    inputPhoneNumber.val('')
    inputUsername.val('')
    $('.alert-danger').addClass('hidden')
    $('#divUsername').removeClass('has-error')
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

  function User (dispNameOrUsername, phoneNum) {
    if (arguments.length === 1) {
      // This means we were just passed a username
      this.username = dispNameOrUsername
    }
    if (arguments.length === 2) {
      this.displayName = dispNameOrUsername
      this.phoneNumber = phoneNum
    }
  }

  // Takes callback of type function(userFound(boolean)). Sets data to object.
  User.prototype.fillFromServer = function (callback) {
    // Check if we have already recieved the appropriate info.
    if (this.displayName && this.username) {
      return callback(true)
    }
    // else query server for their display name
    const payload = {
      username: this.username,
      phoneNumber: this.phoneNumber
    }
    const user = this
    $.post({
      url: lookupDisplayNameURL,
      data: payload,
      success: function (data, status, rand) {
        if (!data) {
          console.log('Could Not Recieve Username, or user does not exist.')
          return callback(false)
        }
        // Set the username, whether we recieved it or not.
        if (data.username) {
          user.username = data.username
        } else {
          // Set it null since the server did not confirm our request
          user.username = null
        }

        if (data.displayName) {
          user.displayName = data.displayName
          return callback(true)
        }
        throw new Error('An Error occurred while querying server.')
      }
    })
  }

  // Will only return true after a fillFromServer call!
  User.prototype.isCurrentUser = function () {
    if (this.username && this.displayName) {
      return true
    }
    return false
  }

  User.prototype.addToList = function () {
    // Now we need to check if they are a current user, or a new one to add.
    if (this.isCurrentUser()) {
      newUserRep(this.displayName, this.username)
    } else {
      newPhoneRep(this.displayName, this.phoneNumber)
    }
  }

  btnAddUserByNum.click(function () {
    const displayName = inputDisplayName.val()
    const user = new User(displayName, inputPhoneNumber.val())
    user.fillFromServer(function (foundUser) {
      if (!foundUser) {
        // console.log('Could Not Find User ' + displayName)
      }
      user.addToList()
      clearFields()
      return hideModal(modalAddByCell)
    })
  })

  btnAddUserByUsername.click(function () {
    const username = inputUsername.val()
    const user = new User(username)
    user.fillFromServer(function (foundUser) {
      if (foundUser) {
        user.addToList()
        clearFields()
        return hideModal(modalAddByUsername)
      } else {
        $('.alert-danger').removeClass('hidden')
        $('#divUsername').addClass('has-error')
        console.log('Could Not Find User ' + username)
      }
    })
  })
})
