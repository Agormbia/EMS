const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment with optional filtering
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, In Use, Maintenance, Retired]
 *         description: Filter by equipment status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by equipment category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by equipment location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in equipment name and notes
 *     responses:
 *       200:
 *         description: List of equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 */
router.get('/', (req, res) => {
  const { status, category, location, search } = req.query;
  let query = 'SELECT * FROM equipment WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (location) {
    query += ' AND location = ?';
    params.push(location);
  }

  if (search) {
    query += ' AND (name LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY createdAt DESC';

  const db = getDb();
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching equipment:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/equipment/categories:
 *   get:
 *     summary: Get all equipment categories
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/categories', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/equipment/locations:
 *   get:
 *     summary: Get all equipment locations
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/locations', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM locations ORDER BY name', (err, rows) => {
    if (err) {
      console.error('Error fetching locations:', err);
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/equipment:
 *   post:
 *     summary: Create new equipment
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, In Use, Maintenance, Retired]
 *               location:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lastMaintenance:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Invalid input data
 */
router.post('/', (req, res) => {
  const { name, category, status, location, purchaseDate, lastMaintenance, notes } = req.body;

  // Validation
  if (!name || !category || !status) {
    return res.status(400).json({ 
      error: 'Name, category, and status are required' 
    });
  }

  if (!['Available', 'In Use', 'Maintenance', 'Retired'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be one of: Available, In Use, Maintenance, Retired' 
    });
  }

  const query = `
    INSERT INTO equipment (name, category, status, location, purchaseDate, lastMaintenance, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [name, category, status, location, purchaseDate, lastMaintenance, notes];

  const db = getDb();
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error creating equipment:', err);
      return res.status(500).json({ error: 'Failed to create equipment' });
    }

    // Get the created equipment
    db.get('SELECT * FROM equipment WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created equipment:', err);
        return res.status(500).json({ error: 'Equipment created but failed to fetch' });
      }

      // Log to history
      const historyQuery = `
        INSERT INTO equipment_history (equipmentId, action, newValues)
        VALUES (?, 'CREATE', ?)
      `;
      db.run(historyQuery, [this.lastID, JSON.stringify(row)]);

      res.status(201).json(row);
    });
  });
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     summary: Get equipment by ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       404:
 *         description: Equipment not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const db = getDb();
  db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching equipment:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(row);
  });
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     summary: Update equipment by ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, In Use, Maintenance, Retired]
 *               location:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lastMaintenance:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       404:
 *         description: Equipment not found
 *       400:
 *         description: Invalid input data
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, status, location, purchaseDate, lastMaintenance, notes } = req.body;

  // Validation
  if (status && !['Available', 'In Use', 'Maintenance', 'Retired'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be one of: Available, In Use, Maintenance, Retired' 
    });
  }

  // First get the current equipment to log in history
  const db = getDb();
  db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, currentEquipment) => {
    if (err) {
      console.error('Error fetching current equipment:', err);
      return res.status(500).json({ error: 'Failed to fetch current equipment' });
    }

    if (!currentEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }
    if (purchaseDate !== undefined) {
      updates.push('purchaseDate = ?');
      params.push(purchaseDate);
    }
    if (lastMaintenance !== undefined) {
      updates.push('lastMaintenance = ?');
      params.push(lastMaintenance);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE equipment SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating equipment:', err);
        return res.status(500).json({ error: 'Failed to update equipment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Get the updated equipment
      db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, updatedEquipment) => {
        if (err) {
          console.error('Error fetching updated equipment:', err);
          return res.status(500).json({ error: 'Equipment updated but failed to fetch' });
        }

        // Log to history
        const historyQuery = `
          INSERT INTO equipment_history (equipmentId, action, oldValues, newValues)
          VALUES (?, 'UPDATE', ?, ?)
        `;
        db.run(historyQuery, [id, JSON.stringify(currentEquipment), JSON.stringify(updatedEquipment)]);

        res.json(updatedEquipment);
      });
    });
  });
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   delete:
 *     summary: Delete equipment by ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *       404:
 *         description: Equipment not found
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const db = getDb();
  db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, equipment) => {
    if (err) {
      console.error('Error fetching equipment:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment' });
    }

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Delete the equipment
    db.run('DELETE FROM equipment WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting equipment:', err);
        return res.status(500).json({ error: 'Failed to delete equipment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Log to history
      const historyQuery = `
        INSERT INTO equipment_history (equipmentId, action, oldValues)
        VALUES (?, 'DELETE', ?)
      `;
      db.run(historyQuery, [id, JSON.stringify(equipment)]);

      res.json({ message: 'Equipment deleted successfully' });
    });
  });
});

/**
 * @swagger
 * /api/equipment/{id}/history:
 *   get:
 *     summary: Get equipment history
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment history
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
 *                   oldValues:
 *                     type: string
 *                   newValues:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/:id/history', (req, res) => {
  const { id } = req.params;

  const db = getDb();
  db.all('SELECT * FROM equipment_history WHERE equipmentId = ? ORDER BY timestamp DESC', [id], (err, rows) => {
    if (err) {
      console.error('Error fetching equipment history:', err);
      return res.status(500).json({ error: 'Failed to fetch equipment history' });
    }
    res.json(rows);
  });
});

module.exports = router;
