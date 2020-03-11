const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const presSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    pres: [presSchema]
});

const User = mongoose.model('users', userSchema);

module.exports = User;