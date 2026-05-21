import Card from "../../components/general/card";

const Task = () => {
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
                    <Card contentClassname="grid grid-cols-2 gap-4">
                        <div>
                            Task Information
                        </div>
                        <div>
                            Task Information
                        </div>
                    </Card>
                </div>
            </section>
        </>
    );
};

export default Task;