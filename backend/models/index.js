const sequelize = require('../config/db');
const User = require('./User');
const Complaint = require('./Complaint');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const Setting = require('./Setting');
const MessMenu = require('./MessMenu');
const MessFeedback = require('./MessFeedback');
const MessSkip = require('./MessSkip');
const Attendance = require('./Attendance');
const PasswordResetOTP = require('./PasswordResetOTP');

// User & Complaints Relations
User.hasMany(Complaint, { foreignKey: 'studentId', as: 'raisedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

User.hasMany(Complaint, { foreignKey: 'wardenId', as: 'managedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'wardenId', as: 'warden' });

User.hasMany(Complaint, { foreignKey: 'staffId', as: 'assignedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

// User & Announcement Relations
User.hasMany(Announcement, { foreignKey: 'createdBy', as: 'createdAnnouncements' });
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User & Notification Relations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User & Mess relations
User.hasMany(MessFeedback, { foreignKey: 'studentId', as: 'messFeedbacks' });
MessFeedback.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

User.hasMany(MessSkip, { foreignKey: 'studentId', as: 'messSkips' });
MessSkip.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// User & Attendance relations
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  sequelize,
  User,
  Complaint,
  Announcement,
  Notification,
  Setting,
  MessMenu,
  MessFeedback,
  MessSkip,
  Attendance,
  PasswordResetOTP
};
