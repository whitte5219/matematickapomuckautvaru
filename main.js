// ================= TAB LOGIC =================
const tabCalc = document.getElementById("tabCalc");
const tabHelp = document.getElementById("tabHelp");
const tabAI   = document.getElementById("tabAI");

const pageCalc = document.getElementById("calc");
const pageHelp = document.getElementById("help");
const pageAI   = document.getElementById("ai");

function show(tab){
  pageCalc.classList.add("hidden");
  pageHelp.classList.add("hidden");
  pageAI.classList.add("hidden");

  tabCalc.classList.remove("active");
  tabHelp.classList.remove("active");
  tabAI.classList.remove("active");

  if(tab === "calc"){ pageCalc.classList.remove("hidden"); tabCalc.classList.add("active"); }
  if(tab === "help"){ pageHelp.classList.remove("hidden"); tabHelp.classList.add("active"); }
  if(tab === "ai"){   pageAI.classList.remove("hidden");   tabAI.classList.add("active"); }
}

tabCalc.onclick = () => show("calc");
tabHelp.onclick = () => show("help");
tabAI.onclick   = () => show("ai");

// ================= CALCULATOR ELEMENTS =================
const conceptSelect = document.getElementById("calcConcept");
const shapeSelect   = document.getElementById("calcShape");
const inputsDiv     = document.getElementById("calcInputs");
const formulaSpan   = document.getElementById("calcFormula");
const resultSpan    = document.getElementById("calcResult");

const canvas = document.getElementById("calcCanvas");
const ctx = canvas.getContext("2d");

// ================= DATA =================
const CONCEPTS = [
  { key: "obvod",  label: "obvod" },
  { key: "obsah",  label: "obsah" },
  { key: "povrch", label: "povrch" },
  { key: "objem",  label: "objem" }
];

const SHAPES = {
  square: {
    name: "Čtverec",
    dims: ["a"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 4 · a", 4*d.a],
      obsah: d => ["obsah = a²", d.a*d.a]
    },
    draw: d => drawSquare(d.a)
  },

  rectangle: {
    name: "Obdélník",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 2 · (a + b)", 2*(d.a+d.b)],
      obsah: d => ["obsah = a · b", d.a*d.b]
    },
    draw: d => drawRectangle(d.a,d.b)
  },

  circle: {
    name: "Kruh",
    dims: ["r"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 2 · π · r", 2*Math.PI*d.r],
      obsah: d => ["obsah = π · r²", Math.PI*d.r*d.r]
    },
    draw: d => drawCircle(d.r)
  },

  rightTriangle: {
    name: "Trojúhelník (pravouhlý)",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["obsah = (a · b) / 2", (d.a*d.b)/2],
      obvod: d => {
        const c = Math.sqrt(d.a*d.a + d.b*d.b);
        return ["obvod = a + b + c", d.a + d.b + c];
      }
    },
    draw: d => drawRightTriangle(d.a,d.b)
  },

  triangle: {
    name: "Trojúhelník (nepravouhlý)",
    dims: ["a","va","b","c"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["obsah = (a · vₐ) / 2", (d.a*d.va)/2],
      obvod: d => ["obvod = a + b + c", d.a + d.b + d.c]
    },
    draw: d => drawNonRightTriangle(d.a,d.va)
  },

  cube: {
    name: "Krychle",
    dims: ["a"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["povrch = 6 · a²", 6*d.a*d.a],
      objem: d => ["objem = a³", d.a**3]
    },
    draw: d => drawCube(d.a)
  },

  cuboid: {
    name: "Kvádr",
    dims: ["a","b","c"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["povrch = 2 · (a·b + a·c + b·c)", 2*(d.a*d.b + d.a*d.c + d.b*d.c)],
      objem: d => ["objem = a · b · c", d.a*d.b*d.c]
    },
    draw: d => drawCuboid(d.a,d.b,d.c)
  }
};

let values = {};

// ================= INIT =================
for(const c of CONCEPTS) conceptSelect.add(new Option(c.label,c.key));
for(const k in SHAPES) shapeSelect.add(new Option(SHAPES[k].name,k));

shapeSelect.value = "square";
syncConcepts();
buildInputs();
render();

// ================= UI LOGIC =================
shapeSelect.onchange = () => { syncConcepts(); buildInputs(); render(); };
conceptSelect.onchange = render;

function syncConcepts(){
  const shape = SHAPES[shapeSelect.value];
  const allowed = shape.allowed;
  const current = conceptSelect.value;

  conceptSelect.innerHTML = "";
  for(const c of CONCEPTS){
    if(allowed.includes(c.key)) conceptSelect.add(new Option(c.label,c.key));
  }
  conceptSelect.value = allowed.includes(current) ? current : allowed[0];
}

function buildInputs(){
  inputsDiv.innerHTML = "";
  values = {};
  const shape = SHAPES[shapeSelect.value];

  shape.dims.forEach(dim=>{
    const div = document.createElement("div");
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

    div.appendChild(label);
    div.appendChild(input);
    inputsDiv.appendChild(div);
  });
}

function defaultValue(dim){
  if(dim === "r") return 5;
  if(dim === "va") return 6;
  if(dim === "b") return 7;
  if(dim === "c") return 8;
  return 5;
}

// ================= RENDER =================
function render(){
  const shape = SHAPES[shapeSelect.value];
  const concept = conceptSelect.value;
  const f = shape.formula[concept];

  if(f){
    const [txt,val] = f(values);
    formulaSpan.textContent = txt;
    resultSpan.textContent = isFinite(val) ? val.toFixed(2) : "—";
  } else {
    formulaSpan.textContent = "—";
    resultSpan.textContent = "—";
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // border
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);

  // make canvas text bigger
  ctx.fillStyle = "black";
  ctx.font = "22px Arial";

  shape.draw(values);
}

// ================= DRAW HELPERS =================
function center(){ return {x: canvas.width/2, y: canvas.height/2}; }
function clamp(n,a,b){ return Math.max(a, Math.min(b, n)); }

// dimension lines (centered text, no manual -20 offsets)
function dimH(x1,y,x2,text){
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();

  const cap = 8;
  ctx.beginPath();
  ctx.moveTo(x1,y-cap); ctx.lineTo(x1,y+cap);
  ctx.moveTo(x2,y-cap); ctx.lineTo(x2,y+cap);
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, (x1+x2)/2, y-10);
  ctx.restore();
}

function dimV(x,y1,y2,text){
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke();

  const cap = 8;
  ctx.beginPath();
  ctx.moveTo(x-cap,y1); ctx.lineTo(x+cap,y1);
  ctx.moveTo(x-cap,y2); ctx.lineTo(x+cap,y2);
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x+14, (y1+y2)/2);
  ctx.restore();
}

// scale helper for 2D shapes to “shapeshift” with values
function scale2D(wUnits, hUnits){
  const margin = 140;
  const maxW = canvas.width - margin*2;
  const maxH = canvas.height - margin*2;
  const k = Math.min(maxW / wUnits, maxH / hUnits);
  return clamp(k, 2, 40);
}

// ================= SHAPES (scaled) =================
function drawSquare(a){
  const k = scale2D(a, a);
  const s = a*k;
  const {x,y} = center();

  const left = x - s/2;
  const top  = y - s/2;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(left, top, s, s);

  dimV(left - 80, top, top + s, `a = ${a}`);
  dimH(left, top + s + 55, left + s, `a = ${a}`);
}

function drawRectangle(a,b){
  const k = scale2D(a, b);
  const w = a*k;
  const h = b*k;
  const {x,y} = center();

  const left = x - w/2;
  const top  = y - h/2;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(left, top, w, h);

  dimV(left - 80, top, top + h, `b = ${b}`);
  dimH(left, top + h + 55, left + w, `a = ${a}`);
}

function drawCircle(r){
  const k = scale2D(r*2, r*2);
  const rad = r*k;
  const {x,y} = center();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x,y,rad,0,Math.PI*2);
  ctx.stroke();

  // radius line + label bigger
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+rad,y);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`r = ${r}`, x+rad+20, y);
}

function drawRightTriangle(a,b){
  const k = scale2D(a, b);
  const w = a*k;
  const h = b*k;
  const {x,y} = center();

  const x0 = x - w/2;
  const y0 = y + h/2;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + w, y0);
  ctx.lineTo(x0, y0 - h);
  ctx.closePath();
  ctx.stroke();

  dimV(x0 - 80, y0 - h, y0, `b = ${b}`);
  dimH(x0, y0 + 55, x0 + w, `a = ${a}`);
}

function drawNonRightTriangle(a, va){
  const k = scale2D(a, va);
  const base = a*k;
  const h = va*k;
  const {x,y} = center();

  const x1 = x - base/2, y1 = y + h/2;
  const x2 = x + base/2, y2 = y + h/2;
  const x3 = x - base/6, y3 = y - h/2;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y3);
  ctx.closePath();
  ctx.stroke();

  dimH(x1, y1 + 55, x2, `a = ${a}`);

  // height line
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x3,y3);
  ctx.lineTo(x3,y1);
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`vₐ = ${va}`, x3 + 14, (y3+y1)/2);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
}

// 3D kept simple but visible
function drawCube(a){
  const s = clamp(140 + a*3, 160, 290);
  const {x,y} = center();

  const frontX = x - s/2;
  const frontY = y - s/2 + 20;
  const dx = s*0.35;
  const dy = s*0.25;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  ctx.strokeRect(frontX, frontY, s, s);

  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + s, frontY);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frontX + s, frontY);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy + s);
  ctx.lineTo(frontX + s, frontY + s);
  ctx.closePath();
  ctx.stroke();

  dimV(frontX - 80, frontY, frontY + s, `a = ${a}`);
  dimH(frontX, frontY + s + 55, frontX + s, `a = ${a}`);
}

function drawCuboid(a,b,c){
  const w = clamp(220 + a*2, 240, 540);
  const h = clamp(170 + b*2, 190, 360);
  const depth = clamp(90 + c*1.5, 100, 220);

  const {x,y} = center();
  const frontX = x - w/2;
  const frontY = y - h/2 + 20;

  const dx = depth*0.6;
  const dy = depth*0.4;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  ctx.strokeRect(frontX, frontY, w, h);

  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + w, frontY);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frontX + w, frontY);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy + h);
  ctx.lineTo(frontX + w, frontY + h);
  ctx.closePath();
  ctx.stroke();

  dimV(frontX - 80, frontY, frontY + h, `b = ${b}`);
  dimH(frontX, frontY + h + 55, frontX + w, `a = ${a}`);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`c = ${c}`, frontX + w + dx + 18, frontY - dy + 20);
}
