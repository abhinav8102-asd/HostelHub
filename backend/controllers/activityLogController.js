const { ActivityLog, Complaint, Announcement, User } = require('../models');

exports.getActivityLogs = async (req, res) => {
  try {
    const dbLogs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    // Gather live database events for a 100% real audit trail
    const liveEvents = [];

    // 1. Fetch recent complaints
    const recentComplaints = await Complaint.findAll({
      include: [
        { model: User, as: 'student', attributes: ['name'] },
        { model: User, as: 'staff', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 15
    });

    recentComplaints.forEach(c => {
      liveEvents.push({
        id: `comp_${c.id}`,
        actorName: c.student ? c.student.name : 'Student',
        actorRole: 'student',
        actionType: 'complaint_create',
        description: `Raised ticket #${c.id}: "${c.title}" (${(c.category || 'General').toUpperCase()})`,
        createdAt: c.createdAt
      });

      if (c.status && c.status !== 'pending') {
        liveEvents.push({
          id: `comp_status_${c.id}`,
          actorName: c.staff ? c.staff.name : (c.assignedStaffId ? 'Staff' : 'Warden/Admin'),
          actorRole: c.staff ? 'staff' : 'warden',
          actionType: 'status_update',
          description: `Updated ticket #${c.id} status to ${c.status.toUpperCase()}`,
          createdAt: c.updatedAt || c.createdAt
        });
      }
    });

    // 2. Fetch recent announcements
    const recentNotices = await Announcement.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentNotices.forEach(a => {
      liveEvents.push({
        id: `notice_${a.id}`,
        actorName: 'System Authority',
        actorRole: 'admin',
        actionType: 'notice_broadcast',
        description: `Broadcasted official notice: "${a.title}"`,
        createdAt: a.createdAt
      });
    });

    // 3. Fetch recent registered users
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentUsers.forEach(u => {
      liveEvents.push({
        id: `user_${u.id}`,
        actorName: u.name,
        actorRole: u.role,
        actionType: 'user_register',
        description: `Registered new ${u.role.toUpperCase()} account (${u.hostelBlock || 'All Hostels'})`,
        createdAt: u.createdAt
      });
    });

    // Combine explicit dbLogs + liveEvents and sort descending by timestamp
    const allCombined = [...dbLogs.map(l => l.toJSON()), ...liveEvents];
    allCombined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Deduplicate by description & time window
    const uniqueLogs = [];
    const seen = new Set();
    for (const log of allCombined) {
      const key = `${log.description}_${new Date(log.createdAt).getMinutes()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLogs.push(log);
      }
    }

    return res.json(uniqueLogs.slice(0, 30));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ message: 'Failed to fetch activity logs: ' + error.message });
  }
};
