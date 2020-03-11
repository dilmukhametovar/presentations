const bcrypt = require('bcrypt');
const User = require('../models/User');

function createUser(username , password) {
    let passwordHash = bcrypt.hashSync(password, 10);
    let newUser = new User({
        username: username,
        passwordHash: passwordHash,
        pres: []
    });
    return newUser.save();
}

function findUserById(id, done) {
    User.findById(id, (err, user) => {
        return done(err, user);
    });
}

function findUserByName(username, done) {
    User.findOne({username: username}, (err, user) => {
        return done(err, user);
    });
}

function authenticate(username, password, done) {
    findUserByName(username, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (!bcrypt.compareSync(password, user.passwordHash)) return done(null, false);
        return done(null, user);
    });
}

function serializeUser(user, done) {
    return done(null, user.id);
}

function deserializeUser(id, done) {
    findUserById(id, function (err, user) {
        if (err) { return done(err); }
        done(null, user);
    });
}

module.exports.createUser = createUser;
module.exports.findUserById = findUserById;
module.exports.findUserByName = findUserByName;
module.exports.authenticate = authenticate;
module.exports.serializeUser = serializeUser;
module.exports.deserializeUser = deserializeUser;