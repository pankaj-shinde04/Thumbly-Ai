import mongoose from 'mongoose';
import { User } from './models/User';

async function testDatabase() {
  try {
    // Use a hardcoded connection string to bypass config issues
    const connectionString = 'mongodb+srv://pankajshinde2434_db_user:Pass%40123@cluster0.rytkgff.mongodb.net/thumbly-ai?retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'password123'
    });

    // Save the user
    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📋 User ID:', testUser._id);
    console.log('📧 User Email:', testUser.email);

    // List all databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('📊 Available databases:', databases.databases.map((db: any) => db.name));

    // List collections in thumbly-ai database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in thumbly-ai:', collections.map((col: any) => col.name));

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDatabase();
