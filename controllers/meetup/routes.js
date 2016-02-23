'use strict'

const express = require('express')
const path = require('path')
const user = require('../../helpers/user')

// main meetup stuff
const router = express.Router()

const prefix = '/meetup'
exports.prefix = prefix

// function to add self to router
exports.attach = function (mainAppRouter) {
  mainAppRouter.use(prefix, user.isAuthenticated, router)
}

/* New Meetup */
// create and attach subrouter
const newRoute = '/new'
exports.newPrefix = path.join(prefix, newRoute)
router.use(newRoute, require('./new'))

// add other stuff here.
