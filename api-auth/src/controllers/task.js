const {Task, User, sequelize, ProgressConfirmation, Subtask} = require('../models');
const { Op, where } = require('sequelize');
const calculateEstimatedProgress = require('../utils/estimatedProgress');
const convertPHLocalToUTCISOString = require('../utils/date');

const getStatusFromProgress = (progress)=>  {
    if (progress === 0) return 'Pending';
    if (progress > 0 && progress <= 20) return 'In_progress';
    if (progress >= 21 && progress <= 99) return 'Ongoing';
    if (progress === 100) return 'Completed'
}

const isValidPHLocalDateTime = (value) => {
    if (!value) {
        return false;
    }
    
    let str;
    
    // Check if it's already a Date object
    if (value instanceof Date) {
        // Convert Date object to PH local time string
        const phTime = new Date(value.getTime() + (8 * 60 * 60 * 1000));
        const year = phTime.getUTCFullYear();
        const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(phTime.getUTCDate()).padStart(2, '0');
        const hours = String(phTime.getUTCHours()).padStart(2, '0');
        const minutes = String(phTime.getUTCMinutes()).padStart(2, '0');
        str = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        str = String(value).trim();
    }
    
    // Validate format
    const phDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;
    
    if (!phDateRegex.test(str)) {
        return false;
    }
    
    // Validate it's a real date
    const date = new Date(str);
    return !isNaN(date.getTime());
};
//@desc   Get all tasks for the authenticated user
//@route  GET /api/tasks
//@access Private

const getTasks = async (req, res) => {
    try{
        // query parameters filtering
        const { status, category, priority, search, sort = 'createdAt', order = 'DESC' } = req.query;
        const allowedStatus = ['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'];
        const allowedCategories = ['NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other'];
        // build where clause based on query parameters
        const where = { user_id: req.user.id };
        // filter by completed
        if (status && allowedStatus.includes(status)) {
            where.status = status;
        }
        // filter by category
        if( category ) {
            if (allowedCategories.includes(category)) {
                where.category = category;
            } else {
                where.category = 'Other';
                where.customCategory = category;
            }
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
            },{
                model: Subtask,
                as: 'subtasks',
                attributes: ['id', 'task_id', 'subtask_title', 'subtask_description', 'subtask_status',
                    'subtask_start', 'subtask_due', 'subtask_progress_percentage', 'subtask_last_estimated_progress'
                ]                
            },  {
                model: ProgressConfirmation,
                as: 'progressConfirmation',
                attributes: ['id', 'task_last_estimated_progress', 'confirm_progress', 'createdAt']
            }]
        });

        // calculate the estimated progress
        const result = tasks.map(task => {
            const estimated = calculateEstimatedProgress(task);
            // update the progressConfirmation model
            const updatedProgressConfirmation = task.progressConfirmation.map(pc => ({
                ...pc.toJSON(),
                task_last_estimated_progress: estimated.last_estimated_progress
            }));

            return {
                ...task.toJSON(),
                last_estimated_progress: estimated.last_estimated_progress,
                estimatedStatus: estimated.estimatedStatus,
                progressConfirmation: updatedProgressConfirmation
            };
        });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: { result }
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
            },  {
                model: ProgressConfirmation,
                as: 'progressConfirmation',
                attributes: ['task_last_estimated_progress', 'confirm_progress', 'createdAt']
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
        const { title, description, category, customCategory, priority, task_start, task_due } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // category validation
        const allowedCategories = ['NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other'];

        const finalCategory = category || 'NoCategory';

        if (!allowedCategories.includes(finalCategory)) {
            return res.status(400).json({
                success: false,
                message: `Category must be one of: ${allowedCategories.join(', ')}`
            });
        }

        if (finalCategory === 'Other') {
            if (!customCategory || !customCategory.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Custom Category is required when category is Other'
                });
            }
            if (customCategory.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Custom Category must be between 1 and 50 characters'
                });
            }
        }

        // For Date objects, we skip validation since they're already valid dates
        // For strings, we validate the format
        if (task_start && !(task_start instanceof Date) && !isValidPHLocalDateTime(task_start)) {
            return res.status(400).json({
                success: false,
                message: 'Task start must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                example: '2026-02-05T14:30'
            });
        }

        if (task_due && !(task_due instanceof Date) && !isValidPHLocalDateTime(task_due)) {
            return res.status(400).json({
                success: false,
                message: 'Task due must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                example: '2026-02-05T15:30'
            });
        }

        // Validate task_due is after task_start
        if (task_start && task_due) {
            const startDate = task_start instanceof Date ? task_start : new Date(task_start);
            const dueDate = task_due instanceof Date ? task_due : new Date(task_due);
            
            if (dueDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Task due date must be after task start date'
                });
            }
        }

        // Convert to UTC ISO string
        const taskStartUTC = task_start ? convertPHLocalToUTCISOString(task_start) : null;
        const taskDueUTC = task_due ? convertPHLocalToUTCISOString(task_due) : null;

        console.log('taskStartUTC:', taskStartUTC);
        console.log('taskDueUTC:', taskDueUTC);

        // Create task
        const task = await Task.create({
            title: title.trim(),
            category: finalCategory,
            customCategory: finalCategory === 'Other' ? customCategory.trim() : null,
            description: description?.trim() || null,
            priority: priority || 'medium',        
            task_start: taskStartUTC || null,
            task_due: taskDueUTC || null,
            user_id: req.user.id,
            progress_percentage: 0,
            status: 'Pending'
        });

        // Create initial progress confirmation
        await ProgressConfirmation.create({
            task_id: task.id,
            user_id: req.user.id,
            confirm_progress: 0
        });

        // Fetch task with user details
        const taskWithUser = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: ProgressConfirmation, as: 'progressConfirmation', attributes: ['task_last_estimated_progress', 'confirm_progress', 'createdAt'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task: taskWithUser }
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//@desc   Update an existing task
//@route  PUT /api/tasks/:id
//@access Private

const updateTask = async (req, res) => {
    try {
        const { title, description, category, customCategory, priority, status, task_start, task_due, progress_percentage } = req.body;
        const allowedStatus = ['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'];
        const allowedCategories = ['NoCategory','Work', 'Personal', 'Health', 'Finance', 'Education', 'Other'];
        const allowedPriorities = ['low', 'medium', 'high'];
        // Find task
        const task = await Task.findOne({ 
            where: { 
                id: req.params.id, 
                user_id: req.user.id 
            } 
        });

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        // Validate PH local datetime (skip validation for Date objects)
        if (task_start !== undefined) {
            if (!(task_start instanceof Date) && !isValidPHLocalDateTime(task_start)) {
                return res.status(400).json({
                    success: false,
                    message: 'Task start must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                    example: '2026-02-05T14:30'
                });
            }
        }

        if (task_due !== undefined) {
            if (!(task_due instanceof Date) && !isValidPHLocalDateTime(task_due)) {
                return res.status(400).json({
                    success: false,
                    message: 'Task due must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                    example: '2026-02-05T15:30'
                });
            }
        }

        // Validate task_due is after task_start (if both are being updated)
        if (task_start !== undefined && task_due !== undefined) {
            const startDate = task_start instanceof Date ? task_start : new Date(task_start);
            const dueDate = task_due instanceof Date ? task_due : new Date(task_due);
            
            if (dueDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Task due date must be after task start date'
                });
            }
        }

        // Validate task_due is after current task_start (if only task_due is being updated)
        if (task_start === undefined && task_due !== undefined && task.task_start) {
            const currentStartDate = new Date(task.task_start);
            const newDueDate = task_due instanceof Date ? task_due : new Date(task_due);
            
            if (newDueDate <= currentStartDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Task due date must be after current task start date'
                });
            }
        }

        // Validate task_start is before current task_due (if only task_start is being updated)
        if (task_start !== undefined && task_due === undefined && task.task_due) {
            const newStartDate = task_start instanceof Date ? task_start : new Date(task_start);
            const currentDueDate = new Date(task.task_due);
            
            if (newStartDate >= currentDueDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Task start date must be before current task due date'
                });
            }
        }

        // Convert PH local time to UTC ISO
        const taskStartUTC = task_start !== undefined 
            ? convertPHLocalToUTCISOString(task_start) 
            : undefined;
        const taskDueUTC = task_due !== undefined 
            ? convertPHLocalToUTCISOString(task_due) 
            : undefined;

        // Update fields (only if provided)
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Title cannot be empty'
                });
            }
            task.title = title.trim();
        }

        if (description !== undefined) {
            task.description = description.trim() || null;
        }
        if (category !== undefined) {
            if(!allowedCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Category must be one of: ${allowedCategories.join(', ')}`
                });
            }
        }
        task.category = category;

        if (category === 'Other') {
            if (!customCategory || !customCategory.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Custom Category is required when category is Other'
                });
            }
            if (customCategory.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Custom Category must be between 1 and 50 characters'
                });
            }
            task.customCategory = customCategory.trim();
        } else {
            task.customCategory = null;
        }

        if (priority !== undefined) {            
            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: `Priority must be one of: ${allowedPriorities.join(', ')}`
                });
            }
            task.priority = priority;
        }

        if (status !== undefined) {
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${allowedStatus.join(', ')}`
                });
            }
            task.status = status;
        }

        if (taskStartUTC !== undefined) {
            task.task_start = taskStartUTC;
        }

        if (taskDueUTC !== undefined) {
            task.task_due = taskDueUTC;
        }

        // Update progress
        if (progress_percentage !== undefined) {
            const progress = Number(progress_percentage);
            
            if (isNaN(progress) || progress < 0 || progress > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Progress percentage must be a number between 0 and 100'
                });
            }

            // Create progress confirmation record
            await ProgressConfirmation.create({
                task_id: task.id,
                user_id: req.user.id,
                confirm_progress: progress
            });

            task.progress_percentage = progress;
            
            // Auto-update status based on progress
            task.status = getStatusFromProgress(progress);
        }

        // Save changes
        await task.save();

        // Fetch updated task with user details
        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email'] 
                },
                { 
                    model: ProgressConfirmation, 
                    as: 'progressConfirmation', 
                    attributes: ['task_last_estimated_progress', 'confirm_progress', 'createdAt'] 
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task: updatedTask }
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// for categery
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const categories = await Task.findAll({
      where: { user_id: userId },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        categories: categories
          .map(c => c.category)
          .filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Get Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
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
        //count pending task
        const pendingTask = await Task.count({
            where: {
                user_id: userId,
                status: 'Pending'
            }
        });
        //count ongoing tasks
        const ongoingTask = await Task.count ({
            where: {
                user_id: userId,
                status: 'Ongoing'
            }
        });
        //count in progress task
        const inprogressTask = await Task.count({
            where: {
                user_id: userId,
                status: 'In_progress'
            }
        });
        // count completed tasks
        const completedTasks = await Task.count({
            where: {
                user_id: userId,
                status: 'Completed'
            }
        });
        // count canceled tasks
        const canceledTask = await Task.count({
            where: {
                user_id: userId,
                status: 'Canceled'
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
                    Completed: completedTasks,
                    Pending: pendingTask,
                    Ongoing: ongoingTask,
                    Inprogress: inprogressTask,
                    Canceled: canceledTask,
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
    getCategories,
    getTaskStats
}