export function drawFullscreenImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) {
  ctx.drawImage(img, 0, 0);
}

export function drawImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  scale = 1
) {
  ctx.drawImage(
    img,
    x - (img.width * scale) / 2,
    y - (img.height * scale) / 2,
    img.width * scale,
    img.height * scale
  );
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  centered = false,
  fill = "#f5d546"
) {
  ctx.save();

  ctx.font = `${size}px Libre Baskerville`;
  ctx.fillStyle = fill;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  if (centered) {
    const measurement = ctx.measureText(text);
    x -= measurement.width / 2;
  }

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.restore();
}

export function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();

  ctx.fillStyle = "#5a1a06";
  ctx.strokeStyle = "#585758";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 5);
  ctx.stroke();
  ctx.fill();

  ctx.restore();
}

export function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill = "#020203"
) {
  ctx.save();

  ctx.fillStyle = fill;
  ctx.strokeStyle = "#585758";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 5);
  ctx.stroke();
  ctx.fill();

  ctx.restore();
}
