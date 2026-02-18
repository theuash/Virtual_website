const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['project', 'task', 'promotion', 'team', 'system'],
        default: 'system'
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['Project', 'Task', 'User'],
            default: null
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    actionUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
    }
}, { timestamps: true });

// TTL index to auto-delete old notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
