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

const roleParticipant = 'participant'
const roleAdmin = 'admin'

const roles = [
  roleAdmin, // have full administrative rights. Can delete group.
  roleParticipant // basic role. Has no rights other than themselves.
]

const Group = Schema({
  name: {
    type: String,
    required: true
  },
  members: {
    type: [{
      phone: {type: Schema.Types.ObjectId, ref: 'Phone', required: true},
      role: {type: String, enum: roles, required: true, default: roleParticipant},
      // Used primarily phone has no name associated.
      // However, will always be used over User nickname if present.
      nickname: String
    }],
    required: true
  },
  weeklyMeetups: [weeklyMeetup]
})

module.exports = mongoose.model('Group', Group)
