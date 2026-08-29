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
      limit: 500
    });

    let totalRating = 0;
    let bTotal = 0, bCount = 0;
    let lTotal = 0, lCount = 0;
    let sTotal = 0, sCount = 0;
    let dTotal = 0, dCount = 0;

    const normalizedFeedbacks = (feedbacks || []).map(f => {
      const rating = Number(f.rating) || 0;
      totalRating += rating;

      const m = (f.mealType || '').toLowerCase().trim();
      if (m === 'breakfast') { bTotal += rating; bCount++; }
      else if (m === 'lunch') { lTotal += rating; lCount++; }
      else if (m === 'snacks') { sTotal += rating; sCount++; }
      else if (m === 'dinner') { dTotal += rating; dCount++; }

      return {
        id: f.id,
        mealType: f.mealType || 'General',
        foodQuality: f.rating,
        rating: f.rating,
        comments: f.comment || '',
        comment: f.comment || '',
        photoUrl: f.photoUrl || f.photo_url || null,
        student: f.student ? f.student.toJSON() : { name: 'Student', roomNumber: 'N/A', hostelBlock: 'Block' },
        createdAt: f.createdAt
      };
    });

    const totalReviews = normalizedFeedbacks.length;
    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';
    const breakfastAvg = bCount > 0 ? (bTotal / bCount).toFixed(1) : '0.0';
    const lunchAvg = lCount > 0 ? (lTotal / lCount).toFixed(1) : '0.0';
    const snacksAvg = sCount > 0 ? (sTotal / sCount).toFixed(1) : '0.0';
    const dinnerAvg = dCount > 0 ? (dTotal / dCount).toFixed(1) : '0.0';

    return res.json({
      summary: {
        totalReviews,
        avgRating,
        breakfastAvg,
        lunchAvg,
        snacksAvg,
        dinnerAvg
      },
      reviews: normalizedFeedbacks
    });
  } catch (error) {
    console.error('Error fetching mess analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch mess analytics: ' + error.message });
  }
};
