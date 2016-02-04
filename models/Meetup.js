'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Meetup = Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  // How Represent Room??
  repeatWeekly: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Meetup', Meetup)
