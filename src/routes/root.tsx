import { Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Root() {
  return (
    <Box>
      <Link to="react-konva">React Konva</Link>
      <Link to="fabric-js">Fabric.js</Link>
    </Box>
  );
}