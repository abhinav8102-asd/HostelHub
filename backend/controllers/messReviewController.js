const { MessReview, User, sequelize } = require('../models');

// Submit student mess review
exports.submitMessReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mealType, foodQuality, hygiene, cleanliness, comments } = req.body;

    const review = await MessReview.create({
      studentId,
      mealType: mealType || 'lunch',
      foodQuality: Number(foodQuality) || 5,
      hygiene: Number(hygiene) || 5,
      cleanliness: Number(cleanliness) || 5,
      comments: comments || ''
    });

    return res.status(201).json({ message: 'Mess review submitted successfully!', review });
  } catch (error) {
    console.error('Error submitting mess review:', error);
    return res.status(500).json({ message: 'Failed to submit mess review.' });
  }
};

// Get Mess Review Analytics & Reviews List
exports.getMessAnalytics = async (req, res) => {
  try {
    const reviews = await MessReview.findAll({
      include: [{ model: User, as: 'student', attributes: ['name', 'email', 'roomNumber', 'hostelBlock'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const totalReviews = await MessReview.count();
    
    // Rating distribution (1 to 5 stars)
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalQualitySum = 0;

    const allReviews = await MessReview.findAll({ attributes: ['foodQuality'] });
    for (const r of allReviews) {
      const q = Math.min(Math.max(r.foodQuality, 1), 5);
      ratingDistribution[q] = (ratingDistribution[q] || 0) + 1;
      totalQualitySum += q;
    }

    const avgRating = totalReviews > 0 ? (totalQualitySum / totalReviews).toFixed(1) : '0.0';

    return res.json({
      summary: {
        totalReviews,
        avgRating,
        ratingDistribution
      },
      reviews
    });
  } catch (error) {
    console.error('Error fetching mess analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch mess analytics.' });
  }
};
