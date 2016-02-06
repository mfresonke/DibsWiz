'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  // Name associated with number. Specified by the person putting in the phone num,
  // or new user registering.
  nickname: {
    type: String,
    required: true
  },
  // Username associated with number.
  owner: {
    type: Schema.Types.ObjectId,
    // A number may not have an owner.
    required: false,
    // However, any person can have only one number assoicated.
    unique: true
  },
  // E164 formatted phone number.
  number: {
    type: String,
    required: true,
    unique: true
  },
  busy: {
    reason: {
      type: String,
      enum: busyStates
    },
    until: {
      type: Date,
      default: function () { return new Date(0) },
      required: true
    }
  }
})

module.exports = mongoose.model('Phone', Phone)
