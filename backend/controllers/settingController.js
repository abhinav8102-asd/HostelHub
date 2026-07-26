const { Setting } = require('../models');

exports.getFooterSettings = async (req, res) => {
  try {
    const keys = ['footer_text', 'footer_email', 'footer_phone', 'footer_copyright'];
    const settings = await Setting.findAll({
      where: { key: keys }
    });

    // Map array to key-value object
    const footerConfig = {};
    keys.forEach(k => {
      const match = settings.find(s => s.key === k);
      footerConfig[k] = match ? match.value : '';
    });

    res.status(200).json(footerConfig);
  } catch (error) {
    console.error('Get Footer Settings Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving footer settings.' });
  }
};

exports.updateFooterSettings = async (req, res) => {
  try {
    const { footer_text, footer_email, footer_phone, footer_copyright } = req.body;

    const updates = {
      footer_text,
      footer_email,
      footer_phone,
      footer_copyright
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await Setting.upsert({ key, value });
      }
    }

    res.status(200).json({ message: 'Footer settings updated successfully.' });
  } catch (error) {
    console.error('Update Footer Settings Error:', error);
    res.status(500).json({ message: 'Internal server error updating footer settings.' });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    const keys = ['app_about', 'app_how_it_works', 'developer_team'];
    const settings = await Setting.findAll({
      where: { key: keys }
    });

    const config = {
      app_about: 'HostelHub is an all-in-one digital platform designed to streamline hostel management. It allows students to raise maintenance tickets instantly, monitors staff assignments, skips mess meals, tracks attendance, and updates students with official announcements.',
      app_how_it_works: '1. Raise a Ticket: Submit electrical, plumbing, carpentry, or cleaning issues with photos.\n2. Automated Routing: Wardens assign staff based on category.\n3. Track Resolution: View status changes and review work completion proof.\n4. Connect: Join batch group chats and stay updated.',
      developer_team: JSON.stringify([
        { name: 'Abhinav Kumar', role: 'Lead Full-Stack Developer', description: 'Expert in Node.js, Express, Sequelize, and Angular architecture.', pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
        { name: 'Saransh Singh', role: 'UI/UX Designer', description: 'Specializes in crafting premium dark/light mode interfaces and custom transitions.', pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }
      ])
    };

    settings.forEach(s => {
      config[s.key] = s.value;
    });

    // Parse developer_team if it's stored as JSON
    try {
      config.developer_team = JSON.parse(config.developer_team);
    } catch (e) {
      config.developer_team = [];
    }

    res.status(200).json(config);
  } catch (error) {
    console.error('Get Public Settings Error:', error);
    res.status(500).json({ message: 'Internal server error retrieving public settings.' });
  }
};

exports.updatePublicSettings = async (req, res) => {
  try {
    const { app_about, app_how_it_works, developer_team } = req.body;

    const updates = {
      app_about,
      app_how_it_works,
      developer_team: typeof developer_team === 'string' ? developer_team : JSON.stringify(developer_team)
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await Setting.upsert({ key, value });
      }
    }

    res.status(200).json({ message: 'Public settings updated successfully.' });
  } catch (error) {
    console.error('Update Public Settings Error:', error);
    res.status(500).json({ message: 'Internal server error updating public settings.' });
  }
};

exports.uploadDevPic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const relativePath = `uploads/${req.file.filename}`;
    res.status(200).json({ url: relativePath });
  } catch (error) {
    console.error('Upload Developer Pic Error:', error);
    res.status(500).json({ message: 'Internal server error uploading developer picture.' });
  }
};


