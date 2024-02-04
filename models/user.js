const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    verify_token: String,
    verify_status: {
        type: Number,
        default: 0
    }    
});

const User = mongoose.model('User', userSchema);

module.exports = User;
