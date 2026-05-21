import Card from "../../components/general/card";

import { useState, useEffect } from "react";
import { getTasks } from "../../api/task";
const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Call the API function to fetch tasks
                const response = await getTasks();
                // must match the structure of the json response from the backend
                setTasks(response.data.result);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };
        // Fetch tasks when the component mounts
        fetchTasks();
    }, []);

    if (loading) return <p>Loading...</p>;
    return (
        <>
            {/* Greetings */}
            <section>                
                <div>
                    <Card>
                        Greetings
                    </Card>
                </div>
            </section>

            {/* Search filter add task */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Search Filter Add
                </h1>
                <div>
                    <Card>
                        Search Filter add
                    </Card>
                </div>
            </section>

            {/* Task Information */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Task Information
                </h1>
                <div>
                    {tasks.map((task) => (
                                <div key={task.id} className="mb-4">
                                    <Card contentClassname="grid grid-cols-6 gap-4 items-center">
                                        {/* Task information goes here, such as title, description, status, etc. */}
                                        <div className="col-span-2 font-semibold text-xs uppercase text-gray-500">
                                            Title
                                        </div>    
                                        <div className="font-semibold text-xs uppercase text-gray-500">
                                            Priority
                                        </div>   
                                        <div className="font-semibold text-xs uppercase text-gray-500">
                                            Status
                                        </div>   
                                        <div className="font-semibold text-xs uppercase text-gray-500">
                                            Progress
                                        </div>   
                                        <div className="font-semibold text-xs uppercase text-gray-500">
                                            Due Date
                                        </div>    

                                        {/*divider*/}
                                        <div className="col-span-6 border-t"></div>

                                        {/* data goes here */} 
                                        <div className="col-span-2">
                                            {task.title}
                                        </div>
                                        <div>
                                            <span className={`rounded-xl px-2 py-1 text-xs font-semibold text-white ${
                                                task.priority === "high"
                                                ? "bg-[#7f5539]"
                                                : task.priority === "low"
                                                ? "bg-[#e6ccb2]"
                                                : "bg-[#b08968]"
                                            }`}>
                                                {task.priority}
                                            </span>                                            
                                        </div>
                                        <div>
                                            <span className={`rounded-xl px-2 py-1 text-xs font-semibold text-white ${
                                                task.status === "Completed"
                                                ? "bg-green-400"
                                                : task.status === "Canceled"
                                                ? "bg-red-500"
                                                : task.status === "In_progress"
                                                ? "bg-yellow-400"
                                                : task.status === "Ongoing"
                                                ? "bg-orange-400"
                                                : "bg-gray-400"
                                            }`}>
                                                {task.status}
                                            </span>                                            
                                        </div>
                                        <div>
                                            {task.progress_percentage}%
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {task.task_due ? new Date(task.task_due).toLocaleDateString() : 'No due date'}
                                        </div>
                                    </Card>
                                    
                                </div>
                            ))}
                    
                </div>
            </section>
        </>
    );
};

export default Task;