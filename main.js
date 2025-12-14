// ---------- TAB SWITCH ----------
function showTab(id) {
  document.getElementById("calc").classList.add("hidden");
  document.getElementById("help").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

// ---------- DATA ----------
const concepts = ["obvod","obsah","povrch","objem"];

const meanings = {
  obvod: "Obvod je délka čáry kolem útvaru.",
  obsah: "Obsah je plocha uvnitř útvaru.",
  povrch: "Povrch je plocha všech stěn tělesa.",
  objem: "Objem je prostor uvnitř tělesa."
};

const shapes = {
  square: {
    name: "Čtverec",
    dims: ["a"],
    formulas: {
      obvod: d => ["o = 4a", 4*d.a],
      obsah: d => ["S = a²", d.a*d.a]
    }
  },
  circle: {
    name: "Kruh",
    dims: ["r"],
    formulas: {
      obvod: d => ["o = 2πr", 2*Math.PI*d.r],
      obsah: d => ["S = πr²", Math.PI*d.r*d.r]
    }
  },
  cube: {
    name: "Krychle",
    dims: ["a"],
    formulas: {
      povrch: d => ["S = 6a²", 6*d.a*d.a],
      objem: d => ["V = a³", d.a**3]
    }
  }
};

// ---------- KALKULAČKA ----------
const calcConcept = document.getElementById("calcConcept");
const calcShape = document.getElementById("calcShape");
const calcInputs = document.getElementById("calcInputs");
const calcFormula = document.getElementById("calcFormula");
const calcResult = document.getElementById("calcResult");
const calcCtx = document.getElementById("calcCanvas").getContext("2d");

concepts.forEach(c => calcConcept.add(new Option(c,c)));
for (let s in shapes) calcShape.add(new Option(shapes[s].name,s));

let values = {};

function updateCalcInputs(){
  calcInputs.innerHTML = "";
  values = {};
  shapes[calcShape.value].dims.forEach(d=>{
    values[d]=5;
    const i=document.createElement("input");
    i.type="number"; i.value=5;
    i.oninput=()=>{values[d]=+i.value;renderCalc();}
    calcInputs.append(d+": ",i,document.createElement("br"));
  });
}

function renderCalc(){
  calcCtx.clearRect(0,0,400,250);
  const s=shapes[calcShape.value];
  const f=s.formulas[calcConcept.value];
  if(!f){calcFormula.textContent="—";calcResult.textContent="—";return;}
  const [txt,res]=f(values);
  calcFormula.textContent=txt;
  calcResult.textContent=res.toFixed(2);
  calcCtx.strokeRect(150,70,100,100);
}

calcShape.onchange=()=>{updateCalcInputs();renderCalc();}
calcConcept.onchange=renderCalc;
updateCalcInputs(); renderCalc();

// ---------- POMŮCKY ----------
const helpConcept=document.getElementById("helpConcept");
const helpText=document.getElementById("helpText");
const helpCtx=document.getElementById("helpCanvas").getContext("2d");

concepts.forEach(c=>helpConcept.add(new Option(c,c)));

let rotX=0, rotY=0;

function rotate(x,y){
  rotX=Math.max(-15,Math.min(15,rotX+y));
  rotY=Math.max(-15,Math.min(15,rotY+x));
  drawHelp();
}

function drawHelp(){
  helpCtx.clearRect(0,0,400,250);
  helpText.textContent=meanings[helpConcept.value];
  helpCtx.strokeRect(170+rotY,90+rotX,80,80);
}

helpConcept.onchange=drawHelp;
drawHelp();
