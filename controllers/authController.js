const passport = require('passport');
const { User } = require('../models');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

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
        req.flash('error', 'Oops! You must logged in to do that!');
        res.redirect('/login');
    },
    async forgot(req, res) {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            req.flash('error', 'No account with this email');
            res.redirect('/login');
        }

        user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = Date.now() + 36000000;
        await user.save();

        const resetURL = `http://${req.headers.host}/account/reset/${
            user.resetPasswordToken
        }`;

        await mail.send({
            user,
            subject: 'Password reset',
            resetURL,
            filename: 'password-reset'
        })
        req.flash(
            'success',
            `You have been emailed a password reset link. ${resetURL} `
        );
        res.redirect('/login');
    },

    async reset(req, res) {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset is invalid or expired');
            res.redirect('/login');
        }

        res.render('reset', { title: 'Reset your password' });
    },

    confirmPassword(req, res, next) {
        if (req.body.password === req.body['password-confirm']) {
            return next();
            
        }

        req.flash('error', 'Passwords do not match!');
        res.redirect('back');
    },

    async update(req, res) {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Password reset is invalid or expired');
            res.redirect('/login');
        }

        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password);

        user.resetPasswordExpires = undefined;
        user.resetPasswordToken = undefined;

        const updatedUser = await user.save();
        await req.login(updatedUser);

        req.flash('success', '💃🏻');
        res.redirect('/');
    }
};
