"use client"; // ensure our game runs in the frontend

import { CardButton } from "@/ui/card-button";
import { Panel } from "@/ui/panel";
import React from "react";

class Game {
  gl: WebGL2RenderingContext;
  canvas2d: CanvasRenderingContext2D | null;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");

    this.gl = gl;
    this.gl.clearColor(0.0, 0.5, 0.5, 1.0);
    
    // Create an overlay canvas for 2D text
    const textCanvas = document.createElement("canvas");
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    textCanvas.style.position = "absolute";
    textCanvas.style.left = "0";
    textCanvas.style.top = "0";
    textCanvas.style.width = "100%";
    textCanvas.style.height = "100%";
    textCanvas.style.pointerEvents = "none";
    canvas.parentNode?.insertBefore(textCanvas, canvas.nextSibling);
    
    this.canvas2d = textCanvas.getContext("2d");
    
    this.draw();
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Draw greeting text
    if (this.canvas2d) {
      this.canvas2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas2d.font = "bold 30px Arial";
      this.canvas2d.textAlign = "center";
      this.canvas2d.fillStyle = "white";
      this.canvas2d.fillText("Guten Morgen!", this.canvas.width / 2, this.canvas.height / 2);
      
      this.canvas2d.font = "20px Arial";
      this.canvas2d.fillText("Im Praktikum wird nicht gespielt", this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }
}

export default () => {
  const game = React.useRef<Game | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    (async () => {
      if (!canvas.current) return;
      // Ensure canvas dimensions match display size
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;
      game.current = new Game(canvas.current);
      
      // Handle resize
      const handleResize = () => {
        if (canvas.current && game.current) {
          canvas.current.width = canvas.current.clientWidth;
          canvas.current.height = canvas.current.clientHeight;
          game.current.draw();
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    })();
  }, []);

  return (
    <>
      <canvas className="h-full w-full" ref={canvas} />
      
      <Panel reduceTopPadding>
        <div className="flex w-full flex-col">
          <span className="text-white text-lg">Computer Graphics 1</span>
          <span className="italic text-white">Practical Course</span>
          <span className="text-white">WT24</span>
        </div>
      </Panel>
    </>
  );
};
