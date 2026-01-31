const { sequelize } = require('../config/database');
const User = require('./user');
const Task = require('./task');

// define model relationships (associations)
// set up one-to-many relationship between User and Task

// A User can have many Tasks
User.hasMany(Task, {
    foreignKey: 'user_id',
    as: 'tasks',            // alias for association task
    onDelete: 'CASCADE'     // delete tasks when user is deleted
});

// Each Task belongs to a single User
Task.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'              // alias for accessing user
});

// export models and database connection
module.exports = {
    sequelize,
    User,
    Task
};