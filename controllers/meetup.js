'use strict'

const router = require('express').Router()
const path = require('path')

const components = require('../helpers/components')
const formHelpers = components.formHelpers
const bootstrapValidatorJS = components.bootstrapValidatorJS
const clientJS = path.join(components.publicJS, 'meetup.js')

router.route('/new')
  .get(function (req, res) {
    res.render('new-meetup', {
      // Data for template goes here.
      user: req.user,
      scripts: [formHelpers.js, bootstrapValidatorJS, clientJS],
      stylesheets: [formHelpers.css]
    })
  })
  .post(function (req, res) {
    console.log(req.body)
  })

module.exports = router
