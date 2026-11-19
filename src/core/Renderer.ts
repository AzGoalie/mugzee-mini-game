export function drawImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  scale = 1,
  centered = true,
) {
  const dx = centered ? x - (img.width * scale) / 2 : x;
  const dy = centered ? y - (img.height * scale) / 2 : y;

  ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
}
