import mongoose from 'mongoose';
import { Message } from '../src/models/Message';
import { DesignSession } from '../src/models/DesignSession';
import { User } from '../src/models/User';
import { config } from '../src/config/env';

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.url);
    console.log('✅ Connected to MongoDB');

    // Test if we can find users
    const userCount = await User.countDocuments();
    console.log(`✅ Users in database: ${userCount}`);

    // Test if we can find sessions
    const sessionCount = await DesignSession.countDocuments();
    console.log(`✅ Sessions in database: ${sessionCount}`);

    // Test if we can find messages
    const messageCount = await Message.countDocuments();
    console.log(`✅ Messages in database: ${messageCount}`);

    // Test creating a sample session
    console.log('\n--- Testing Session Creation ---');
    const testSession = new DesignSession({
      userId: new mongoose.Types.ObjectId(), // Test user ID
      title: 'Test Session',
      platform: 'youtube',
      status: 'active'
    });
    
    await testSession.save();
    console.log(`✅ Test session created with ID: ${testSession._id}`);

    // Test creating a sample message
    console.log('\n--- Testing Message Creation ---');
    const testMessage = new Message({
      sessionId: testSession._id,
      role: 'user',
      content: 'Test message',
      metadata: {}
    });
    
    await testMessage.save();
    console.log(`✅ Test message created with ID: ${testMessage._id}`);

    // Clean up test data
    await Message.deleteOne({ _id: testMessage._id });
    await DesignSession.deleteOne({ _id: testSession._id });
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All database tests passed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testDatabase();
