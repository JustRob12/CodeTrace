-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('LOGIN', 'LOGOUT', 'CREATE_STUDENT', 'UPDATE_STUDENT', 'DELETE_STUDENT', 'CREATE_EVENT', 'DELETE_EVENT') NOT NULL,
    target_id VARCHAR(50),  -- Can be student_id or event_id depending on action_type
    details TEXT,
    ip_address VARCHAR(45),  -- IPv6 compatible length
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for faster querying
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- Add comments for better documentation
ALTER TABLE admin_logs 
COMMENT = 'Tracks all administrative actions including logins, student management, and event management';
