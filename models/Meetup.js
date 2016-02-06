'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const duration = {
  minutes: {type: Number, min: 0, max: 59, required: true},
  hours: {type: Number, min: 0, max: 23, default: 0}
}

const Meetup = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  time: {
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
  // Refers to the room field in library
  room: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Meetup', Meetup)
