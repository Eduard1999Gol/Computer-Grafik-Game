"use client"; // ensure our game runs in the frontend

import React from 'react';


class Game {
  gl: WebGL2RenderingContext;

  constructor(
    private canvas: HTMLCanvasElement
  ) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');

    this.gl = gl;
    this.gl.clearColor(0.0, 0.5, 0.0, 1.0);
    this.draw();
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}

export default () => {

  const game = React.useRef<Game | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    (async () => {
      if (!canvas.current) return;
      game.current = new Game(canvas.current);
    })(); 
  }, []);

  return (
    <>
      <canvas className='h-full w-full' ref={canvas} />
    </>
  );
};
