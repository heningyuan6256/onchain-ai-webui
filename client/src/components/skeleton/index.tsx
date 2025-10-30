import { FC } from "react";
import GridSkeleton from "../loading";

const Skeleton: FC = () => {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "563px" }}>
        <div style={{ marginBottom: "30px" }}>
          <GridSkeleton size="small" />
        </div>
        <div style={{ marginBottom: "30px" }}>
          <GridSkeleton size="medium" />
        </div>
        <GridSkeleton size="medium" />
      </div>
    </div>
  );
};

export default Skeleton;
