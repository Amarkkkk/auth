const {DataTypes} = require ('sequelize');
const {sequelize} = require ('../config/database');

// create task table with realationship to user table
const Task = sequelize.define ('Task', {
    // id - primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // title
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Task Title is required'
            },
            len: {
                args: [3, 100],
                msg: 'Task Title should be between 3 and 100 characters'
            }
        }
    },

    // description
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 500],
                msg: 'Task Description should not exceed 500 characters'
            }
        }
    },
    // completed
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
        allowNull: false
    },

    // priority
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
        validate: {
            isIn: {
                args: [['low', 'medium', 'high']],
                msg: 'Priority must be one of: low, medium, high'
            }
        }
    },

    // dueDate
    due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'Due Date must be a valid date'
            }
        }
    },

    // Foreign key userId
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id'       // refers to column id
        },
        onUpdate: 'CASCADE',    // if user id changes, update tasks
        onDelete: 'CASCADE'     // if user deleted, delete tasks
        }
    }, {
        tableName: 'tasks',
        timestamps: true,
        underscored: true,

        // indexes for faster queries on user_id
        indexes: [
            {
                fields: ['user_id'] // index on user_id for faster lookups
            },
            {
                fields: ['completed'] // index on completed for filtering
            }
        ]
    }
);

module.exports = Task;