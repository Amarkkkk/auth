const {Task, User, sequelize} = require('../models');
const { Op, where } = require('sequelize');

//@desc   Get all tasks for the authenticated user
//@route  GET /api/tasks
//@access Private

const getTasks = async (req, res) => {
    try{
        // query parameters filtering
        const { completed, priority, search, sort = 'createdAt', order = 'DESC' } = req.query;
        // build where clause based on query parameters
        const where = { user_id: req.user.id };
        // filter by completed
        if (completed !== undefined) {
            where.completed = completed === 'true';
        }
        // filter by priority
        if( priority ) {
            where.priority = priority;
        }
        // search in title or description
        if ( search ) {
            where[Op.or] = [
                {title: { [Op.iLike]: `%${search}%` } },
                {description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        // get tasks
        const tasks = await Task.findAll({
            where,
            order: [[sort, order]],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving tasks',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc get single task by id
//@route GET /api/tasks/:id
//@access Private

const getTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id    // ensure task belongs to authenticated user
            }, 
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: { task }
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving task',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc   Create a new task 
//@route  POST /api/tasks
//@access Private

const createTask = async (req, res) => {
    try {
        const { title, description, priority , due_date} = req.body;

        // create task with logged in user's id
        const task = await Task.create({
            title,
            description,
            priority,
            due_date: due_date ? new Date(due_date) : null,
            user_id: req.user.id            
        });
        // fetch task with user details
        const taskWithUser = await Task.findByPk(task.id,{
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task: taskWithUser }
        });
    } catch (error) {
        console.error('Create task error:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    path: e.path,
                    message: e.message                    
                }))
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc   Update an existing task
//@route  PUT /api/tasks/:id
//@access Private

const updateTask = async (req, res) => {
    try {
        const {title, description, priority, completed, due_date} = req.body;
        // find task to update
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id    // ensure task belongs to authenticated user
            }
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'            
            });
        }
        // update task fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (completed !== undefined) task.completed = completed;
        if (due_date !== undefined) task.due_date = due_date;

        await task.save();

        // fetch updated task with user details
        const updatedTask = await Task.findByPk(task.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task: updatedTask }
        });
    } catch (error) {
        console.error('Update task error:', error);

        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc   Delete a task
//@route  DELETE /api/tasks/:id
//@access Private

const deleteTask = async (req, res) => {
    try {
        // find and delete task
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id    // ensure task belongs to authenticated user
            }
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'            
            });            
        }
        await task.destroy();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });        
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc Get task statistics for authenticated user
//@route GET /api/tasks/stats
//@access Private

const getTaskStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // count total tasks
        const totalTasks = await Task.count({
            where: { user_id: userId }
        });
        // count completed tasks
        const completedTasks = await Task.count({
            where: {
                user_id: userId,
                completed: true
            }
        });
        // count task by priority
        const tasksByPriority = await Task.findAll({
            where: {
                user_id: userId
            },
            attributes: [
                'priority',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['priority'],
            raw: true
        });
        res.status(200).json ({
            success: true,
            data: {
                stats: {
                    total: totalTasks,
                    completed: completedTasks,
                    pending: totalTasks - completedTasks,
                    byPriority: tasksByPriority
                }
            }
        });
    } catch (error){
        console.error('Get Stats error: ', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
}