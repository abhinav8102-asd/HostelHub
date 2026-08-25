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
    let normalizedFeedbacks = [];
    try {
      const feedbackList = await MessFeedback.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      const studentIds = [...new Set((feedbackList || []).map(f => f.studentId).filter(Boolean))];
      let studentMap = new Map();
      if (studentIds.length > 0) {
        const students = await User.findAll({
          where: { id: studentIds },
          attributes: ['id', 'name', 'email', 'roomNumber', 'hostelBlock']
        });
        studentMap = new Map(students.map(s => [s.id, s]));
      }

      normalizedFeedbacks = (feedbackList || []).map(f => {
        const st = studentMap.get(f.studentId);
        return {
          id: f.id,
          mealType: f.mealType,
          foodQuality: f.rating,
          comments: f.comment || '',
          student: st ? st.toJSON() : { name: 'Student', roomNumber: 'N/A', hostelBlock: 'Block' },
          createdAt: f.createdAt
        };
      });
    } catch (e) {
      console.error('Error fetching MessFeedback:', e);
    }

    let normalizedReviews = [];
    try {
      const reviewsList = await MessReview.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      const reviewStudentIds = [...new Set((reviewsList || []).map(r => r.studentId).filter(Boolean))];
      let reviewStudentMap = new Map();
      if (reviewStudentIds.length > 0) {
        const reviewStudents = await User.findAll({
          where: { id: reviewStudentIds },
          attributes: ['id', 'name', 'email', 'roomNumber', 'hostelBlock']
        });
        reviewStudentMap = new Map(reviewStudents.map(s => [s.id, s]));
      }

      normalizedReviews = (reviewsList || []).map(r => {
        const st = reviewStudentMap.get(r.studentId);
        return {
          id: r.id,
          mealType: r.mealType,
          foodQuality: r.foodQuality,
          comments: r.comments || '',
          student: st ? st.toJSON() : { name: 'Student', roomNumber: 'N/A', hostelBlock: 'Block' },
          createdAt: r.createdAt
        };
      });
    } catch (e) {
      console.error('Error fetching MessReview:', e);
    }

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
