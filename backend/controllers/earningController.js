const Earning = require('../models/Earning');
const User = require('../models/User');

exports.getEarnings = async (req, res) => {
    try {
        const earnings = await Earning.find({ user: req.userId })
            .populate('project', 'title')
            .populate('task', 'title')
            .sort({ earnedDate: -1 });

        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
        const pendingEarnings = earnings
            .filter(e => e.status === 'pending')
            .reduce((sum, e) => sum + e.amount, 0);

        res.json({
            success: true,
            earnings,
            totalEarnings,
            pendingEarnings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings'
        });
    }
};

exports.createEarning = async (req, res) => {
    try {
        const { project, task, amount, description } = req.body;

        const earning = new Earning({
            user: req.userId,
            project,
            task,
            amount,
            description
        });

        await earning.save();

        // Update user total earnings
        const user = await User.findById(req.userId);
        user.totalEarnings += amount;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Earning recorded successfully',
            earning
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating earning'
        });
    }
};

exports.getEarningById = async (req, res) => {
    try {
        const earning = await Earning.findById(req.params.id)
            .populate('project', 'title')
            .populate('task', 'title');

        if (!earning) {
            return res.status(404).json({
                success: false,
                message: 'Earning not found'
            });
        }

        res.json({
            success: true,
            earning
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earning'
        });
    }
};

exports.requestPayout = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        const user = await User.findById(req.userId);

        if (user.totalEarnings < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create payout record (you would typically integrate with payment gateway here)
        const payoutEarnings = await Earning.find({
            user: req.userId,
            status: 'completed'
        }).limit(Math.floor(amount / 100));

        const payout = {
            user: req.userId,
            amount,
            paymentMethod,
            status: 'processing',
            requestDate: new Date(),
            expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        };

        res.json({
            success: true,
            message: 'Payout request submitted',
            payout
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error processing payout'
        });
    }
};

exports.getEarningStats = async (req, res) => {
    try {
        const earnings = await Earning.find({ user: req.userId });

        const stats = {
            total: earnings.reduce((sum, e) => sum + e.amount, 0),
            pending: earnings
                .filter(e => e.status === 'pending')
                .reduce((sum, e) => sum + e.amount, 0),
            completed: earnings
                .filter(e => e.status === 'completed')
                .reduce((sum, e) => sum + e.amount, 0),
            paid: earnings
                .filter(e => e.status === 'paid')
                .reduce((sum, e) => sum + e.amount, 0),
            count: earnings.length
        };

        res.json({
            success: true,
            stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earning stats'
        });
    }
};
