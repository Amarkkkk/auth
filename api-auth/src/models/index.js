const { sequelize } = require('../config/database');
const User = require('./user');
const Otp = require('./otp');
const Task = require('./task');
const Subtask = require('./subtask');
const ProgressConfirmation = require('./progressConfirmation');

// define model relationships (associations)
// set up one-to-many relationship between User and Task
User.hasMany(Otp, {
    foreignKey: 'user_id',
    as: 'otps',
    onDelete: 'CASCADE'
});

Otp.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
// user <-> task
User.hasMany(Task, {
    foreignKey: 'user_id',
    as: 'tasks',            // alias for association task
    onDelete: 'CASCADE'     // delete tasks when user is deleted
});

Task.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'              // alias for accessing user
});

// user <-> subtask (ADDED THIS)
User.hasMany(Subtask, {
    foreignKey: 'user_id',
    as: 'subtasks',
    onDelete: 'CASCADE'
});

Subtask.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// user <-> progress confirmation
User.hasMany(ProgressConfirmation, {
    foreignKey: 'user_id',
    as: 'progressConfirmation',
    onDelete: 'CASCADE'
});

ProgressConfirmation.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// task <-> subtask
Task.hasMany(Subtask, {
    foreignKey: 'task_id',
    as: 'subtasks',
    onDelete: 'CASCADE'
});

Subtask.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task'  // Changed from 'tasks' to 'task' (singular) - more conventional
});

// task <-> progress confirmation
Task.hasMany(ProgressConfirmation, {
    foreignKey: 'task_id',
    as: 'progressConfirmation'
});

ProgressConfirmation.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task'  // Changed from 'tasks' to 'task' (singular) - more conventional
});

// subtask <-> progress confirmation
Subtask.hasMany(ProgressConfirmation, {
    foreignKey: 'subtask_id',
    as: 'progressConfirmation'
});

ProgressConfirmation.belongsTo(Subtask, {
    foreignKey: 'subtask_id',
    as: 'subtask'  // Changed from 'subtasks' to 'subtask' (singular) - more conventional
});


// export models and database connection
module.exports = {
    sequelize,
    User,
    Otp,
    Task,
    Subtask,
    ProgressConfirmation
};