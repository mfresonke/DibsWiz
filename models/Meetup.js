'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Meetup = Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  library: {
    type: String
  },
  memberPhones: [{
    type: Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  }],
  meetupDays: [{
    type: Number,
    required: true,
    min: 0,
    max: 6
  }],
  startTime: {
    hour: {
      type: Number,
      min: 0,
      max: 23
    }, min: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  endTime: {
    hour: {
      type: Number,
      min: 0,
      max: 23
    }, min: {
      type: Number,
      min: 0,
      max: 59
    }
  }

})

module.exports = mongoose.model('Meetup', Meetup)
