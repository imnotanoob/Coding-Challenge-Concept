// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('user', new Schema({ 
    name: String,
    email: String, 
    password: String, 
    admin: Boolean,
    starttime: Date,
    endtime: Date,
    submittedtime: Date,
    giturl: String
}));