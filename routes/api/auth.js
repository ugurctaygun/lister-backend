const express = require('express');
const config = require('config');
//Middleware
const router = express.Router();
const auth = require('../../middleware/auth');
//Models
const User = require('../../models/User');
//Dependencies
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Get authorized user
// @access  Private
router.get('/', auth , async(req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user and get token, Login
// @access  Private
router.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
] , async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const { email , password} = req.body;

    try {

        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({errors: [ {msg: 'Invalid credentials'} ]});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({errors: [ {msg: 'Invalid credentials'} ]});
        }

        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000}, 
            (err,token) => {
                if(err) throw err;
                res.json({token});
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;