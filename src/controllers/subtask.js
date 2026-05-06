const {Subtask, User, Task, sequelize, ProgressConfirmation} = require('../models');
const { Op, where } = require('sequelize');
const calculateSubtaskEstimatedProgress = require('../utils/SubtaskEstimatedProgress');
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

//@desc   Get all subtasks for the authenticated user
//@route  GET /api/subtasks
//@access Private

const getSubtasks = async (req, res) => {
    try{
        // query parameters filtering
        const { subtask_status, subtask_priority, search, sort = 'createdAt', order = 'DESC' } = req.query;
        const allowedSubtaskStatus = ['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'];
        // build where clause based on query parameters
        const where = { user_id: req.user.id };
        
        if (subtask_status && allowedSubtaskStatus.includes(subtask_status)) {
            where.subtask_status = subtask_status;
        }
        // filter by subtask_priority
        if( subtask_priority ) {
            where.subtask_priority = subtask_priority;
        }
        // search in title or description
        if ( search ) {
            where[Op.or] = [
                {subtask_title: { [Op.iLike]: `%${search}%` } },
                {subtask_description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        // get tasks
        const subtasks = await Subtask.findAll({
            where,
            order: [[sort, order]],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Task,
                    as: 'task',
                    attributes: ['id', 'title', 'status']
                },
                {
                    model: ProgressConfirmation,
                    as: 'progressConfirmation',
                    attributes: ['id', 'subtask_last_estimated_progress', 'confirm_progress', 'createdAt']
                }
            ]
        });

        // calculate the estimated progress
        const result = subtasks.map(subtask => {
            const estimated = calculateSubtaskEstimatedProgress(subtask);
            // update the progressConfirmation model
            const updatedProgressConfirmation = subtask.progressConfirmation.map(pc => ({
                ...pc.toJSON(),
                subtask_last_estimated_progress: estimated.subtask_last_estimated_progress
            }));
            // remove original progressConfirmation
            const subtaskJson = subtask.toJSON();
            delete subtaskJson.progressConfirmation;
            return {
                ...subtaskJson,
                subtask_last_estimated_progress: estimated.subtask_last_estimated_progress,
                subtask_estimatedStatus: estimated.subtaskEstimatedStatus,
                subtask_progressConfirmation: updatedProgressConfirmation
            };
        });
        res.status(200).json({
            success: true,
            count: subtasks.length,
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

//@desc get single subtask by id
//@route GET /api/subtasks/:id
//@access Private

const getSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id    // ensure task belongs to authenticated user
            }, 
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Task,
                    as: 'task',
                    attributes: ['id', 'title', 'status']
                },
                {
                    model: ProgressConfirmation,
                    as: 'progressConfirmation',
                    attributes: ['subtask_last_estimated_progress', 'confirm_progress', 'createdAt']
                }
            ]
        });
        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found'
            });
        }
        res.status(200).json({
            success: true,
            data: { subtask }
        });
    } catch (error) {
        console.error('Get subtask error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving task',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc   Create new subtask(s) for a task
//@route  POST /api/subtasks
//@access Private

const createSubtask = async (req, res) => {
    try {
        const { task_id, subtasks } = req.body;

        // Validate task_id is provided
        if (!task_id) {
            return res.status(400).json({
                success: false,
                message: 'task_id is required'
            });
        }

        // Check if task exists and belongs to user
        const task = await Task.findOne({
            where: {
                id: task_id,
                user_id: req.user.id
            }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to add subtasks to this task'
            });
        }

        // Handle both single subtask object and array of subtasks
        const subtasksArray = Array.isArray(subtasks) ? subtasks : [subtasks];

        if (subtasksArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one subtask is required'
            });
        }

        // Validate all subtasks before creating
        for (let i = 0; i < subtasksArray.length; i++) {
            const subtask = subtasksArray[i];
            
            if (!subtask.subtask_title || !subtask.subtask_title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Subtask title is required for subtask at index ${i}`
                });
            }

            // Validate start date
            if (subtask.subtask_start && !(subtask.subtask_start instanceof Date) && !isValidPHLocalDateTime(subtask.subtask_start)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid subtask_start format for subtask at index ${i}. Must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])`,
                    example: '2026-02-05T14:30'
                });
            }

            // Validate due date
            if (subtask.subtask_due && !(subtask.subtask_due instanceof Date) && !isValidPHLocalDateTime(subtask.subtask_due)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid subtask_due format for subtask at index ${i}. Must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])`,
                    example: '2026-02-05T15:30'
                });
            }

            // Validate due is after start
            if (subtask.subtask_start && subtask.subtask_due) {
                const startDate = subtask.subtask_start instanceof Date ? subtask.subtask_start : new Date(subtask.subtask_start);
                const dueDate = subtask.subtask_due instanceof Date ? subtask.subtask_due : new Date(subtask.subtask_due);
                
                if (dueDate <= startDate) {
                    return res.status(400).json({
                        success: false,
                        message: `Subtask due date must be after start date for subtask at index ${i}`
                    });
                }
            }
        }

        // Create all subtasks
        const createdSubtasks = [];
        
        for (const subtaskData of subtasksArray) {
            // Convert to UTC ISO string
            const subtaskStartUTC = subtaskData.subtask_start ? convertPHLocalToUTCISOString(subtaskData.subtask_start) : null;
            const subtaskDueUTC = subtaskData.subtask_due ? convertPHLocalToUTCISOString(subtaskData.subtask_due) : null;

            // Create subtask
            const subtask = await Subtask.create({
                task_id: task_id,
                subtask_title: subtaskData.subtask_title.trim(),
                subtask_description: subtaskData.subtask_description?.trim() || null,
                subtask_priority: subtaskData.subtask_priority || 'medium',
                subtask_start: subtaskStartUTC,
                subtask_due: subtaskDueUTC,
                user_id: req.user.id,
                subtask_progress_percentage: 0,
                subtask_status: 'Pending'
            });

            // Create initial progress confirmation with BOTH task_id and subtask_id
            await ProgressConfirmation.create({
                task_id: task_id,           // Added task_id
                subtask_id: subtask.id,
                user_id: req.user.id,
                confirm_progress: 0
            });

            createdSubtasks.push(subtask.id);
        }

        // Fetch all created subtasks with details
        const subtasksWithDetails = await Subtask.findAll({
            where: {
                id: createdSubtasks
            },
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email'] 
                },
                { 
                    model: Task, 
                    as: 'task', 
                    attributes: ['id', 'title', 'status'] 
                },
                { 
                    model: ProgressConfirmation, 
                    as: 'progressConfirmation', 
                    attributes: ['subtask_last_estimated_progress', 'confirm_progress', 'createdAt'] 
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: `${createdSubtasks.length} subtask(s) created successfully`,
            data: { 
                subtasks: subtasksWithDetails,
                count: createdSubtasks.length
            }
        });
    } catch (error) {
        console.error('Create subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subtask(s)',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//@desc   Update an existing task
//@route  PUT /api/tasks/:id
//@access Private

const updateSubtask = async (req, res) => {
    try {
        const { subtask_title, subtask_description, subtask_priority, 
            subtask_status, subtask_start, subtask_due, subtask_progress_percentage } = req.body;
        const allowedSubtaskStatus = ['Pending', 'Ongoing', 'In_progress', 'Completed', 'Canceled'];

        // Find subtask
        const subtask = await Subtask.findOne({ 
            where: { 
                id: req.params.id, 
                user_id: req.user.id 
            } 
        });

        if (!subtask) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subtask not found' 
            });
        }

        // Validate PH local datetime (skip validation for Date objects)
        if (subtask_start !== undefined) {
            if (!(subtask_start instanceof Date) && !isValidPHLocalDateTime(subtask_start)) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask start must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                    example: '2026-02-05T14:30'
                });
            }
        }

        if (subtask_due !== undefined) {
            if (!(subtask_due instanceof Date) && !isValidPHLocalDateTime(subtask_due)) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask due must be PH local time (YYYY-MM-DDTHH:mm[:ss[.SSS]])',
                    example: '2026-02-05T15:30'
                });
            }
        }

        // Validate subtask_due is after subtask_start (if both are being updated)
        if (subtask_start !== undefined && subtask_due !== undefined) {
            const startDate = subtask_start instanceof Date ? subtask_start : new Date(subtask_start);
            const dueDate = subtask_due instanceof Date ? subtask_due : new Date(subtask_due);
            
            if (dueDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask due date must be after subtask start date'
                });
            }
        }

        // Validate task_due is after current subtask_start (if only task_due is being updated)
        if (subtask_start === undefined && subtask_due !== undefined && subtask.subtask_start) {
            const currentStartDate = new Date(subtask.subtask_start);
            const newDueDate = subtask_due instanceof Date ? subtask_due : new Date(subtask_due);
            
            if (newDueDate <= currentStartDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask due date must be after current subtask start date'
                });
            }
        }

        // Validate subtask_start is before current task_due (if only subtask_start is being updated)
        if (subtask_start !== undefined && subtask_due === undefined && subtask.subtask_due) {
            const newStartDate = subtask_start instanceof Date ? subtask_start : new Date(subtask_start);
            const currentDueDate = new Date(subtask.subtask_due);
            
            if (newStartDate >= currentDueDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask start date must be before current subtask due date'
                });
            }
        }

        // Convert PH local time to UTC ISO
        const subtaskStartUTC = subtask_start !== undefined 
            ? convertPHLocalToUTCISOString(subtask_start) 
            : undefined;
        const subtaskDueUTC = subtask_due !== undefined 
            ? convertPHLocalToUTCISOString(subtask_due) 
            : undefined;

        // Update fields (only if provided)
        if (subtask_title !== undefined) {
            if (!subtask_title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask Title cannot be empty'
                });
            }
            subtask.subtask_title = subtask_title.trim();
        }

        if (subtask_description !== undefined) {
            subtask.subtask_description = subtask_description.trim() || null;
        }

        if (subtask_priority !== undefined) {
            const allowedPriorities = ['low', 'medium', 'high'];
            if (!allowedPriorities.includes(subtask_priority)) {
                return res.status(400).json({
                    success: false,
                    message: `Subtask Priority must be one of: ${allowedPriorities.join(', ')}`
                });
            }
            subtask.subtask_priority = subtask_priority;
        }

        if (subtask_status !== undefined) {
            if (!allowedSubtaskStatus.includes(subtask_status)) {
                return res.status(400).json({
                    success: false,
                    message: `Subtask Status must be one of: ${allowedSubtaskStatus.join(', ')}`
                });
            }
            subtask.subtask_status = subtask_status;
        }

        if (subtaskStartUTC !== undefined) {
            subtask.subtask_start = subtaskStartUTC;
        }

        if (subtaskDueUTC !== undefined) {
            subtask.subtask_due = subtaskDueUTC;
        }

        // Update progress
        if (subtask_progress_percentage !== undefined) {
            const progress = Number(subtask_progress_percentage);
            
            if (isNaN(progress) || progress < 0 || progress > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Subtask Progress percentage must be a number between 0 and 100'
                });
            }

            // Check if confirmation already exists for this subtask
            let confirmation = await ProgressConfirmation.findOne({
                where: {
                    subtask_id: subtask.id,
                    user_id: req.user.id
                }
            });

            if (confirmation) {
                // Update existing confirmation
                confirmation.confirm_progress = progress;
                await confirmation.save();
            } else {
                // Create new confirmation
                await ProgressConfirmation.create({
                    subtask_id: subtask.id,
                    user_id: req.user.id,
                    confirm_progress: progress
                });
            }

            subtask.subtask_progress_percentage = progress;
            
            // Auto-update status based on progress
            subtask.subtask_status = getStatusFromProgress(progress);
        }

        // Save changes
        await subtask.save();

        // Fetch updated task with user details
        const updatedSubtask = await Subtask.findByPk(subtask.id, {
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email'] 
                },
                { 
                    model: Task, 
                    as: 'task', 
                    attributes: ['id', 'title', 'status'] 
                },
                { 
                    model: ProgressConfirmation, 
                    as: 'progressConfirmation', 
                    attributes: ['subtask_last_estimated_progress', 'confirm_progress', 'createdAt'] 
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Subtask updated successfully',
            data: { subtask: updatedSubtask }
        });

    } catch (error) {
        console.error('Update subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subtask',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//@desc   Delete a subtask
//@route  DELETE /api/tasks/:id
//@access Private

const deleteSubtask = async (req, res) => {
    try {
        // find and delete subtask
        const subtask = await Subtask.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id    // ensure task belongs to authenticated user
            }
        });
        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found'            
            });            
        }
        await subtask.destroy();

        res.status(200).json({
            success: true,
            message: 'Subtask deleted successfully'
        });        
    } catch (error) {
        console.error('Delete subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subtask',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

//@desc Get task statistics for authenticated user
//@route GET /api/tasks/stats
//@access Private

const getSubtaskStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // count total tasks
        const totalSubtasks = await Subtask.count({
            where: { user_id: userId }
        });
        //count pending task
        const pendingSubtask = await Subtask.count({
            where: {
                user_id: userId,
                subtask_status: 'Pending'
            }
        });
        //count ongoing tasks
        const ongoingSubtask = await Subtask.count ({
            where: {
                user_id: userId,
                subtask_status: 'Ongoing'
            }
        });
        //count in progress task
        const inprogressSubtask = await Subtask.count({
            where: {
                user_id: userId,
                subtask_status: 'In_progress'
            }
        });
        // count completed tasks
        const completedSubtasks = await Subtask.count({
            where: {
                user_id: userId,
                subtask_status: 'Completed'
            }
        });
        // count canceled tasks
        const canceledSubtask = await Subtask.count({
            where: {
                user_id: userId,
                subtask_status: 'Canceled'
            }
        });
        // count task by priority
        const SubtasksByPriority = await Subtask.findAll({
            where: {
                user_id: userId
            },
            attributes: [
                'subtask_priority',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['subtask_priority'],
            raw: true
        });
        res.status(200).json ({
            success: true,
            data: {
                stats: {
                    total: totalSubtasks,
                    Completed: completedSubtasks,
                    Pending: pendingSubtask,
                    Ongoing: ongoingSubtask,
                    Inprogress: inprogressSubtask,
                    Canceled: canceledSubtask,
                    byPriority: SubtasksByPriority
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
    getSubtasks,
    getSubtask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    getSubtaskStats
}