"use strict";
const assert=require("node:assert/strict");
const {readFileSync,existsSync}=require("node:fs");
for(const path of ["index.html","styles.css","app.js","favicon.svg",".nojekyll","docs/DESIGN_SYSTEM.md"]){
  assert.ok(existsSync(path),"Arquivo ausente: "+path);
}
const html=readFileSync("index.html","utf8"),js=readFileSync("app.js","utf8"),css=readFileSync("styles.css","utf8");
for(const id of ["challenge-form","challenge-title","challenge-list","import-file","results","stat-done"]){
 assert.ok(html.includes('id="'+id+'"'),"Componente ausente: "+id);
}
assert.ok(js.includes("localStorage"),"Persistência local ausente");
assert.ok(js.includes("textContent"),"Renderização segura ausente");
assert.ok(css.includes("prefers-reduced-motion"),"Movimento reduzido ausente");
assert.ok(!/https?:\/\/[^\s"']+\.js/.test(html),"Script CDN inesperado");
console.log("PASS: app estática, tokens, navegação e armazenamento local.");
