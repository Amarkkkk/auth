// src/config/database.js
const { Sequelize } = require('sequelize');

/**
 * Create PostgreSQL connection using Sequelize
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    
    // Logging
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Connection pool configuration
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Timezone
    timezone: '+00:00',
    
    // Default options for models
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

/**
 * Test database connection and sync models
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced');
    }
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Export both sequelize and connectDB
module.exports = { sequelize, connectDB };