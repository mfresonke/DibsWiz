'use strict'

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const libraries = require('./shared/libraries')
const Library = require('./models/Library')

// setup env
dotenv.load({
  path: '.env'
})

const mongoURI = process.env.MONGODB
console.log('Connecting to MongoDB at ' + mongoURI)
mongoose.connect(mongoURI)

mongoose.connection.on('error', function () {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.')
  process.exit(1)
})

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + mongoURI)

  saveLibraries()
})

const saveLibraries = function () {
  for (let rawLib of libraries.all) {
    console.log('Creating Mongoose Object')
    const lib = new Library(rawLib)
    console.log('Saving Mongoose Object')
    lib.save(function (err) {
      if (err) {
        console.log('Library with Errors: ')
        console.log(JSON.stringify(rawLib))
        throw new Error(err)
      }
      console.log('Save Successful')
      mongoose.connection.close()
    })
  }
}
