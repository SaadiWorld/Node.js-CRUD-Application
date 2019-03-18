const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');  // So that we can compare our passwords

module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        let query = { username: username };
        User.findOne(query, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'No User Found!' });
            }

            // Matching the two Passwords
            // One coming from the form through 'password' object
            // Other coming from the database through 'user' object
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Wrong Password' });
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}