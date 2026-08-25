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
    const feedbacks = await MessFeedback.findAll({
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'roomNumber', 'hostelBlock']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    let totalRating = 0;
    const normalizedFeedbacks = (feedbacks || []).map(f => {
      totalRating += (f.rating || 0);
      return {
        id: f.id,
        mealType: f.mealType,
        foodQuality: f.rating,
        comments: f.comment || '',
        student: f.student ? f.student.toJSON() : { name: 'Student', roomNumber: 'N/A', hostelBlock: 'Block' },
        createdAt: f.createdAt
      };
    });

    const totalReviews = normalizedFeedbacks.length;
    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';

    return res.json({
      summary: {
        totalReviews,
        avgRating
      },
      reviews: normalizedFeedbacks
    });
  } catch (error) {
    console.error('Error fetching mess analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch mess analytics: ' + error.message });
  }
};
