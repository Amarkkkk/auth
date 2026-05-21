import Lottie from "lottie-react";

const LottieAnimation = ({animationData, Loop=true}) => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Lottie animationData={animationData} loop={Loop} />
        </div>
    );
};

export default LottieAnimation;