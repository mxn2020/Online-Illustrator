import React, { useEffect, useRef } from 'react';

// Import or define your types here
import { Project, Element, Point } from './types';

export const ProjectPreview: React.FC<{ project: Project }> = ({ project }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        renderPreview(ctx, project);
      }
    }
  }, [project]);

  const renderPreview = (ctx: CanvasRenderingContext2D, project: Project) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    // Get the first artboard
    const artboard = project.artboards[0];

    // Calculate the scale to fit the preview
    const scale = Math.min(
      canvasRef.current!.width / artboard.width,
      canvasRef.current!.height / artboard.height
    );

    // Draw the artboard background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, artboard.width * scale, artboard.height * scale);

    // Draw the elements
    project.layers.forEach(layer => {
      if (!layer.isHidden) {
        layer.elements.forEach(element => {
          if (!element.isHidden) {
            drawElement(ctx, element, scale);
          }
        });
      }
    });
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: Element, scale: number) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = element.fillColor;
    ctx.strokeStyle = element.strokeColor;
    ctx.lineWidth = element.strokeWidth;
    ctx.globalAlpha = element.opacity;

    switch (element.type) {
      case 'shape':
        drawShape(ctx, element);
        break;
      case 'path':
        drawPath(ctx, element);
        break;
      case 'line':
        drawLine(ctx, element);
        break;
    }

    ctx.restore();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, element: Element) => {
    switch (element.tool) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(
          element.position.x,
          element.position.y,
          element.dimensions.width,
          element.dimensions.height
        );
        ctx.fill();
        ctx.stroke();
        break;
      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(
          element.position.x + element.dimensions.width / 2,
          element.position.y + element.dimensions.height / 2,
          element.dimensions.width / 2,
          element.dimensions.height / 2,
          0, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        break;
      case 'triangle':
        drawTriangle(ctx, element);
        break;
      case 'star':
        drawStar(ctx, element);
        break;
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, element: Element) => {
    if (element.points && element.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      if (element.tool === 'pen') {
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, element: Element) => {
    if (element.start && element.end) {
      ctx.beginPath();
      ctx.moveTo(element.start.x, element.start.y);
      ctx.lineTo(element.end.x, element.end.y);
      ctx.stroke();
    }
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, element: Element) => {
    const { x, y } = element.position;
    const { width, height } = element.dimensions;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, element: Element) => {
    const { x, y } = element.position;
    const { width, height } = element.dimensions;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius / 2;
    const spikes = 5;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={150}
      className="border border-gray-300"
    />
  );
};