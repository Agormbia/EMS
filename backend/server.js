const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const equipmentRoutes = require('./routes/equipment');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'eQuipo API',
      version: '1.0.0',
      description: 'A comprehensive API for managing equipment with CRUD operations',
      contact: {
        name: 'API Support',
        email: 'support@equipment.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Equipment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the equipment'
            },
            name: {
              type: 'string',
              description: 'Name of the equipment'
            },
            category: {
              type: 'string',
              description: 'Category of the equipment'
            },
            status: {
              type: 'string',
              enum: ['Available', 'In Use', 'Maintenance', 'Retired'],
              description: 'Current status of the equipment'
            },
            location: {
              type: 'string',
              description: 'Current location of the equipment'
            },
            purchaseDate: {
              type: 'string',
              format: 'date',
              description: 'Date when equipment was purchased'
            },
            lastMaintenance: {
              type: 'string',
              format: 'date',
              description: 'Date of last maintenance'
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the equipment'
            }
          },
          required: ['name', 'category', 'status']
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'eQuipo API',
    version: '1.0.0',
    documentation: `/api-docs`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});
