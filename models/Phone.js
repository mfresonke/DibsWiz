'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const phone = require('../helpers/phone')

// There are Three Possible User states
//  - Available
//    - User Has No Booking Attached and is Available to Book
//  - Booked
//    - User Has A Booking Attached
//  - Not Available
//    - User Has No Booking Attached but is Not Available to Book
const busyStates = ['Booked', 'Not Available']
exports.busyStates = busyStates

const Phone = Schema({
  // E164 formatted phone number.
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (num) {
        // make sure the number is in standard form
        const stdNum = phone.convertToStandard(num)
        if (!num || !stdNum) {
          return false
        }
        return num === stdNum
      }
    },
    unique: true
  },
  busy: {
    reason: {
      type: String,
      required: true,
      default: 'Not Available',
      enum: busyStates
    },
    until: {
      type: Date,
      // We make a busy until date some in time in the past by default to simplify querying.
      default: function () { return new Date(0) },
      required: true
    }
  }
}, {timestamps: true})

module.exports = mongoose.model('Phone', Phone)
