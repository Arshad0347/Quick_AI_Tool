import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-[url(/gradientBackground.png)] flex flex-col items-center justify-center w-full bg-cover bg-no-repeat min-h-screen px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-4xl space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
          Create amazing content with{" "}
          <span className="bg-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AI tools
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your content creation with our suite of premium AI tools.
          Write articles, generate images, and enhance your workflow
          effortlessly.
        </p>
        <div className="flex justify-center flex-wrap gap-4 text-sm max-sm:text-xs">
          <button
            onClick={() => navigate("/ai")}
            className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer"
          >
            Start creating now
          </button>
          <button className="bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer">
            Watch Demo
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600">
        <img src={assets.user_group} className="h-8 items-center" alt="" />
        Trusted by 10k+ people
      </div>
    </div>
  );
};

export default Hero;
