const calculateEstimatedProgress = (task) => {
    // check if the tast start and task due is not null, if null return null
    if (!task.task_start || !task.task_due){
        return {
            last_estimated_progress: null,
            estimatedStatus: null
        };
    }

    //convert to ph time
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"})).getTime();
    
    // convert to time and store the task start
    const start = new Date(task.task_start).getTime();
    // convert to time and store the task due
    const due = new Date(task.task_due).getTime();   
    
    // check the scheduled if valid
    if (due <= start) {
        return {
            last_estimated_progress: 0,
            estimatedProgress: 'Invalid Schedule'
        };
    }

    // task not started yet
    if (now < start) {
        return {
            last_estimated_progress: 0,
            estimatedStatus: 'NotStarted'
        };
    }

    // get the estimated progress percentage
    const rawProgress = ((now - start) / (due - start)) * 100;
    const estimatedProgress = Math.min(Math.floor(rawProgress), 100);

    // overdue
    if (estimatedProgress >= 100 && task.status !== 'Completed') {
        return {
            last_estimated_progress: 100,
            estimatedStatus: 'Overdue'
        };
    }
    // completed regardless of the estimated progress
    if (task.progress_percentage === 100 || task.status === 'Completed') {
        return {
            last_estimated_progress: 100,
            estimatedStatus: 'Completed'
        };
    }
    // update status
    return {
        last_estimated_progress: estimatedProgress,
        estimatedStatus: 'Ontrack'
    };
};

const subtaskcalculateEstimatedProgress = (subtask) => {
    // check if the subtask start and subtask due is not null, if null return null
    if (!subtask.subtask_start || !subtask.subtask_due){
            console.log("Missing dates:", subtask);
        return {
            last_estimated_progress: null,
            estimatedStatus: null
        };
    }

    //convert to ph time
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"})).getTime();
    
    // convert to time and store the subtask start
    const start = new Date(subtask.subtask_start).getTime();
    // convert to time and store the subtask due
    const due = new Date(subtask.subtask_due).getTime();   
    
    // check the scheduled if valid
    if (due <= start) {
        return {
            last_estimated_progress: 0,
            estimatedProgress: 'Invalid Schedule'
        };
    }

    // subtask not started yet
    if (now < start) {
        return {
            last_estimated_progress: 0,
            estimatedStatus: 'NotStarted'
        };
    }

    // get the estimated progress percentage
    const rawProgress = ((now - start) / (due - start)) * 100;
    const estimatedProgress = Math.min(Math.floor(rawProgress), 100);

    // overdue
    if (estimatedProgress >= 100 && subtask.subtask_status !== 'Completed') {
        return {
            last_estimated_progress: 100,
            estimatedStatus: 'Overdue'
        };
    }
    // completed regardless of the estimated progress
    if (subtask.subtask_progress_percentage === 100 || subtask.subtask_status === 'Completed') {
        return {
            last_estimated_progress: 100,
            estimatedStatus: 'Completed'
        };
    }
    // update status
    return {
        last_estimated_progress: estimatedProgress,
        estimatedStatus: 'Ontrack'
    };
};

module.exports = {
    calculateEstimatedProgress,
    subtaskcalculateEstimatedProgress
};