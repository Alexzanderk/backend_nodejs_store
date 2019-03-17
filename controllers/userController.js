const { User } = require('../models');
const promisify = require('es6-promisify');

module.exports = {
    loginForm(req, res) {
        res.render('login', { title: 'Log In' });
    },

    registerForm(req, res) {
        res.render('register', { title: 'Register' });
    },

    validateRegister(req, res, next) {
        req.sanitizeBody('name');
        req.checkBody('name', 'You must supply a name!').notEmpty();
        req.checkBody('email', 'That Email is not valid').isEmail();
        req.sanitizeBody('email').normalizeEmail({
            remove_dots: false,
            remove_extension: false,
            gmail_remove_subaddress: false
        });
        req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
        req.checkBody(
            'password-confirm',
            'Confirm Password Cannot be Blank!'
        ).notEmpty();
        req.checkBody(
            'password-confirm',
            'Oops! Your password do not match'
        ).equals(req.body.password);

        const errors = req.validationErrors();

        if (errors) {
            req.flash('error', errors.map(err => err.msg));
            res.render('register', {
                title: 'Register',
                body: req.body,
                flashes: req.flash()
            });
            return;
        }

        next();
    },

    async register(req, res, next) {
        const { email, name, password } = req.body;
        const user = new User({ email, name });
        const register = promisify(User.register, User);
        await register(user, password);
        next();
    }
};
