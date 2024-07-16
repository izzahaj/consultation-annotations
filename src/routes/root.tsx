import { Box, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import '../App.css';

export default function Root() {
  return (
    <Box>
      <Stack>
        <Link to="react-konva">React Konva</Link>
        <Link to="fabric-js">Fabric.js</Link>
      </Stack>
    </Box>
  );
}