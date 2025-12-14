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
    dims: ["a","va"],
    allowed: ["obsah"],
    formula: {
      obsah: d => ["obsah = (a · vₐ) / 2", (d.a*d.va)/2]
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
for(const c of CONCEPTS){
  conceptSelect.add(new Option(c.label,c.key));
}
for(const k in SHAPES){
  shapeSelect.add(new Option(SHAPES[k].name,k));
}

shapeSelect.value = "square";
syncConcepts();
buildInputs();
render();

// ================= UI LOGIC =================
shapeSelect.onchange = () => {
  syncConcepts();
  buildInputs();
  render();
};

conceptSelect.onchange = render;

function syncConcepts(){
  const shape = SHAPES[shapeSelect.value];
  const allowed = shape.allowed;
  const current = conceptSelect.value;

  conceptSelect.innerHTML = "";
  for(const c of CONCEPTS){
    if(allowed.includes(c.key)){
      conceptSelect.add(new Option(c.label,c.key));
    }
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
    label.textContent = dim + ": ";
    const input = document.createElement("input");
    input.type = "number";
    input.value = 5;

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

// ================= RENDER =================
function render(){
  const shape = SHAPES[shapeSelect.value];
  const concept = conceptSelect.value;
  const f = shape.formula[concept];

  if(f){
    const [txt,val] = f(values);
    formulaSpan.textContent = txt;
    resultSpan.textContent = val.toFixed(2);
  } else {
    formulaSpan.textContent = "—";
    resultSpan.textContent = "—";
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);
  shape.draw(values);
}

// ================= DRAW HELPERS =================
function center(){ return {x: canvas.width/2, y: canvas.height/2}; }

function drawSquare(a){
  const s = 150;
  const {x,y} = center();
  ctx.strokeRect(x-s/2,y-s/2,s,s);
  dimV(x-s/2-60,y-s/2,y+s/2,`a = ${a}`);
  dimH(x-s/2,y+s/2+40,x+s/2,`a = ${a}`);
}

function drawRectangle(a,b){
  const w = 220, h = 140;
  const {x,y} = center();
  ctx.strokeRect(x-w/2,y-h/2,w,h);
  dimV(x-w/2-60,y-h/2,y+h/2,`b = ${b}`);
  dimH(x-w/2,y+h/2+40,x+w/2,`a = ${a}`);
}

function drawCircle(r){
  const {x,y} = center();
  ctx.beginPath();
  ctx.arc(x,y,80,0,Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+80,y);
  ctx.stroke();
  ctx.fillText(`r = ${r}`,x+90,y+5);
}

function drawRightTriangle(a,b){
  const {x,y} = center();
  ctx.beginPath();
  ctx.moveTo(x-100,y+80);
  ctx.lineTo(x+100,y+80);
  ctx.lineTo(x-100,y-80);
  ctx.closePath();
  ctx.stroke();
  dimH(x-100,y+120,x+100,`a = ${a}`);
  dimV(x-160,y-80,y+80,`b = ${b}`);
}

function drawNonRightTriangle(a,va){
  const {x,y} = center();
  ctx.beginPath();
  ctx.moveTo(x-120,y+80);
  ctx.lineTo(x+120,y+80);
  ctx.lineTo(x-40,y-80);
  ctx.closePath();
  ctx.stroke();
  dimH(x-120,y+120,x+120,`a = ${a}`);
  ctx.beginPath();
  ctx.moveTo(x-40,y-80);
  ctx.lineTo(x-40,y+80);
  ctx.stroke();
  ctx.fillText(`vₐ = ${va}`,x-30,y);
}

function drawCube(a){
  const {x,y} = center();
  ctx.strokeRect(x-80,y-40,120,120);
  ctx.strokeRect(x-40,y-80,120,120);
  ctx.beginPath();
  ctx.moveTo(x-80,y-40); ctx.lineTo(x-40,y-80);
  ctx.moveTo(x+40,y-40); ctx.lineTo(x+80,y-80);
  ctx.moveTo(x+40,y+80); ctx.lineTo(x+80,y+40);
  ctx.stroke();
  dimH(x-80,y+120,x+40,`a = ${a}`);
}

function drawCuboid(a,b,c){
  const {x,y} = center();
  ctx.strokeRect(x-120,y-40,200,120);
  ctx.strokeRect(x-80,y-80,200,120);
  ctx.beginPath();
  ctx.moveTo(x-120,y-40); ctx.lineTo(x-80,y-80);
  ctx.moveTo(x+80,y-40); ctx.lineTo(x+120,y-80);
  ctx.moveTo(x+80,y+80); ctx.lineTo(x+120,y+40);
  ctx.stroke();
  dimH(x-120,y+120,x+80,`a = ${a}`);
  dimV(x-180,y-40,y+80,`b = ${b}`);
  ctx.fillText(`c = ${c}`,x+140,y-60);
}

// ================= DIMENSION LINES =================
function dimH(x1,y,x2,text){
  ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1,y-6); ctx.lineTo(x1,y+6);
  ctx.moveTo(x2,y-6); ctx.lineTo(x2,y+6); ctx.stroke();
  ctx.fillText(text,(x1+x2)/2-20,y-10);
}

function dimV(x,y1,y2,text){
  ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-6,y1); ctx.lineTo(x+6,y1);
  ctx.moveTo(x-6,y2); ctx.lineTo(x+6,y2); ctx.stroke();
  ctx.fillText(text,x+10,(y1+y2)/2);
}
