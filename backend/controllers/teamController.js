const Team = require('../models/Team');
const User = require('../models/User');

exports.createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        const team = new Team({
            name,
            description,
            leader: req.userId,
            members: [{
                user: req.userId,
                role: 'leader'
            }]
        });

        await team.save();

        res.status(201).json({
            success: true,
            message: 'Team created successfully',
            team
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating team'
        });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            $or: [
                { leader: req.userId },
                { 'members.user': req.userId }
            ]
        })
        .populate('leader', 'name email')
        .populate('members.user', 'name email')
        .populate('projects', 'title');

        res.json({
            success: true,
            count: teams.length,
            teams
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching teams'
        });
    }
};

exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('leader', 'name email')
            .populate('members.user', 'name email')
            .populate('projects', 'title');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            team
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching team'
        });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;

        const team = await Team.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    members: {
                        user: userId,
                        role: role || 'junior'
                    }
                }
            },
            { new: true }
        ).populate('members.user', 'name email');

        res.json({
            success: true,
            message: 'Member added to team',
            team
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error adding member'
        });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.body;

        const team = await Team.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    members: { user: userId }
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Member removed from team',
            team
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error removing member'
        });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { name, description, updatedAt: Date.now() },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Team updated successfully',
            team
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating team'
        });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Team deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting team'
        });
    }
};
