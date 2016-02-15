'use strict'

const Group = require('../models/Group')
const Phone = require('../models/Phone')

// gets all groups associated with user by User ID, inc. creator and
// callback is of form function(err, [groups])
exports.allFromUserID = function (userID, callback) {
  Phone.findOne({user: userID})
    .select({ _id: 1 }) // select only the phone ID, since we don't care about the rest.
    .exec(function (err, phone) {
      if (err) {
        return callback(err)
      } else if (!phone) {
        return callback(new Error('User not associated with a phone number.'))
      }
      // Now that we know we have a valid user, let's get all the groups they are a part of.
      // since at this point we would pass the error forward anyways,
      //  let's go and simply pass the callback to the function.
      Group.find({'group.members': phone._id}, callback)
    })
}
