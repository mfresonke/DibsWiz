'use strict'

const router = require('express').Router()
const path = require('path')
const Group = require('../models/Group')
const User = require('../models/User')
const phone = require('../helpers/phone')

const components = require('../helpers/components')
const formHelpers = components.formHelpers
const clientJS = path.join(components.publicJS, 'meetup.js')

router.route('/new')
  // create new group page
  .get(function (req, res, next) {
    const user = req.user
    // get groups assoc. with user.
    Group.find({'members.phone': user.phone}, function (err, groups) {
      if (err) {
        return next(err)
      }
      res.render('new-meetup', {
        // Data for template goes here.
        user: req.user,
        groups: groups,
        scripts: [formHelpers.js, clientJS],
        stylesheets: [formHelpers.css]
      })
    })
  })
  // when someone submits a new group
  .post(function (req, res, next) {
    const submission = req.body
    const newGroup = new Group({
      name: submission.groupName,
      // create base members object with user themselves as a member.
      members: [{
        phone: req.user.phone,
        role: 'admin'
      }]
    })
    // Let's start our callback doosey to process the things that have been given!
    // Why not usernames to start?
    processUsernameSubmissions(submission.usernames, function (err, phoneIDs) {
      if (err) {
        return next(err)
      }
      // Let's add the phoneIDs we've retrieved into our new group object!
      for (let phoneID of phoneIDs) {
        newGroup.members.push({phone: phoneID})
      }
      // OK Cool! Now that we took care of the usernames, let's do the phone submissions!
      processPhoneSubmissions(submission.phoneNumbers, submission.phoneNames, function (err, phoneIDs, nicknames) {
        if (err) {
          return next(err)
        }
        // very similar to usernames above, BUT, we also have nicknames to account for!
        for (let i = 0; i !== phoneIDs.length; ++i) {
          newGroup.members.push({
            phone: phoneIDs[i],
            nickname: nicknames[i]
          })
        }
        console.log(newGroup)
        // Nice! Let's save the group we made!
        newGroup.save()
        res.redirect('/meetup/new')
      })
    })
  })

// Processes the given usernames from the submission.
// finds the associated phone IDs from the users.
// callback is of form function (err, phoneIDs).
// If no error occurs, will always return at least an empty array.
const processUsernameSubmissions = function (usernames, callback) {
  if (!usernames) {
    return callback(null, [])
  }
  // do regular single-to-array conversion to generify code.
  if (typeof usernames === 'string') {
    usernames = [usernames]
  }
  User
    .find({username: {$in: usernames}})
    .select('phone')
    .exec(function (err, users) {
      if (err) {
        return callback(err)
      }
      // make sure we were able to find ALL of the users given.
      if (users.length !== usernames.length) {
        return callback(new Error('There was an error retrieving all users from the DB.'))
      }
      const phoneIDs = []
      // Extract the phone IDs from each user obj
      for (let user of users) {
        phoneIDs.push(user.phone)
      }
      return callback(null, phoneIDs)
    })
}

// Processes the raw phone names and phone nums from the submission.
// callback is of form function (err, phoneIDs, nicknames).
// If no error occurs, will always pass at a minimum two empty arrays.
const processPhoneSubmissions = function (phoneNums, phoneNames, callback) {
  // check if we even have any phone items to deal with.
  if (!phoneNums || !phoneNames) {
    // if not, simply call the callback with blank arrays.
    return callback(null, [], [])
  }
  // if we're dealing with the single case, let's put them in arrays to allow
  //  our code to be generic.
  if (typeof phoneNames === 'string' && typeof phoneNums === 'string') {
    phoneNames = [phoneNames]
    phoneNums = [phoneNums]
  }
  // perform some basic validation by checking that the arrays are of identical size.
  if (phoneNames.length !== phoneNums.length) {
    return callback(new Error('Phone Numbers and Phone Names from Post Not Of Equal Length!'))
  }
  // holds the to-be-inserted phone objects.
  const phoneIDs = []
  const phoneItr = phoneNums[Symbol.iterator]()
  let currItr = phoneItr.next()
  // here we define a callback that will loop through all the phones, add
  //  them to the phoneIDs array, and then finally call the ending callback
  //  when finished.
  const findPhonesCB = function (err, newPhone) {
    if (err) {
      return callback(err)
    }
    phoneIDs.push(newPhone._id)
    // now that we've pushed the phone ID, go to the next phone iteration
    currItr = phoneItr.next()
    if (currItr.done) {
      return callback(null, phoneIDs, phoneNames)
    }
    // otherwise, we're not done. let's call phone.findOrCreate again.
    phone.findOrCreate(currItr.value, findPhonesCB)
  }
  // now we kickstart the process by calling it once here!
  phone.findOrCreate(currItr.value, findPhonesCB)
}

module.exports = router
