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

    // update status
    return {
        last_estimated_progress: estimatedProgress,
        estimatedStatus: 'Ontrack'
    };
};

module.exports = calculateEstimatedProgress;