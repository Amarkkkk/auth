const {DataTypes} = require ('sequelize');
const {sequelize} = require ('../config/database');

const Progress_Confirmation = sequelize.define ('Progress_Confirmation', {
    id: {
        type: DataTypes.INTEGER,        
        primaryKey: true,
        autoIncrement: true
    },

    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        }
    },

    subtask_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'subtasks',
            key: 'id'
        }
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    task_last_estimated_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,        
    },

    subtask_last_estimated_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true,        
    },

    task_confirm_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    subtask_confirm_progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    }
}, {
    tableName: 'progressConfirmation',
    timestamps: true,
    underscored: true,

    indexes: [
        {
            fields: ['task_id']
        },
        {
            fields: ['subtask_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['task_last_estimated_progress']
        },
        {
            fields: ['subtask_last_estimated_progress']
        }
    ]
});

module.exports = Progress_Confirmation;