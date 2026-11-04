const NS = "http://www.w3.org/2000/svg";
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smooth = t => t * t * (3 - 2 * t);
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function mix(c1, c2, t) {
  const a = c1.match(/\w\w/g).map(h => parseInt(h, 16));
  const b = c2.match(/\w\w/g).map(h => parseInt(h, 16));
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
// interpola numa escala de cores [c0, c1, c2...] com t em 0..1
function ramp(colors, t) {
  const s = clamp(t, 0, 1) * (colors.length - 1);
  const i = Math.min(Math.floor(s), colors.length - 2);
  return mix(colors[i], colors[i + 1], s - i);
}
// fundo do lago: y da margem para um x (aprox. da curva da bacia)
const LAKE_C = 1205, LAKE_HW = 195;
const lakeBottom = x => 645 + 135 * Math.sqrt(Math.max(0, 1 - ((x - LAKE_C) / LAKE_HW) ** 2));

const svgIcon = body => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const ICON = {
  play: svgIcon('<path d="M8 5.5v13l10.5-6.5z" class="f"/>'),
  pause: svgIcon('<rect x="6.5" y="5" width="4" height="14" rx="1" class="f"/><rect x="13.5" y="5" width="4" height="14" rx="1" class="f"/>'),
  vol: svgIcon('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="f"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svgIcon('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="f"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
};

/* ================= CENÁRIO ================= */
// raios do sol
for (let i = 0; i < 12; i++) {
  const a = i * Math.PI / 6;
  el("line", { x1: 1380 + Math.cos(a) * 62, y1: 120 + Math.sin(a) * 62, x2: 1380 + Math.cos(a) * 92, y2: 120 + Math.sin(a) * 92 }, $("rays"));
}
// nuvens
for (const [x, y, s, d] of [[150, 120, 1, 40], [620, 70, 1.25, 52], [1000, 150, .85, 34]]) {
  const g = el("g", { style: `animation-duration:${d}s` }, $("clouds"));
  for (const [dx, dy, r] of [[0, 0, 34], [36, -14, 42], [78, 0, 32], [40, 12, 30]]) {
    el("circle", { cx: x + dx * s, cy: y + dy * s, r: r * s, fill: "#ffffff" }, g);
  }
}
// pássaros
for (const [y, d, delay, s] of [[190, 34, 0, 1], [215, 34, -1.2, .8], [175, 34, -2, .7], [260, 46, -20, .9]]) {
  const g = el("g", { class: "bird", style: `animation-duration:${d}s;animation-delay:${delay}s` }, $("birds"));
  el("path", { d: `M0,${y} q${6 * s},${-7 * s} ${12 * s},0 q${6 * s},${-7 * s} ${12 * s},0`, class: "wing", style: `animation-delay:${delay * .3}s` }, g);
}
// árvores ao longe nas colinas
for (const [x, y, s] of [[520, 506, .5], [545, 510, .4], [690, 500, .45], [1110, 488, .45], [1140, 492, .38], [1250, 495, .4], [1560, 492, .5]]) {
  el("circle", { cx: x, cy: y - 10 * s * 2, r: 18 * s, fill: "#5f9e52" }, $("farTrees"));
  el("rect", { x: x - 2, y: y - 6, width: 4, height: 10, fill: "#6b4423", opacity: .7 }, $("farTrees"));
}
// rachaduras da rocha matriz
for (let i = 0; i < 9; i++) {
  const x = rand(40, 1560), y = rand(850, 885);
  el("path", { d: `M${x},${y} l${rand(10, 20)},${rand(-6, 6)} l${rand(8, 16)},${rand(4, 10)}` }, $("cracks"));
}
// pedrinhas no solo
for (let i = 0; i < 45; i++) {
  const x = rand(10, 1590), y = rand(620, 820);
  if (x > 990 && x < 1420 && y < 850) continue;
  el("ellipse", { cx: x, cy: y, rx: rand(3, 9), ry: rand(2, 5) }, $("pebbles"));
}
// tufos de grama e flores
for (const x of [552, 780, 792, 885, 1460, 1512, 1590]) {
  const y = x > 1440 ? 585 : 600;
  el("path", { d: `M${x},${y} l-4,-9 M${x},${y} l0,-11 M${x},${y} l4,-9` }, $("tufts"));
}
for (const [x, c] of [[778, "#ff6b9a"], [796, "#ffd166"], [846, "#fff"], [884, "#ff6b9a"], [1508, "#ffd166"]]) {
  const y = x > 1440 ? 584 : 599;
  el("line", { x1: x, y1: y, x2: x, y2: y - 9, stroke: "#4c9a3a", "stroke-width": 1.5 }, $("flowers"));
  el("circle", { cx: x, cy: y - 10, r: 3, fill: c }, $("flowers"));
}
// lavoura e cerca
const CROP_X = Array.from({ length: 10 }, (_, i) => 574 + i * 20);
const cropsInner = el("g", {}, $("crops"));
el("rect", { x: 560, y: 597, width: 208, height: 6, rx: 3, fill: "#6b4a2b" }, $("crops"));
CROP_X.forEach((x, i) => {
  el("path", { d: `M${x},602 l-6,26 M${x},602 l5,30 M${x},602 l0,22` }, $("roots"));
  const g = el("g", { class: "leaf", style: `animation-delay:${-i * .4}s` }, cropsInner);
  el("line", { x1: x, y1: 600, x2: x, y2: 548, stroke: "#4c9a3a", "stroke-width": 3, "stroke-linecap": "round" }, g);
  el("ellipse", { cx: x - 7, cy: 580, rx: 8, ry: 3, fill: "#5fbf4a", transform: `rotate(-30 ${x - 7} 580)` }, g);
  el("ellipse", { cx: x + 7, cy: 568, rx: 8, ry: 3, fill: "#5fbf4a", transform: `rotate(30 ${x + 7} 568)` }, g);
  el("ellipse", { cx: x, cy: 544, rx: 4, ry: 9, fill: "#f2c14e" }, g);
});
for (let x = 556; x <= 772; x += 27) el("line", { x1: x, y1: 601, x2: x, y2: 586 }, $("fence"));
el("line", { x1: 556, y1: 590, x2: 772, y2: 590, "stroke-width": 2 }, $("fence"));
el("line", { x1: 556, y1: 596, x2: 772, y2: 596, "stroke-width": 2 }, $("fence"));
// mata ciliar
function tree(parent, x, base, s = 1) {
  const g = el("g", {}, parent);
  el("rect", { x: x - 4 * s, y: base - 34 * s, width: 8 * s, height: 34 * s, rx: 3, fill: "#6b4423" }, g);
  el("circle", { cx: x, cy: base - 48 * s, r: 22 * s, fill: "#3f8f3a" }, g);
  el("circle", { cx: x - 13 * s, cy: base - 36 * s, r: 15 * s, fill: "#4fa847" }, g);
  el("circle", { cx: x + 13 * s, cy: base - 38 * s, r: 16 * s, fill: "#5bb553" }, g);
  el("path", { d: `M${x},${base} l-10,22 M${x},${base} l9,26 M${x},${base} l2,18` }, $("roots"));
}
tree($("riparian"), 962, 602, 1);
tree($("riparian"), 990, 614, .8);
tree($("riparian"), 1010, 640, .6);
tree($("riparian"), 1408, 624, .6);
tree($("riparian"), 1426, 600, .75);
// juncos nas margens
for (const x of [1022, 1032, 1044, 1366, 1378, 1388]) {
  const g = el("g", { class: "reed", style: `animation-delay:${-rand(0, 3)}s` }, $("reeds"));
  const h = rand(26, 38);
  el("line", { x1: x, y1: 652, x2: x, y2: 652 - h, stroke: "#5f8f3a", "stroke-width": 2 }, g);
  el("rect", { x: x - 2.5, y: 652 - h, width: 5, height: 11, rx: 2.5, fill: "#7a4f2a" }, g);
}
// cidade
for (const [x, c] of [[1532, "#f4a259"], [1556, "#e76f51"], [1580, "#f6d186"]]) {
  el("rect", { x, y: 559, width: 20, height: 26, fill: c }, $("town"));
  el("path", { d: `M${x - 3},560 L${x + 10},546 L${x + 23},560 Z`, fill: "#8c3b2b" }, $("town"));
  el("rect", { x: x + 6, y: 566, width: 8, height: 7, fill: "#fff3c4" }, $("town"));
  el("rect", { x: x + 7, y: 576, width: 6, height: 9, fill: "#6b4423" }, $("town"));
}
// pluma do esgoto e espuma na superfície
for (let i = 0; i < 9; i++) {
  el("circle", {
    cx: 1398, cy: 667, r: rand(9, 14), class: "plume",
    style: `--dx:${-rand(70, 150).toFixed(0)}px;--dy:${rand(5, 45).toFixed(0)}px;animation-delay:${(-i * .9).toFixed(1)}s`,
  }, $("plume"));
}
for (let i = 0; i < 7; i++) {
  el("ellipse", { cx: 1330 + i * 10 + rand(-3, 3), cy: 647, rx: rand(3, 6), ry: 2, class: "foam", style: `animation-delay:${-rand(0, 3).toFixed(1)}s` }, $("foam"));
}
// fumaça da fábrica
for (let i = 0; i < 4; i++) el("circle", { cx: 532, cy: 480, r: 9, style: `animation-delay:${i * .8}s` }, $("smoke"));
// chuva
const RAIN = Array.from({ length: 120 }, () => {
  const l = el("line", {}, $("rain"));
  const x = rand(0, 1640), y = rand(-980, -20);
  l.setAttribute("x1", x); l.setAttribute("y1", y); l.setAttribute("x2", x - 4); l.setAttribute("y2", y + 16);
  l.style.animationDuration = rand(.7, 1.1) + "s";
  l.style.animationDelay = -rand(0, 1.1) + "s";
  return l;
});
// algas na superfície
const ALGAE = Array.from({ length: 90 }, (_, i) => {
  const c = el("circle", { cx: rand(1025, 1388), cy: rand(645, 658), r: rand(3, 8), fill: i % 3 ? "#5ea83a" : "#3f7f2a", class: "hide", style: `animation-delay:${-rand(0, 3)}s` }, $("algae"));
  return { c, order: Math.random() };
}).sort((a, b) => a.order - b.order);
// plantas submersas
const SEAWEED = [];
for (let x = 1085; x <= 1325; x += 22) {
  const y = lakeBottom(x) + 2, h = rand(32, 55);
  const p = el("path", { d: `M${x},${y} q-9,${-h / 4} 0,${-h / 2} q9,${-h / 4} 0,${-h / 2}`, class: "weed", style: `animation-delay:${-rand(0, 4)}s` }, $("seaweed"));
  SEAWEED.push(p);
}
// bolhas de gás (decomposição sem oxigênio)
for (let i = 0; i < 12; i++) {
  const x = rand(1090, 1320);
  el("circle", { cx: x, cy: lakeBottom(x) - 4, r: rand(2, 4), class: "bubble", style: `animation-delay:${-rand(0, 4)}s;animation-duration:${rand(3, 5)}s` }, $("bubbles"));
}
// ondulações na superfície
for (const [x, d] of [[1110, 0], [1230, -1.5], [1330, -3]]) {
  el("ellipse", { cx: x, cy: 650, rx: 18, ry: 3, class: "ripple", style: `animation-delay:${d}s` }, $("ripples"));
}
// peixes
const FISH_COLORS = ["#ff9f43", "#ffd166", "#ff7b7b", "#6fd3ff", "#ffb347", "#f4845f", "#ffe08a", "#7bdff2"];
const FISH = FISH_COLORS.map((col, i) => {
  const g = el("g", {}, $("fish"));
  const body = el("g", {}, g);
  el("path", { d: "M-14,0 C-8,-9 8,-9 15,0 C8,9 -8,9 -14,0 Z M-13,0 L-23,-8 L-21,0 L-23,8 Z", fill: col }, body);
  el("circle", { cx: 8, cy: -2, r: 1.8, fill: "#1b1b1b" }, body);
  return {
    g, body, col, cx: rand(1160, 1250), y: rand(685, 735), amp: rand(30, 60),
    w: rand(.25, .5), ph: rand(0, 6.28), tol: 2 + i * .45, alive: true, deadT: 0, fy: 0, rot: 0, op: 1,
  };
});
// patos
const DUCKS = [0, 2.6].map(ph => {
  const g = el("g", {}, $("ducks"));
  const b = el("g", {}, g);
  drawDuck(b);
  return { g, b, ph };
});

/* ================= ÍCONES (vetoriais, virados para a direita, base em y = 0) ================= */
const INK = "#2b2b2b";
function drawCow(g) {
  el("path", { d: "M-25,-29 C-31,-23 -30,-13 -28,-8", stroke: INK, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, g);
  el("circle", { cx: -28, cy: -7, r: 2.6, fill: INK }, g);
  for (const [x, back] of [[-20, 0], [-13, 1], [6, 0], [13, 1]]) {
    el("rect", { x, y: -15, width: 5, height: 15, rx: 2, fill: back ? "#e4e4e4" : "#fff", stroke: INK, "stroke-width": 1.2 }, g);
    el("rect", { x, y: -3, width: 5, height: 3, fill: INK }, g);
  }
  el("ellipse", { cx: -5, cy: -13, rx: 5, ry: 3.5, fill: "#f6a5b6", stroke: INK, "stroke-width": 1 }, g);
  el("rect", { x: -26, y: -35, width: 46, height: 23, rx: 11, fill: "#fff", stroke: INK, "stroke-width": 1.6 }, g);
  el("path", { d: "M-19,-34 C-10,-35 -6,-28 -11,-23 C-16,-19 -23,-25 -19,-34 Z", fill: INK }, g);
  el("ellipse", { cx: 6, cy: -27, rx: 6, ry: 4.5, fill: INK }, g);
  el("ellipse", { cx: -2, cy: -17, rx: 3.5, ry: 2.2, fill: INK }, g);
  const head = el("g", { class: "graze-head" }, g);
  el("path", { d: "M17,-29 q2,-6 6,-5", stroke: "#d9c28d", "stroke-width": 2.6, fill: "none", "stroke-linecap": "round" }, head);
  el("ellipse", { cx: 14, cy: -32, rx: 4.5, ry: 2.2, fill: "#fff", stroke: INK, "stroke-width": 1.2, transform: "rotate(-25 14 -32)" }, head);
  el("ellipse", { cx: 24, cy: -28, rx: 8, ry: 9, fill: "#fff", stroke: INK, "stroke-width": 1.6 }, head);
  el("ellipse", { cx: 22, cy: -33, rx: 3.6, ry: 3.4, fill: INK }, head);
  el("circle", { cx: 26, cy: -30, r: 1.6, fill: INK }, head);
  el("ellipse", { cx: 28, cy: -21, rx: 6.5, ry: 4.6, fill: "#f6a5b6", stroke: INK, "stroke-width": 1.2 }, head);
  el("circle", { cx: 26, cy: -21, r: .9, fill: INK }, head);
  el("circle", { cx: 30.5, cy: -21, r: .9, fill: INK }, head);
}
function drawSheep(g) {
  for (const x of [-10, -5, 4, 9]) el("rect", { x, y: -11, width: 3.2, height: 11, rx: 1.5, fill: "#3a3a3a" }, g);
  for (const [x, y, r] of [[-10, -15, 7], [-3, -19, 8], [5, -18, 8], [10, -13, 6], [-6, -11, 6], [3, -11, 6.5]]) {
    el("circle", { cx: x, cy: y, r, fill: "#f6f3ec", stroke: "#d7d0c2", "stroke-width": 1 }, g);
  }
  const head = el("g", { class: "graze-head" }, g);
  el("ellipse", { cx: 12, cy: -20, rx: 3.5, ry: 1.6, fill: "#3a3a3a", transform: "rotate(-30 12 -20)" }, head);
  el("ellipse", { cx: 16, cy: -16, rx: 5, ry: 6.5, fill: "#3a3a3a" }, head);
  el("circle", { cx: 14.5, cy: -21, r: 3.2, fill: "#f6f3ec" }, head);
  el("circle", { cx: 17.5, cy: -17, r: 1, fill: "#fff" }, head);
}
function drawDuck(g) {
  el("ellipse", { cx: 0, cy: 1, rx: 15, ry: 2.5, fill: "none", stroke: "#fff", "stroke-width": 1, opacity: .6 }, g);
  el("path", { d: "M-11,-5 L-17,-10 L-12,-1 Z", fill: "#3b3b3b" }, g);
  el("ellipse", { cx: 0, cy: -4, rx: 12, ry: 6, fill: "#b9aa9b" }, g);
  el("ellipse", { cx: -2, cy: -5.5, rx: 7, ry: 3.4, fill: "#8a7565" }, g);
  el("rect", { x: -5, y: -6.5, width: 4, height: 2, fill: "#3f51b5" }, g);
  el("circle", { cx: 8, cy: -6, r: 5, fill: "#7b4a2e" }, g);
  el("path", { d: "M7,-10 L9,-14", stroke: "#fff", "stroke-width": 2 }, g);
  el("circle", { cx: 11, cy: -14, r: 5, fill: "#2e7d32" }, g);
  el("path", { d: "M15,-15 l6,1.6 l-6,1.8 Z", fill: "#f6c445" }, g);
  el("circle", { cx: 12.5, cy: -15.5, r: 1, fill: "#111" }, g);
}
function wheel(g, x, y, r, rim) {
  const w = el("g", { class: "wheel" }, g);
  el("circle", { cx: x, cy: y, r, fill: "#222" }, w);
  el("circle", { cx: x, cy: y, r: r * .5, fill: rim }, w);
  el("line", { x1: x - r * .5, y1: y, x2: x + r * .5, y2: y, stroke: "#222", "stroke-width": 1 }, w);
  return w;
}
function drawTruck(g) {
  el("rect", { x: -25, y: -10, width: 50, height: 3, fill: "#333" }, g);
  el("rect", { x: -25, y: -25, width: 32, height: 15, rx: 2, fill: "#2a9d8f", stroke: "#1d6f65", "stroke-width": 1.2 }, g);
  for (const x of [-17, -9, -1]) el("line", { x1: x, y1: -24, x2: x, y2: -11, stroke: "#1d6f65", "stroke-width": 1 }, g);
  const load = el("path", { d: "M-24,-25 Q-9,-36 6,-25 Z", fill: "#f2c14e", stroke: "#c99a2e", "stroke-width": 1 }, g);
  el("path", { d: "M9,-10 L9,-25 L18,-25 L25,-16 L25,-10 Z", fill: "#e63946", stroke: "#a4161a", "stroke-width": 1.2 }, g);
  el("path", { d: "M11,-23 L17,-23 L22,-17 L11,-17 Z", fill: "#cdeffd" }, g);
  el("rect", { x: 23, y: -14, width: 2.5, height: 2.5, fill: "#ffd166" }, g);
  wheel(g, -15, -5, 5, "#bbb");
  wheel(g, 15, -5, 5, "#bbb");
  return load;
}
function drawTractor(g) {
  el("rect", { x: -27, y: -16, width: 10, height: 9, rx: 1.5, fill: "#ff7b39", stroke: "#c4541c", "stroke-width": 1 }, g);
  el("line", { x1: -17, y1: -9, x2: -12, y2: -9, stroke: "#333", "stroke-width": 2 }, g);
  const spray = el("g", { fill: "#ff9a5c" }, g);
  for (let i = 0; i < 4; i++) el("circle", { class: "spray", cx: -22 + (i % 2) * 4, cy: -6, r: 1.4, style: `animation-delay:${-i * .2}s` }, spray);
  el("rect", { x: 12, y: -25, width: 2.6, height: 10, fill: "#555" }, g);
  el("path", { d: "M-2,-17 L19,-17 L22,-9 L-2,-9 Z", fill: "#2d9b45", stroke: "#1f6d31", "stroke-width": 1.2 }, g);
  el("rect", { x: -14, y: -30, width: 13, height: 18, fill: "#cdeffd", opacity: .55 }, g);
  el("path", { d: "M-14,-12 L-14,-30 L-1,-30 L-1,-12", stroke: "#1f6d31", "stroke-width": 2.4, fill: "none" }, g);
  el("rect", { x: -16, y: -33, width: 17, height: 3.5, rx: 1, fill: "#1f6d31" }, g);
  el("rect", { x: -14, y: -14, width: 16, height: 6, fill: "#2d9b45" }, g);
  wheel(g, -8, -10, 10, "#f2c14e");
  wheel(g, 15, -5, 5, "#f2c14e");
}
function drawMushroom(parent, x, y, s, cap) {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el("path", { d: "M-3,0 L-2.5,-9 L2.5,-9 L3,0 Z", fill: "#f5ebdc", stroke: "#cbb79a", "stroke-width": .8 }, g);
  el("path", { d: "M-9,-8 Q0,-22 9,-8 Z", fill: cap, stroke: "#7a1f1f", "stroke-width": .8 }, g);
  if (cap === "#e63946") for (const [cx, cy, r] of [[-4, -11, 1.6], [2, -14, 1.4], [5, -10, 1.2]]) el("circle", { cx, cy, r, fill: "#fff" }, g);
}
drawCow($("cow"));
drawSheep($("sheep"));
const truckLoad = drawTruck($("truckBody"));
drawTractor($("tractorBody"));
drawMushroom($("mushrooms"), 908, 588, 1.1, "#e63946");
drawMushroom($("mushrooms"), 928, 588, .8, "#e63946");
drawMushroom($("mushrooms"), 944, 600, .7, "#b5835a");
drawMushroom($("mushrooms"), 890, 601, .6, "#b5835a");

/* ================= RESERVATÓRIOS E FLUXOS ================= */
// badge: [x, y, direção da seta: 1 = aponta para baixo, -1 = para cima, 0 = sem seta]
const RES = {
  rocha:     { name: "Rocha fosfática", c: [200, 578], r: [0, 0],  init: 85, badge: [190, 515, 1] },
  fabrica:   { name: "Fábrica",        c: [505, 588], r: [14, 6],   init: 0 },
  solo:      { name: "Solo",           c: [630, 705], r: [160, 30], init: 18, badge: [630, 770, 0] },
  planta:    { name: "Plantas",        c: [664, 572], r: [86, 14],  init: 10, badge: [664, 510, 1] },
  animal:    { name: "Animais",        c: [838, 586], r: [32, 7],   init: 4,  badge: [838, 528, 1] },
  decomp:    { name: "Decompositores", c: [922, 594], r: [22, 5],   init: 4,  badge: [922, 640, -1] },
  cidade:    { name: "Cidade",         c: [1560, 579], r: [24, 4],  init: 2,  badge: [1556, 522, 1] },
  lago:      { name: "Lago",           c: [1205, 700], r: [140, 34], init: 5, badge: [1078, 620, 1] },
  sedimento: { name: "Sedimentos",     c: [1205, 792], r: [100, 5], init: 12, badge: [1205, 840, -1] },
};
const ROAD = "C820,580 870,562 960,552 C1060,542 1160,535 1300,545 C1440,555 1460,575 1520,585";
const ROAD_BACK = "C1460,575 1440,555 1300,545 C1160,535 1060,542 960,552 C870,562 820,580 770,600";
// [origem, destino, caminho, ação humana?]
const FLOW_DEFS = [
  ["rocha", "solo", "M200,578 C300,612 360,690 470,700 C520,705 580,708 630,705"],
  ["rocha", "fabrica", "M200,578 C280,600 340,628 380,640 L424,644 L484,582 C490,584 498,587 505,588", 1],
  ["fabrica", "solo", "M505,588 C535,598 560,600 600,600 C625,640 630,680 630,705", 1],
  ["solo", "planta", "M630,705 C640,650 655,610 664,572"],
  ["planta", "animal", "M664,572 C730,530 795,550 838,586"],
  ["planta", "decomp", "M664,572 C750,640 860,640 922,594"],
  ["planta", "cidade", `M664,572 C710,590 745,602 770,600 ${ROAD} C1530,583 1545,580 1560,579`, 1],
  ["animal", "decomp", "M838,586 C862,615 895,615 922,594"],
  ["decomp", "solo", "M922,594 C890,670 770,715 630,705"],
  ["solo", "lago", "M630,705 C780,730 960,700 1050,690 C1120,688 1160,698 1205,700"],
  ["cidade", "lago", "M1560,579 C1575,582 1590,584 1590,592 L1590,606 L1475,606 C1450,622 1430,648 1404,663 C1330,690 1260,700 1205,700", 1],
  ["cidade", "solo", `M1560,579 C1545,580 1530,583 1520,585 ${ROAD_BACK} C720,640 670,690 630,705`, 1],
  ["lago", "sedimento", "M1205,700 C1220,740 1195,770 1205,792"],
  ["sedimento", "rocha", "M1205,792 C1100,885 380,885 200,578"],
];
const FLOWS = {};
for (const [a, b, d, human] of FLOW_DEFS) {
  const p = el("path", { d, class: "flow " + (human ? "hum" : "nat"), opacity: .12 }, $("flows"));
  const len = p.getTotalLength();
  FLOWS[a + ">" + b] = { el: p, len, p0: p.getPointAtLength(0), p1: p.getPointAtLength(len), flux: 0 };
}
// rótulos com setinha apontando para o reservatório
for (const k in RES) {
  const r = RES[k];
  if (!r.badge) continue;
  const [x, y, dir] = r.badge;
  const g = el("g", { class: "badge", filter: "url(#shadow)" }, $("badges"));
  const w = 30 + r.name.length * 6.6;
  if (dir) el("path", { d: `M${x - 6},${y + dir * 11} L${x},${y + dir * 18} L${x + 6},${y + dir * 11} Z`, class: "tip" }, g);
  el("rect", { x: x - w / 2, y: y - 12, width: w, height: 24, rx: 12 }, g);
  const t = el("text", { x, y }, g);
  t.append(r.name + " ");
  const n = el("tspan", { class: "n" }, t);
  el("title", {}, g).textContent = `Quantidade de fósforo em: ${r.name}`;
  r.badgeEl = g; r.countEl = n; r.shown = -1;
}

/* ================= ESTADO ================= */
const ctl = { fert: 20, rain: .3, mata: true, esgoto: true, speed: 1, playing: true };
let particles = [], mineAcc = 0, simTime = 0;
let lakeA = 0, O2 = 9, growth = .6, prevTrophic = 0, rockWarned = false, lastFishToast = -99;
const history = [];

const ore = $("oreLayer"), pit = $("pit");
const inside = (shape, x, y) => shape.isPointInFill(new DOMPoint(x, y));
function homeIn(res) {
  if (res === "rocha") {
    // átomos ficam na camada de fosforita, fora da parte já escavada pela cava
    for (let i = 0; i < 60; i++) {
      const x = rand(55, 478), y = rand(510, 668);
      const inOre = [[0, 0], [-7, 0], [7, 0], [0, -7], [0, 7]].every(([dx, dy]) => inside(ore, x + dx, y + dy));
      const inPit = [[0, 0], [-9, 0], [9, 0], [0, -9]].some(([dx, dy]) => inside(pit, x + dx, y + dy));
      if (inOre && !inPit) return [x, y];
    }
    return RES.rocha.c;
  }
  const { c, r } = RES[res];
  const a = rand(0, Math.PI * 2), d = Math.sqrt(Math.random());
  return [c[0] + Math.cos(a) * r[0] * d, c[1] + Math.sin(a) * r[1] * d];
}

function reset() {
  $("particles").innerHTML = "";
  particles = [];
  for (const k in RES) {
    for (let i = 0; i < RES[k].init; i++) {
      const [x, y] = homeIn(k);
      const e = el("circle", { r: 4.5, class: "p-nat", cx: x, cy: y }, $("particles"));
      particles.push({ res: k, hx: x, hy: y, x, y, ph: rand(0, 6.28), moving: null, fert: false, el: e });
    }
  }
  lakeA = 0; O2 = 9; mineAcc = 0; simTime = 0; prevTrophic = 0; rockWarned = false;
  history.length = 0;
  FISH.forEach(f => { f.alive = true; f.deadT = 0; f.op = 1; });
}

function send(p, dest) {
  const f = FLOWS[p.res + ">" + dest];
  const [hx, hy] = homeIn(dest);
  p.moving = { f, dest, k: 0, dur: f.len / 300, sx: p.x, sy: p.y, hx, hy };
  f.flux = Math.min(f.flux + .35, 1);
  if (dest === "fabrica") { p.fert = true; p.el.setAttribute("class", "p-fert"); }
  if (dest === "rocha") { p.fert = false; p.el.setAttribute("class", "p-nat"); }
}

// taxas (por segundo, por átomo) de cada saída
// multiplica todas as taxas: o sistema reage rápido o bastante para demonstrar em sala
const RATE = 2.5;
function rates(res, n) {
  const rain = ctl.rain;
  switch (res) {
    case "rocha": return [["solo", .004 * (.4 + rain)]];
    case "fabrica": return [["solo", 1.5]];
    case "solo": return [
      ["planta", .06 * Math.max(0, 1 - n.planta / 35)],
      ["lago", .004 * (.3 + 2.2 * rain) * (ctl.mata ? .3 : 1) * (1 + Math.max(0, n.solo - 25) / 20)],
    ];
    case "planta": return [["animal", .03], ["decomp", .035], ["cidade", .03]];
    case "animal": return [["decomp", .08]];
    case "decomp": return [["solo", .12]];
    case "cidade": return ctl.esgoto ? [["solo", .15], ["lago", .02]] : [["lago", .18]];
    case "lago": return [["sedimento", .012]];
    case "sedimento": return [["rocha", .008]];
  }
  return [];
}

/* ================= VEÍCULOS ================= */
const road = $("road"), roadLen = road.getTotalLength();
let truckK = 0, truckDir = 1, tractorOp = 0;
function updateVehicles(t, dt) {
  // caminhão vai cheio de grãos até a cidade e volta vazio
  truckK += truckDir * dt * ctl.speed * .045;
  if (truckK > 1 || truckK < 0) { truckDir *= -1; truckK = clamp(truckK, 0, 1); }
  const k = (.2 + ease(truckK) * .78) * roadLen; // estaciona depois do pasto, sem cobrir os animais
  const a = road.getPointAtLength(k), b = road.getPointAtLength(Math.min(k + 1, roadLen));
  const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  $("truck").setAttribute("transform", `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
  $("truckBody").setAttribute("transform", `scale(${truckDir} 1)`);
  truckLoad.style.opacity = truckDir > 0 ? 1 : 0;

  // trator só trabalha quando há adubação
  tractorOp += ((ctl.fert > 0 ? 1 : 0) - tractorOp) * Math.min(dt * 2, 1);
  const ph = t * .22 * Math.max(ctl.speed, .5);
  const x = 664 + Math.sin(ph) * 82;
  $("tractor").setAttribute("transform", `translate(${x.toFixed(1)} 606)`);
  $("tractor").setAttribute("opacity", tractorOp.toFixed(2));
  $("tractorBody").setAttribute("transform", `scale(${Math.cos(ph) >= 0 ? 1 : -1} 1)`);
}

/* ================= LOOP ================= */
let last = performance.now();
function frame(now) {
  const realDt = Math.min(now - last, 1000) / 1000; // relógio da apresentação não pode atrasar em quadros lentos
  const dt = Math.min(realDt, .06);
  last = now;
  const sdt = ctl.playing ? dt * ctl.speed : 0;
  const t = now / 1000;
  simTime += sdt;

  // contagem por reservatório (apenas átomos parados)
  const n = {};
  for (const k in RES) n[k] = 0;
  for (const p of particles) if (!p.moving) n[p.res]++;

  if (sdt > 0) {
    // mineração conforme o uso de fertilizante
    mineAcc += (ctl.fert / 100) * 1.2 * sdt;
    while (mineAcc >= 1) {
      mineAcc--;
      const rock = particles.filter(p => !p.moving && p.res === "rocha");
      if (rock.length) send(rock[Math.floor(Math.random() * rock.length)], "fabrica");
    }
    for (const p of particles) {
      if (p.moving) continue;
      for (const [dest, r] of rates(p.res, n)) {
        if (Math.random() < r * RATE * sdt) { send(p, dest); break; }
      }
    }
  }

  // movimento dos átomos
  for (const p of particles) {
    const m = p.moving;
    if (m) {
      m.k = Math.min(m.k + sdt / m.dur, 1);
      const pt = m.f.el.getPointAtLength(ease(m.k) * m.f.len);
      const s = 1 - smooth(Math.min(m.k / .2, 1));
      const e = smooth(Math.max((m.k - .8) / .2, 0));
      p.x = pt.x + s * (m.sx - m.f.p0.x) + e * (m.hx - m.f.p1.x);
      p.y = pt.y + s * (m.sy - m.f.p0.y) + e * (m.hy - m.f.p1.y);
      if (m.k >= 1) { p.res = m.dest; p.hx = m.hx; p.hy = m.hy; p.moving = null; }
    } else {
      p.x = p.hx + Math.sin(t * .8 + p.ph) * 3;
      p.y = p.hy + Math.cos(t * .6 + p.ph) * 2;
    }
    p.el.setAttribute("cx", p.x.toFixed(1));
    p.el.setAttribute("cy", p.y.toFixed(1));
  }

  // intensidade dos fluxos
  for (const k in FLOWS) {
    const f = FLOWS[k];
    f.flux *= Math.pow(.6, sdt);
    f.el.setAttribute("opacity", (.08 + f.flux * .75).toFixed(2));
  }

  // rótulos
  for (const k in RES) {
    const r = RES[k];
    if (r.countEl && r.shown !== n[k]) {
      r.countEl.textContent = n[k];
      if (r.shown >= 0) { r.badgeEl.classList.add("bump"); setTimeout(() => r.badgeEl.classList.remove("bump"), 220); }
      r.shown = n[k];
    }
  }

  // crescimento da lavoura
  growth += ((.45 + clamp(n.planta / 25, 0, 1) * .75) - growth) * Math.min(dt * 2, 1);
  cropsInner.setAttribute("transform", `translate(0 600) scale(1 ${growth.toFixed(3)}) translate(0 -600)`);

  if (ctl.playing) updateVehicles(t, dt);
  updateLake(n, sdt, dt, t);
  if (sdt > 0) sampleChart(n);
  updateZoom(dt);
  presentTick(realDt);
  requestAnimationFrame(frame);
}

/* ================= LAGO ================= */
const TROPHIC = [["Oligotrófico", "t0"], ["Mesotrófico", "t1"], ["Eutrófico", "t2"], ["Hipereutrófico", "t3"]];
let lastLook = -1;

function updateLake(n, sdt, dt, t) {
  const target = clamp((n.lago - 7) / 24, 0, 1);
  lakeA += (target - lakeA) * Math.min(sdt * .9, 1);
  const O2target = 9 - 8.6 * Math.pow(lakeA, 1.3);
  O2 += (O2target - O2) * Math.min(sdt * 1, 1);

  // aparência só muda quando a eutrofização varia de forma visível
  if (Math.abs(lakeA - lastLook) > .005) {
    lastLook = lakeA;
    $("waterTop").setAttribute("stop-color", ramp(["4fb3ea", "5fb58a", "6e9a32", "5b6b26"], lakeA));
    $("waterBot").setAttribute("stop-color", ramp(["1d5f99", "236b5a", "2f4f1d", "2a2a14"], lakeA));
    const shown = Math.round(Math.pow(lakeA, .8) * ALGAE.length);
    ALGAE.forEach((a, i) => a.c.classList.toggle("hide", i >= shown));
    // sem luz, as plantas submersas morrem
    const weed = ramp(["3fae6a", "5f8f3a", "6b5a3a"], lakeA * 1.3);
    SEAWEED.forEach(w => { w.setAttribute("stroke", weed); w.style.opacity = 1 - clamp((lakeA - .4) / .5, 0, .85); });
    $("bubbles").setAttribute("opacity", clamp((lakeA - .55) / .3, 0, 1).toFixed(2));
    $("ripples").setAttribute("opacity", (1 - lakeA).toFixed(2));
  }
  // esgoto tratado sai quase transparente; sem tratamento forma uma pluma marrom com espuma
  $("plume").style.fill = ctl.esgoto ? "#cdeefa" : "#7a5226";
  $("plume").style.opacity = ctl.esgoto ? .3 : .85;
  $("foam").style.opacity = ctl.esgoto ? 0 : 1;

  // patos vão embora quando o lago fica ruim
  const duckOp = 1 - clamp((lakeA - .4) / .25, 0, 1);
  for (const d of DUCKS) {
    const s = t * .09 + d.ph;
    const x = 1245 + Math.sin(s) * 95;
    d.g.setAttribute("transform", `translate(${x.toFixed(1)} ${(647 + Math.sin(t * 2 + d.ph) * 1.2).toFixed(1)})`);
    d.b.setAttribute("transform", `scale(${Math.cos(s) >= 0 ? 1 : -1} 1)`);
    d.g.setAttribute("opacity", duckOp.toFixed(2));
  }

  let alive = 0;
  for (const f of FISH) {
    if (f.alive && O2 < f.tol) { f.alive = false; f.deadT = 0; f.fy = f.y; f.rot = 0; if (simTime - lastFishToast > 6) { toast("🐟 Peixes morrendo por falta de O₂"); lastFishToast = simTime; } }
    if (!f.alive && O2 > f.tol + 1.2 && f.op <= 0) { f.alive = true; f.op = 0; }
    if (f.alive) {
      alive++;
      f.op = Math.min(f.op + dt, 1);
      const x = f.cx + Math.sin(t * f.w + f.ph) * f.amp;
      const dir = Math.cos(t * f.w + f.ph) >= 0 ? 1 : -1;
      const y = f.y + Math.sin(t * 1.7 + f.ph) * 3;
      f.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      f.body.setAttribute("transform", `scale(${dir} 1)`);
      f.body.firstChild.setAttribute("fill", f.col);
    } else {
      f.deadT += dt;
      f.fy += (652 - f.fy) * Math.min(dt * .8, 1);
      f.rot += (180 - f.rot) * Math.min(dt * 2, 1);
      if (f.deadT > 6) f.op = Math.max(f.op - dt * .5, 0);
      const x = f.cx + Math.sin(f.ph) * f.amp;
      f.g.setAttribute("transform", `translate(${x.toFixed(1)} ${f.fy.toFixed(1)}) rotate(${f.rot.toFixed(1)})`);
      f.body.firstChild.setAttribute("fill", "#9aa3a0");
    }
    f.g.setAttribute("opacity", f.op.toFixed(2));
  }

  const level = lakeA < .12 ? 0 : lakeA < .38 ? 1 : lakeA < .68 ? 2 : 3;
  if (level !== prevTrophic) {
    const [name, cls] = TROPHIC[level];
    $("trophic").textContent = name;
    $("trophic").className = "trophic " + cls;
    if (level === 2 && prevTrophic < 2) toast("🦠 Floração de algas no lago");
    if (level === 3) toast("⚠️ Lago hipereutrófico: zona morta");
    if (level <= 1 && prevTrophic >= 2) toast("💧 O lago está se recuperando");
    prevTrophic = level;
  }
  if (n.rocha === 0 && !rockWarned && ctl.fert > 0) { toast("⛏️ Reserva de rocha fosfática esgotada"); rockWarned = true; }
  if (n.rocha > 5) rockWarned = false;

  $("sP").textContent = n.lago;
  $("sO2").textContent = O2.toFixed(1);
  $("sAlg").textContent = Math.round(lakeA * 100) + "%";
  $("sFish").textContent = `${alive}/${FISH.length}`;
  $("o2bar").style.width = clamp(O2 / 9 * 100, 3, 100) + "%";
  if (P.on) {
    $("pO2").textContent = O2.toFixed(1);
    $("pAlg").textContent = Math.round(lakeA * 100) + "%";
    $("pFish").textContent = `${alive}/${FISH.length}`;
  }
}

/* ================= GRÁFICO ================= */
const chart = $("chart");
const cx = chart.getContext("2d");
let sampleAcc = 0;
function sampleChart(n) {
  sampleAcc += 1;
  if (sampleAcc < 8) return;
  sampleAcc = 0;
  history.push([O2, n.lago]);
  if (history.length > 160) history.shift();
  drawChart();
}
function drawChart() {
  const dpr = window.devicePixelRatio || 1;
  const w = chart.clientWidth, h = chart.clientHeight;
  if (chart.width !== w * dpr) { chart.width = w * dpr; chart.height = h * dpr; }
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.clearRect(0, 0, w, h);
  cx.strokeStyle = "rgba(255,255,255,.07)";
  cx.lineWidth = 1;
  for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(0, h * i / 4); cx.lineTo(w, h * i / 4); cx.stroke(); }
  const maxP = Math.max(30, ...history.map(s => s[1]));
  const line = (idx, max, color) => {
    cx.beginPath();
    history.forEach((s, i) => {
      const x = (i / 159) * w, y = h - 4 - (s[idx] / max) * (h - 8);
      i ? cx.lineTo(x, y) : cx.moveTo(x, y);
    });
    cx.strokeStyle = color; cx.lineWidth = 2.2; cx.lineJoin = "round"; cx.stroke();
  };
  line(0, 10, "#6fd3ff");
  line(1, maxP, "#ff7b39");
}

/* ================= AVISOS ================= */
function toast(msg) {
  const d = document.createElement("div");
  d.className = "toast";
  d.textContent = msg;
  $("toasts").appendChild(d);
  setTimeout(() => d.remove(), 4000);
}

/* ================= CONTROLES ================= */
function paintRange(input) { input.style.setProperty("--v", ((input.value - input.min) / (input.max - input.min)) * 100 + "%"); }

function applyControls() {
  ctl.fert = +$("fert").value;
  ctl.rain = $("rainCtl").value / 100;
  ctl.mata = $("mata").checked;
  ctl.esgoto = $("esgoto").checked;
  $("fertOut").textContent = ctl.fert + "%";
  $("rainOut").textContent = Math.round(ctl.rain * 100) + "%";
  paintRange($("fert")); paintRange($("rainCtl"));

  const visible = Math.round(ctl.rain * RAIN.length);
  RAIN.forEach((l, i) => (l.style.display = i < visible ? "" : "none"));
  $("sun").style.opacity = 1 - ctl.rain * .75;
  $("birds").style.opacity = 1 - ctl.rain;
  const cloud = mix("ffffff", "8b98a5", ctl.rain);
  $("clouds").querySelectorAll("circle").forEach(c => c.setAttribute("fill", cloud));
  $("skyTop").setAttribute("stop-color", mix("6ec6ff", "6f8796", ctl.rain));
  $("skyBot").setAttribute("stop-color", mix("e6f6ff", "b9c6cf", ctl.rain));
  $("smoke").style.opacity = ctl.fert ? .3 + ctl.fert / 140 : 0;
  $("riparian").classList.toggle("off", !ctl.mata);
  $("ete").classList.toggle("off", !ctl.esgoto);
}
["fert", "rainCtl", "mata", "esgoto"].forEach(id => $(id).addEventListener("input", applyControls));

const PRESETS = {
  natural:     { fert: 0,  rain: 30, mata: true,  esgoto: true },
  intensivo:   { fert: 95, rain: 75, mata: false, esgoto: false },
  sustentavel: { fert: 30, rain: 40, mata: true,  esgoto: true },
};
function setControls(p) {
  if ("fert" in p) $("fert").value = p.fert;
  if ("rain" in p) $("rainCtl").value = p.rain;
  if ("mata" in p) $("mata").checked = p.mata;
  if ("esgoto" in p) $("esgoto").checked = p.esgoto;
  applyControls();
}
function markPreset(name) {
  $("presets").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.p === name));
}
$("presets").addEventListener("click", e => {
  const name = e.target.closest("button")?.dataset.p;
  if (!PRESETS[name]) return;
  setControls(PRESETS[name]);
  markPreset(name);
});
["fert", "rainCtl", "mata", "esgoto"].forEach(id => $(id).addEventListener("input", () => markPreset(null)));

function setSpeed(v) {
  ctl.speed = v;
  $("speed").querySelectorAll("button").forEach(x => x.classList.toggle("on", +x.dataset.v === v));
}
$("speed").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) setSpeed(+b.dataset.v);
});
$("play").addEventListener("click", () => {
  ctl.playing = !ctl.playing;
  $("play").innerHTML = ctl.playing ? ICON.pause : ICON.play;
  $("play").setAttribute("aria-label", ctl.playing ? "Pausar" : "Continuar");
});
$("reset").addEventListener("click", reset);
document.addEventListener("keydown", e => {
  if (P.on) {
    if (["ArrowRight", "PageDown"].includes(e.code)) { e.preventDefault(); goStep(P.step + 1); }
    if (e.code === "Space") { e.preventDefault(); setAuto(!P.auto); }
    if (["ArrowLeft", "PageUp"].includes(e.code)) { e.preventDefault(); goStep(P.step - 1); }
    if (e.code === "Escape") stopPresentation();
    return;
  }
  if (e.code === "Space" && e.target === document.body) { e.preventDefault(); $("play").click(); }
});

/* ================= ZOOM E ARRASTE ================= */
const scene = $("scene");
const VB = { x: 0, y: 0, w: 1600 };   // vista atual (suavizada)
const VBT = { x: 0, y: 0, w: 1600 };  // vista alvo
const MIN_W = 360;
function clampVB(v) {
  v.w = clamp(v.w, MIN_W, 1600);
  v.x = clamp(v.x, 0, 1600 - v.w);
  v.y = clamp(v.y, 0, 900 - v.w * 9 / 16);
}
function toSvg(cx, cy) {
  const r = scene.getBoundingClientRect();
  return [VBT.x + (cx - r.left) / r.width * VBT.w, VBT.y + (cy - r.top) / r.height * VBT.w * 9 / 16];
}
function zoomAt(px, py, factor) {
  const nw = clamp(VBT.w * factor, MIN_W, 1600), k = nw / VBT.w;
  VBT.x = px - (px - VBT.x) * k;
  VBT.y = py - (py - VBT.y) * k;
  VBT.w = nw;
  clampVB(VBT);
  $("zoomHint").classList.add("hide");
}
function updateZoom(dt) {
  if (Math.abs(VB.x - VBT.x) + Math.abs(VB.y - VBT.y) + Math.abs(VB.w - VBT.w) < .05) return;
  const a = Math.min(dt * (P.on ? 2.4 : 12), 1); // na apresentação a câmera anda devagar
  VB.x += (VBT.x - VB.x) * a; VB.y += (VBT.y - VB.y) * a; VB.w += (VBT.w - VB.w) * a;
  scene.setAttribute("viewBox", `${VB.x.toFixed(2)} ${VB.y.toFixed(2)} ${VB.w.toFixed(2)} ${(VB.w * 9 / 16).toFixed(2)}`);
}
scene.addEventListener("wheel", e => {
  e.preventDefault();
  const [px, py] = toSvg(e.clientX, e.clientY);
  zoomAt(px, py, Math.exp(clamp(e.deltaY, -120, 120) * .0018));
}, { passive: false });

// arrastar com um dedo/mouse, pinça com dois dedos
const pointers = new Map();
let drag = null, pinch = null;
const startDrag = (x, y) => { drag = { x, y, vx: VBT.x, vy: VBT.y }; };
// sem isso o navegador seleciona/arrasta a imagem da cena junto com o mouse
scene.addEventListener("dragstart", e => e.preventDefault());
scene.addEventListener("selectstart", e => e.preventDefault());
scene.addEventListener("pointerdown", e => {
  e.preventDefault();
  getSelection()?.removeAllRanges();
  scene.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) startDrag(e.clientX, e.clientY);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), w: VBT.w };
    drag = null;
  }
  scene.classList.add("dragging");
});
scene.addEventListener("pointermove", e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const [px, py] = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
    zoomAt(px, py, pinch.w * pinch.d / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1) / VBT.w);
  } else if (drag) {
    const r = scene.getBoundingClientRect();
    VBT.x = drag.vx - (e.clientX - drag.x) / r.width * VBT.w;
    VBT.y = drag.vy - (e.clientY - drag.y) / r.height * VBT.w * 9 / 16;
    clampVB(VBT);
  }
});
const endPointer = e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (pointers.size === 1) { const [p] = pointers.values(); startDrag(p.x, p.y); }
  if (!pointers.size) { drag = null; scene.classList.remove("dragging"); }
};
scene.addEventListener("pointerup", endPointer);
scene.addEventListener("pointercancel", endPointer);
scene.addEventListener("dblclick", e => {
  if (VBT.w < 1600) { Object.assign(VBT, { x: 0, y: 0, w: 1600 }); return; }
  const [px, py] = toSvg(e.clientX, e.clientY);
  zoomAt(px, py, .45);
});
const center = () => [VBT.x + VBT.w / 2, VBT.y + VBT.w * 9 / 32];
$("zoomIn").addEventListener("click", () => zoomAt(...center(), .7));
$("zoomOut").addEventListener("click", () => zoomAt(...center(), 1 / .7));
$("zoomReset").addEventListener("click", () => Object.assign(VBT, { x: 0, y: 0, w: 1600 }));
setTimeout(() => $("zoomHint").classList.add("hide"), 7000);

/* ================= MODO APRESENTAÇÃO ================= */
// lines: falado e mostrado na legenda · spot: área circulada (coordenadas da cena) · w: zoom da câmera
// card: lado da legenda · setup: o que muda na simulação · demo: fluxos mostrados · focus: rótulos em destaque
const STEPS = [
  {
    title: "O ciclo do fósforo", w: 1600, card: "left",
    setup: () => { setControls(PRESETS.natural); setSpeed(1); },
    lines: [
      "O fósforo é essencial à vida: está no DNA, no ATP e nos ossos.",
      "Seu ciclo é sedimentar e lento, porque não passa pela atmosfera.",
    ],
  },
  {
    title: "Rochas e intemperismo", w: 820, card: "right",
    spot: { cx: 380, cy: 630, rx: 290, ry: 100, rot: 12 },
    setup: () => setControls({ rain: 80 }),
    demo: ["rocha>solo"], focus: ["rocha", "solo"],
    lines: [
      "Tudo começa nas rochas fosfáticas.",
      "Com a chuva e o tempo, elas se desgastam e liberam fosfato para o solo.",
    ],
  },
  {
    title: "Plantas e animais", w: 640, card: "left",
    spot: { cx: 730, cy: 600, rx: 190, ry: 85 },
    setup: () => setControls({ rain: 40 }),
    demo: ["solo>planta", "planta>animal"], focus: ["solo", "planta", "animal"],
    lines: [
      "As plantas absorvem o fosfato pelas raízes, e os animais o obtêm ao se alimentar delas.",
    ],
  },
  {
    title: "Decompositores", w: 640, card: "left",
    spot: { cx: 840, cy: 630, rx: 190, ry: 90 },
    demo: ["animal>decomp", "planta>decomp", "decomp>solo"], focus: ["animal", "decomp", "solo"],
    lines: [
      "Fungos e bactérias decompõem restos e excretas, devolvendo o fosfato ao solo.",
    ],
  },
  {
    title: "Água, sedimentos e rocha", w: 1600, card: "left",
    spot: { cx: 760, cy: 760, rx: 640, ry: 120 },
    demo: ["solo>lago", "lago>sedimento", "sedimento>rocha"], focus: ["solo", "lago", "sedimento", "rocha"],
    lines: [
      "A chuva leva parte do fosfato para rios e lagos.",
      "No fundo, ele vira sedimento e, em milhões de anos, rocha de novo.",
    ],
  },
  {
    title: "Mineração e fertilizantes", w: 700, card: "right",
    spot: { cx: 470, cy: 600, rx: 175, ry: 70 },
    setup: () => setControls({ fert: 70, rain: 30, mata: true, esgoto: true }),
    demo: ["rocha>fabrica", "fabrica>solo"], focus: ["rocha", "solo"],
    lines: [
      "O ser humano acelera o ciclo: extrai a rocha fosfática e a transforma em fertilizante para a lavoura.",
    ],
    extra: `<p class="chem">Ca₃(PO₄)₂ + 2 H₂SO₄ → Ca(H₂PO₄)₂ + 2 CaSO₄</p>`,
  },
  {
    title: "Fósforo em excesso", w: 1150, card: "left",
    spot: { cx: 1120, cy: 650, rx: 480, ry: 120 },
    setup: () => { setControls(PRESETS.intensivo); setSpeed(2); },
    demo: ["solo>lago", "cidade>lago"], focus: ["solo", "cidade", "lago"],
    lines: [
      "Com adubo em excesso, sem mata ciliar e sem tratar o esgoto, o fósforo sobra e escoa para o lago.",
    ],
  },
  {
    title: "Eutrofização", w: 640, card: "left", minTime: 14, live: true,
    spot: { cx: 1205, cy: 712, rx: 205, ry: 88 },
    setup: () => { setControls(PRESETS.intensivo); setSpeed(4); },
    focus: ["lago"],
    lines: [
      "As algas se multiplicam, morrem e são decompostas por bactérias que consomem o oxigênio.",
      "Sem oxigênio, os peixes morrem: é a eutrofização.",
    ],
  },
  {
    title: "Como prevenir", w: 900, card: "left", minTime: 12, live: true,
    spot: { cx: 1290, cy: 640, rx: 320, ry: 110 },
    setup: () => { setControls(PRESETS.sustentavel); setSpeed(4); },
    demo: ["cidade>solo"], focus: ["cidade", "lago"],
    lines: [
      "Para evitar, é preciso tratar o esgoto, preservar a mata ciliar e usar o adubo na medida certa.",
    ],
  },
  {
    title: "Conclusão", w: 1600, card: "left",
    setup: () => setSpeed(1),
    lines: [
      "Assim, o ciclo do fósforo se mantém em equilíbrio. Obrigado!",
    ],
  },
];

const P = { on: false, step: 0, acc: 0, demoIdx: 0, auto: true, muted: false, line: 0, lineT: 0, elapsed: 0, doneAt: null, token: 0 };
const SPOT = { cx: 800, cy: 450, rx: 900, ry: 600, rot: 0, o: 0 };   // atual
const SPOTT = { ...SPOT };                                            // alvo

// enquadra a câmera para a área circulada ficar do lado oposto da legenda
function frameFor(s) {
  if (!s.spot || s.w >= 1600) return { x: 0, y: 0, w: 1600 };
  const h = s.w * 9 / 16;
  const fx = s.card === "left" ? .66 : .34;
  return { x: s.spot.cx - fx * s.w, y: s.spot.cy - .62 * h, w: s.w };
}

/* ---- voz ---- */
// "gravada": narração neural pré-gerada em audio/ (gerar_audio.py); as outras são vozes do sistema
const RECORDED = "gravada";
const narr = new Audio();
narr.preload = "auto";
const synth = window.speechSynthesis;
let voice = null, voices = [], voiceMode = RECORDED;
function voiceScore(v) {
  let s = /pt[-_]BR/i.test(v.lang) ? 10 : /^pt/i.test(v.lang) ? 5 : -99;
  if (/natural|neural|online/i.test(v.name)) s += 8;
  if (/google/i.test(v.name)) s += 5;
  if (/francisca|thalita|antonio/i.test(v.name)) s += 2;
  if (/maria/i.test(v.name)) s += 1;
  return s;
}
const voiceLabel = v => v.name.replace(/^Microsoft\s+/i, "").replace(/\s*-\s*Portuguese.*$/i, "").replace(/\s*\(Natural\)/i, " · natural");
function pickVoice() {
  voices = (synth?.getVoices() || []).filter(v => voiceScore(v) > 0).sort((a, b) => voiceScore(b) - voiceScore(a));
  let saved = null;
  try { saved = localStorage.getItem("cicloP.voice"); } catch {}
  const sel = $("voiceSel");
  sel.innerHTML = `<option value="${RECORDED}">Francisca · voz natural (gravada)</option>`
    + voices.map(v => `<option value="${v.name}">${voiceLabel(v)} · voz do sistema</option>`).join("");
  voiceMode = voices.some(v => v.name === saved) ? saved : RECORDED;
  voice = voices.find(v => v.name === voiceMode) || null;
  sel.value = voiceMode;
}
function stopVoice() {
  narr.pause();
  narr.onended = narr.onerror = null;
  synth?.cancel();
}
$("voiceSel").addEventListener("change", e => {
  voiceMode = e.target.value;
  voice = voices.find(v => v.name === voiceMode) || null;
  try { localStorage.setItem("cicloP.voice", voiceMode); } catch {}
  if (P.on) { if (P.auto && P.line < STEPS[P.step].lines.length) narrate(P.line); return; }
  // amostra da voz escolhida
  stopVoice();
  if (voiceMode === RECORDED) { narr.src = "audio/amostra.mp3"; narr.play().catch(() => {}); return; }
  const u = new SpeechSynthesisUtterance("Olá, turma! Eu vou apresentar o ciclo do fósforo.");
  u.lang = "pt-BR"; if (voice) u.voice = voice;
  synth?.speak(u);
});
pickVoice();
synth?.addEventListener?.("voiceschanged", pickVoice);

function markLine(i) {
  P.line = i;
  $("pText").querySelectorAll(".s").forEach((sp, j) => {
    sp.classList.toggle("on", j === i);
    sp.classList.toggle("said", j < i);
  });
}
const lineSeconds = text => 1.2 + text.split(/\s+/).length * .36;
function lineDone() { markLine(STEPS[P.step].lines.length); P.doneAt = P.elapsed; }

// toca as frases gravadas uma a uma; se algum arquivo faltar, continua com a voz do sistema
function playRecorded(i, my) {
  if (my !== P.token) return;
  if (i >= STEPS[P.step].lines.length) return lineDone();
  markLine(i);
  narr.src = `audio/s${P.step}_${i}.mp3`;
  narr.onended = () => playRecorded(i + 1, my);
  narr.onerror = () => { if (my === P.token) speakSystem(i, my); };
  narr.play().catch(() => { if (my === P.token && narr.error) speakSystem(i, my); });
}

function speakSystem(from, my) {
  const lines = STEPS[P.step].lines;
  if (!synth) { P.mode = "timer"; P.lineT = lineSeconds(lines[from]); return; }
  P.mode = "tts";
  lines.slice(from).forEach((text, k) => {
    const i = from + k;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    if (voice) u.voice = voice;
    u.rate = /natural|online|google/i.test(voice?.name || "") ? 1 : 1.05;
    u.onstart = () => { if (my === P.token) markLine(i); };
    if (i === lines.length - 1) u.onend = () => { if (my === P.token) lineDone(); };
    synth.speak(u);
  });
}

// narra a etapa a partir da frase `from`: áudio gravado, voz do sistema, ou só tempo de leitura sem som
function narrate(from = 0) {
  const my = ++P.token;
  stopVoice();
  P.doneAt = null;
  markLine(from);
  if (P.muted) { P.mode = "timer"; P.lineT = lineSeconds(STEPS[P.step].lines[from]); return; }
  if (voiceMode === RECORDED) { P.mode = "audio"; playRecorded(from, my); }
  else speakSystem(from, my);
}

/* ---- etapas ---- */
function goStep(i) {
  if (i >= STEPS.length) return stopPresentation();
  P.step = clamp(i, 0, STEPS.length - 1);
  P.acc = 0; P.demoIdx = 0; P.elapsed = 0;
  const s = STEPS[P.step];
  Object.assign(VBT, frameFor(s));
  clampVB(VBT);
  Object.assign(SPOTT, s.spot ? { rot: 0, ...s.spot, o: 1 } : { o: 0 });
  s.setup?.();

  $("pStep").textContent = `${P.step + 1}/${STEPS.length}`;
  $("pBar").style.width = ((P.step + 1) / STEPS.length) * 100 + "%";
  $("pTitle").textContent = s.title;
  $("pText").innerHTML = s.lines.map(l => `<span class="s">${l}</span>`).join(" ");
  $("pExtra").innerHTML = s.extra || "";
  $("pLive").style.display = s.live ? "" : "none";
  const card = $("presCard");
  card.className = "pres-card " + s.card;
  void card.offsetWidth;
  card.classList.add("in");
  $("pBody").scrollTop = 0;
  highlight(s.focus || [], s.demo || []);
  narrate(0);
}

function highlight(focus, demo) {
  $("badges").classList.toggle("dim", focus.length > 0);
  for (const k in RES) RES[k].badgeEl?.classList.toggle("focus", focus.includes(k));
  $("flows").classList.toggle("dim", demo.length > 0);
  for (const k in FLOWS) FLOWS[k].el.classList.toggle("spot", demo.includes(k));
}

function updateSpot(dt) {
  const a = Math.min(dt * 2.4, 1);
  for (const k in SPOTT) SPOT[k] += (SPOTT[k] - SPOT[k]) * a;
  const tr = `rotate(${SPOT.rot.toFixed(2)} ${SPOT.cx.toFixed(1)} ${SPOT.cy.toFixed(1)})`;
  for (const id of ["spotHole", "spotRing"]) {
    const e = $(id);
    e.setAttribute("cx", SPOT.cx.toFixed(1)); e.setAttribute("cy", SPOT.cy.toFixed(1));
    e.setAttribute("rx", SPOT.rx.toFixed(1)); e.setAttribute("ry", SPOT.ry.toFixed(1));
    e.setAttribute("transform", tr);
  }
  $("spot").setAttribute("opacity", SPOT.o.toFixed(3));
}

function presentTick(dt) {
  updateSpot(dt);
  if (!P.on || !P.auto) return;
  P.elapsed += dt;
  const s = STEPS[P.step];

  // sem voz: avança as frases pelo tempo de leitura
  if (P.mode === "timer" && P.line < s.lines.length) {
    P.lineT -= dt;
    if (P.lineT <= 0) {
      markLine(P.line + 1);
      if (P.line < s.lines.length) P.lineT = lineSeconds(s.lines[P.line]);
      else P.doneAt = P.elapsed;
    }
  }
  // próxima etapa quando a fala termina (e o efeito na cena já teve tempo de aparecer)
  if (P.doneAt !== null && P.step < STEPS.length - 1 && P.elapsed >= Math.max(s.minTime || 0, P.doneAt + 1.2)) {
    goStep(P.step + 1);
    return;
  }

  // manda átomos pelo fluxo explicado para o efeito ficar visível
  if (!s.demo || !ctl.playing) return;
  P.acc += dt;
  if (P.acc < .7) return;
  P.acc = 0;
  const [a, b] = s.demo[P.demoIdx++ % s.demo.length].split(">");
  const idle = particles.filter(p => !p.moving && p.res === a);
  if (idle.length) send(idle[Math.floor(Math.random() * idle.length)], b);
}

function setAuto(on) {
  P.auto = on;
  $("pAuto").innerHTML = on ? ICON.pause : ICON.play;
  $("pAuto").setAttribute("aria-label", on ? "Pausar apresentação" : "Continuar apresentação");
  if (P.muted || !P.on || P.mode === "timer") return;
  if (P.mode === "audio") { on ? narr.play().catch(() => {}) : narr.pause(); return; }
  // pause/resume da fala do sistema é instável no Chrome: parar e retomar da frase atual é mais confiável
  if (!on) { P.token++; synth?.cancel(); }
  else if (P.line < STEPS[P.step].lines.length) narrate(P.line);
}

function startPresentation() {
  setAuto(true); // antes de ligar P.on, para não narrar duas vezes
  P.on = true;
  document.body.classList.add("presenting");
  if (!ctl.playing) $("play").click();
  reset();
  goStep(0);
}
function stopPresentation() {
  P.on = false;
  P.token++;
  stopVoice();
  document.body.classList.remove("presenting");
  highlight([], []);
  SPOTT.o = 0;
  Object.assign(VBT, { x: 0, y: 0, w: 1600 });
  setSpeed(1);
  if (document.fullscreenElement) document.exitFullscreen();
}
$("presentBtn").addEventListener("click", startPresentation);
$("pExit").addEventListener("click", stopPresentation);
$("pPrev").addEventListener("click", () => goStep(P.step - 1));
$("pNext").addEventListener("click", () => goStep(P.step + 1));
$("pAuto").addEventListener("click", () => setAuto(!P.auto));
$("pMute").addEventListener("click", () => {
  P.muted = !P.muted;
  $("pMute").innerHTML = P.muted ? ICON.mute : ICON.vol;
  $("pMute").setAttribute("aria-label", P.muted ? "Ligar voz" : "Desligar voz");
  const s = STEPS[P.step];
  if (P.line < s.lines.length) narrate(P.line);
  else stopVoice();
});
$("pFull").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

applyControls();
reset();
requestAnimationFrame(frame);
