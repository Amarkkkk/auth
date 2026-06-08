import Textfield from "../general/textfield";
import { TiDelete } from "react-icons/ti";
// task for task details page
// isEditing is for if the user is editing the task or just viewing it
// onSubtaskClick for navigating to the subtask
export default function TaskDetails ({task, isEditing, onSubtaskClick, onChange}) {
    if(!task) return <div>Loading...</div>;
    console.log("COMPONENT UPDATED")
    return (
        <div className="space-y-4">
            <Textfield
                label="Title"
                name="title"
                value={task.title}
                onChange={onChange}
                disabled={!isEditing}
            />
            <Textfield
                label="Description"
                name="description"
                value={task.description}
                onChange={onChange}
                disabled={!isEditing}
            />
            <div>
                <h3 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Subtasks
                </h3>

                {task.subtasks?.map((subtask) => (
                    <div
                    key={subtask.id}
                    onClick={() => {
                        console.log("SUBTASK CLICKED:", subtask);
                        console.log("component updated");
                        onSubtaskClick(subtask)}}
                    className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition">       
                        <div className="flex flex-row justify-between items-center">
                            <div>
                                <div className="font-semibold">
                                    {subtask.subtask_title}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {subtask.subtask_status} • {subtask.subtask_progress_percentage}
                                </div>
                            </div>       
                            <div>
                                <TiDelete
                                    className="text-red-500 hover:text-red-700"
                                    size={30}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent the click from propagating to the parent div
                                        console.log("deleted")
                                    }}
                                />                              
                            </div>                                       
                        </div>                                     
                    </div>
                ))}
            </div>
            
        </div>
    );
};
