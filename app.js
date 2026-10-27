"use strict";
(() => {
  const KEY="lol-challenge-hub-local-v1";
  const MAX_CHALLENGES=100;
  const $=(selector)=>document.querySelector(selector);
  const list=$("#challenge-list"),form=$("#challenge-form"),toast=$("#toast");
  const priorities={high:{label:"PRIORIDADE ALTA",rank:0},medium:{label:"PRIORIDADE MÉDIA",rank:1},low:{label:"PRIORIDADE BAIXA",rank:2}};
  let filter="all",items=[];
  let timer;
  function notify(message){toast.textContent=message;toast.hidden=false;clearTimeout(timer);timer=setTimeout(()=>toast.hidden=true,3300)}
  function valid(item){
    if(!item||typeof item!=="object")return false;
    return typeof item.id==="string"&&item.id.length>0&&item.id.length<=90&&typeof item.title==="string"&&item.title.trim().length>=2&&item.title.length<=70&&
      Object.hasOwn(priorities,item.priority)&&Number.isInteger(item.goal)&&item.goal>=1&&item.goal<=10000&&
      Number.isInteger(item.progress)&&item.progress>=0&&item.progress<=item.goal&&
      typeof item.notes==="string"&&item.notes.length<=500&&Number.isFinite(Date.parse(item.updatedAt));
  }
  function read(){
    try{const parsed=JSON.parse(localStorage.getItem(KEY));if(!parsed)return [];
      if(parsed.version!==1||!Array.isArray(parsed.challenges)||parsed.challenges.length>MAX_CHALLENGES||!parsed.challenges.every(valid))throw Error("Invalid data");
      if(new Set(parsed.challenges.map(item=>item.id)).size!==parsed.challenges.length)throw Error("Duplicate");
      return parsed.challenges;
    }catch{notify("Dados locais não puderam ser lidos. Você pode importar um backup JSON.");return []}
  }
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify({version:1,challenges:items}));return true}
    catch{notify("Armazenamento bloqueado: exporte seus dados antes de sair.");return false}
  }
  function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node}
  function button(label,action,id,cls){const b=el("button",cls,label);b.type="button";b.dataset.action=action;b.dataset.id=id;return b}
  function card(item){
    const done=item.progress>=item.goal;
    const article=el("article","challenge-card"+(done?" done":""));
    const top=el("div","card-top"),left=el("div");
    const p=el("span","priority "+item.priority,priorities[item.priority].label);
    const title=el("h3","",item.title);
    const status=el("span","status-pill",done?"Concluído":"Em andamento");
    left.append(p,title);top.append(left,status);article.append(top);
    article.append(el("p","card-note",item.notes||"Sem observações."));
    const lbl=el("div","progress-label"),number=el("strong","",item.progress+" / "+item.goal);
    lbl.append(el("span","","Progresso registrado"),number);article.append(lbl);
    const meter=el("progress");meter.max=item.goal;meter.value=item.progress;meter.setAttribute("aria-label","Progresso de "+item.title);article.append(meter);
    const controls=el("div","card-actions");
    const advance=button("+1 progresso","advance",item.id);advance.disabled=done;
    controls.append(advance,button("Editar","edit",item.id),button("Excluir","delete",item.id,"danger"));
    article.append(controls);
    return article;
  }
  function render(){
    const sorted=[...items].sort((a,b)=>priorities[a.priority].rank-priorities[b.priority].rank||Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
    const visible=sorted.filter(item=>filter==="all"||(filter==="done"?item.progress>=item.goal:item.progress<item.goal));
    list.replaceChildren(...visible.map(card));
    $("#empty").hidden=items.length>0;
    $("#stat-total").textContent=items.length;
    $("#stat-done").textContent=items.filter(item=>item.progress>=item.goal).length;
    $("#stat-active").textContent=items.filter(item=>item.progress<item.goal).length;
    $("#results").textContent=visible.length+(visible.length===1?" desafio exibido":" desafios exibidos");
    if(items.length>0&&visible.length===0)list.append(el("p","no-results","Nenhum desafio neste filtro."));
    document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===filter)));
  }
  function resetEditor(){
    form.reset();$("#editing-id").value="";$("#save").textContent="Salvar desafio";$("#cancel-edit").hidden=true;
  }
  function edit(item){
    $("#editing-id").value=item.id;$("#challenge-title").value=item.title;$("#priority").value=item.priority;
    $("#goal").value=item.goal;$("#progress").value=item.progress;$("#notes").value=item.notes;
    $("#save").textContent="Atualizar desafio";$("#cancel-edit").hidden=false;
    $("#novo").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    $("#challenge-title").focus({preventScroll:true});
  }
  form.addEventListener("submit",(event)=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const title=$("#challenge-title").value.trim(),goal=Number($("#goal").value),progress=Number($("#progress").value);
    if(title.length<2||title.length>70||!Number.isInteger(goal)||goal<1||goal>10000||!Number.isInteger(progress)||progress<0||progress>goal){
      notify("Confira a meta e o progresso (0 até o valor da meta).");return;
    }
    const id=$("#editing-id").value;
    if(!id&&items.length>=MAX_CHALLENGES){notify("Limite de 100 desafios locais atingido.");return}
    const next={id:id||crypto.randomUUID(),title,priority:$("#priority").value,goal,progress,notes:$("#notes").value.trim(),updatedAt:new Date().toISOString()};
    if(!valid(next)){notify("Revise os dados do desafio.");return}
    const position=items.findIndex(item=>item.id===id);
    if(position>=0)items[position]=next;else items.push(next);
    save();resetEditor();render();notify("Desafio salvo neste navegador.");
    $("#desafios").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  });
  $("#cancel-edit").addEventListener("click",resetEditor);
  list.addEventListener("click",(event)=>{
    const control=event.target.closest("button[data-action]");if(!control)return;
    const index=items.findIndex(item=>item.id===control.dataset.id);if(index<0)return;
    const item=items[index];
    if(control.dataset.action==="edit"){edit(item);return}
    if(control.dataset.action==="delete"){
      if(!confirm("Excluir este desafio e seu progresso local?"))return;
      items.splice(index,1);if($("#editing-id").value===item.id)resetEditor();notify("Desafio excluído.");
    }else if(control.dataset.action==="advance"&&item.progress<item.goal){
      item.progress++;item.updatedAt=new Date().toISOString();
      notify(item.progress===item.goal?"Meta concluída! ✦":"Progresso atualizado.");
    }
    save();render();
  });
  document.querySelectorAll("[data-filter]").forEach(control=>control.addEventListener("click",()=>{filter=control.dataset.filter;render()}));
  $("#load-demo").addEventListener("click",()=>{
    if(items.length&&!confirm("Substituir seus desafios pelos exemplos?"))return;
    const timestamp=new Date().toISOString();
    items=[
      {id:"demo-1",title:"Jogar 10 partidas",priority:"high",goal:10,progress:3,notes:"Exemplo fictício, progresso manual.",updatedAt:timestamp},
      {id:"demo-2",title:"Praticar visão por 5 sessões",priority:"medium",goal:5,progress:2,notes:"Dados demonstrativos, não importados da Riot.",updatedAt:timestamp},
      {id:"demo-3",title:"Revisar 3 partidas",priority:"low",goal:3,progress:3,notes:"Exemplo concluído para testar filtros.",updatedAt:timestamp}
    ];
    filter="all";save();render();notify("Três exemplos demonstrativos carregados.");
  });
  $("#export-data").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify({version:1,challenges:items},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=el("a");
    link.href=url;link.download="lol-challenge-hub-backup.json";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify("Backup JSON preparado. Guarde o arquivo em local seguro.");
  });
  $("#import-data").addEventListener("click",()=>$("#import-file").click());
  $("#import-file").addEventListener("change",async(event)=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    if(file.size>1_000_000){notify("Arquivo maior que 1 MB.");return}
    try{
      const data=JSON.parse(await file.text());
      if(data.version!==1||!Array.isArray(data.challenges)||data.challenges.length>MAX_CHALLENGES||!data.challenges.every(valid)||new Set(data.challenges.map(item=>item.id)).size!==data.challenges.length)throw Error("Formato inválido");
      if(items.length&&!confirm("Importar o JSON e substituir TODOS os desafios locais?"))return;
      items=data.challenges.map(item=>({...item}));
      filter="all";resetEditor();save();render();notify("Backup importado com sucesso.");
    }catch{notify("JSON inválido ou incompatível. Seus dados atuais foram mantidos.")}
  });
  items=read();render();
})();
