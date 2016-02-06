'use strict'

exports.duration = {
  minutes: {type: Number, min: 0, max: 59, required: true},
  hours: {type: Number, min: 0, max: 23, required: true}
}

exports.time = {
  minute: {type: Number, min: 0, max: 59},
  hour: {type: Number, min: 0}
}
