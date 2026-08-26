const { MessMenu, MessFeedback, MessSkip, User } = require('../models');
const { Op } = require('sequelize');

// Self-healing default menu seed data
const defaultMenu = [
  { dayOfWeek: 'Monday', breakfast: 'Aloo Paratha with Curd & Pickle', lunch: 'Rajma Masala, Steamed Rice, Roti, Salad', snacks: 'Samosa & Hot Chai', dinner: 'Mix Veg, Dal Tadka, Roti, Kheer' },
  { dayOfWeek: 'Tuesday', breakfast: 'Idli, Wada with Sambar & Coconut Chutney', lunch: 'Kadhi Pakoda, Jeera Rice, Roti, Aloo Jeera', snacks: 'Veg Pakora & Tea', dinner: 'Paneer Bhurji, Dal Fry, Roti, Gulab Jamun' },
  { dayOfWeek: 'Wednesday', breakfast: 'Poha with Sev, Tea/Milk & Fruits', lunch: 'Veg Biryani, Veg Raita, Roti, Papad', snacks: 'Bread Cutlet & Coffee', dinner: 'Dal Makhani, Egg Curry / Paneer Pasanda, Roti, Ice Cream' },
  { dayOfWeek: 'Thursday', breakfast: 'Puri Bhaji & Tea/Coffee', lunch: 'Chole Bhature, Boondi Raita, Onion Salad', snacks: 'Suji Halwa & Chai', dinner: 'Aloo Gobi Matar, Yellow Dal, Roti, Custard' },
  { dayOfWeek: 'Friday', breakfast: 'Uttapam with Tomato & Coconut Chutney', lunch: 'Dal Fry, Rice, Seasonal Dry Veg, Roti', snacks: 'Kachori & Tea', dinner: 'Shahi Paneer, Butter Naan / Roti, Dal Fry, Halwa' },
  { dayOfWeek: 'Saturday', breakfast: 'Bread Butter, Jam & Omelette / Sprouts', lunch: 'Veg Pulao, Kadhi, Roti, French Fries', snacks: 'Veg Roll & Coffee', dinner: 'Pav Bhaji, Pulao, Salad, Rasgulla' },
  { dayOfWeek: 'Sunday', breakfast: 'Chole Kulche, Pickle & Lassi', lunch: 'Special Veg Thali (Paneer Butter Masala, Dal Makhani, Pulao, Roti, Sweet)', snacks: 'Cream Roll & Milk', dinner: 'Aloo Shimla Mirch, Khichdi / Roti, Curd' }
];

const checkAndSeedMenu = async () => {
  const count = await MessMenu.count();
  if (count === 0) {
    console.log('Seeding default Mess Menu...');
    await MessMenu.bulkCreate(defaultMenu);
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

    // Check if student has already rated this meal for the day
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    let feedback = await MessFeedback.findOne({
      where: { studentId, mealType, date }
    });

    if (feedback) {
      // Update existing feedback
      feedback.rating = rating;
      feedback.comment = comment;
      if (photoUrl) {
        feedback.photoUrl = photoUrl;
      }
      await feedback.save();
    } else {
      // Create new feedback
      feedback = await MessFeedback.create({
        studentId,
        mealType,
        date,
        rating,
        comment,
        photoUrl
      });
    }

    res.status(200).json({ message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback.' });
  }
};

// 4. Get Feedback Stats (Warden / Admin)
exports.getFeedbackStats = async (req, res) => {
  try {
    // Get all feedbacks with student details
    const feedbacks = await MessFeedback.findAll({
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

    res.status(200).json({ stats, feedbacks });
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
