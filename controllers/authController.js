const passport = require('passport');

module.exports = {
    login: passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Failed Login!',
        successRedirect: '/',
        successFlash: 'You are now logged in!'
    }),

    logout(req, res) {
        req.logout();
        req.flash('success', 'You are now logged out!!! 🙋🏻‍♂️');
        res.redirect('/');
    },

    isLoggesIn(req, res, next) {
        if (req.isAuthenticated()) {
            next();
            return;
        }
        req.flash('error', 'Oops! You must logged in to do that!')
        res.redirect('/login')
    }
};
