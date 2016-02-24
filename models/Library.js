'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = require('../helpers/model')
const duration = model.duration

const styleStandard = 'Standard'
const styles = [styleStandard, 'Reading', 'High Top']
const features = ['AirMedia', 'Monitor']

const time = {
  minute: {type: Number, min: 0, max: 59},
  hour: {type: Number, min: 0, max: 23}
}

const hoursOfOperation = {
  days: [{
    type: Number,
    max: 6,
    min: 0,
    required: true
  }],
  // notice how these are NOT required. null === does not open/close. Used for 24hr scenarios.
  open: time,
  close: time
}

const Room = {
  name: {type: String, required: true},
  number: {type: String, required: true},
  capacity: {type: Number, required: true},
  style: {type: String, required: true, enum: styles, default: styleStandard},
  features: [{type: String, enum: features}]
}

const Library = new Schema({
  name: {type: String, required: true},
  // A Short Name Used as a Reference
  reference: {type: String, required: true},
  reservation: {
    type: {
      increments: {type: duration, required: true},
      lengths: {type: duration, required: true}
    },
    required: true
  },
  rooms: [Room],
  hours: {
    type: [hoursOfOperation],
    required: true
  }
})

// whenOpenOn takes in a date and returns the hours on that day
Library.methods.hoursOn = function (date) {
  if (!(date instanceof Date)) {
    throw new TypeError('Input not of Date type')
  }
  // for now, we just go off the day. In the future, we will have specific exceptions.
  const dayOfWeek = date.getDay()
  for (let hoursOfOp of this.hours) {
    for (let day of hoursOfOp.days) {
      if (day === dayOfWeek) {
        return hoursOfOp
      }
    }
  }
  // else, not open on that day.
  return null
}

module.exports = mongoose.model('Library', Library)
