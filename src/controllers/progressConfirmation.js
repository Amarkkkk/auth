const { ProgressConfirmation, Task, Subtask } = require('../models');
const calculateEstimatedProgress = require('../utils/estimatedProgress');

// Create a new progress confirmation
const createProgressConfirmation = async (req, res) => {
  try {
    const { task_id, subtask_id, confirm_progress } = req.body;

    // Validate confirm_progress
    if (confirm_progress < 0 || confirm_progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'confirm_progress must be between 0 and 100'
      });
    }

    // Check task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let subtask = null;
    // Only check subtask if subtask is provided
    if (subtask_id) {
      subtask = await Subtask.findByPk(subtask_id);
      if (!subtask) {
        return res.status(400).json({
          success: false,
          message: 'Subtask not found'
        });
      }
    }

    // Check if confirmation already exists for this task
    let confirmation = await ProgressConfirmation.findOne({
      where: {
        task_id,
        user_id: req.user.id
      }
    });

    let isNewConfirmation = false;

    if (confirmation) {
      // Update existing confirmation
      confirmation.confirm_progress = confirm_progress;
      if (subtask_id) {
        confirmation.subtask_id = subtask_id;
      }
      await confirmation.save();
    } else {
      // Create new confirmation
      confirmation = await ProgressConfirmation.create({
        task_id,
        subtask_id,
        user_id: req.user.id,
        confirm_progress
      });
      isNewConfirmation = true;
    }

    // Update Task progress based on confirmed progress
    task.progress_percentage = confirm_progress;

    if (confirm_progress === 0) task.status = 'Pending';
    else if (confirm_progress > 0 && confirm_progress <= 20) task.status = 'In_progress';
    else if (confirm_progress >= 21 && confirm_progress <= 99) task.status = 'Ongoing';
    else if (confirm_progress === 100) task.status = 'Completed';

    await task.save();

    // Optionally update subtask progress if needed
    if (subtask) {
      subtask.progress_percentage = confirm_progress;
      await subtask.save();
    }

    // Calculate last estimated progress
    const estimated = calculateEstimatedProgress(task);

    res.status(isNewConfirmation ? 201 : 200).json({
      success: true,
      message: isNewConfirmation 
        ? 'Progress confirmation added successfully' 
        : 'Progress confirmation updated successfully',
      data: {
        ...confirmation.toJSON(),
        task_last_estimated_progress: estimated.last_estimated_progress,
        subtask_last_estimated_progress: subtask ? subtask.subtask_last_estimated_progress || 0 : 0,
        estimatedStatus: estimated.estimatedStatus
      }
    });

  } catch (error) {
    console.error('Progress Confirmation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating progress confirmation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all progress confirmations for a task or subtask
const getProgressConfirmations = async (req, res) => {
  try {
    const { task_id, subtask_id } = req.query;
    const where = {};

    if (task_id) where.task_id = task_id;
    if (subtask_id) where.subtask_id = subtask_id;

    const confirmations = await ProgressConfirmation.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    // Fetch the last estimated progress
    const result = await Promise.all(confirmations.map(async (conf) => {
      const task = await Task.findByPk(conf.task_id);
      const estimated = calculateEstimatedProgress(task);

      let subtask = null;
      if (conf.subtask_id) {
        subtask = await Subtask.findByPk(conf.subtask_id);
      }

      return {
        ...conf.toJSON(),
        task_last_estimated_progress: estimated.last_estimated_progress,
        subtask_last_estimated_progress: subtask ? subtask.subtask_last_estimated_progress || 0 : 0,
        estimatedStatus: estimated.estimatedStatus
      };
    }));
    
    res.status(200).json({
      success: true,
      count: confirmations.length,
      data: result
    });
  } catch (error) {
    console.error('Get Progress Confirmations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress confirmations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get one progress confirmation by ID
const getOneProgressConfirmation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the confirmation
    const confirmation = await ProgressConfirmation.findByPk(id);

    if (!confirmation) {
      return res.status(404).json({
        success: false,
        message: 'Progress confirmation not found'
      });
    }

    // Fetch task and calculate estimated progress
    const task = await Task.findByPk(confirmation.task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Associated task not found'
      });
    }

    const estimated = calculateEstimatedProgress(task);

    // Fetch subtask if exists
    let subtask = null;
    if (confirmation.subtask_id) {
      subtask = await Subtask.findByPk(confirmation.subtask_id);
    }

    // Build response data
    const responseData = {
      ...confirmation.toJSON(),
      task_last_estimated_progress: estimated.last_estimated_progress,
      subtask_last_estimated_progress: subtask ? subtask.subtask_last_estimated_progress || 0 : 0,
      estimatedStatus: estimated.estimatedStatus
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get One Progress Confirmation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress confirmation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createProgressConfirmation,
  getProgressConfirmations,
  getOneProgressConfirmation
};