import LottieModule from "lottie-react";
const Lottie = LottieModule.default;

const Media = ({ type, src, animationData, className = "" }) => {
  if (type === "image") {
    return <img src={src} className={className} alt="" />;
  }

  if (type === "lottie") {
    return (
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className={className}
      />
    );
  }

  return null;
};

export default Media;