const { MessReview, MessFeedback, User } = require('../models');

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

// Get Mess Review Analytics & Reviews List (Aggregating both MessFeedback & MessReview)
exports.getMessAnalytics = async (req, res) => {
  try {
    let feedbackList = [];
    try {
      feedbackList = await MessFeedback.findAll({
        include: [{ model: User, as: 'student', attributes: ['name', 'email', 'roomNumber', 'hostelBlock'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    } catch (e) {
      console.error('Error fetching MessFeedback:', e);
    }

    let reviewsList = [];
    try {
      reviewsList = await MessReview.findAll({
        include: [{ model: User, as: 'student', attributes: ['name', 'email', 'roomNumber', 'hostelBlock'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    } catch (e) {
      console.error('Error fetching MessReview:', e);
    }

    const normalizedFeedbacks = (feedbackList || []).map(f => ({
      id: f.id,
      mealType: f.mealType,
      foodQuality: f.rating,
      comments: f.comment || '',
      student: f.student,
      createdAt: f.createdAt
    }));

    const normalizedReviews = (reviewsList || []).map(r => ({
      id: r.id,
      mealType: r.mealType,
      foodQuality: r.foodQuality,
      comments: r.comments || '',
      student: r.student,
      createdAt: r.createdAt
    }));

    const allReviews = [...normalizedFeedbacks, ...normalizedReviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalReviews = allReviews.length;
    let totalQualitySum = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const r of allReviews) {
      const q = Math.min(Math.max(Number(r.foodQuality) || 5, 1), 5);
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
      reviews: allReviews
    });
  } catch (error) {
    console.error('Error fetching mess analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch mess analytics: ' + error.message });
  }
};
