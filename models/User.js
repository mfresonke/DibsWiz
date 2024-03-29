var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  name: {
    type: String,
    required: true
  },
  // Every User Needs a Phone Attached
  phone: {
    type: Schema.Types.ObjectId,
    ref: 'Phone',
    required: true,
    unique: true
  }
}, {timestamps: true})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)
