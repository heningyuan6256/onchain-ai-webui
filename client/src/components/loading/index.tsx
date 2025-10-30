import React from "react";

const GridSkeleton = ({ size = "medium" }) => {
  return <div className={`grid-skeleton ${size}`}></div>;
};

export default GridSkeleton;
