
const mongoose = require('mongoose');

const timestamp = require('mongoose-timestamp');


var ChatSchema = new mongoose.Schema({
    from: {type:  mongoose.Schema.Types.ObjectId , required: true, ref : 'User'},
    message: {type: String, required: true, trim: true},
    name: {type: String, required: true, trim: true},

});

ChatSchema.plugin(timestamp);


const Chat = mongoose.model('MyGroup', ChatSchema);


module.exports = Chat
