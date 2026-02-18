const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'paid'],
        default: 'pending'
    },
    earnedDate: {
        type: Date,
        default: Date.now
    },
    paidDate: {
        type: Date,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'wallet', 'crypto', 'other'],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Earning', earningSchema);
