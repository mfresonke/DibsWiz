'use strict'

const Group = require('../models/Group')
const Phone = require('../models/Phone')

// gets all groups associated with user by User ID, inc. creator and
// callback is of form function(err, [groups])
exports.allFromUserID = function (userID, callback) {
  Phone.findOne({user: userID}, function (err, user) {
    if (err) {
      return callback(err)
    } else if (!user) {
      return callback(new Error('User not associated with phone number.'))
    }
  })
  Group.find({})
}
