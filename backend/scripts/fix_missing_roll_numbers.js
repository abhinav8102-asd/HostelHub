const User = require('../models/User');
const sequelize = require('../config/db');

async function fixMissingRollNumbers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB for roll number fix.');

    const students = await User.findAll({ where: { role: 'student' } });
    let updatedCount = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (!student.rollNumber || student.rollNumber.trim() === '') {
        const generatedRoll = student.roomNumber 
          ? `2025STU-${student.roomNumber}` 
          : `2025STU-${100 + student.id}`;
        
        // Ensure uniqueness
        const exists = await User.findOne({ where: { rollNumber: generatedRoll } });
        const finalRoll = exists ? `2025STU-${100 + student.id}` : generatedRoll;

        student.rollNumber = finalRoll;
        await student.save();
        updatedCount++;
        console.log(`Updated user ${student.name} (ID: ${student.id}) with Roll Number: ${finalRoll}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} student roll numbers!`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing missing roll numbers:', error);
    process.exit(1);
  }
}

fixMissingRollNumbers();
