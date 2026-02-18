const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

exports.createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, dueDate, priority, estimatedHours } = req.body;

        const task = new Task({
            title,
            description,
            project,
            assignedTo,
            createdBy: req.userId,
            dueDate,
            priority,
            estimatedHours
        });

        await task.save();

        // Add task to project
        await Project.findByIdAndUpdate(
            project,
            { $push: { tasks: task._id } }
        );

        // Create notification
        await Notification.create({
            recipient: assignedTo,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${title}`,
            type: 'task',
            relatedEntity: {
                entityType: 'Task',
                entityId: task._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error creating task'
        });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { createdBy: req.userId },
                { assignedTo: req.userId }
            ]
        })
        .populate('project', 'title')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks'
        });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'title')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching task'
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, actualHours } = req.body;

        const updateData = {
            title,
            description,
            status,
            priority,
            actualHours,
            updatedAt: Date.now()
        };

        if (status === 'completed' && !req.body.completedDate) {
            updateData.completedDate = new Date();
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating task'
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        await Project.findByIdAndUpdate(
            task.project,
            { $pull: { tasks: task._id } }
        );

        await Task.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting task'
        });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                status,
                completedDate: status === 'completed' ? new Date() : null
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Task status updated',
            task
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating task status'
        });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        user: req.userId,
                        text,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        ).populate('comments.user', 'name email');

        res.json({
            success: true,
            message: 'Comment added successfully',
            task
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
};
