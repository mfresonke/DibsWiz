'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const meetTime = {
  hour: {type: Number, min: 0, max: 23, required: true},
  minute: {type: Number, min: 0, max: 59, default: 0}
}

const weeklyMeetup = {
  weekday: {type: Number, min: 0, max: 6, required: true},
  start: meetTime,
  end: meetTime
}

const Group = Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [{
      phone: {type: Schema.Types.ObjectId, ref: 'Phone'},
      // Used if phone has no name associated.
      nickname: String
    }],
    required: true
  },
  weeklyMeetups: [weeklyMeetup]
})

module.exports = mongoose.model('Group', Group)
