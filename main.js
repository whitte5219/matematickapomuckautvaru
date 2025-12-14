// ---------------- Tabs ----------------
const tabCalc = document.getElementById("tabCalc");
const tabHelp = document.getElementById("tabHelp");
const pageCalc = document.getElementById("calc");
const pageHelp = document.getElementById("help");

function show(which){
  const isCalc = which === "calc";
  pageCalc.classList.toggle("hidden", !isCalc);
  pageHelp.classList.toggle("hidden", isCalc);
  tabCalc.classList.toggle("active", isCalc);
  tabHelp.classList.toggle("active", !isCalc);
}
tabCalc.onclick = () => show("calc");
tabHelp.onclick = () => show("help");

// ---------------- Calculator data ----------------
const conceptSelect = document.getElementById("calcConcept");
const shapeSelect = document.getElementById("calcShape");
const inputsDiv = document.getElementById("calcInputs");
const formulaSpan = document.getElementById("calcFormula");
const resultSpan = document.getElementById("calcResult");

const canvas = document.getElementById("calcCanvas");
const ctx = canvas.getContext("2d");

const CONCEPTS = [
  { key:"obvod",  label:"obvod"  },
  { key:"obsah",  label:"obsah"  },
  { key:"povrch", label:"povrch" },
  { key:"objem",  label:"objem"  }
];

const SHAPES = {
  square: {
    name: "Čtverec",
    dims: ["a"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod:  d => ["o = 4a", 4*d.a],
      obsah:  d => ["S = a²", d.a*d.a]
    },
    draw: (d) => drawSquare(d.a)
  },

  rectangle: {
    name: "Obdélník",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["o = 2(a + b)", 2*(d.a + d.b)],
      obsah: d => ["S = a · b", d.a*d.b]
    },
    draw: (d) => drawRectangle(d.a, d.b)
  },

  circle: {
    name: "Kruh",
    dims: ["r"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["o = 2πr", 2*Math.PI*d.r],
      obsah: d => ["S = πr²", Math.PI*d.r*d.r]
    },
    draw: (d) => drawCircle(d.r)
  },

  rightTriangle: {
    name: "Trojúhelník (pravouhlý)",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["S = a · b / 2", (d.a*d.b)/2],
      obvod: d => {
        const c = Math.sqrt(d.a*d.a + d.b*d.b);
        return ["o = a + b + c, c = √(a² + b²)", d.a + d.b + c];
      }
    },
    draw: (d) => drawRightTriangle(d.a, d.b)
  },

  triangle: {
    name: "Trojúhelník (nepravouhlý)",
    dims: ["a","va","b","c"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["S = a · vₐ / 2", (d.a*d.va)/2],
      obvod: d => ["o = a + b + c", d.a + d.b + d.c]
    },
    draw: (d) => drawNonRightTriangle(d.a, d.va)
  },

  cube: {
    name: "Krychle",
    dims: ["a"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["S = 6a²", 6*d.a*d.a],
      objem:  d => ["V = a³", d.a**3]
    },
    draw: (d) => drawCubeWireframe(d.a)
  },

  cuboid: {
    name: "Kvádr",
    dims: ["a","b","c"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["S = 2(ab + ac + bc)", 2*(d.a*d.b + d.a*d.c + d.b*d.c)],
      objem:  d => ["V = a · b · c", d.a*d.b*d.c]
    },
    draw: (d) => drawCuboidWireframe(d.a, d.b, d.c)
  }
};

let values = {}; // current inputs

// ---------------- UI init ----------------
for (const c of CONCEPTS){
  conceptSelect.add(new Option(c.label, c.key));
}
for (const key in SHAPES){
  shapeSelect.add(new Option(SHAPES[key].name, key));
}

// defaults
shapeSelect.value = "cube";
syncConceptOptions();
buildInputs();
render();

// ---------------- Logic gating ----------------
function syncConceptOptions(){
  const shape = SHAPES[shapeSelect.value];
  const allowed = shape.allowed;

  // rebuild concept options to only allowed
  const current = conceptSelect.value;
  conceptSelect.innerHTML = "";
  for (const c of CONCEPTS){
    if (allowed.includes(c.key)){
      conceptSelect.add(new Option(c.label, c.key));
    }
  }

  // keep if possible, else first allowed
  if (allowed.includes(current)) conceptSelect.value = current;
  else conceptSelect.value = allowed[0];
}

function buildInputs(){
  inputsDiv.innerHTML = "";
  values = {};
  const shape = SHAPES[shapeSelect.value];

  for (const dim of shape.dims){
    const wrap = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = dim + ":";
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.1";
    input.value = defaultValue(dim);
    values[dim] = Number(input.value);

    input.oninput = () => {
      values[dim] = Number(input.value);
      render();
    };

    wrap.appendChild(label);
    wrap.appendChild(input);
    inputsDiv.appendChild(wrap);
  }
}

function defaultValue(dim){
  if (dim === "r") return 4;
  if (dim === "va") return 3;
  return 5;
}

// ---------------- Events ----------------
shapeSelect.onchange = () => {
  syncConceptOptions();
  buildInputs();
  render();
};
conceptSelect.onchange = render;

// ---------------- Render ----------------
function render(){
  const shape = SHAPES[shapeSelect.value];
  const concept = conceptSelect.value;
  const f = shape.formula[concept];

  if (!f){
    formulaSpan.textContent = "—";
    resultSpan.textContent = "—";
  } else {
    const [txt, val] = f(values);
    formulaSpan.textContent = txt;
    resultSpan.textContent = isFinite(val) ? val.toFixed(2) : "—";
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth = 2;

  // draw border
  ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);

  // draw shape preview
  shape.draw(values);
}

// ---------------- Drawing helpers ----------------
function center(){
  return { cx: canvas.width/2, cy: canvas.height/2 };
}
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// 2D shapes scaled by input (simple mapping)
function drawSquare(a){
  const {cx, cy} = center();
  const s = clamp(20 + a*18, 40, 240);
  ctx.strokeRect(cx - s/2, cy - s/2, s, s);
}

function drawRectangle(a,b){
  const {cx, cy} = center();
  const w = clamp(30 + a*18, 60, 320);
  const h = clamp(30 + b*18, 60, 240);
  ctx.strokeRect(cx - w/2, cy - h/2, w, h);
}

function drawCircle(r){
  const {cx, cy} = center();
  const rad = clamp(20 + r*18, 30, 160);
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI*2);
  ctx.stroke();
}

function drawRightTriangle(a,b){
  const {cx, cy} = center();
  const w = clamp(30 + a*18, 70, 320);
  const h = clamp(30 + b*18, 70, 240);

  const x0 = cx - w/2;
  const y0 = cy + h/2;

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + w, y0);
  ctx.lineTo(x0, y0 - h);
  ctx.closePath();
  ctx.stroke();
}

function drawNonRightTriangle(a, va){
  const {cx, cy} = center();
  const base = clamp(30 + a*18, 80, 340);
  const h = clamp(30 + va*18, 70, 240);

  const x1 = cx - base/2, y1 = cy + h/2;
  const x2 = cx + base/2, y2 = cy + h/2;
  const x3 = cx - base/6, y3 = cy - h/2;

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y3);
  ctx.closePath();
  ctx.stroke();
}

// 3D-looking wireframe like your image
function drawCubeWireframe(a){
  const {cx, cy} = center();
  const s = clamp(30 + a*20, 80, 220);

  const frontX = cx - s/2;
  const frontY = cy - s/2 + 30;

  // shift for top/right
  const dx = s*0.35;
  const dy = s*0.25;

  // front square
  ctx.strokeRect(frontX, frontY, s, s);

  // top face
  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + s, frontY);
  ctx.closePath();
  ctx.stroke();

  // right face
  ctx.beginPath();
  ctx.moveTo(frontX + s, frontY);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy + s);
  ctx.lineTo(frontX + s, frontY + s);
  ctx.closePath();
  ctx.stroke();
}

function drawCuboidWireframe(a,b,c){
  // simple: use a as width, b as height, c as depth-ish (only affects offset)
  const {cx, cy} = center();
  const w = clamp(40 + a*18, 120, 340);
  const h = clamp(40 + b*18, 100, 260);
  const depth = clamp(20 + c*10, 40, 140);

  const frontX = cx - w/2;
  const frontY = cy - h/2 + 25;

  const dx = depth*0.6;
  const dy = depth*0.4;

  // front rectangle
  ctx.strokeRect(frontX, frontY, w, h);

  // top face
  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + w, frontY);
  ctx.closePath();
  ctx.stroke();

  // right face
  ctx.beginPath();
  ctx.moveTo(frontX + w, frontY);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy + h);
  ctx.lineTo(frontX + w, frontY + h);
  ctx.closePath();
  ctx.stroke();
}
