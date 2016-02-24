'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const duration = {
  minutes: {type: Number, min: 0, max: 59, required: true},
  hours: {type: Number, min: 0, max: 23, default: 0}
}

const Meetup = new Schema({
  library: {
    type: Schema.Types.ObjectId,
    ref: 'Library',
    requried: true
  },
  // Refers to the room field in library
  targetRoom: {
    type: Schema.Types.ObjectId,
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  reservations: {
    type: [{
      time: {type: Date, required: true},
      // the booked variable is assigned once the reservation has been filled.
      // while the booked variable itself is necessarily optional, everything within
      //  it is not. In other words, it's all or nothing.
      booked: {
        by: {type: Schema.Types.ObjectId, ref: 'User', required: true}, // if this is not assigned, then there is currently nobody holding it.
        room: {type: Schema.Types.ObjectId, required: true} // actual room booked. May be different than targetRoom
      }
    }],
    required: true
  },
  length: {type: duration, required: true}
}, {timestamps: true})

module.exports = mongoose.model('Meetup', Meetup)
