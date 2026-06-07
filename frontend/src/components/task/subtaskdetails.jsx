import Textfield from "../general/textfield";

const SubtaskDetails = ({subtask, isEditing, onChange}) => {

    if(!subtask) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div>{subtask.id}</div>
            <Textfield
                label="Title"
                name="subtask_title"
                value={subtask.subtask_title}
                disabled={!isEditing}
                onChange={onChange}
            />
            <Textfield
                label="Description"
                name="subtask_description"
                value={subtask.subtask_description}
                disabled={!isEditing}
                onChange={onChange}
            />
            <Textfield
                label="Status"
                name="subtask_status"
                value={subtask.subtask_status}
                disabled={!isEditing}
                onChange={onChange}
            />
            <Textfield
                label="Progress"
                name="subtask_progress_percentage"
                value={subtask.subtask_progress_percentage}
                disabled={!isEditing}
                onChange={onChange}
            />
        </div>
    );
};

export default SubtaskDetails;