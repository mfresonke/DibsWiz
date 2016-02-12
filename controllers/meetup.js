'use strict'

const router = require('express').Router()
const path = require('path')
const Phone = require('../models/Phone')
const Group = require('../models/Group')

const components = require('../helpers/components')
const formHelpers = components.formHelpers
const clientJS = path.join(components.publicJS, 'meetup.js')

router.route('/new')
  .get(function (req, res) {
    const user = req.user
    // get groups assoc. with user.
    // Step 1: Get phone of user.

    Group.find({})

    res.render('new-meetup', {
      // Data for template goes here.
      user: req.user,
      scripts: [formHelpers.js, clientJS],
      stylesheets: [formHelpers.css]
    })
  })
  .post(function (req, res) {
    console.log(req.body)
  })

module.exports = router
