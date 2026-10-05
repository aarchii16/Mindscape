const mongoose = require('mongoose');
const User = require('../models/user.model');
const Slot = require('../models/slot.model');
const Chat = require('../models/chat.model');
const Appointment = require('../models/appointment.model');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mindscape', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Chat.deleteMany({});
    await Appointment.deleteMany({});

    // Seed users
    const users = [
      {
        username: 'john_student',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        institution: 'University of Example',
        yearOfStudy: '2'
      },
      {
        username: 'jane_student',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student',
        institution: 'University of Example',
        yearOfStudy: '3'
      },
      {
        username: 'dr_sarah_thompson',
        email: 'sarah.thompson@mindscape.edu',
        password: 'password123',
        firstName: 'Dr. Sarah',
        lastName: 'Thompson',
        role: 'counselor',
        bio: 'Licensed Clinical Psychologist with 12 years of experience. Specializes in anxiety, depression, and academic stress. Former Director of Student Counseling at Stanford University.',
        credentials: 'Ph.D. in Clinical Psychology, Licensed Psychologist (PSY12345)',
        specializations: ['Anxiety Disorders', 'Depression', 'Academic Stress', 'Trauma']
      },
      {
        username: 'dr_michael_chen',
        email: 'michael.chen@mindscape.edu',
        password: 'password123',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        role: 'counselor',
        bio: 'Board-certified psychiatrist with expertise in college mental health. Research focus on student well-being and mindfulness-based interventions.',
        credentials: 'M.D., Board Certified in Psychiatry (MD45678)',
        specializations: ['Mood Disorders', 'ADHD', 'Sleep Issues', 'Mindfulness Therapy']
      },
      {
        username: 'emily_rodriguez_lcsw',
        email: 'emily.rodriguez@mindscape.edu',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        role: 'counselor',
        bio: 'Licensed Clinical Social Worker specializing in multicultural counseling and LGBTQ+ student support. 8 years experience working with diverse college populations.',
        credentials: 'LCSW, Certified Multicultural Counselor (LCSW78901)',
        specializations: ['LGBTQ+ Issues', 'Cultural Identity', 'Relationship Counseling', 'Grief Support']
      },
      {
        username: 'david_kumar_ma',
        email: 'david.kumar@mindscape.edu',
        password: 'password123',
        firstName: 'David',
        lastName: 'Kumar',
        role: 'counselor',
        bio: 'Mental Health Counselor with expertise in career counseling and life transitions. Former college athlete turned counselor, understands student-athlete challenges.',
        credentials: 'M.A. in Counseling Psychology, Certified Career Counselor',
        specializations: ['Career Counseling', 'Life Transitions', 'Athlete Mental Health', 'Stress Management']
      },
      {
        username: 'admin_mike',
        email: 'admin@mindscape.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Admin',
        role: 'admin'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Users seeded');

    const sarah = createdUsers.find(u => u.username === 'dr_sarah_thompson');
    const michael = createdUsers.find(u => u.username === 'dr_michael_chen');
    const emily = createdUsers.find(u => u.username === 'emily_rodriguez_lcsw');
    const david = createdUsers.find(u => u.username === 'david_kumar_ma');
    const john = createdUsers.find(u => u.username === 'john_student');

    // Seed slots
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(now.getDate() + 2);

    const slots = [
      {
        counselor: sarah._id,
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
        type: 'therapy',
        isAvailable: true,
        notes: 'Initial anxiety assessment and treatment planning'
      },
      {
        counselor: sarah._id,
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
        type: 'consultation',
        isAvailable: true,
        notes: 'Academic stress management session'
      },
      {
        counselor: michael._id,
        startTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 10, 0),
        endTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 11, 0),
        type: 'therapy',
        isAvailable: true,
        notes: 'Mood disorder evaluation and mindfulness techniques'
      },
      {
        counselor: michael._id,
        startTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 16, 0),
        endTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 17, 0),
        type: 'consultation',
        isAvailable: true,
        notes: 'ADHD assessment and study strategies'
      },
      {
        counselor: emily._id,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 13, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0),
        type: 'therapy',
        isAvailable: true,
        notes: 'LGBTQ+ identity exploration and support'
      },
      {
        counselor: david._id,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 11, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 12, 0),
        type: 'coaching',
        isAvailable: true,
        notes: 'Career transition counseling and resume review'
      },
      {
        counselor: david._id,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 15, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 16, 0),
        type: 'consultation',
        isAvailable: true,
        notes: 'Athlete mental health and performance anxiety'
      }
    ];

    const createdSlots = await Slot.create(slots);
    console.log('Slots seeded');

    // Note: No synthetic chat or appointment seeded - start with clean data for real interactions

    console.log('Seeding completed successfully!');
    console.log('Sample data created:');
    console.log('- Students: john_student, jane_student');
    console.log('- Counselors: dr_sarah_thompson, dr_michael_chen, emily_rodriguez_lcsw, david_kumar_ma');
    console.log('- Admin: admin_mike');
    console.log('- Password for all: password123');
    console.log('- Available slots: 7 counseling sessions across different specialties');
    console.log('- No synthetic chats or appointments - ready for real student-counselor interactions');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;