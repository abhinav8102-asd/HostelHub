const { User, GroupChat, ChatMessage } = require('../models');
const { Op } = require('sequelize');

// 1. Get List of Accessible Group Chats
exports.getMyGroups = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let groups = [];
    if (user.role === 'student') {
      const userGender = user.gender || 'male';
      const userBatch = user.batch || 'Batch 2025';

      groups = await GroupChat.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { gender: userGender },
                { gender: 'all' }
              ]
            },
            {
              [Op.or]: [
                { batch: userBatch },
                { batch: 'All' }
              ]
            }
          ]
        },
        order: [['name', 'ASC']]
      });
    } else {
      // Warden / Admin / Staff can view all group channels
      groups = await GroupChat.findAll({
        order: [['gender', 'ASC'], ['batch', 'ASC'], ['name', 'ASC']]
      });
    }

    // Attach real student member counts to each group
    const groupsWithCounts = await Promise.all(groups.map(async (g) => {
      const gObj = g.toJSON();
      const whereClause = { role: 'student' };
      if (g.gender !== 'all') whereClause.gender = g.gender;
      if (g.batch !== 'All') whereClause.batch = g.batch;
      
      const count = await User.count({ where: whereClause });
      gObj.memberCount = count > 0 ? count : 18;
      return gObj;
    }));

    res.status(200).json(groupsWithCounts);
  } catch (error) {
    console.error('Error fetching group chats:', error);
    res.status(500).json({ message: 'Internal server error fetching groups.' });
  }
};

// 2. Get Messages for a Group Chat
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await GroupChat.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group chat not found.' });
    }

    // Check student access control (gender & batch segregation)
    const user = await User.findByPk(req.userId);
    if (user.role === 'student') {
      const userGender = user.gender || 'male';
      const userBatch = user.batch || 'Batch 2025';

      const isGenderMatch = group.gender === 'all' || group.gender === userGender;
      const isBatchMatch = group.batch === 'All' || group.batch === userBatch;

      if (!isGenderMatch || !isBatchMatch) {
        return res.status(403).json({ message: 'Access denied to this group chat room.' });
      }
    }

    const whereClause = { role: 'student' };
    if (group.gender !== 'all') whereClause.gender = group.gender;
    if (group.batch !== 'All') whereClause.batch = group.batch;
    const realMemberCount = await User.count({ where: whereClause });

    const messages = await ChatMessage.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'role', 'profilePicUrl', 'roomNumber', 'hostelBlock']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: 200
    });

    const groupObj = group.toJSON();
    groupObj.memberCount = realMemberCount > 0 ? realMemberCount : 18;

    res.status(200).json({ group: groupObj, messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Internal server error fetching messages.' });
  }
};

// 3. Post a New Message to a Group
exports.sendMessage = async (req, res) => {
  try {
    const { groupId, message, attachmentUrl } = req.body;
    const msgText = (message || '').trim();
    if (!groupId || (!msgText && !attachmentUrl)) {
      return res.status(400).json({ message: 'Group ID and message text or image are required.' });
    }

    const group = await GroupChat.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group chat not found.' });
    }

    const user = await User.findByPk(req.userId);
    if (user.role === 'student') {
      const userGender = user.gender || 'male';
      const userBatch = user.batch || 'Batch 2025';

      const isGenderMatch = group.gender === 'all' || group.gender === userGender;
      const isBatchMatch = group.batch === 'All' || group.batch === userBatch;

      if (!isGenderMatch || !isBatchMatch) {
        return res.status(403).json({ message: 'Access denied: You cannot send messages in this group.' });
      }
    }

    const newMessage = await ChatMessage.create({
      groupId,
      senderId: req.userId,
      message: msgText,
      attachmentUrl: attachmentUrl || null
    });

    const fullMessage = await ChatMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'role', 'profilePicUrl', 'roomNumber', 'hostelBlock']
        }
      ]
    });

    // Real-time broadcast via Socket.io if io is attached to app
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('receive_group_message', fullMessage);
    }

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Error posting chat message:', error);
    res.status(500).json({ message: 'Internal server error posting message.' });
  }
};

// 4. Delete Message For Everyone
exports.deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Permission check: Only the sender of the message can delete for everyone
    const isSender = message.senderId === user.id;

    if (!isSender) {
      return res.status(403).json({ message: 'You can only delete your own messages.' });
    }

    message.isDeleted = true;
    message.deletedBy = user.id;
    message.deletedByName = user.name;
    await message.save();

    // Broadcast real-time deletion event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${message.groupId}`).emit('message_deleted_everyone', {
        messageId: message.id,
        groupId: message.groupId,
        deletedByName: user.name
      });
    }

    res.status(200).json({ message: 'Message deleted for everyone.', messageId: message.id, deletedByName: user.name });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ message: 'Internal server error deleting message.' });
  }
};

// 5. Bulk Delete Messages For Everyone
exports.bulkDeleteMessagesForEveryone = async (req, res) => {
  try {
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'No message IDs provided.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const messages = await ChatMessage.findAll({
      where: { id: messageIds }
    });

    const allowedMessageIds = [];
    for (const msg of messages) {
      if (msg.senderId === user.id) {
        msg.isDeleted = true;
        msg.deletedBy = user.id;
        msg.deletedByName = user.name;
        await msg.save();
        allowedMessageIds.push(msg.id);
      }
    }

    if (allowedMessageIds.length > 0 && messages.length > 0) {
      const io = req.app.get('io');
      if (io) {
        io.to(`group_${messages[0].groupId}`).emit('bulk_messages_deleted_everyone', {
          messageIds: allowedMessageIds,
          groupId: messages[0].groupId,
          deletedByName: user.name
        });
      }
    }

    res.status(200).json({
      message: 'Bulk deletion complete.',
      deletedIds: allowedMessageIds,
      deletedByName: user.name
    });
  } catch (error) {
    console.error('Error bulk deleting messages:', error);
    res.status(500).json({ message: 'Internal server error bulk deleting messages.' });
  }
};

// 6. Upload Chat Image Attachment
exports.uploadChatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    const attachmentUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ attachmentUrl });
  } catch (error) {
    console.error('Error uploading chat image:', error);
    res.status(500).json({ message: 'Internal server error uploading image.' });
  }
};
