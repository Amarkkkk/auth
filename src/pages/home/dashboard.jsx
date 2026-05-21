import Card from "../../components/general/card";

const Dashboard = () => {
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
            
            {/* Status */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Overview - numbers
                </h1>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    <Card>
                        Pending
                    </Card>
                    <Card>
                        Ongoing
                    </Card>
                    <Card>
                        In progress
                    </Card>
                    <Card>
                        Completed
                    </Card>
                    <Card>
                        Canceled
                    </Card>
                    <Card>
                        Total
                    </Card>
                </div>
            </section>

            {/* Due Dates and Completion */}
            <div className="flex flex-col md:grid grid-cols-3 gap-4">
                 {/* Upcoming Due date */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Upcoming Due date
                    </h1>
                    <div>
                        <Card>
                            Upcoming Due date
                        </Card>
                    </div>
                </section>
                {/* Recent Completed */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Recent Completed
                    </h1>
                    <div>
                        <Card>
                            Recent Completed
                        </Card>
                    </div>
                </section>
                {/* Due Date base on Estimated */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Due Date base on Estimated
                    </h1>
                    <div>
                        <Card>
                            Due Date base on Estimated
                        </Card>
                    </div>
                </section>
            </div>              

            {/* Progress Overview */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Progress Overview - bar chart
                </h1>
                <div>
                    <Card>
                        Progress Overview
                    </Card>
                </div>
            </section>           

            {/* Quick Actions */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Quick Actions
                </h1>
                <div>
                    <Card>
                        Quick Actions
                    </Card>
                </div>
            </section>     
        </>
    );
};

export default Dashboard;