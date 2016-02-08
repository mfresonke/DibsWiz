'use strict'

const phone = require('node-phonenumber')
const Phone = require('../models/Phone')

/* Static Helper Methods */

/**
 * Callback for recieving a found or created phone number.
 *
 * @callback phoneCallback
 * @param {Error} err - error if error occured.
 * @param {Phone} phone - found or created phone object from DB.
 */

/**
 * Find a Phone Number, and Create It If It Doesn't Exist.
 *
 * @param {string} rawPhoneNum - The phone number we wish to search for or create.
 * @param {string} nickname - The User's Desired Nickname. Will override the current one if phone if it already exists.
 * @param {phoneCallback} phoneNumberCallback - A callback to run after phone number is found/created.
 */
exports.findOrCreate = function (userID, rawPhoneNum, phoneCallback) {
  const phoneNumber = convertToStandard(rawPhoneNum)
  // check that number is valid.
  if (!phoneNumber) {
    phoneCallback(new Error('Phone Number Invalid'), null)
    return
  }
  // Update the Phone Obj If It Exists
  Phone.findOneAndUpdate(
    {number: phoneNumber},
    // Updates the nickname, and adds an owner.
    {user: userID},
    {new: true},
    function (err, phone) {
      if (err) {
        throw new Error('Error while executing update phone query')
      }
      if (phone) {
        // We're done! Call the callback.
        phoneCallback(err, phone)
        return
      }
      // otherwise, create a new phone instance.
      Phone.create({number: phoneNumber, user: userID}, function (err, phone) {
        phoneCallback(err, phone)
      })
    }
  )
}

const lengthOfUSNumber = '+14071234567'.length

/**
 * Format a number to the proper US type, making sure input is valid.
 *
 * @param {string} rawPhoneNum - The phone number to convert.
 * @return {string|null} String if phone number is valid, null if phone number is invalid.
 */
const convertToStandard = function (rawPhoneNum) {
  const phoneUtil = phone.PhoneNumberUtil.getInstance()
  const phoneNumberObj = phoneUtil.parse(rawPhoneNum, 'US')
  if (phoneNumberObj === undefined) {
    // phone number could not be parsed. Not a valid phone number.
    return null
  }
  const phoneNumber = phoneUtil.format(phoneNumberObj, phone.PhoneNumberFormat.E164)
  if (phoneNumber.length !== lengthOfUSNumber) {
    // phone number has incorrect length. most likely invalid.
    return null
  }
  return phoneNumber
}
exports.convertToStandard = convertToStandard

// If I need to search phone and populate, steal it from member.js
