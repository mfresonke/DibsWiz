'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const duration = require('../helpers/model').duration

const Meetup = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  reservations: {type: [{
    time: {type: Date, required: true},
    heldBy: {type: Schema.Types.ObjectId, ref: 'User'} // if this is not assigned, then there is currently nobody holding it.
  }],
    required: true
  },
  length: {type: duration, required: true},
  library: {
    type: Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  // Refers to the room field in library
  room: {
    type: Schema.Types.ObjectId,
    required: true
  },
  repeatWeekly: {
    type: Boolean,
    default: false
  }
}, {timestamps: true})

module.exports = mongoose.model('Meetup', Meetup)
