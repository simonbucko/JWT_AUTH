const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    let errors = { email: '', password: '' };

    //incorrect email
    if (err.message === 'Incorrect email') {
        errors.email = "The email is not registered";
    }
    if (err.message === 'Incorrect password') {
        errors.password = "The password is incorrect";
    }

    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'Email is already registered';
        return errors
    }

    //validation erros
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60; //three days

const createToken = (id) => {
    return jwt.sign({ id }, 'secret', {
        expiresIn: maxAge
    });
}

const singup_get = (req, res) => {
    res.render('signup');
}
const login_get = (req, res) => {
    res.render('login');
}
const singup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}
const login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports = {
    singup_get,
    singup_post,
    login_get,
    login_post,
    logout_get
}