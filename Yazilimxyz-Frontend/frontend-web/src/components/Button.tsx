import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  bgColor?: "white" | "black";
  onClick?: () => void;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  bgColor = "black",
  onClick,
  className = "",
}) => {
  const textColor = bgColor === "white" ? "text-black" : "text-white";
  const background = bgColor === "white" ? "bg-white" : "bg-black";
  const border = "border border-gray-300";

  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-medium heading-sm-1 transition duration-200 hover:opacity-90 ${background} ${textColor} ${border} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
