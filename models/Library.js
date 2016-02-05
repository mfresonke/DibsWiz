'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = require('../helpers/model')
const duration = model.duration
const time = model.time

const styleStandard = 'Standard'
const styles = [styleStandard, 'Reading', 'High Top']
const features = ['AirMedia', 'Monitor']

const hoursOfOperation = {
  days: [{
    type: Number,
    max: 6,
    min: 0,
    required: true
  }],
  open: time,
  close: time
}

const Room = new Schema({
  name: {type: String, required: true},
  number: {type: String, required: true},
  capacity: {type: Number, required: true},
  style: {type: String, required: true, enum: styles, default: styleStandard},
  features: [{type: String, enum: features}]
})

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

module.exports = mongoose.model('Library', Library)
