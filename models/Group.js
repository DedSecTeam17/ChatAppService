const mongoose = require('mongoose');

const timestamp = require('mongoose-timestamp');


var ChatSchema = new mongoose.Schema({
    from: {type: String, required: true, trim: true},
    message: {type: String, required: true, trim: true},
});

ChatSchema.plugin(timestamp);


const Chat = mongoose.model('MyGroup', ChatSchema);


module.exports = Chat
