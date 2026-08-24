const { ActivityLog } = require('../models');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    if (logs.length === 0) {
      // Provide default recent activity logs if fresh DB
      const defaultLogs = [
        { id: 1, actorName: 'System AI', actorRole: 'system', actionType: 'alert', description: 'Electrical issue volume up 40% in Block B', createdAt: new Date() },
        { id: 2, actorName: 'Student Rahul', actorRole: 'student', actionType: 'complaint_create', description: 'Submitted complaint #304 (Fan Not Working)', createdAt: new Date(Date.now() - 15 * 60 * 1000) },
        { id: 3, actorName: 'Admin Exec', actorRole: 'admin', actionType: 'complaint_assign', description: 'Assigned Ram Singh (Electrician) to ticket #304', createdAt: new Date(Date.now() - 10 * 60 * 1000) },
        { id: 4, actorName: 'Ram Singh', actorRole: 'staff', actionType: 'status_update', description: 'Updated ticket #304 status to In-Progress', createdAt: new Date(Date.now() - 5 * 60 * 1000) }
      ];
      return res.json(defaultLogs);
    }

    return res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
};
