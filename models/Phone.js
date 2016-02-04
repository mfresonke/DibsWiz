'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Phone Represents one phone entity
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
  }
})

module.exports = mongoose.model('Phone', Phone)
