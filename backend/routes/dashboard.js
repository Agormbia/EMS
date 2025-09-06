const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEquipment:
 *                   type: integer
 *                 availableEquipment:
 *                   type: integer
 *                 inUseEquipment:
 *                   type: integer
 *                 maintenanceEquipment:
 *                   type: integer
 *                 retiredEquipment:
 *                   type: integer
 *                 totalCategories:
 *                   type: integer
 *                 totalLocations:
 *                   type: integer
 */
router.get('/stats', (req, res) => {
  const queries = {
    totalEquipment: 'SELECT COUNT(*) as count FROM equipment',
    availableEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Available"',
    inUseEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "In Use"',
    maintenanceEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Maintenance"',
    retiredEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Retired"',
    totalCategories: 'SELECT COUNT(*) as count FROM categories',
    totalLocations: 'SELECT COUNT(*) as count FROM locations'
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  const checkCompletion = () => {
    completedQueries++;
    if (completedQueries === totalQueries) {
      res.json(stats);
    }
  };

  const db = getDb();
  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count;
      }
      checkCompletion();
    });
  });
});

/**
 * @swagger
 * /api/dashboard/equipment-by-category:
 *   get:
 *     summary: Get equipment count by category
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Equipment count by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   count:
 *                     type: integer
 */
router.get('/equipment-by-category', (req, res) => {
  const query = `
    SELECT category, COUNT(*) as count 
    FROM equipment 
    GROUP BY category 
    ORDER BY count DESC
  `;

  const db = getDb();
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching equipment by category:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment by category' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/dashboard/equipment-by-status:
 *   get:
 *     summary: Get equipment count by status
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Equipment count by status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   count:
 *                     type: integer
 */
router.get('/equipment-by-status', (req, res) => {
  const query = `
    SELECT status, COUNT(*) as count 
    FROM equipment 
    GROUP BY status 
    ORDER BY count DESC
  `;

  const db = getDb();
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching equipment by status:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment by status' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/dashboard/equipment-by-location:
 *   get:
 *     summary: Get equipment count by location
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Equipment count by location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   location:
 *                     type: string
 *                   count:
 *                     type: integer
 */
router.get('/equipment-by-location', (req, res) => {
  const query = `
    SELECT location, COUNT(*) as count 
    FROM equipment 
    WHERE location IS NOT NULL
    GROUP BY location 
    ORDER BY count DESC
  `;

  const db = getDb();
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching equipment by location:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment by location' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent equipment activity
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent equipment activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   equipmentId:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   equipmentName:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/recent-activity', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const query = `
    SELECT 
      eh.id,
      eh.equipmentId,
      eh.action,
      eh.oldValues,
      eh.newValues,
      eh.timestamp,
      e.name as equipmentName
    FROM equipment_history eh
    LEFT JOIN equipment e ON eh.equipmentId = e.id
    ORDER BY eh.timestamp DESC 
    LIMIT ?
  `;

  const db = getDb();
  db.all(query, [limit], (err, rows) => {
    if (err) {
      console.error('Error fetching recent activity:', err);
      return res.status(500).json({ error: 'Failed to fetch recent activity' });
    }

    // Process the rows to handle deleted equipment
    const processedRows = rows.map(row => {
      // For DELETE actions, extract name from oldValues if equipmentName is null
      if (row.action === 'DELETE' && !row.equipmentName && row.oldValues) {
        try {
          const oldValues = JSON.parse(row.oldValues);
          row.equipmentName = oldValues.name;
        } catch (e) {
          console.error('Error parsing oldValues for deleted equipment:', e);
          row.equipmentName = 'Unknown Equipment';
        }
      }
      return row;
    });

    res.json(processedRows);
  });
});

/**
 * @swagger
 * /api/dashboard/maintenance-due:
 *   get:
 *     summary: Get equipment due for maintenance
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look ahead for maintenance
 *     responses:
 *       200:
 *         description: Equipment due for maintenance
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 */
router.get('/maintenance-due', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const query = `
    SELECT * FROM equipment 
    WHERE lastMaintenance IS NOT NULL 
    AND date(lastMaintenance, '+' || ? || ' days') <= date('now')
    AND status != 'Retired'
    ORDER BY lastMaintenance ASC
  `;

  const db = getDb();
  db.all(query, [days], (err, rows) => {
    if (err) {
      console.error('Error fetching maintenance due equipment:', err);
      return res.status(500).json({ error: 'Failed to fetch maintenance due equipment' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/dashboard/equipment-value:
 *   get:
 *     summary: Get equipment value statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Equipment value statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEquipment:
 *                   type: integer
 *                 availableEquipment:
 *                   type: integer
 *                 inUseEquipment:
 *                   type: integer
 *                 maintenanceEquipment:
 *                   type: integer
 *                 retiredEquipment:
 *                   type: integer
 */
router.get('/equipment-value', (req, res) => {
  const queries = {
    totalEquipment: 'SELECT COUNT(*) as count FROM equipment',
    availableEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Available"',
    inUseEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "In Use"',
    maintenanceEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Maintenance"',
    retiredEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status = "Retired"'
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  const checkCompletion = () => {
    completedQueries++;
    if (completedQueries === totalQueries) {
      res.json(stats);
    }
  };

  const db = getDb();
  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count;
      }
      checkCompletion();
    });
  });
});

module.exports = router;
