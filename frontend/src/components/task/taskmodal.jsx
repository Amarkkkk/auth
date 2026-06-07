import {useState, useEffect} from "react";
import TaskDetails from "./taskDetails";
import SubtaskDetails from "./subtaskDetails";
import Button from "../general/buttons";

import { updateTask } from "../../api/task";
import { updateSubtask } from "../../api/subtask";

const TaskModal = ({ task, subtask, isOpen, onClose, onSave}) => {

    // controls which screen is shown
    const [view, setView] = useState({
        type: "task",
        data: task
    });

    // view or editing data
    const [isEditing, setIsEditing] = useState(false);

    // open subtask inside the modal
    const openSubtask = (subtask) => {
        if(!subtask) return;
        setIsEditing(false); // default to view mode when opening a subtask        
        setSubtaskForm(subtask); // set the subtask form data
        setView({
            type: "subtask",
            data: subtask
        });
    };

    // go back to task
    const backToTask = () => {
        setIsEditing(false); // default to view mode when going back to task
        setView({
            type: "task",
            data: task
        });
    };

    // update task or subtask 
    const [form, setForm] = useState(task);
    const [subtaskForm, setSubtaskForm] = useState(subtask);

    // set form data when task changes
    useEffect(() => {
        if(!task) return;
        setForm(task);
        setIsEditing(false);
        setView({
            type: "task", data: task
        });
    }, [task]);
    
    // handle form changes for both task and subtask
    const handleChange = (e) => {
        const { name, value } = e.target;
        if(view.type === "task") {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if(view.type === "subtask") {
            setSubtaskForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // handle save 
    const handleSave = async () => {
        try {
            if (view.type === "task") {
                // for updating a task, we send the whole form which includes subtasks. Preventing undefined value
                const payload = {
                    title: form.title,
                    description: form.description,
                    status: form.status,
                    priority: form.priority,
                    due_date: form.due_date,   
                    category: form.category,                              
                };
                const response = await updateTask(form.id, payload);
                console.log("Task updated successfully:", response);
                onSave(response); // pass updated task back to parent                
            }

            if (view.type === "subtask") {
                const payload = {
                    subtask_title: subtaskForm.subtask_title,
                    subtask_description: subtaskForm.subtask_description,
                    subtask_status: subtaskForm.subtask_status,
                    subtask_due: subtaskForm.subtask_due,
                    subtask_progress_percentage: subtaskForm.subtask_progress_percentage,
                };
                const response = await updateSubtask(subtaskForm.id, payload);
                console.log("Subtask updated successfully:", response);
                onSave(response); // pass updated subtask back to parent
            }            
        } catch (error) {
            console.error("Error updating task:", error);
            console.log("Form data that caused error:", form);
            console.log("Task data that caused error:", task);
        }
    }

    // return if no task or not open
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">

                <Button 
                variant="text"
                onClick={onClose}
                className="absolute top-3 right-3">
                    ✕
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {/* Back Button for Subtask View */}
                        {view.type === "subtask" && (
                            <Button
                                variant="text"
                                onClick={backToTask}
                                className="text-gray-500 hover:text-underline"
                            >
                                ← Back
                            </Button>
                        )}
                        {/** Dynamic Title */}
                        <h2 className="text-lg font-bold">
                            {view.type === "task" ? "Task Details" : "Subtask Details"}
                        </h2>
                    </div>

                    {/* Edit Switch */}
                    <Button 
                        variant="secondary"
                        onClick={() => setIsEditing(v => !v)}
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>

                {/* Content */}     
                {view.type === "task" && (
                    <TaskDetails
                        task={form}
                        isEditing={isEditing}
                        onSubtaskClick={openSubtask}
                        onChange={handleChange}
                        onSave={handleSave}
                    />
                )} 

                {view.type === "subtask" && (
                    <SubtaskDetails
                        subtask={subtaskForm}
                        isEditing={isEditing}
                        onChange={handleChange}
                        onSave={handleSave}
                    />
                )}    

                {/*save button */}
                {isEditing && (
                    <Button 
                    variant="primary"
                    onClick={() => {
                        // handle save logic here, such as making an API call to update the task
                        console.log("Saving task...", form);
                        handleSave();
                        setIsEditing(false); // exit edit mode after saving
                    }}
                    >
                        Save Changes
                    </Button>
                )}
            </div>
            
        </div>
    );
};

export default TaskModal;