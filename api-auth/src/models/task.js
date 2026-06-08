const {DataTypes, ENUM} = require ('sequelize');
const {sequelize} = require ('../config/database');

// create task table with realationship to user table
const Task = sequelize.define ('Task', {
    // id - primary key
    id: {
        type: DataTypes.INTEGER,        
        primaryKey: true,        
        autoIncrement: true
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
    category: {
        type: DataTypes.ENUM('NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other'),
        allowNull: true,
        defaultValue: 'NoCategory',        
    },

    customCategory: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            len: {  
                args: [1, 50],
                msg: 'Custom Category should not exceed 50 characters'
            },
            customCategoryRequired() {
                if (this.category === 'Other' && (!this.customCategory || this.customCategory.trim() === '')) {
                    throw new Error('Custom Category is required when category is Other');
                }
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

    // status
    status: {
        type: DataTypes.ENUM('Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'),
        defaultValue: 'Pending',
        validate: {
            isIn: {
                args: [['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled']],
                msg: 'Status must be one of: Pending, Ongoing, In progress, Completed, Canceled'
            }
        }
    },
    // subtask count
    subtask_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // progress percentage
    progress_percentage: {
        type: DataTypes.FLOAT,        
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        },
    },

    // task_start
    task_start: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // dueDate
    task_due: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isAfterTaskStart(value){
                if (this.task_start && value && new Date(value) <= new Date(this.task_start)){
                    throw new Error('Task due date must be after task start date');
                }
            }
        }
    },

    // last_estimated_progress
    last_estimated_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        },
    },
    
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
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
                fields: ['status'] // index on completed for filtering
            },
            {
                fields: ['priority']
            }
        ]
    }
);



module.exports = Task;