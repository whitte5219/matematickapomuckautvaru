import { clearCanvas, niceScale } from "./utils.js";

function baseStyle(ctx){
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
}

function drawGrid(ctx, w, h){
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  const step = 40;
  for (let x=0; x<=w; x+=step){
    ctx.moveTo(x,0); ctx.lineTo(x,h);
  }
  for (let y=0; y<=h; y+=step){
    ctx.moveTo(0,y); ctx.lineTo(w,y);
  }
  ctx.stroke();
  ctx.restore();
}

export function draw2D(canvas, concept, shapeKey, dims){
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  clearCanvas(ctx, w, h);
  baseStyle(ctx);

  // background
  ctx.save();
  ctx.fillStyle = "rgba(8,10,14,0.55)";
  ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  drawGrid(ctx, w, h);
  ctx.restore();

  const isObvod = concept === "obvod";
  const isObsah = concept === "obsah";

  const strokeW = isObvod ? 6 : 3;
  const fillAlpha = isObsah ? 0.22 : 0.0;

  ctx.save();
  ctx.translate(w/2, h/2);

  // choose size based on inputs (mapped)
  const aPx = niceScale(dims.a ?? 6, 120, 260);
  const bPx = niceScale(dims.b ?? 4, 90, 220);
  const rPx = niceScale(dims.r ?? 4, 70, 170);

  ctx.strokeStyle = "rgba(232,236,243,0.85)";
  ctx.lineWidth = strokeW;
  ctx.fillStyle = `rgba(110,168,255,${fillAlpha})`;

  if (shapeKey === "square"){
    const s = aPx;
    ctx.beginPath();
    ctx.rect(-s/2, -s/2, s, s);
    if (isObsah) ctx.fill();
    ctx.stroke();
  }

  if (shapeKey === "rectangle"){
    const rw = aPx;
    const rh = bPx;
    ctx.beginPath();
    ctx.rect(-rw/2, -rh/2, rw, rh);
    if (isObsah) ctx.fill();
    ctx.stroke();
  }

  if (shapeKey === "circle"){
    ctx.beginPath();
    ctx.arc(0,0,rPx,0,Math.PI*2);
    if (isObsah) ctx.fill();
    ctx.stroke();
    // radius line
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(rPx,0);
    ctx.stroke();
    ctx.restore();
  }

  if (shapeKey === "rightTriangle"){
    // right triangle with legs a,b
    const ax = aPx;
    const by = bPx;
    ctx.beginPath();
    ctx.moveTo(-ax/2, by/2);
    ctx.lineTo(ax/2, by/2);
    ctx.lineTo(-ax/2, -by/2);
    ctx.closePath();
    if (isObsah) ctx.fill();
    ctx.stroke();

    // right angle mark
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    const x0 = -ax/2, y0 = by/2;
    ctx.beginPath();
    ctx.moveTo(x0+24, y0);
    ctx.lineTo(x0+24, y0-24);
    ctx.lineTo(x0, y0-24);
    ctx.stroke();
    ctx.restore();
  }

  if (shapeKey === "triangle"){
    // non-right triangle (rough visual): use a as base length, va as height
    const base = aPx;
    const height = niceScale(dims.va ?? 3, 70, 200);

    const p1 = {x: -base/2, y: height/2};
    const p2 = {x: base/2, y: height/2};
    const p3 = {x: -base/6, y: -height/2};

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.lineTo(p3.x,p3.y);
    ctx.closePath();
    if (isObsah) ctx.fill();
    ctx.stroke();

    // draw height line for obsah concept
    if (isObsah){
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p3.x, height/2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // label
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "rgba(232,236,243,0.8)";
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const label = isObvod ? "Obvod = čára kolem" : (isObsah ? "Obsah = plocha uvnitř" : "");
  if (label) ctx.fillText(label, -w/2 + 16, -h/2 + 24);
  ctx.restore();

  ctx.restore();
}

