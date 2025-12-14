import { SHAPES, MEANINGS, DEFAULTS, unitForPow } from "./formulas.js";
import { fmtNumber } from "./utils.js";
import { draw2D } from "./draw2d.js";
import { createCubeController, draw3D } from "./draw3d.js";

const conceptSelect = document.getElementById("conceptSelect");
const shapeSelect = document.getElementById("shapeSelect");
const inputsWrap = document.getElementById("inputs");

const formulaText = document.getElementById("formulaText");
const resultText = document.getElementById("resultText");
const meaningText = document.getElementById("meaningText");
const unitHint = document.getElementById("unitHint");

const canvas2d = document.getElementById("canvas2d");
const canvas3d = document.getElementById("canvas3d");

const canvas2dHint = document.getElementById("canvas2dHint");
const canvas3dHint = document.getElementById("canvas3dHint");

const btnExplorer = document.getElementById("btnExplorer");
const btnCalculator = document.getElementById("btnCalculator");

let mode = "calculator"; // explorer or calculator
let currentDims = {};

const cubeController = createCubeController(canvas3d);

// --- init selects ---
const CONCEPTS = [
  { key:"obvod", label:"Obvod" },
  { key:"obsah", label:"Obsah" },
  { key:"povrch", label:"Povrch" },
  { key:"objem", label:"Objem" }
];

function setMode(newMode){
  mode = newMode;
  btnExplorer.classList.toggle("active", mode === "explorer");
  btnCalculator.classList.toggle("active", mode === "calculator");
  // In explorer mode: results are still shown, but input can be minimal.
  render();
}

btnExplorer.addEventListener("click", () => setMode("explorer"));
btnCalculator.addEventListener("click", () => setMode("calculator"));

function populateConcepts(){
  conceptSelect.innerHTML = "";
  for (const c of CONCEPTS){
    const opt = document.createElement("option");
    opt.value = c.key;
    opt.textContent = c.label;
    conceptSelect.appendChild(opt);
  }
  conceptSelect.value = "obsah";
}

function populateShapes(){
  shapeSelect.innerHTML = "";
  for (const [key, def] of Object.entries(SHAPES)){
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = def.label;
    shapeSelect.appendChild(opt);
  }
  shapeSelect.value = "rightTriangle";
}

function getSelected(){
  const concept = conceptSelect.value;
  const shapeKey = shapeSelect.value;
  const shapeDef = SHAPES[shapeKey];
  return { concept, shapeKey, shapeDef };
}

function allowedConceptsForShape(shapeDef){
  return shapeDef.concepts;
}

function syncConceptToShape(){
  const { concept, shapeDef } = getSelected();
  const allowed = allowedConceptsForShape(shapeDef);
  if (!allowed.includes(concept)){
    conceptSelect.value = allowed[0];
  }
}

function buildInputs(shapeDef){
  inputsWrap.innerHTML = "";
  currentDims = {};

  const dims = shapeDef.dims;
  for (const d of dims){
    const wrap = document.createElement("label");
    wrap.className = "inputWrap";
    wrap.innerHTML = `
      ${d.label} <span class="hint">(${d.hint})</span>
      <input type="number" step="0.1" min="0" id="in_${d.key}" />
    `;
    inputsWrap.appendChild(wrap);

    const input = wrap.querySelector("input");
    const defVal = DEFAULTS[d.key] ?? 5;
    input.value = String(defVal);
    currentDims[d.key] = Number(input.value);

    input.addEventListener("input", () => {
      currentDims[d.key] = Number(input.value);
      render();
    });
  }
}

function computeValue(shapeDef, concept){
  const f = shapeDef.formulas?.[concept];
  if (!f) return { value: NaN, formula: "—", unitPow: 0 };
  try{
    const value = f.compute(currentDims);
    return { value, formula: f.text, unitPow: f.unitPow ?? 0 };
  } catch {
    return { value: NaN, formula: f.text ?? "—", unitPow: f.unitPow ?? 0 };
  }
}

function render(){
  const { concept, shapeKey, shapeDef } = getSelected();
  const allowed = allowedConceptsForShape(shapeDef);

  // hint pills
  canvas2dHint.textContent = shapeDef.type === "2d" ? `${shapeDef.label} / ${concept}` : "Zvol tvar 2D";
  canvas3dHint.textContent = (shapeKey === "cube") ? `Krychle / ${concept}` : "Zvol krychli pro 3D";

  // meaning
  meaningText.textContent = MEANINGS[concept] ?? "";

  // formula + result
  const { value, formula, unitPow } = computeValue(shapeDef, concept);
  formulaText.textContent = formula;
  resultText.textContent = fmtNumber(value);
  unitHint.textContent = unitForPow(unitPow);

  // draw 2D
  if (shapeDef.type === "2d"){
    draw2D(canvas2d, concept, shapeKey, currentDims);
  } else {
    // draw a friendly placeholder by drawing square in 2D if cube selected? We keep it blank-ish.
    draw2D(canvas2d, "obsah", "square", { a: 6 });
  }

  // draw 3D (only cube makes sense)
  if (shapeKey === "cube"){
    draw3D(canvas3d, concept, currentDims, cubeController);
  } else {
    draw3D(canvas3d, concept, { a: 6 }, cubeController);
  }
}

// re-render continuously so cube rotation feels smooth while dragging
function tick(){
  render();
  requestAnimationFrame(tick);
}

// events
conceptSelect.addEventListener("change", () => {
  const { shapeDef } = getSelected();
  const allowed = allowedConceptsForShape(shapeDef);
  if (!allowed.includes(conceptSelect.value)){
    conceptSelect.value = allowed[0];
  }
  render();
});

shapeSelect.addEventListener("change", () => {
  syncConceptToShape();
  const { shapeDef } = getSelected();
  buildInputs(shapeDef);
  render();
});

// init
populateConcepts();
populateShapes();
syncConceptToShape();
buildInputs(SHAPES[shapeSelect.value]);

// start
tick();

