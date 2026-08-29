const fs = require('fs');
const sequelize = require('../config/db');
const { MessMenu, MessFeedback, MessSkip, User } = require('../models');
const { Op } = require('sequelize');

// Official Hostel Mess Menu Data
const defaultMenu = [
  {
    dayOfWeek: 'Monday',
    breakfast: 'PLAIN PARATHA-03, ALU CHANA SABJI & TEA',
    lunch: 'RICE, DAL, GREEN SABJI & GREEN CHATNI ACHAR',
    snacks: 'SAMOSA-(02PCS) CHATNI & TEA (100ML)',
    dinner: 'ROTI, RICE, CHANA DAL TADKA & MIX BHUJIYA'
  },
  {
    dayOfWeek: 'Tuesday',
    breakfast: 'PLAIN ROTI -04 PC, GHOOGHNI & TEA',
    lunch: 'RICE, CURRY BARRY(04PCS) & ALU GREEN VEG BHUJIYA',
    snacks: 'VEG CHOWMEIN-01 PLATE, TEA',
    dinner: 'JEERA RICE, ROTI-5, CHANA DAL & GREEN VEG'
  },
  {
    dayOfWeek: 'Wednesday',
    breakfast: 'PURI 05 PCS, ALU CHANA SABJI, BUNDIYA & TEA',
    lunch: 'RICE, DAL, RAJMA SABJI & PAPAD',
    snacks: 'TOAST - 04PCS/MIXTURE & TEA',
    dinner: 'ROTI, RICE, DAL, & FISH-02 PCS / BUTTER PANEER MASALA'
  },
  {
    dayOfWeek: 'Thursday',
    breakfast: 'IDLI- 03 PCS, SHAMBER AND CHANA DAL CHATNI & TEA',
    lunch: 'RICE, DAL & GREEN VEG & ACHAR/CHATNI',
    snacks: 'ALU CHOP(2Nos), CHATNI & TEA',
    dinner: 'PURI ALU CHANA SABJI & KHEER'
  },
  {
    dayOfWeek: 'Friday',
    breakfast: 'SATTU PARATHA -02 PCS, ALU CHANA DAAL-SABJI & TEA',
    lunch: 'RICE, DAL, SEASONAL VEG & SALAD',
    snacks: 'PASTA -01 PLATE & TEA',
    dinner: 'ROTI 4pcs, JEERA RICE, DAL & CHANA MASALA / EGG CURRY-01 + ALU PCS'
  },
  {
    dayOfWeek: 'Saturday',
    breakfast: 'METHI PARATHA-02, GREEN CHATNI & TEA',
    lunch: 'KHICHRI, CHOKHA, PAPAD & ACHAR',
    snacks: 'PAKODI/NIMKI & TEA',
    dinner: 'ROTI, RICE, DAL & ALU DAM / MIX VEG'
  },
  {
    dayOfWeek: 'Sunday',
    breakfast: 'CHHOLA BHATHURA-02 PCS & TEA',
    lunch: 'RICE, DAL, MIX VEG, RAITA',
    snacks: 'TEA',
    dinner: 'PULAO, ROTI-5 PCS, CHANA DAL, CHICKEN-03 PCS / MUTTER PANEER & SWEETS'
  }
];

const checkAndSeedMenu = async () => {
  try {
    for (const item of defaultMenu) {
      const existing = await MessMenu.findOne({ where: { dayOfWeek: item.dayOfWeek } });
      if (existing) {
        await existing.update(item);
      } else {
        await MessMenu.create(item);
      }
    }
    console.log('Official Mess Menu synchronized successfully.');
  } catch (err) {
    console.error('Error synchronizing mess menu:', err.message);
  }
};

// 1. Get Weekly Menu
exports.getMenu = async (req, res) => {
  try {
    await checkAndSeedMenu();
    const menu = await MessMenu.findAll({ order: [['id', 'ASC']] });
    res.status(200).json(menu);
  } catch (error) {
    console.error('Error fetching mess menu:', error);
    res.status(500).json({ message: 'Error retrieving mess menu.' });
  }
};

// 2. Update Menu Day (Warden / Admin)
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast, lunch, snacks, dinner } = req.body;

    const menuItem = await MessMenu.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu day not found.' });
    }

    menuItem.breakfast = breakfast !== undefined ? breakfast : menuItem.breakfast;
    menuItem.lunch = lunch !== undefined ? lunch : menuItem.lunch;
    if (snacks !== undefined) menuItem.snacks = snacks;
    menuItem.dinner = dinner !== undefined ? dinner : menuItem.dinner;
    await menuItem.save();

    res.status(200).json({ message: 'Mess menu updated successfully!', menu: menuItem });
  } catch (error) {
    console.error('Error updating mess menu:', error);
    res.status(500).json({ message: 'Error updating mess menu.' });
  }
};

// 3. Submit Meal Feedback (Student only)
exports.submitFeedback = async (req, res) => {
  try {
    const { mealType, date, rating, comment } = req.body;
    const studentId = req.userId;

    if (!mealType || !date || !rating) {
      return res.status(400).json({ message: 'Meal type, date, and rating are required.' });
    }

    const ratingVal = parseInt(rating, 10) || 5;

    let photoUrl = req.body.photoUrl || req.body.photo || null;
    if (req.file) {
      try {
        const mimeType = req.file.mimetype || 'image/jpeg';
        let base64Str = null;
        if (req.file.buffer) {
          base64Str = req.file.buffer.toString('base64');
        } else if (req.file.path && fs.existsSync(req.file.path)) {
          base64Str = fs.readFileSync(req.file.path).toString('base64');
        }
        if (base64Str) {
          photoUrl = `data:${mimeType};base64,${base64Str}`;
        } else if (req.file.filename) {
          photoUrl = `/uploads/${req.file.filename}`;
        }
      } catch (fileErr) {
        console.error('Error converting file to base64:', fileErr);
        if (req.file.filename) {
          photoUrl = `/uploads/${req.file.filename}`;
        }
      }
    }

    let feedback = null;
    try {
      feedback = await MessFeedback.findOne({
        where: { studentId, mealType, date }
      });
    } catch (findErr) {
      console.warn('MessFeedback findOne warning:', findErr.message);
    }

    try {
      if (feedback) {
        feedback.rating = ratingVal;
        feedback.comment = comment || '';
        if (photoUrl) {
          feedback.photoUrl = photoUrl;
        }
        await feedback.save();
      } else {
        feedback = await MessFeedback.create({
          studentId,
          mealType,
          date,
          rating: ratingVal,
          comment: comment || '',
          photoUrl
        });
      }
    } catch (saveError) {
      console.error('Initial feedback save failed, retrying without photoUrl:', saveError.message);
      try {
        if (feedback) {
          feedback.rating = ratingVal;
          feedback.comment = comment || '';
          await feedback.save();
        } else {
          feedback = await MessFeedback.create({
            studentId,
            mealType,
            date,
            rating: ratingVal,
            comment: comment || ''
          });
        }
      } catch (saveError2) {
        console.error('Sequelize save failed, executing raw SQL fallback:', saveError2.message);
        const photoValStr = photoUrl ? `'${photoUrl}'` : 'NULL';
        const safeComment = (comment || '').replace(/'/g, "''");
        
        try {
          // PostgreSQL / MySQL INSERT fallback
          await sequelize.query(`
            INSERT INTO mess_feedbacks (student_id, meal_type, date, rating, comment, photo_url, "createdAt", "updatedAt")
            VALUES (${studentId}, '${mealType}', '${date}', ${ratingVal}, '${safeComment}', ${photoValStr}, NOW(), NOW());
          `);
        } catch (rawSqlErr) {
          console.error('Raw SQL fallback error:', rawSqlErr.message);
          // Standard simple insert
          await sequelize.query(`
            INSERT INTO mess_feedbacks (student_id, meal_type, date, rating, comment, "createdAt", "updatedAt")
            VALUES (${studentId}, '${mealType}', '${date}', ${ratingVal}, '${safeComment}', NOW(), NOW());
          `);
        }
      }
    }

    return res.status(200).json({ message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ message: 'Error submitting feedback: ' + (error.message || 'Server error') });
  }
};

// 4. Get Feedback Stats (Warden / Admin)
exports.getFeedbackStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all feedbacks from the last 7 days (1 week auto-expiry) with student details
    const feedbacks = await MessFeedback.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'roomNumber', 'hostelBlock']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5000
    });

    // Calculate average ratings
    const stats = {
      overallAvg: 0,
      breakfastAvg: 0,
      lunchAvg: 0,
      dinnerAvg: 0,
      totalCount: feedbacks.length,
      breakfastCount: 0,
      lunchCount: 0,
      dinnerCount: 0
    };

    let totalRating = 0;
    let bRating = 0, lRating = 0, dRating = 0;

    feedbacks.forEach(f => {
      totalRating += f.rating;
      if (f.mealType === 'breakfast') {
        bRating += f.rating;
        stats.breakfastCount++;
      } else if (f.mealType === 'lunch') {
        lRating += f.rating;
        stats.lunchCount++;
      } else if (f.mealType === 'dinner') {
        dRating += f.rating;
        stats.dinnerCount++;
      }
    });

    stats.overallAvg = stats.totalCount ? +(totalRating / stats.totalCount).toFixed(1) : 0;
    stats.breakfastAvg = stats.breakfastCount ? +(bRating / stats.breakfastCount).toFixed(1) : 0;
    stats.lunchAvg = stats.lunchCount ? +(lRating / stats.lunchCount).toFixed(1) : 0;
    stats.dinnerAvg = stats.dinnerCount ? +(dRating / stats.dinnerCount).toFixed(1) : 0;

    const formattedFeedbacks = feedbacks.map(f => {
      const plain = f.get({ plain: true });
      return {
        ...plain,
        photoUrl: plain.photoUrl || plain.photo_url || null
      };
    });

    res.status(200).json({ stats, feedbacks: formattedFeedbacks });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ message: 'Error retrieving feedback stats.' });
  }
};

// 5. Toggle Skip Meal (Student only)
exports.toggleSkipMeal = async (req, res) => {
  try {
    const { mealType, date } = req.body;
    const studentId = req.userId;

    if (!mealType || !date) {
      return res.status(400).json({ message: 'Meal type and date are required.' });
    }

    const existing = await MessSkip.findOne({
      where: { studentId, mealType, date }
    });

    if (existing) {
      // Unskip the meal
      await existing.destroy();
      return res.status(200).json({ message: 'Meal skip cancelled!', skipped: false });
    } else {
      // Skip the meal
      const skippedMeal = await MessSkip.create({
        studentId,
        mealType,
        date
      });
      return res.status(200).json({ message: 'Meal marked as skipped!', skipped: true, skippedMeal });
    }
  } catch (error) {
    console.error('Error toggling meal skip:', error);
    res.status(500).json({ message: 'Error updating meal skip status.' });
  }
};

// 6. Get My Skipped Meals (Student only)
exports.getMySkippedMeals = async (req, res) => {
  try {
    const studentId = req.userId;
    const skips = await MessSkip.findAll({
      where: { studentId },
      order: [['date', 'ASC']]
    });
    res.status(200).json(skips);
  } catch (error) {
    console.error('Error fetching skipped meals:', error);
    res.status(500).json({ message: 'Error fetching skipped meals.' });
  }
};

// 7. Get Skip Summary (Warden / Admin)
exports.getSkipSummary = async (req, res) => {
  try {
    // Get skips from today onwards
    const today = new Date().toISOString().split('T')[0];
    const skips = await MessSkip.findAll({
      where: {
        date: {
          [Op.gte]: today
        }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'roomNumber', 'hostelBlock']
        }
      ]
    });

    // Group skips by date and mealType for easy analytics dashboard
    const summary = {};
    skips.forEach(s => {
      if (!summary[s.date]) {
        summary[s.date] = { breakfast: 0, lunch: 0, dinner: 0, list: [] };
      }
      summary[s.date][s.mealType]++;
      summary[s.date].list.push(s);
    });

    res.status(200).json({ summary, allSkips: skips });
  } catch (error) {
    console.error('Error fetching skip summary:', error);
    res.status(500).json({ message: 'Error fetching skip summary.' });
  }
};
