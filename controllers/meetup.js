'use strict'

const router = require('express').Router()
const path = require('path')
const group = require('../helpers/group')
const Group = require('../models/Group')
const User = require('../models/User')
const phone = require('../helpers/phone')
const Phone = require('../models/Phone')

const components = require('../helpers/components')
const formHelpers = components.formHelpers
const clientJS = path.join(components.publicJS, 'meetup.js')

router.route('/new')
  // create new group page
  .get(function (req, res, next) {
    const user = req.user
    // get groups assoc. with user.
    group.allFromUserID(user._id, function (err, groups) {
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
    console.log(req.body)
    const submission = req.body
    const newGroup = new Group({name: submission.groupName})
    // Let's start our callback doosey to process the things that have been given!
    // Why not usernames to start?
    processUsernameSubmissions(submission.usernames, function (err, phoneIDs) {
      if (err) {
        return next(err)
      }
      // Let's add the phoneIDs we've retrieved into our new group object!
      newGroup.members = []
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
        // Nice! Let's save the group we made!
        newGroup.save()
        // Now we should do something cool like redirect the user or something...
        // Nahhhhhhh. (but really, there's just no other page to redirect to!)
        // Gotta create it :)
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
  User.find({username: {$in: usernames}}, '_id', function (err, users) {
    if (err) {
      return callback(err)
    }
    // make sure we were able to find ALL of the users given.
    if (users.length !== usernames.length) {
      return callback(new Error('There was an error retrieving all users from the DB.'))
    }
    // Extract just the user IDs from each user obj
    const userIDs = []
    for (let user of users) {
      userIDs.push(user._id)
    }
    // OK cool! If we made it this far, we have all the relevant userID fields.
    //  now, let's search the phone records for matching users.
    Phone.find({user: {$in: userIDs}}, function (err, phones) {
      if (err) {
        return callback(err)
      }
      // check that we found all the phones...
      if (phones.length !== userIDs.length) {
        return callback(new Error('WTF? Some users did not have phones associated.'))
      }
      // else let's extract the phone IDs and call that callback!
      const phoneIDs = []
      for (let phone of phones) {
        phoneIDs.push(phone._id)
      }
      return callback(null, phoneIDs)
    })
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
  const toInsert = []
  // save some new phone numbers and retrieve the IDs!
  for (let phoneNum of phoneNums) {
    const normdPhoneNum = phone.convertToStandard(phoneNum)
    if (!normdPhoneNum) {
      return callback(new Error('One of the phone Numbers, ' + phoneNum + ' failed to normalize.'))
    }
    toInsert.push({number: normdPhoneNum})
  }
  // Nice! Now let's insert the phone objs into the DB!
  Phone.insertMany(toInsert, function (err, phones) {
    if (err) {
      return callback(err)
    }
    const phoneIDs = []
    // extract all the IDs out of the phones.
    for (let phone of phones) {
      phoneIDs.push(phone._id)
    }
    // nice! now let's call the callback.
    return callback(null, phoneIDs, phoneNames)
  })
}

module.exports = router
