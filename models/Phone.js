'use strict'
const mongoose = require('mongoose')


// Phone Represents one phone entity
let Phone = mongoose.Schema({
  // E164 formatted phone number.
  number: {
    type: String,
    required: true,
    unique: true
  }
})

module.exports = mongoose.model('Phone', Phone)
