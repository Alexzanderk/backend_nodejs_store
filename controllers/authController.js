const passport = require('passport');

module.exports = {
    login: passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Failed Login!',
        successRedirect: '/',
        successFlash: 'You are now logged in!'
    })
};
