const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'data', 'equipment.db');

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database with tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create database connection
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
      console.log(`📁 Database location: ${dbPath}`);
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // Equipment table
      const createEquipmentTable = `
        CREATE TABLE IF NOT EXISTS equipment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('Available', 'In Use', 'Maintenance', 'Retired')),
          location TEXT,
          purchaseDate TEXT,
          lastMaintenance TEXT,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Equipment history table for tracking changes
      const createHistoryTable = `
        CREATE TABLE IF NOT EXISTS equipment_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          equipmentId INTEGER NOT NULL,
          action TEXT NOT NULL,
          oldValues TEXT,
          newValues TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (equipmentId) REFERENCES equipment (id)
        )
      `;

      // Categories table for predefined categories
      const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT
        )
      `;

      // Locations table for predefined locations
      const createLocationsTable = `
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT
        )
      `;

      let completedOperations = 0;
      const totalOperations = 7; // 4 table creations + 3 data insertions

      const checkCompletion = () => {
        completedOperations++;
        if (completedOperations === totalOperations) {
          console.log('✅ All database operations completed');
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            }
            resolve();
          });
        }
      };

      // Create all tables first
      db.run(createEquipmentTable, (err) => {
        if (err) {
          console.error('Error creating equipment table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Equipment table created/verified');
        checkCompletion();
      });

      db.run(createHistoryTable, (err) => {
        if (err) {
          console.error('Error creating history table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ History table created/verified');
        checkCompletion();
      });

      db.run(createCategoriesTable, (err) => {
        if (err) {
          console.error('Error creating categories table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Categories table created/verified');
        checkCompletion();
      });

      db.run(createLocationsTable, (err) => {
        if (err) {
          console.error('Error creating locations table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Locations table created/verified');
        checkCompletion();
      });

      // Insert default categories
      const defaultCategories = [
        'Electronics',
        'Tools',
        'Medical Equipment',
        'Safety & Security',
        'Appliances',
        'IT & Networking',
        'Miscellaneous'
      ];

      // First clear existing categories, then insert new ones
      db.run('DELETE FROM categories', (err) => {
        if (err) {
          console.error('Error clearing categories:', err.message);
        } else {
          console.log('✅ Categories table cleared');
          
          let categoriesInserted = 0;
          const totalCategories = defaultCategories.length;
          
          const insertNextCategory = () => {
            if (categoriesInserted >= totalCategories) {
              console.log('✅ Default categories inserted');
              checkCompletion();
              return;
            }
            
            const category = defaultCategories[categoriesInserted];
            db.run('INSERT INTO categories (name) VALUES (?)', [category], (err) => {
              if (err) {
                console.error(`Error inserting category '${category}':`, err.message);
              }
              categoriesInserted++;
              insertNextCategory();
            });
          };
          
          insertNextCategory();
        }
      });

      // Insert default locations
      const defaultLocations = [
        'Main Office',
        'Warehouse A',
        'Warehouse B',
        'Lab 1',
        'Lab 2',
        'Field Office',
        'Maintenance Bay',
        'Storage Room'
      ];

      // First clear existing locations, then insert new ones
      db.run('DELETE FROM locations', (err) => {
        if (err) {
          console.error('Error clearing locations:', err.message);
        } else {
          console.log('✅ Locations table cleared');
          
          let locationsInserted = 0;
          const totalLocations = defaultLocations.length;
          
          const insertNextLocation = () => {
            if (locationsInserted >= totalLocations) {
              console.log('✅ Default locations inserted');
              checkCompletion();
              return;
            }
            
            const location = defaultLocations[locationsInserted];
            db.run('INSERT INTO locations (name) VALUES (?)', [location], (err) => {
              if (err) {
                console.error(`Error inserting location '${location}':`, err.message);
              }
              locationsInserted++;
              insertNextLocation();
            });
          };
          
          insertNextLocation();
        }
      });

      // Insert sample equipment data
      const sampleEquipment = [
        {
          name: 'Dell Latitude Laptop',
          category: 'IT & Networking',
          status: 'Available',
          location: 'Main Office',
          purchaseDate: '2023-01-15',
          notes: 'High-performance laptop for development work'
        },
        {
          name: 'Office Chair - Ergonomic',
          category: 'Miscellaneous',
          status: 'In Use',
          location: 'Main Office',
          purchaseDate: '2022-08-20',
          notes: 'Adjustable height and lumbar support'
        },
        {
          name: 'Drill Set - Professional',
          category: 'Tools',
          status: 'Available',
          location: 'Warehouse A',
          purchaseDate: '2023-03-10',
          notes: 'Complete drill set with various bits'
        }
      ];

      // First clear existing equipment, then insert new ones
      db.run('DELETE FROM equipment', (err) => {
        if (err) {
          console.error('Error clearing equipment:', err.message);
        } else {
          console.log('✅ Equipment table cleared');
          
          let equipmentInserted = 0;
          const totalEquipment = sampleEquipment.length;
          
          const insertNextEquipment = () => {
            if (equipmentInserted >= totalEquipment) {
              console.log('✅ Sample equipment data inserted');
              checkCompletion();
              return;
            }
            
            const item = sampleEquipment[equipmentInserted];
            db.run('INSERT INTO equipment (name, category, status, location, purchaseDate, notes) VALUES (?, ?, ?, ?, ?, ?)', 
              [item.name, item.category, item.status, item.location, item.purchaseDate, item.notes], (err) => {
              if (err) {
                console.error(`Error inserting equipment '${item.name}':`, err.message);
              }
              equipmentInserted++;
              insertNextEquipment();
            });
          };
          
          insertNextEquipment();
        }
      });
    });
  });
};

// Create a function to get a database connection
const getDb = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('✅ Connected to SQLite database');
      console.log(`📁 Database location: ${dbPath}`);
    }
  });
};

module.exports = { getDb, initDatabase };
