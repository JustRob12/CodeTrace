const db = require('../config/db');

/**
 * Log admin activities in the database
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} actionType - Type of action performed (LOGIN, LOGOUT, etc.)
 * @param {string} targetId - ID of the target entity (student_id or event_id)
 * @param {string} details - Additional details about the action
 * @param {string} ipAddress - IP address of the admin
 * @returns {Promise} - Resolves when logging is complete
 */
const logAdminActivity = (adminId, actionType, targetId = null, details = null, ipAddress = null) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO admin_logs 
            (admin_id, action_type, target_id, details, ip_address) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [adminId, actionType, targetId, details, ipAddress],
            (error, results) => {
                if (error) {
                    console.error('Error logging admin activity:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};

module.exports = {
    logAdminActivity
};
