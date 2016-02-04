'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  }]
})

module.exports = mongoose.model('Group', Group)
