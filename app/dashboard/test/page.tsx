'use client'
import { Stage, Layer, Circle } from 'react-konva';

function Canvas() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Circle x={400} y={100} radius={20} fill="green" />
      </Layer>
    </Stage>
  );
}

export default Canvas;