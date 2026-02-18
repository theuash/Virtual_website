const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const getPromotionThresholds = (currentRole) => {
    const thresholds = {
        precrate: {
            nextRole: 'crate',
            projectsRequired: 1,
            earningsRequired: 100
        },
        crate: {
            nextRole: 'project_initiator',
            projectsRequired: 10,
            earningsRequired: 5000
        },
        project_initiator: {
            nextRole: 'momentum_supervisor',
            projectsRequired: 25,
            earningsRequired: 20000
        },
        momentum_supervisor: {
            nextRole: 'admin',
            projectsRequired: 50,
            earningsRequired: 100000
        }
    };

    return thresholds[currentRole] || null;
};

const checkPromotion = (user) => {
    const threshold = getPromotionThresholds(user.role);
    
    if (!threshold) return null;
    
    if (user.completedProjects >= threshold.projectsRequired && 
        user.totalEarnings >= threshold.earningsRequired) {
        return threshold.nextRole;
    }
    
    return null;
};

module.exports = {
    generateToken,
    calculateAge,
    validateEmail,
    getPromotionThresholds,
    checkPromotion
};
