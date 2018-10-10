var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('interview', new Schema({
    name: String,
    body: String,
    type: Number, //Type of Development (.NET Jr, Sr, Android, etc) use a number, better searching, will create a simple object related to 0-2 types.
    createdBy: Schema.Types.ObjectId,
    updatedBy: Schema.Types.ObjectId,
    duration: Number //in minutes
}));