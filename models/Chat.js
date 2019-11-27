const mongoose = require('mongoose');

const timestamp = require('mongoose-timestamp');


var ChatSchema = new mongoose.Schema({
    sender_group_public_key: {type: String, required: true, trim: true},
    receiver_group_public_key: {type: String, required: true, trim: true},
    encrypted_message: {type: String, required: true, trim: true},
});

ChatSchema.plugin(timestamp);


const Chat = mongoose.model('Chat', ChatSchema);


module.exports = Chat
