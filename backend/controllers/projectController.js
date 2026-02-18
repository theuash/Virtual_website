const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

exports.createProject = async (req, res) => {
    try {
        const { title, description, type, budget, deadline } = req.body;

        const project = new Project({
            title,
            description,
            type,
            budget,
            deadline,
            createdBy: req.userId
        });

        await project.save();

        // Create notification
        await Notification.create({
            recipient: req.userId,
            title: 'Project Created',
            message: `You created a new ${type} project: ${title}`,
            type: 'project',
            relatedEntity: {
                entityType: 'Project',
                entityId: project._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error creating project'
        });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { createdBy: req.userId },
                { assignedTo: req.userId }
            ]
        })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('tasks');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            project
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project'
        });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { title, description, status, progress, budget } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                status,
                progress,
                budget,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating project'
        });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting project'
        });
    }
};

exports.assignUserToProject = async (req, res) => {
    try {
        const { userId } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedTo: userId } },
            { new: true }
        );

        res.json({
            success: true,
            message: 'User assigned to project',
            project
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error assigning user'
        });
    }
};
