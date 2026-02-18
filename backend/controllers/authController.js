const User = require('../models/User');
const { generateToken, calculateAge, validateEmail } = require('../utils/helpers');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, dateOfBirth, freelancingFields } = req.body;

        // Check age
        if (calculateAge(dateOfBirth) < 16) {
            return res.status(400).json({
                success: false,
                message: 'You must be at least 16 years old'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            dateOfBirth,
            freelancingFields,
            avatar: name.charAt(0).toUpperCase()
        });

        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error creating account'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
};

exports.logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
