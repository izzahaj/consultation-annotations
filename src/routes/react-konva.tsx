import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, styled, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { KonvaEventObject } from "konva/lib/Node";
import { Line as LineShape, LineConfig } from "konva/lib/shapes/Line";
import { useRef, useState } from "react";
import { Layer, Stage, Line, Rect, Image } from "react-konva";
import { Draw, AutoFixNormal, Square, CropSquare, HorizontalRule, PanTool, InsertPhoto} from '@mui/icons-material';
import { Rect as RectShape } from "konva/lib/shapes/Rect";
import { Image as ImageShape } from "konva/lib/shapes/Image";
import useImage from "use-image";

const strokeColors = ["black", "red", "yellow", "orange", "brown", "blue", "green", "grey", "lightblue", "limegreen", "pink", "purple"]
const strokeWidths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const tools = [
  {
    value: "pointer",
    icon: <PanTool />
  },
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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

type CanvasToolbarProps = {
  tool: string,
  handleTool: (event: React.MouseEvent<HTMLElement>, value: string | null) => void,
  strokeWidth: number,
  handleStrokeWidth: (event: SelectChangeEvent) => void,
  stroke: string,
  handleStroke: (event: React.MouseEvent<HTMLElement>, value: string | null) => void,
  handleImage: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleLoad: (event: React.MouseEvent<HTMLButtonElement>) => void,
  handleSave: (event: React.MouseEvent<HTMLButtonElement>) => void
};

const CanvasToolbar = (props: CanvasToolbarProps) => {
  const { tool, handleTool, strokeWidth, handleStrokeWidth, stroke, handleStroke, handleImage, handleLoad, handleSave } = props;

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
        <FormControl sx={{ minWidth: 100}}>
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
      <Box>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          color="secondary"
          startIcon={<InsertPhoto />}
        >
          Upload image
          <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImage} />
        </Button>
      </Box>
      <Stack flexDirection="row" columnGap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoad}
        >
          Load Sketch
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save Sketch
        </Button>
      </Stack>
    </Stack>
  );
};

type DrawingCanvasProps = {
  onMouseDown: (event: KonvaEventObject<MouseEvent>) => void,
  onMouseMove: (event: KonvaEventObject<MouseEvent>) => void,
  onMouseUp: () => void,
  lines: LineShape<LineConfig>[],
  straightLines: LineShape<LineConfig>[],
  rectangles: RectShape[],
  images: ImageShape[]
}

const DrawingCanvas = (props: DrawingCanvasProps) => {
  const { onMouseDown, onMouseMove, onMouseUp, lines, straightLines, rectangles, images } = props;
  const stageRef = useRef(null);

  return (
    <Box>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={onMouseDown}
        onMousemove={onMouseMove}
        onMouseup={onMouseUp}
      >
        <Layer>
          {lines?.map((line, i) => (
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
              draggable
            />
          ))}
          {straightLines?.map((straightLine, i) => (
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
              draggable
            />
          ))}
          {rectangles?.map((rectangle, i) => (
            <Rect
              key={i}
              x={rectangle.x}
              y={rectangle.y}
              width={rectangle.width}
              height={rectangle.height}
              strokeWidth={rectangle.strokeWidth}
              stroke={rectangle.stroke}
              fill="transparent"
              draggable
            />
          ))}
          {images?.map((image, i) => (
            <URLImage
              key={i}
              src={image.src}
            />
          ))}
        </Layer>
      </Stage>
    </Box>
  );
}

const URLImage = ({ src }) => {
  const [image] = useImage(src);
  return <Image image={image} scaleX={0.2} scaleY={0.2}/>;
}

export default function KonvaCanvas() {
  const [tool, setTool] = useState("pointer");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [stroke, setStroke] = useState("black"); // line colour 
  const isDrawing = useRef(false);
  // Lines and shapes state; what should be serialized and saved
  const [lines, setLines] = useState<LineShape<LineConfig>[]>([]);
  const [rectangles, setRectangles] = useState<RectShape[]>([]);
  const [straightLines, setStraightLines] = useState<LineShape<LineConfig>[]>([]);
  const [images, setImages] = useState<ImageShape[]>([]);

  const handleLoad = () => {
    const savedDataString = window.localStorage.getItem("canvas");

    if (!savedDataString) {
      console.log("No existing canvas");
      return;
    }

    const savedData = JSON.parse(savedDataString);
    console.log("canvas loaded");
    console.log(savedData);

    setLines(savedData.lines);
    setRectangles(savedData.rectangles);
    setStraightLines(savedData.straightLines);
    setImages(savedData.images);
  };

  const handleSave = () => {
    const data = {
      lines,
      rectangles,
      straightLines,
      images
    };

    const stringData = JSON.stringify(data);
    window.localStorage.setItem("canvas", stringData);
    console.log("canvas saved");
    console.log(stringData);
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);

    if (file) {
      const url = URL.createObjectURL(file);
      console.log(url)
      setImages([
        ...images,
        {
          src: url,

        }
      ]);
    }
  };

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
            handleImage={handleImage}
            handleLoad={handleLoad}
            handleSave={handleSave}
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
            images={images}
          />
        </Grid>
      </Grid>
    </Box>
  );
}


// ??
// suggestion: serialize state of Stage component to JSON and save in database --> use this to generate stage from the state so can still edit
// is this ok for performance?
// how to handle existing vectors from prev system?