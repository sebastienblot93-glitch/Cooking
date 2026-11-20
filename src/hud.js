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
 else if(k==='soupe'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,s*.1,s*.8,s*.55,0,0,7);c.fill();c.fillStyle='#e5652e';c.beginPath();c.ellipse(0,0,s*.62,s*.36,0,0,7);c.fill();c.fillStyle='#f2c46a';for(let i=0;i<3;i++)c.fillRect(-s*.3+i*s*.22,-s*.08+(i%2)*s*.1,s*.14,s*.14);}
 else if(k==='salade'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,s*.1,s*.85,s*.55,0,0,7);c.fill();icon(c,'laitue_coupe',-s*.2,0,s*.7);icon(c,'tomate_coupe',s*.25,0,s*.55);}
 else if(k==='pot'){c.fillStyle='#8d96a1';rrp(c,-s*.6,-s*.35,s*1.2,s*.8,s*.18);c.fill();c.fillStyle='#e5652e';c.beginPath();c.ellipse(0,-s*.33,s*.55,s*.14,0,0,7);c.fill();c.fillStyle='#4a515c';c.fillRect(-s*.85,-s*.15,s*.25,s*.12);c.fillRect(s*.6,-s*.15,s*.25,s*.12);}
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
 // bulles au-dessus des postes
 for(const row of G.tiles)for(const t of row){
  const q=P(t.x+.5,CH+.75,t.z+.5);
  if(t.type==='board'&&t.item&&t.item.st==='cru'&&t.item.cp>0)bar2(c,q.x-24,q.y,48,t.item.cp,'#7ed37f');
  if(t.type==='sink'&&t.wp>0)bar2(c,q.x-24,q.y,48,t.wp,'#7fd0ff');
  if(t.type==='stove'){const pot=t.pot;if(t.fire>0){c.font='700 '+(26*sc+6)+'px "Baloo 2",sans-serif';c.textAlign='center';c.fillStyle=Math.sin(time*10)>0?'#ff4a2a':'#ffd23a';c.fillText('🔥',q.x,q.y-6);bar2(c,q.x-24,q.y+6,48,t.fire,'#ff5a3a');}
   else if(pot.c.length||pot.burnt){const keys=pot.burnt?[]:pot.done?['soupe']:pot.c.map(()=> 'tomate');if(keys.length)bubble(c,q.x,q.y-26,keys);
    if(!pot.done&&!pot.burnt)bar2(c,q.x-24,q.y-2,48,pot.prog,'#7ed37f');
    if(pot.done){bar2(c,q.x-24,q.y-2,48,pot.burn,pot.burn>.55&&Math.sin(time*16)>0?'#ff4a2a':'#ffb347');if(pot.burn>.55){c.fillStyle='#ff4a2a';c.beginPath();c.arc(q.x+34,q.y-26,13,0,7);c.fill();c.fillStyle='#fff';c.font='800 18px sans-serif';c.textAlign='center';c.fillText('!',q.x+34,q.y-20);}}}}
  if(t.item&&t.item.k==='assiette'&&t.item.c.length){const q2=P(t.x+.5,CH+.55,t.z+.5);bubble(c,q2.x,q2.y-14,plateIcons(t.item));}
 }
 for(const p of G.players){
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
 const tm=Math.ceil(G.time),txt=Math.floor(tm/60)+':'+String(tm%60).padStart(2,'0');const tx=W-110,ty=H-70;
 rrp(c,tx,ty,96,56,28);c.fillStyle='rgba(30,22,44,.85)';c.fill();c.fillStyle=G.time<30&&Math.sin(time*8)>0?'#ff6a5a':'#ffffff';c.font='800 30px "Baloo 2",sans-serif';c.textAlign='center';c.fillText(txt,tx+48,ty+39);
 const f=G.time/G.L.dur;c.strokeStyle='#ffd34d';c.lineWidth=4;c.beginPath();c.arc(tx-26,ty+28,18,-Math.PI/2,-Math.PI/2+Math.PI*2*f);c.stroke();c.strokeStyle='rgba(255,255,255,.2)';c.beginPath();c.arc(tx-26,ty+28,18,0,7);c.stroke();
}
function plateIcons(it){return it.c.map(k=>k==='soupe'?'soupe':k);}
function ticket(c,o,x,y,time){
 const R=RECIPES[o.r],w=164,h=122,f=Math.max(0,o.t/o.max),slide=Math.max(0,1-o.age*3),shake=o.t<12?Math.sin(time*30)*2:0;
 c.save();c.translate(x+shake,y-slide*60);c.globalAlpha=1-slide;
 rrp(c,2,4,w,h,14);c.fillStyle='rgba(0,0,0,.25)';c.fill();rrp(c,0,0,w,h,14);c.fillStyle='#fffaf0';c.fill();
 const col=f>.5?'#5cc85a':f>.25?'#f2a23a':'#e8463a';rrp(c,6,6,(w-12)*f,10,5);c.fillStyle=col;c.fill();rrp(c,6,6,w-12,10,5);c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=1;c.stroke();
 icon(c,o.r==='soupe'?'soupe':'salade',w/2,52,30);
 const pp=R.pipe;const step=Math.min(36,(w-16)/pp.length);pp.forEach((k,i)=>{const ix=w/2-(pp.length-1)*step/2+i*step;rrp(c,ix-16,86,32,30,8);c.fillStyle='#efe6d6';c.fill();icon(c,k==='pot'?'pot':k==='knife'?'knife':k,ix,101,10);});
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
