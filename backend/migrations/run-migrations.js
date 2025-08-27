const { initDatabase } = require('../config/database');

console.log('🚀 Starting database migrations...');

initDatabase()
  .then(() => {
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 Database is ready with sample data');
    console.log('🔗 You can now connect to the database using Beekeeper Studio');
    console.log('📁 Database file location: backend/data/equipment.db');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  });
