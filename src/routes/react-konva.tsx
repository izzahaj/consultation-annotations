import { Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { KonvaEventObject } from "konva/lib/Node";
import { Line as LineShape, LineConfig } from "konva/lib/shapes/Line";
import { useRef, useState } from "react";
import { Layer, Stage, Line, Rect } from "react-konva";
import { Draw, AutoFixNormal, Square, CropSquare, HorizontalRule} from '@mui/icons-material';
import { Rect as RectShape } from "konva/lib/shapes/Rect";

type CanvasToolbarProps = {
  tool: string,
  handleTool: (event: React.MouseEvent<HTMLElement>, value: string | null) => void,
  strokeWidth: number,
  handleStrokeWidth: (event: SelectChangeEvent) => void,
  stroke: string,
  handleStroke: (event: React.MouseEvent<HTMLElement>, value: string | null) => void,
};

const strokeColors = ["black", "red", "yellow", "orange", "brown", "blue", "green", "grey", "lightblue", "limegreen", "pink", "purple"]
const strokeWidths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const tools = [
  {
    value: "pen",
    icon: <Draw />
  },
  {
    value: "eraser",
    icon: <AutoFixNormal />
  },
  {
    value: "line",
    icon: <HorizontalRule />
  },
  {
    value: "rectangle",
    icon: <CropSquare />
  },
]

const CanvasToolbar = (props: CanvasToolbarProps) => {
  const { tool, handleTool, strokeWidth, handleStrokeWidth, stroke, handleStroke } = props;

  return (
    <Stack rowGap={2}>
      <Box>
        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={handleTool}
          sx={{ flexWrap: "wrap" }}
        >
          {tools.map((tool) => (
            <ToggleButton key={tool.value} value={tool.value}>
              {tool.icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box>
        <ToggleButtonGroup
          value={stroke}
          exclusive
          onChange={handleStroke}
          sx={{ flexWrap: "wrap" }}
        >
          {strokeColors.map((color) => (
            <ToggleButton key={color} value={color}>
              <Square htmlColor={color} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box>
        <FormControl sx={{ minWidth: 200}}>
          <InputLabel id="strokeWidthLabel">Stroke width</InputLabel>
          <Select
            labelId="strokeWidthLabel"
            id="strokeWidth"
            value={strokeWidth.toString()}
            label="Stroke width"
            onChange={handleStrokeWidth}
          >
            {strokeWidths.map((width) => (
              <MenuItem key={width} value={width}>{width}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
};

type DrawingCanvasProps = {
  onMouseDown: (event: KonvaEventObject<MouseEvent>) => void,
  onMouseMove: (event: KonvaEventObject<MouseEvent>) => void,
  onMouseUp: () => void,
  lines: LineShape<LineConfig>[],
  straightLines: LineShape<LineConfig>[],
  rectangles: RectShape[]
}

const DrawingCanvas = (props: DrawingCanvasProps) => {
  const { onMouseDown, onMouseMove, onMouseUp, lines, straightLines, rectangles } = props;

  return (
    <Box bgcolor="whitesmoke">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={onMouseDown}
        onMousemove={onMouseMove}
        onMouseup={onMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
          {straightLines.map((straightLine, i) => (
            <Line
              key={i}
              points={straightLine.points}
              stroke={straightLine.stroke}
              strokeWidth={straightLine.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                straightLine.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
          {rectangles.map((rectangle, i) => (
            <Rect
              key={i}
              x={rectangle.x}
              y={rectangle.y}
              width={rectangle.width}
              height={rectangle.height}
              strokeWidth={rectangle.strokeWidth}
              stroke={rectangle.stroke}
              fill="transparent"
            />
          ))}
        </Layer>
      </Stage>
    </Box>
  );
}

// TODO:
// update mouse events to handle drawing of shapes
export default function KonvaCanvas() {
  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [stroke, setStroke] = useState("black"); // line colour 
  const [lines, setLines] = useState<LineShape<LineConfig>[]>([]);
  const [rectangles, setRectangles] = useState<RectShape[]>([]);
  const [straightLines, setStraightLines] = useState<LineShape<LineConfig>[]>([]);
  const isDrawing = useRef(false);

  const handleTool = (_event: React.MouseEvent<HTMLElement>, newTool: string | null) => {
    if (newTool) {
      setTool(newTool);
    }
  };

  const handleStrokeWidth = (event: SelectChangeEvent) => {
    const { value } = event.target;
    setStrokeWidth(parseInt(value));
  };

  const handleStroke = (_event: React.MouseEvent<HTMLElement>, newStroke: string | null) => {
    if (newStroke) {
      setStroke(newStroke);
    }
  };

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = event.target.getStage()?.getPointerPosition();

    if (tool === "pen" || tool === "eraser") {
      setLines([
        ...lines,
        {
          tool,
          strokeWidth,
          stroke,
          points: [pos?.x, pos?.y]
        }
      ]);
    }

    if (tool === "line" || tool === "eraser") {
      setStraightLines([
        ...straightLines,
        {
          tool,
          strokeWidth,
          stroke,
          x: pos?.x,
          y: pos?.y,
          points: [pos?.x, pos?.y]
        }
      ]);
    }

    if (tool === "rectangle") {
      setRectangles([
        ...rectangles,
        {
          x: pos?.x,
          y: pos?.y,
          width: 0,
          height: 0,
          strokeWidth,
          stroke
        }
      ]);
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();

    if (tool === "eraser") {
      let lastLine = lines[lines.length - 1];
      let lastStraightLine = straightLines[straightLines.length - 1];

      lastLine.points = lastLine.points.concat([point?.x, point?.y]);
      lastStraightLine.points = lastStraightLine.points.concat([point?.x, point?.y]);

      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
      straightLines.splice(straightLines.length - 1, 1, lastStraightLine);
      setStraightLines(straightLines.concat());
    }

    if (tool === "pen") {
      let lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point?.x, point?.y]);

      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    }

    if (tool === "line") {
      let lastStraightLine = straightLines[straightLines.length - 1];
      lastStraightLine.points = [lastStraightLine.x, lastStraightLine.y, point?.x, point?.y];
      
      straightLines.splice(straightLines.length - 1, 1, lastStraightLine);
      setStraightLines(straightLines.concat());
    }
    
    if (tool === "rectangle") {
      let lastRectangle = rectangles[rectangles.length - 1];
      const sx = lastRectangle.x;
      const sy = lastRectangle.y;
      lastRectangle.width = point?.x - sx;
      lastRectangle.height = point?.y - sy;
      
      rectangles.splice(rectangles.length - 1, 1, lastRectangle);
      setRectangles(rectangles.concat());
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container>
        <Grid item xs={3}>
          <CanvasToolbar
            tool={tool}
            handleTool={handleTool}
            strokeWidth={strokeWidth}
            handleStrokeWidth={handleStrokeWidth}
            stroke={stroke}
            handleStroke={handleStroke}
          />
        </Grid>
        <Grid item xs={9}>
          <DrawingCanvas
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            lines={lines}
            straightLines={straightLines}
            rectangles={rectangles}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
