import { connect, disconnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

async function createTestUsers() {
  try {
    console.log('Connecting to database...');
    await connect();

    // Create test users
    const users = [
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123',
        role: 'user',
        verified: true
      },
      {
        username: 'testmod',
        email: 'mod@example.com',
        password: 'test123',
        role: 'moderator',
        verified: true
      },
      {
        username: 'testadmin',
        email: 'admin@example.com',
        password: 'test123',
        role: 'admin',
        verified: true
      }
    ];

    for (const userData of users) {
      // Check if user exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Created ${userData.role}: ${userData.username}`);
    }

    console.log('\nTest users created successfully!');
    console.log('\nYou can now login with:');
    console.log('1. Regular User');
    console.log('   Username: testuser');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');
    console.log('\n2. Moderator');
    console.log('   Username: testmod');
    console.log('   Email: mod@example.com');
    console.log('   Password: test123');
    console.log('\n3. Admin');
    console.log('   Username: testadmin');
    console.log('   Email: admin@example.com');
    console.log('   Password: test123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await disconnect();
  }
}

createTestUsers();