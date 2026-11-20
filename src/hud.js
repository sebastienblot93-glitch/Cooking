// ================= INTERFACE 2D (au-dessus de la 3D) =================
let hx=null;
function rrp(c,x,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h);}
function icon(c,k,x,y,s){
 c.save();c.translate(x,y);
 const ball=(cx,cy,r,col)=>{const g=c.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,'#fff');g.addColorStop(.25,col);g.addColorStop(1,shadeHex(col,-.3));c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();};
 if(k==='tomate'||k==='tomate_cru'){ball(0,s*.05,s*.62,'#e2382a');c.fillStyle='#3c9a3a';for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;c.beginPath();c.ellipse(Math.cos(a)*s*.18,-s*.48+Math.sin(a)*s*.18,s*.2,s*.07,a,0,7);c.fill();}}
 else if(k==='tomate_coupe'){for(const [dx,dy] of [[-.3,.1],[.3,.12],[0,-.18]]){c.fillStyle='#c92e22';c.beginPath();c.arc(dx*s,dy*s,s*.38,0,7);c.fill();c.fillStyle='#f4836b';c.beginPath();c.arc(dx*s,dy*s,s*.29,0,7);c.fill();}}
 else if(k==='laitue'||k==='laitue_cru'){ball(0,0,s*.66,'#3f9a3a');ball(-s*.15,-s*.05,s*.45,'#79c95a');ball(s*.1,s*.05,s*.28,'#b7e68c');}
 else if(k==='laitue_coupe'){for(let i=0;i<7;i++){c.save();c.translate(Math.cos(i*1.7)*s*.3,Math.sin(i*2.3)*s*.24);c.rotate(i*.9);c.fillStyle=i%2?'#5fae45':'#a6dd7c';rrp(c,-s*.3,-s*.08,s*.6,s*.16,s*.08);c.fill();c.restore();}}
 else if(k==='oignon'||k==='oignon_cru'){ball(0,s*.08,s*.6,'#e3a64e');c.fillStyle='#b9772f';c.beginPath();c.moveTo(-s*.14,-s*.4);c.lineTo(0,-s*.85);c.lineTo(s*.14,-s*.4);c.fill();c.strokeStyle='rgba(150,90,30,.55)';c.lineWidth=Math.max(1,s*.08);for(const a of [-.35,.35]){c.beginPath();c.ellipse(0,s*.08,s*.6*Math.abs(Math.cos(a*2)),s*.58,0,-1.2,1.2);c.stroke();}}
 else if(k==='oignon_coupe'){for(const [dx,dy] of [[-.3,.1],[.3,.12],[0,-.18]]){c.strokeStyle='#e9d6a8';c.lineWidth=s*.1;c.beginPath();c.arc(dx*s,dy*s,s*.32,0,7);c.stroke();c.strokeStyle='#f8f0dc';c.beginPath();c.arc(dx*s,dy*s,s*.17,0,7);c.stroke();}}
 else if(k==='soupe_oignon'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,s*.1,s*.8,s*.55,0,0,7);c.fill();c.fillStyle='#c4893a';c.beginPath();c.ellipse(0,0,s*.62,s*.36,0,0,7);c.fill();c.fillStyle='#fff1c4';c.beginPath();c.ellipse(-s*.05,-s*.02,s*.36,s*.18,0,0,7);c.fill();c.fillStyle='#f6d58a';for(let i=0;i<3;i++)c.fillRect(-s*.3+i*s*.22,-s*.1+(i%2)*s*.1,s*.13,s*.13);}
 else if(k==='pain'){c.fillStyle='#f0c27a';rrp(c,-s*.75,s*.05,s*1.5,s*.35,s*.15);c.fill();const g=c.createRadialGradient(-s*.2,-s*.4,s*.1,0,-s*.05,s*.8);g.addColorStop(0,'#ffd58a');g.addColorStop(1,'#c9772e');c.fillStyle=g;c.beginPath();c.ellipse(0,0,s*.78,s*.55,0,Math.PI,0);c.fill();c.fillStyle='#fff6dc';for(let i=0;i<5;i++){c.beginPath();c.ellipse(-s*.4+i*s*.2,-s*.25-(i%2)*s*.12,s*.06,s*.035,.4,0,7);c.fill();}}
 else if(k==='steak'||k==='steak_cru'||k==='steak_cuit'){c.fillStyle=k==='steak_cuit'?'#7d4528':'#d45f62';c.beginPath();c.ellipse(0,0,s*.8,s*.55,-.2,0,7);c.fill();c.strokeStyle=k==='steak_cuit'?'#3e1e0e':'#f4c4c0';c.lineWidth=s*.12;for(const i of [-1,0,1]){c.beginPath();c.moveTo(-s*.4,i*s*.25-s*.15);c.lineTo(s*.4,i*s*.25+s*.15);c.stroke();}}
 else if(k==='pan'){c.fillStyle='#2c2f36';c.beginPath();c.arc(-s*.1,0,s*.62,0,7);c.fill();c.fillStyle='#3e434c';c.beginPath();c.arc(-s*.1,0,s*.46,0,7);c.fill();c.fillStyle='#2a2016';rrp(c,s*.45,-s*.1,s*.5,s*.2,s*.08);c.fill();}
 else if(k==='burger'||k==='burger_garni'){const g=k==='burger_garni';c.fillStyle='#f0c27a';rrp(c,-s*.8,s*.38,s*1.6,s*.3,s*.14);c.fill();c.fillStyle='#6a3a20';rrp(c,-s*.85,s*.12,s*1.7,s*.3,s*.14);c.fill();if(g){c.fillStyle='#6fbe4f';rrp(c,-s*.9,-s*.02,s*1.8,s*.18,s*.09);c.fill();c.fillStyle='#d8352a';rrp(c,-s*.75,-s*.16,s*1.5,s*.16,s*.08);c.fill();}const gg=c.createRadialGradient(-s*.2,-s*.6,s*.1,0,-s*.3,s*.9);gg.addColorStop(0,'#ffd58a');gg.addColorStop(1,'#c9772e');c.fillStyle=gg;c.beginPath();c.ellipse(0,g?-s*.18:-s*.02,s*.82,s*.62,0,Math.PI,0);c.fill();c.fillStyle='#fff6dc';for(let i=0;i<5;i++){c.beginPath();c.ellipse(-s*.4+i*s*.2,(g?-s*.5:-s*.34)-(i%2)*s*.12,s*.06,s*.035,.4,0,7);c.fill();}}
 else if(k==='soupe'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,s*.1,s*.8,s*.55,0,0,7);c.fill();c.fillStyle='#e5652e';c.beginPath();c.ellipse(0,0,s*.62,s*.36,0,0,7);c.fill();c.fillStyle='#f2c46a';for(let i=0;i<3;i++)c.fillRect(-s*.3+i*s*.22,-s*.08+(i%2)*s*.1,s*.14,s*.14);}
 else if(k==='salade'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,s*.1,s*.85,s*.55,0,0,7);c.fill();icon(c,'laitue_coupe',-s*.2,0,s*.7);icon(c,'tomate_coupe',s*.25,0,s*.55);}
 else if(k==='pot'||k==='pot_oignon'){c.fillStyle='#8d96a1';rrp(c,-s*.6,-s*.35,s*1.2,s*.8,s*.18);c.fill();c.fillStyle=k==='pot'?'#e5652e':'#c4893a';c.beginPath();c.ellipse(0,-s*.33,s*.55,s*.14,0,0,7);c.fill();c.fillStyle='#4a515c';c.fillRect(-s*.85,-s*.15,s*.25,s*.12);c.fillRect(s*.6,-s*.15,s*.25,s*.12);}
 else if(k==='knife'){c.rotate(-.7);c.fillStyle='#dfe5ec';rrp(c,-s*.12,-s*.7,s*.24,s*.85,s*.08);c.fill();c.fillStyle='#3b2a20';rrp(c,-s*.12,s*.15,s*.24,s*.5,s*.08);c.fill();}
 c.restore();
}
function shadeHex(h,a){const c=hex3(h).map(v=>Math.round(255*Math.max(0,Math.min(1,a<0?v*(1+a):v+(1-v)*a))));return 'rgb('+c.join(',')+')';}
function bar2(c,x,y,w,f,col){rrp(c,x-1.5,y-1.5,w+3,11,6);c.fillStyle='#1d1a26';c.fill();rrp(c,x,y,Math.max(4,w*Math.min(1,f)),8,4);c.fillStyle=col;c.fill();}
function bubble(c,x,y,keys){const n=keys.length,w=Math.max(34,n*26+10);rrp(c,x-w/2,y-17,w,34,17);c.fillStyle='rgba(255,255,255,.95)';c.fill();c.strokeStyle='rgba(30,20,40,.35)';c.lineWidth=1.5;c.stroke();keys.forEach((k,i)=>icon(c,k,x-(n-1)*13+i*26,y,10));}
function drawHUD(time){
 const cv=document.getElementById('hud'),c=cv.getContext('2d'),dpr=cv.width/cv.clientWidth,W=cv.clientWidth,H=cv.clientHeight;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);if(!G||!CAM)return;
 const sc=W/1200,P=(x,y,z)=>{const q=r3Project([x,y,z]);return {x:q.x/dpr,y:q.y/dpr};};
 const vg=c.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,6,20,.35)');c.fillStyle=vg;c.fillRect(0,0,W,H);
 drawDark(c,cv,dpr,W,H,P,time);
 // bulles au-dessus des postes
 for(const row of G.tiles)for(const t of row){
  const q=P(t.x+.5,CH+.75,t.z+.5);
  if(t.type==='board'&&t.item&&t.item.st==='cru'&&t.item.cp>0)bar2(c,q.x-24,q.y,48,t.item.cp,'#7ed37f');
  if(t.type==='sink'&&t.wp>0)bar2(c,q.x-24,q.y,48,t.wp,'#7fd0ff');
  if(t.type==='stove'){const pot=t.pot;if(t.fire>0){c.font='700 '+(26*sc+6)+'px "Baloo 2",sans-serif';c.textAlign='center';c.fillStyle=Math.sin(time*10)>0?'#ff4a2a':'#ffd23a';c.fillText('🔥',q.x,q.y-6);bar2(c,q.x-24,q.y+6,48,t.fire,'#ff5a3a');}
   else if(pot.c.length||pot.burnt){const keys=pot.burnt?[]:pot.done?[SOUPING[pot.c[0]]]:pot.c.slice();if(keys.length)bubble(c,q.x,q.y-26,keys);
    if(!pot.done&&!pot.burnt)bar2(c,q.x-24,q.y-2,48,pot.prog,'#7ed37f');
    if(pot.done){bar2(c,q.x-24,q.y-2,48,pot.burn,pot.burn>.55&&Math.sin(time*16)>0?'#ff4a2a':'#ffb347');if(pot.burn>.55){c.fillStyle='#ff4a2a';c.beginPath();c.arc(q.x+34,q.y-26,13,0,7);c.fill();c.fillStyle='#fff';c.font='800 18px sans-serif';c.textAlign='center';c.fillText('!',q.x+34,q.y-20);}}}}
  if(t.type==='pan'){const pn=t.pan;if(t.fire>0){}else if(pn.it&&pn.it.st==='cru')bar2(c,q.x-24,q.y-2,48,pn.prog,'#7ed37f');else if(pn.it&&pn.it.st==='cuit'){bubble(c,q.x,q.y-26,['steak_cuit']);bar2(c,q.x-24,q.y-2,48,pn.burn,pn.burn>.55&&Math.sin(time*16)>0?'#ff4a2a':'#ffb347');if(pn.burn>.55){c.fillStyle='#ff4a2a';c.beginPath();c.arc(q.x+34,q.y-26,13,0,7);c.fill();c.fillStyle='#fff';c.font='800 18px sans-serif';c.textAlign='center';c.fillText('!',q.x+34,q.y-20);}}}
  if(t.fire>0&&t.type!=='stove'){c.font='700 '+(26*sc+6)+'px "Baloo 2",sans-serif';c.textAlign='center';c.fillStyle=Math.sin(time*10)>0?'#ff4a2a':'#ffd23a';c.fillText('🔥',q.x,q.y-6);bar2(c,q.x-24,q.y+6,48,t.fire,'#ff5a3a');}
  if(t.item&&t.item.k==='assiette'&&t.item.c.length){const q2=P(t.x+.5,CH+.55,t.z+.5);bubble(c,q2.x,q2.y-14,plateIcons(t.item));}
 }
 for(const p of G.players){
  if(p.dead>0){const s=G.spawns[p.i],q2=P(s.x,.9,s.z);c.globalAlpha=.9;c.beginPath();c.arc(q2.x,q2.y,22,0,7);c.fillStyle='rgba(30,22,44,.85)';c.fill();c.lineWidth=4;c.strokeStyle=PCOL[p.i];c.beginPath();c.arc(q2.x,q2.y,22,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-p.dead/DEADT));c.stroke();
   c.fillStyle='#fff';c.font='800 22px "Baloo 2",sans-serif';c.textAlign='center';c.fillText(Math.ceil(p.dead),q2.x,q2.y+8);c.globalAlpha=1;continue;}
  const q=P(p.x,1.55,p.z);
  if(p.held&&p.held.k==='assiette'&&p.held.c.length)bubble(c,q.x+40,q.y+18,plateIcons(p.held));
  c.fillStyle=PCOL[p.i];c.beginPath();c.moveTo(q.x,q.y+4);c.lineTo(q.x-9,q.y-9);c.lineTo(q.x+9,q.y-9);c.closePath();c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke();
 }
 // particules
 for(const q of G.parts){const s=P(q.x,q.y,q.z),a=Math.max(0,q.life/q.max);c.globalAlpha=a;c.fillStyle=q.col;c.beginPath();c.arc(s.x,s.y,q.r*(q.kind==='steam'?1.6-a:1)*sc*1.3,0,7);c.fill();}c.globalAlpha=1;
 for(const f of G.floats){const s=P(f.x,f.y+(1-f.life/f.max)*.8,f.z),a=Math.min(1,f.life/f.max*2.5);c.globalAlpha=a;c.textAlign='center';
  if(f.big<0){c.font='700 15px "Baloo 2",sans-serif';const w=c.measureText(f.text).width+18;rrp(c,s.x-w/2,s.y-18,w,26,13);c.fillStyle='rgba(30,22,44,.85)';c.fill();c.fillStyle=f.col;c.fillText(f.text,s.x,s.y);}
  else{c.font='800 '+(f.big?26:18)+'px "Baloo 2",sans-serif';c.lineWidth=5;c.strokeStyle='rgba(30,22,44,.9)';c.strokeText(f.text,s.x,s.y);c.fillStyle=f.col;c.fillText(f.text,s.x,s.y);}c.globalAlpha=1;}
 // commandes
 G.orders.forEach((o,i)=>ticket(c,o,14+i*176,12,time));
 // pièces et chrono
 const by=H-70;rrp(c,14,by,190,56,28);c.fillStyle='rgba(30,22,44,.85)';c.fill();
 const cg=c.createRadialGradient(42,by+22,3,46,by+28,22);cg.addColorStop(0,'#fff6b0');cg.addColorStop(.4,'#ffcf3a');cg.addColorStop(1,'#c98a10');c.fillStyle=cg;c.beginPath();c.arc(46,by+28,20,0,7);c.fill();c.fillStyle='#8a5a00';c.font='800 18px "Baloo 2",sans-serif';c.textAlign='center';c.fillText('★',46,by+34);
 c.fillStyle='#fff';c.font='800 30px "Baloo 2",sans-serif';c.textAlign='left';c.fillText(G.score,76,by+39);
 if(G.streak>1){c.fillStyle='#ffd34d';c.font='800 16px "Baloo 2",sans-serif';c.fillText('×'+G.streak,150,by+38);}
 starBar(c,W/2,H-70,G.L.stars,G.served,time);
 const tm=Math.ceil(G.time),txt=Math.floor(tm/60)+':'+String(tm%60).padStart(2,'0');const tx=W-110,ty=H-70;
 rrp(c,tx,ty,96,56,28);c.fillStyle='rgba(30,22,44,.85)';c.fill();c.fillStyle=G.time<30&&Math.sin(time*8)>0?'#ff6a5a':'#ffffff';c.font='800 30px "Baloo 2",sans-serif';c.textAlign='center';c.fillText(txt,tx+48,ty+39);
 const f=G.time/G.L.dur;c.strokeStyle='#ffd34d';c.lineWidth=4;c.beginPath();c.arc(tx-26,ty+28,18,-Math.PI/2,-Math.PI/2+Math.PI*2*f);c.stroke();c.strokeStyle='rgba(255,255,255,.2)';c.beginPath();c.arc(tx-26,ty+28,18,0,7);c.stroke();
}
function drawDark(c,cv,dpr,W,H,P,time){
 const f=darkF();if(f<=0)return;
 if(!hx||hx.width!==cv.width||hx.height!==cv.height){hx=document.createElement('canvas');hx.width=cv.width;hx.height=cv.height;}
 const o=hx.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.clearRect(0,0,hx.width,hx.height);o.setTransform(dpr,0,0,dpr,0,0);
 o.fillStyle='rgba(6,4,22,'+(.93*f).toFixed(3)+')';o.fillRect(0,0,W,H);o.globalCompositeOperation='destination-out';
 const light=(x,y,z,r,k)=>{const a=P(x,y,z),b=P(x+r,y,z),R=Math.max(8,Math.hypot(b.x-a.x,b.y-a.y));const g=o.createRadialGradient(a.x,a.y,R*.2,a.x,a.y,R);g.addColorStop(0,'rgba(0,0,0,'+(k||1)+')');g.addColorStop(1,'rgba(0,0,0,0)');o.fillStyle=g;o.beginPath();o.arc(a.x,a.y,R,0,7);o.fill();};
 for(const p of G.players)if(!(p.dead>0))light(p.x,.6,p.z,1.9+Math.sin(time*7+p.i)*.06);
 for(const row of G.tiles)for(const t of row){if(t.fire>0)light(t.x+.5,CH,t.z+.5,1.7);
  else if(t.type==='stove'&&t.pot.c.length&&!t.pot.burnt||t.type==='pan'&&t.pan.it)light(t.x+.5,CH,t.z+.5,.75,.8);
  else if(t.type==='serve')light(t.x+.5,CH,t.z+.5,.9,.7);else if(t.g==='portal')light(t.x+.5,.1,t.z+.5,.8,.8);}
 c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(hx,0,0);c.restore();
 // halo chaud autour des chefs
 for(const p of G.players)if(!(p.dead>0)){const a=P(p.x,.6,p.z),b=P(p.x+1.6,.6,p.z),R=Math.hypot(b.x-a.x,b.y-a.y),g=c.createRadialGradient(a.x,a.y,0,a.x,a.y,R);g.addColorStop(0,'rgba(255,214,140,'+(.14*f).toFixed(3)+')');g.addColorStop(1,'rgba(255,214,140,0)');c.fillStyle=g;c.beginPath();c.arc(a.x,a.y,R,0,7);c.fill();}
}
function star5(c,x,y,r,fill,stroke){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=2.5;c.strokeStyle=stroke;c.stroke();}}
function starBar(c,cx,y,th,served,time){
 const w=300,x=cx-w/2,max=th[3]*1.12;rrp(c,x,y,w,56,28);c.fillStyle='rgba(30,22,44,.85)';c.fill();
 icon(c,'soupe',x+30,y+28,13);c.fillStyle='#fff';c.font='800 26px "Baloo 2",sans-serif';c.textAlign='center';c.fillText(served,x+62,y+37);
 const bx=x+86,bw=w-104,by=y+33;rrp(c,bx,by-5,bw,10,5);c.fillStyle='#463a5a';c.fill();rrp(c,bx,by-5,Math.max(8,bw*Math.min(1,served/max)),10,5);c.fillStyle='#ffd34d';c.fill();
 th.forEach((v,i)=>{const sx=bx+bw*v/max,on=served>=v;star5(c,sx,by-12,on?11+Math.max(0,Math.sin(time*5+i))*1.5:9,on?'#ffd34d':'#6b5d80',on?'#8a5a00':null);});
}
function plateIcons(it){return it.c.slice();}
const dishIcon=r=>r==='soupe'?'soupe':r==='oignon'?'soupe_oignon':r==='burger'||r==='burger_garni'?r:'salade';
function ticket(c,o,x,y,time){
 const R=RECIPES[o.r],w=164,h=122,f=Math.max(0,o.t/o.max),slide=Math.max(0,1-o.age*3),shake=o.t<12?Math.sin(time*30)*2:0;
 c.save();c.translate(x+shake,y-slide*60);c.globalAlpha=1-slide;
 rrp(c,2,4,w,h,14);c.fillStyle='rgba(0,0,0,.25)';c.fill();rrp(c,0,0,w,h,14);c.fillStyle=o.vip?'#fff1c2':'#fffaf0';c.fill();
 if(o.vip){c.lineWidth=4;c.strokeStyle='#f2b51a';c.stroke();c.fillStyle='#f2b51a';c.beginPath();c.moveTo(w-44,42);c.lineTo(w-40,26);c.lineTo(w-33,35);c.lineTo(w-26,24);c.lineTo(w-19,35);c.lineTo(w-12,26);c.lineTo(w-8,42);c.closePath();c.fill();c.fillStyle='#8a5a00';c.font='800 13px "Baloo 2",sans-serif';c.textAlign='center';c.fillText('×2',w-26,58);}
 const col=f>.5?'#5cc85a':f>.25?'#f2a23a':'#e8463a';rrp(c,6,6,(w-12)*f,10,5);c.fillStyle=col;c.fill();rrp(c,6,6,w-12,10,5);c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=1;c.stroke();
 icon(c,dishIcon(o.r),w/2,52,30);
 const pp=R.pipe;const step=Math.min(36,(w-16)/pp.length);pp.forEach((k,i)=>{const ix=w/2-(pp.length-1)*step/2+i*step;rrp(c,ix-16,86,32,30,8);c.fillStyle='#efe6d6';c.fill();icon(c,k==='pot'?(o.r==='oignon'?'pot_oignon':'pot'):k,ix,101,10);});
 c.restore();
}
function chefPortrait(cv,si,pi){const c=cv.getContext('2d'),S=SKINS[si],w=cv.width,h=cv.height;c.clearRect(0,0,w,h);
 const g=c.createRadialGradient(w*.4,h*.45,4,w/2,h*.58,w*.42);g.addColorStop(0,'#fff');g.addColorStop(.3,S.body);g.addColorStop(1,shadeHex(S.body,-.3));c.fillStyle=g;c.beginPath();c.ellipse(w/2,h*.6,w*.33,h*.33,0,0,7);c.fill();
 c.fillStyle=PCOL[pi];c.beginPath();c.ellipse(w/2,h*.74,w*.2,h*.17,0,0,7);c.fill();
 c.fillStyle='#1d120d';for(const sd of [-1,1]){c.beginPath();c.ellipse(w/2+sd*w*.11,h*.52,w*.04,h*.06,0,0,7);c.fill();}c.fillStyle='#fff';for(const sd of [-1,1]){c.beginPath();c.arc(w/2+sd*w*.11-2,h*.5,2,0,7);c.fill();}
 c.fillStyle='rgba(255,120,140,.7)';for(const sd of [-1,1]){c.beginPath();c.ellipse(w/2+sd*w*.2,h*.6,w*.05,h*.03,0,0,7);c.fill();}
 if(S.hat==='toque'){c.fillStyle='#fff';c.fillRect(w*.36,h*.2,w*.28,h*.12);c.beginPath();c.ellipse(w/2,h*.18,w*.22,h*.12,0,0,7);c.fill();}
 else if(S.hat==='cap'){c.fillStyle='#d4432f';c.beginPath();c.ellipse(w/2,h*.3,w*.4,h*.16,0,Math.PI,0);c.fill();c.fillStyle='#fff6ea';for(const [dx,r] of [[-.15,5],[.12,6],[0,4]]){c.beginPath();c.arc(w/2+dx*w,h*.24,r,0,7);c.fill();}}
 else if(S.hat==='stem'){c.strokeStyle='#3f8f3a';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(w/2,h*.3);c.quadraticCurveTo(w*.52,h*.16,w*.64,h*.14);c.stroke();}
 else if(S.hat==='leaves'){c.fillStyle='#4f9e3f';for(const a of [-.5,0,.5]){c.beginPath();c.ellipse(w/2+Math.sin(a)*12,h*.18,5,14,a,0,7);c.fill();}}
}
