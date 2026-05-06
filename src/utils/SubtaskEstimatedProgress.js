const calculateSubtaskEstimatedProgress = (subtask) => {
    // check if the tast start and task due is not null, if null return null
    if (!subtask.subtask_start || !subtask.subtask_due){
        return {
            subtask_last_estimated_progress: null,
            subtaskEstimatedStatus: null
        };
    }

    //convert to ph time
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"})).getTime();
    
    // convert to time and store the task start
    const start = new Date(subtask.subtask_start).getTime();
    // convert to time and store the task due
    const due = new Date(subtask.subtask_due).getTime();   
    
    // check the scheduled if valid
    if (due <= start) {
        return {
            subtask_last_estimated_progress: 0,
            subtaskEstimatedProgress: 'Invalid Schedule'
        };
    }

    // task not started yet
    if (now < start) {
        return {
            subtask_last_estimated_progress: 0,
            subtaskEstimatedStatus: 'NotStarted'
        };
    }

    // get the estimated progress percentage
    const rawProgress = ((now - start) / (due - start)) * 100;
    const estimatedProgress = Math.min(Math.floor(rawProgress), 100);

    // overdue
    if (estimatedProgress >= 100 && task.status !== 'Completed') {
        return {
            subtask_last_estimated_progress: 100,
            subtaskEstimatedStatus: 'Overdue'
        };
    }

    // update status
    return {
        subtask_last_estimated_progress: estimatedProgress,
        subtaskEstimatedStatus: 'Ontrack'
    };
};

module.exports = calculateSubtaskEstimatedProgress;