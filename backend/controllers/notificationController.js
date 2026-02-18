const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.userId,
            read: false
        });

        res.json({
            success: true,
            unreadCount
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await Notification.findByIdAndUpdate(
            notificationId,
            {
                read: true,
                readAt: new Date()
            }
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error marking notification'
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, read: false },
            {
                read: true,
                readAt: new Date()
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error marking notifications'
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.notificationId);

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
};
