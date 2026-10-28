"use strict";
/* Targeted WCAG-oriented browser checks. Not a full accessibility certification. */
module.exports=async function audit(page,errors){
 const issues=await page.evaluate(()=>{
  const issues=[];
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0};
  const rgb=value=>{const m=String(value||"").match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);return m?[+m[1],+m[2],+m[3]]:null};
  const channel=n=>{const v=n/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
  const brightness=c=>.2126*channel(c[0])+.7152*channel(c[1])+.0722*channel(c[2]);
  const ratio=(a,b)=>{const aa=brightness(a),bb=brightness(b);return(Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05)};
  function opaqueBg(el){
   for(let node=el;node;node=node.parentElement){
    const s=getComputedStyle(node),v=s.backgroundColor;if(v&&!/rgba?\([^)]*,\s*0(?:\.0+)?\)/.test(v)){
      const c=rgb(v);if(c)return c;
    }
   }
   return null;
  }
  const fields=[...document.querySelectorAll('form input:not([type="hidden"]):not([type="file"]),form select,form textarea')].filter(visible);
  if(!fields.length)issues.push("No visible form fields");
  for(const [i,field] of fields.entries()){
   const label=field.labels?.length||field.getAttribute("aria-label")||field.getAttribute("aria-labelledby");
   if(!label)issues.push("Field "+i+" lacks accessible label");
   const rect=field.getBoundingClientRect();
   if(rect.height<43)issues.push("Form field "+i+" too short: "+Math.round(rect.height)+"px");
   const fg=rgb(getComputedStyle(field).color),bg=opaqueBg(field);
   if(fg&&bg&&ratio(fg,bg)<4.5)issues.push("Form field "+i+" insufficient text contrast: "+ratio(fg,bg).toFixed(2));
   const placeholder=field.getAttribute("placeholder");
   if(placeholder){const pc=rgb(getComputedStyle(field,"::placeholder").color);
    if(pc&&bg&&ratio(pc,bg)<4.5)issues.push("Placeholder "+i+" insufficient contrast: "+ratio(pc,bg).toFixed(2));
   }
  }
  for(const el of [...document.querySelectorAll("header nav a,.hero .button,.hero-buttons .button,form button")].filter(visible)){
   const r=el.getBoundingClientRect();if(r.height<43)issues.push("Action target "+(el.textContent||"").trim().slice(0,25)+" is "+Math.round(r.height)+"px tall");
  }
  return issues;
 });
 errors.push(...issues);
 await page.keyboard.press("Tab");
 const initial=await page.evaluate(()=>document.activeElement?.matches("a.skip,a.skip-link"));
 if(!initial)errors.push("First Tab did not reach skip link");
 else{
  await page.keyboard.press("Tab");
  const outline=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {width:parseFloat(s.outlineWidth)||0,style:s.outlineStyle}});
  if(outline.width<2||outline.style==="none")errors.push("Keyboard navigation has no clear visible focus ring");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  const skipped=await page.evaluate(()=>document.activeElement===document.querySelector("main")&&location.hash==="#"+document.querySelector("main").id);
  if(!skipped)errors.push("Skip link did not move keyboard focus to main content");
 }
 await page.evaluate(()=>{if(document.activeElement?.blur)document.activeElement.blur()});
};