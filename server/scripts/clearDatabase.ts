import mongoose from 'mongoose';
import { Message } from '../src/models/Message';
import { DesignSession } from '../src/models/DesignSession';
import { User } from '../src/models/User';
import { Asset } from '../src/models/Asset';
import { config } from '../src/config/env';
import { logger } from '../src/lib/logger';

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.url);
    console.log('Connected to MongoDB');

    // Delete all documents from collections
    const messageCount = await Message.deleteMany({});
    const sessionCount = await DesignSession.deleteMany({});
    const assetCount = await Asset.deleteMany({});
    
    // Note: Don't delete users as they need to login
    console.log(`✅ Deleted ${messageCount.deletedCount} messages`);
    console.log(`✅ Deleted ${sessionCount.deletedCount} sessions`);
    console.log(`✅ Deleted ${assetCount.deletedCount} assets`);
    console.log('✅ Database cleared successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
