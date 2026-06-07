import Card from "../../components/general/card";

const Analytics = () => {
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
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        Task Done
                    </Card>
                    <Card>
                        On time percentage
                    </Card>
                    <Card>
                        Average progress percentage
                    </Card>
                    <Card>
                        Task Load or Active
                    </Card>
                </div>
            </section>

            {/* Progress Overtime */}
            <section>                
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Progress Overtime - line chart
                </h1>                
                <div>
                    <Card>
                        Progress Overtime
                    </Card>
                </div>
            </section>

            {/* Task Distribution and Work Load */}
            <div className="grid grid-cols-2 gap-4">
                 {/* Task Distribution */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Task Distribution - pie chart
                    </h1>
                    <div>
                        <Card>
                            Task Distribution
                        </Card>
                    </div>
                </section>
                 {/* Work Load and Health Metrics */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Work Load and Health Metrics - gauge + bar chart
                    </h1>
                    <div>
                        <Card>
                            Work Load and Health Metrics
                        </Card>
                    </div>
                </section>
            </div>  

             {/* Bottleneck and prediction */}
            <div className="flex flex-col md:grid grid-cols-2 gap-4">
                 {/* Task Distribution */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Bottleneck Analysis - bar chart
                    </h1>
                    <div>
                        <Card>
                            Bottleneck Analysis
                        </Card>
                    </div>
                </section>
                 {/* Prediction and intelligence */}
                <section>
                    <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                        Prediction and Intelligence - line chart
                    </h1>
                    <div>
                        <Card>
                            Prediction and Intelligence
                        </Card>
                    </div>
                </section>
            </div>

            {/* Time and Delay Analysis */}
            <section>
                <h1 className="text-sm font-bold mb-1 mt-3 md:text-md">
                    Time and Delay Analysis - bar chart
                </h1>
                <div>
                    <Card>
                        Time and Delay Analysis
                    </Card>
                </div>
            </section>               
        </>
    );
};

export default Analytics;