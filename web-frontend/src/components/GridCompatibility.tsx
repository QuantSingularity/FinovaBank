import { Grid as MuiGrid, type SxProps, type Theme } from "@mui/material";
import type React from "react";

interface GridCompatibilityProps {
  children?: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  sx?: SxProps<Theme>;
  [key: string]: any;
}

const GridCompatibility: React.FC<GridCompatibilityProps> = (props) => {
  return <MuiGrid {...props} />;
};

export default GridCompatibility;
