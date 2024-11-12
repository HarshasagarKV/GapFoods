const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roleId: {
        type: Number,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token:{
        type: String,
        required: false
    }
});

module.exports = mongoose.model('User', UserSchema);
