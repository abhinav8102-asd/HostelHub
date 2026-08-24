const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MessReview = sequelize.define('MessReview', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mealType: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'snacks', 'dinner'),
      defaultValue: 'lunch'
    },
    foodQuality: {
      type: DataTypes.INTEGER, // 1 to 5
      allowNull: false,
      defaultValue: 5
    },
    hygiene: {
      type: DataTypes.INTEGER, // 1 to 5
      allowNull: false,
      defaultValue: 5
    },
    cleanliness: {
      type: DataTypes.INTEGER, // 1 to 5
      allowNull: false,
      defaultValue: 5
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    }
  });

  return MessReview;
};
