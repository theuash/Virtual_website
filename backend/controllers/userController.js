const User = require('../models/User');
const { checkPromotion } = require('../utils/helpers');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
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

exports.updateUser = async (req, res) => {
    try {
        const { name, email, freelancingFields } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                name,
                email,
                freelancingFields,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('supervisor', 'name email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for promotion eligibility
        const eligibleForPromotion = checkPromotion(user);

        res.json({
            success: true,
            user,
            promotionEligible: eligibleForPromotion
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('-password')
            .limit(50);

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

exports.promoteUser = async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = newRole;
        await user.save();

        res.json({
            success: true,
            message: 'User promoted successfully',
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error promoting user'
        });
    }
};
