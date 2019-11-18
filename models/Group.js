const mongoose = require('mongoose');

const timestamp = require('mongoose-timestamp');


var CustomerSchema = new mongoose.Schema({
    group_public_key: {type: String, required: true, trim: true},
    group_name: {type: String, required: true, trim: true},
});

CustomerSchema.plugin(timestamp);


const Group = mongoose.model('Group', CustomerSchema);


module.exports = Group
