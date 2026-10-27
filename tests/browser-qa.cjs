"use strict";
const { chromium }=require("playwright");
const { spawn }=require("node:child_process");
const fs=require("node:fs");
fs.mkdirSync("screenshots",{recursive:true});
const server=spawn("python3",["-m","http.server","8769","--bind","127.0.0.1"],{stdio:"ignore"});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 await wait(1100);
 const browser=await chromium.launch({headless:true}),results=[];
 const sizes=[{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:1366,height:768},{width:1600,height:900}];
 try{
  for(const viewport of sizes){
   const context=await browser.newContext({viewport,reducedMotion:"reduce",acceptDownloads:true});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
   page.on("response",r=>{if(r.status()>=400&&r.url().startsWith("http://127.0.0.1:8769"))errors.push(r.status()+" "+r.url())});
   try{
    const response=await page.goto("http://127.0.0.1:8769/",{waitUntil:"load"});
    if(response.status()!==200)errors.push("Home HTTP "+response.status());
    await page.getByRole("heading",{name:/Toda conquista começa/}).waitFor();
    if(await page.locator(".challenge-card").count()!==0)errors.push("A primeira visita deveria estar vazia");
    await page.getByRole("button",{name:"Carregar exemplos demonstrativos"}).click();
    if(await page.locator(".challenge-card").count()!==3)errors.push("Não carregou três exemplos");
    await page.getByRole("button",{name:"Concluídos",exact:true}).click();
    if(await page.locator(".challenge-card").count()!==1)errors.push("Filtro concluídos não mostrou um exemplo");
    await page.getByRole("button",{name:"Todos",exact:true}).click();
    const title=page.getByLabel("Nome do desafio");
    await title.fill("Meu teste local");
    await page.getByLabel("Meta total").fill("5");
    await page.getByLabel("Progresso atual").fill("1");
    await page.getByRole("button",{name:"Salvar desafio"}).click();
    if(await page.locator(".challenge-card").count()!==4)errors.push("Não criou um desafio");
    await page.reload();
    if(await page.locator(".challenge-card").count()!==4)errors.push("O progresso não persistiu após reload");
    const created=page.locator(".challenge-card").filter({hasText:"Meu teste local"});
    await created.getByRole("button",{name:"+1 progresso"}).click();
    if(!((await created.locator(".progress-label").innerText()).includes("2 / 5")))errors.push("Avançar não funcionou");
    const downloadPromise=page.waitForEvent("download");
    await page.getByRole("button",{name:"Exportar JSON"}).click();
    const downloaded=await downloadPromise;
    if(!downloaded.suggestedFilename().endsWith(".json"))errors.push("Exportação JSON falhou");
    page.once("dialog",d=>d.accept());
    await created.getByRole("button",{name:"Excluir"}).click();
    if(await page.locator(".challenge-card").count()!==3)errors.push("Exclusão não funcionou");
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))errors.push("Overflow horizontal");
    await page.screenshot({path:"screenshots/"+viewport.width+"x"+viewport.height+".png",fullPage:true,animations:"disabled"});
    results.push({viewport,passed:errors.length===0,errors});
   }catch(e){errors.push(e.stack||String(e));results.push({viewport,passed:false,errors})}
   finally{await context.close()}
  }
 }finally{await browser.close();server.kill()}
 fs.writeFileSync("screenshots/diagnostics.json",JSON.stringify(results,null,2));
 results.forEach(row=>console.log(JSON.stringify(row)));
 if(results.length!==sizes.length||results.some(row=>!row.passed))process.exitCode=1;
})().catch(e=>{console.error(e);server.kill();process.exitCode=1});
