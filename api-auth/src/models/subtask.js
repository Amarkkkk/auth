const {DataTypes, ENUM} = require ('sequelize');
const {sequelize} = require ('../config/database');

const Subtask = sequelize.define ('Subtask', {

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

    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    subtask_title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Subtask title is required'
            },
            len: {
                args: [3,100],
                msg: 'Subtask title should between 3 and 100 characters'
            },
        }
    },

    subtask_priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
        validate: {
            isIn: {
                args: [['low', 'medium', 'high']],
                msg: 'Priority must be one of: low, medium, high'
            }
        }
    },
    
    subtask_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        validate: {
            len: {
            args: [0, 500],  // Must use args, not just [0, 500]
            msg: 'Description cannot exceed 500 characters'
            }
  }
    },

    subtask_status: {
        type: DataTypes.ENUM ('Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'),
        defaultValue: 'Pending',
        validate: {
            isIn: {
                args: [['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled']],
                msg: 'Status must be one of: Pending, Ongoing, In progress, Completed, Canceled'
            }
        }
    },

    subtask_progress_percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        },
    },

    subtask_start: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
            isDate: {
                msg: 'Please provide a valid date format'
            }
        }
    },

    subtask_due: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
            isDate: {
                msg: 'Please provide a valid date'
            },
            isAfterTaskStart(value){
                if (this.task_start && value && new Date(value) <= new Date(this.task_start)){
                    throw new Error('Subtask due date must be after subtask start date');
                }
            }
        }
    },

    subtask_last_estimated_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        },
    }

}, {
    tableName: 'subtasks',
    timestamps: true,
    underscored: true,

    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['task_id']
        },
        {
            fields: ['subtask_priority']
        },
        {
            fields: ['subtask_status']
        }
    ]
});

module.exports = Subtask;