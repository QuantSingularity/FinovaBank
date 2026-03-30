// GridCompatibility.tsx
// A simplified compatibility layer for Material UI Grid component

import { Grid as MuiGrid, type SxProps, type Theme } from "@mui/material";
import type React from "react";

interface GridCompatibilityProps {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  sx?: SxProps<Theme>;
}

const GridCompatibility: React.FC<GridCompatibilityProps> = (props) => {
  const { children, item, ...other } = props;

  // In Material UI v7, the 'item' prop is no longer used
  // We simply pass all other props to the MuiGrid component
  return <MuiGrid {...other}>{children}</MuiGrid>;
};

export default GridCompatibility;
