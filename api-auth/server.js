require('dotenv').config();
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/database');

// start the server
// initialize the database connection and start express server

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // connect to postgre
        await connectDB();
        // import models to ensure they're registered
        require('./src/models');

        // sync database (creates table if they dont exist)
        // warning: {force: true } will drop all tables and recreate them
        // use { alter: tru } in development to update tables
        // use migrations in production
        if (process.env.NODE_ENV === 'development'){
            await sequelize.sync({ alter: true });
            console.log('Database tables synchronize');
        }

        // start express server
        app.listen(PORT, () => {
            console.log('=====================================');
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
            console.log(`📡 Server is listening on port ${PORT}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
            console.log(`📚 Endpoints:`);
            console.log(`   - Health: http://localhost:${PORT}/api/health`);
            console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
            console.log(`   - Tasks: http://localhost:${PORT}/api/tasks`);
            console.log('=====================================');
        });
    } catch (error) {
        console.error('Failed to start server: ', error.message);
        process.exit(1);
    }
};

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection: ', err.message);
    // close server and exit
    process.exit(1);
});

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception Error: ', err.message);
    process.exit(1);
});

// gracefull shotdown
process.on('SIGTERM', async() => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async() => {
    console.log('SIGINT  received. Shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

// start server
startServer();
