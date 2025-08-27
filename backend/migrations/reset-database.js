const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting database...');

const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    // Drop all tables
    const dropTables = [
      'DROP TABLE IF EXISTS equipment_history',
      'DROP TABLE IF EXISTS equipment',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS locations'
    ];

    db.serialize(() => {
      // Drop tables
      dropTables.forEach((query, index) => {
        db.run(query, (err) => {
          if (err) {
            console.error(`Error dropping table ${index + 1}:`, err.message);
          } else {
            console.log(`✅ Dropped table ${index + 1}`);
          }
        });
      });

      // Wait a bit for tables to be dropped, then recreate
      setTimeout(() => {
        const { initDatabase } = require('../config/database');
        initDatabase()
          .then(() => {
            console.log('✅ Database reset completed successfully!');
            console.log('🆕 All tables recreated with fresh sample data');
            resolve();
          })
          .catch(reject);
      }, 1000);
    });
  });
};

resetDatabase()
  .then(() => {
    console.log('🎉 Database is ready for use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  });
