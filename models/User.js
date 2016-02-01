var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  phone: {
    type: Schema.Types.ObjectId,
    ref: 'Phone',
    required: true,
    unique: true
  }
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)
