'use strict'
// This File is for Dumping DB objects to output. Not for production use....
const router = require('express').Router()
const User = require('../models/User')
const Phone = require('../models/Phone')
const Group = require('../models/Group')
const Library = require('../models/Library')

router.get('/users', function (req, res) {
  dumpModel(req, res, User)
})

router.get('/fill/users', function (req, res) {
  dumpModel(req, res, User, ['phone'])
})

router.get('/phones', function (req, res) {
  dumpModel(req, res, Phone)
})

router.get('/groups', function (req, res) {
  dumpModel(req, res, Group)
})

router.get('/libraries', function (req, res) {
  dumpModel(req, res, Library)
})

const dumpModel = function (req, res, model, toPopulate) {
  let populateStr = ''
  if (toPopulate) {
    populateStr = toPopulate.join(' ')
  }

  model
    .find({}, function (err, users) {
      if (err) {
        console.log(err)
        return
      }
      res.json(users)
    })
    .populate(populateStr)
}

module.exports = router
