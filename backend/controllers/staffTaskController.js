const { StaffTask, User } = require('../models');

exports.createStaffTask = async (req, res) => {
  try {
    const { title, description, assignedStaffId, hostelBlock, priority, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await StaffTask.create({
      title,
      description: description || '',
      assignedStaffId: assignedStaffId ? Number(assignedStaffId) : null,
      hostelBlock: hostelBlock || 'All',
      priority: priority || 'medium',
      status: 'pending',
      deadline: deadline ? new Date(deadline) : null
    });

    return res.status(201).json({ message: 'Task assigned successfully!', task });
  } catch (error) {
    console.error('Error creating staff task:', error);
    return res.status(500).json({ message: 'Failed to create staff task.' });
  }
};

exports.getStaffTasks = async (req, res) => {
  try {
    const tasks = await StaffTask.findAll({
      include: [{ model: User, as: 'assignedStaff', attributes: ['id', 'name', 'phone', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching staff tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch staff tasks.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await StaffTask.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.status = status || task.status;
    await task.save();

    return res.json({ message: 'Task status updated successfully.', task });
  } catch (error) {
    console.error('Error updating task status:', error);
    return res.status(500).json({ message: 'Failed to update task status.' });
  }
};
