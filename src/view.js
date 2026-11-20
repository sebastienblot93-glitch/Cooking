// ================= SCÈNE 3D =================
const PCOL=['#e8603c','#2a9d9f'],PNAME=['Soleil','Lune'];
const SKINS=[
 {id:'brioche',nom:'Brioche',body:'#f0b866',hat:'toque'},
 {id:'piment',nom:'Piment',body:'#e2463a',hat:'stem'},
 {id:'mochi',nom:'Mochi',body:'#f4eef8',hat:'toque'},
 {id:'radis',nom:'Radis',body:'#ec6b93',hat:'leaves'},
 {id:'champi',nom:'Champi',body:'#f1e3c9',hat:'cap'}
];
const Mx=(x,y,z,ry,rx,rz)=>M4.trs(x,y,z,ry||0,1,rx||0,rz||0);
function rbox(P,w,h,d,lx,ly,lz,col,o){o=o||{};put(geoRoundBox(w,h,d,o.r===undefined?.04:o.r,o.N||4),M4.mul(P,Mx(lx,ly+h/2,lz,o.ry,o.rx,o.rz)),col,o);}
function ell(P,rx,ry,rz,lx,ly,lz,col,o){o=o||{};put(geoEllipsoid(rx,ry,rz,o.seg||14),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
function cyl(P,rt,rb,h,lx,ly,lz,col,o){o=o||{};put(geoCyl(rt,rb,h,o.seg||20,!o.open),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
function torus(P,R,r,lx,ly,lz,col,o){o=o||{};put(geoTorus(R,r,o.seg||24,8),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
const ID=M4.ident();

// ---------- objets ----------
function tomato3(P,y,s){s=s||1;ell(P,.15*s,.13*s,.15*s,0,y+.13*s,0,'#e2382a',{gloss:.6});for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ell(P,.07*s,.015*s,.03*s,Math.cos(a)*.05*s,y+.255*s,Math.sin(a)*.05*s,'#3c9a3a',{ry:-a});}cyl(P,.015*s,.015*s,.05*s,0,y+.25*s,0,'#2f7a2c');}
function tomatoCut3(P,y,s){s=s||1;for(const [dx,dz,a] of [[-.08,.02,.3],[.07,.05,-.2],[0,-.07,.1]]){cyl(P,.1*s,.1*s,.035*s,dx*s,y,dz*s,'#d22f22',{rx:a*.4});cyl(P,.078*s,.078*s,.04*s,dx*s,y+.002,dz*s,'#f4836b',{rx:a*.4});}}
function lettuce3(P,y,s){s=s||1;ell(P,.19*s,.14*s,.19*s,0,y+.13*s,0,'#3f9a3a',{gloss:.3});for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ell(P,.11*s,.1*s,.11*s,Math.cos(a)*.1*s,y+.15*s,Math.sin(a)*.1*s,'#79c95a');}ell(P,.09*s,.08*s,.09*s,0,y+.24*s,0,'#b7e68c');}
function lettuceCut3(P,y,s){s=s||1;for(let i=0;i<7;i++){const a=i*1.7;rbox(P,.14*s,.03*s,.06*s,Math.cos(a)*.09*s,y+(i%3)*.012,Math.sin(a*1.3)*.08*s,i%2?'#5fae45':'#a6dd7c',{ry:a,r:.012});}}
function onion3(P,y,s){s=s||1;ell(P,.15*s,.14*s,.15*s,0,y+.14*s,0,'#e3a64e',{gloss:.6});for(let i=0;i<4;i++){const a=i/4*Math.PI;ell(P,.152*s,.12*s,.03*s,0,y+.14*s,0,'#c98a3a',{ry:a,a:.55});}cyl(P,.05*s,.012*s,.1*s,0,y+.25*s,0,'#b9772f');for(let i=0;i<3;i++)rbox(P,.012*s,.04*s,.012*s,(i-1)*.025*s,y-.005,0,'#6b4a2a',{r:.004});}
function onionCut3(P,y,s){s=s||1;for(const [dx,dz,R] of [[-.07,.03,.08],[.07,.05,.07],[0,-.07,.075]]){torus(P,R*s,.018*s,dx*s,y+.02,dz*s,'#f6ecd2',{seg:16});torus(P,R*.55*s,.016*s,dx*s,y+.02,dz*s,'#ead7a8',{seg:14});}}
function bunTop3(P,y,s){s=s||1;ell(P,.165*s,.1*s,.165*s,0,y,0,'#e39a48',{gloss:.55});for(let i=0;i<7;i++){const a=i*2.4,r=(.04+(i%3)*.035)*s;ell(P,.014*s,.007*s,.022*s,Math.cos(a)*r,y+.085*s-(r*r*1.4),Math.sin(a)*r,'#fff6dc',{ry:a});}}
function pain3(P,y,s){s=s||1;cyl(P,.15*s,.155*s,.05*s,0,y,0,'#f0c27a',{gloss:.2});bunTop3(P,y+.055*s,s);}
function steak3(P,y,st,s){s=s||1;const col=st==='cru'?'#d45f62':st==='cuit'?'#7d4528':'#2b1b14';
 ell(P,.17*s,.045*s,.15*s,0,y+.045*s,0,col,{gloss:st==='cru'?.6:.3});if(st==='cru')for(const [dx,dz] of [[-.05,.03],[.06,-.02],[0,.07]])ell(P,.03*s,.01*s,.02*s,dx*s,y+.085*s,dz*s,'#f4c4c0');
 if(st==='cuit')for(const i of [-1,0,1])rbox(P,.22*s,.008,.022*s,0,y+.083*s,i*.06*s,'#3e1e0e',{ry:.5,r:.004,noShadow:true});}
function burger3(P,y,c){let h=y;const bun=c.includes('pain');
 if(bun){cyl(P,.15,.155,.05,0,h,0,'#f0c27a');h+=.05;}
 if(c.includes('steak_cuit')){steak3(P,h-.01,'cuit',1);h+=.075;}
 if(c.includes('laitue_coupe')){ell(P,.18,.018,.17,0,h+.01,0,'#6fbe4f',{gloss:.3});ell(P,.15,.016,.15,.02,h+.02,-.02,'#9ad96f');h+=.035;}
 if(c.includes('tomate_coupe')){for(const [dx,dz] of [[-.06,0],[.06,.02]]){cyl(P,.075,.075,.025,dx,h,dz,'#d8352a',{gloss:.4});cyl(P,.058,.058,.027,dx,h,dz,'#f4836b');}h+=.03;}
 if(bun)bunTop3(P,h+.02,1);}
function plate3(P,y,dirty){cyl(P,.25,.21,.035,0,y,0,dirty?'#d8ccb8':'#f7f5f0',{seg:24,gloss:.5});torus(P,.215,.018,0,y+.035,0,dirty?'#cfc2ab':'#ffffff',{seg:24});if(dirty){cyl(P,.08,.08,.04,.05,y+.005,-.04,'#9a6a3a');cyl(P,.05,.05,.04,-.07,y+.005,.06,'#c0502e');}}
function plateFull3(P,y,c){plate3(P,y);const top=y+.04,sp=c.find(x=>SOUPS.has(x));
 if(c.includes('pain')||c.includes('steak_cuit')){burger3(P,top,c);return;}
 if(sp){const on=sp==='soupe_oignon';cyl(P,.16,.13,.07,0,top,0,'#ffffff',{gloss:.4});cyl(P,.135,.135,.072,0,top+.002,0,on?'#c4893a':'#e5652e',{gloss:.3});for(let i=0;i<3;i++)rbox(P,.045,.03,.045,Math.cos(i*2.1)*.06,top+.06,Math.sin(i*2.1)*.06,on?'#f6d58a':'#f2c46a',{r:.01});if(on)ell(P,.06,.012,.05,-.02,top+.075,.02,'#fff1c4');else ell(P,.025,.01,.04,.05,top+.08,-.03,'#3c9a3a');}
 else{if(c.includes('laitue_coupe'))lettuceCut3(Mx2(P,0,0,0,1),top,.95);if(c.includes('tomate_coupe'))tomatoCut3(Mx2(P,0,0,0,1),top+(c.includes('laitue_coupe')?.04:0),.8);}
}
const Mx2=(P,x,y,z,ry)=>M4.mul(P,Mx(x,y,z,ry));
function dirtyStack3(P,y,n){for(let i=0;i<Math.min(n,6);i++)plate3(Mx2(P,(i%2)*.02,0,0,i),y+i*.045,true);}
function ext3(P,y){cyl(P,.09,.09,.42,0,y,0,'#d8302a',{gloss:.7});ell(P,.09,.05,.09,0,y+.42,0,'#d8302a',{gloss:.7});cyl(P,.03,.03,.08,0,y+.45,0,'#222');rbox(P,.16,.03,.04,.06,y+.5,0,'#222',{r:.01});cyl(P,.02,.02,.2,-.1,y+.35,0,'#333',{rz:.6});rbox(P,.12,.06,.002,0,y+.18,.09,'#ffffff',{r:.005});}
function item3(it,P,y){if(!it)return;const k=key(it);
 if(k==='tomate_cru')tomato3(P,y);else if(k==='tomate_coupe')tomatoCut3(P,y+.02);else if(k==='laitue_cru')lettuce3(P,y);else if(k==='oignon_cru')onion3(P,y);else if(k==='pain')pain3(P,y);else if(it.k==='steak')steak3(P,y,it.st);else if(k==='oignon_coupe')onionCut3(P,y);else if(k==='laitue_coupe')lettuceCut3(P,y);
 else if(it.k==='assiette')plateFull3(P,y,it.c);else if(it.k==='sales')dirtyStack3(P,y,it.n);else if(it.k==='extincteur')ext3(P,y);}

// ---------- souris ----------
function mouse3(m,time){const run=Math.sin(m.t*28),P=M4.trs(m.x,Math.abs(run)*.03,m.z,m.a,1.5);
 ell(P,.11,.085,.16,0,.09,0,'#9c98a6',{gloss:.3});ell(P,.08,.07,.08,0,.13,.15,'#a7a3b1');ell(P,.025,.02,.03,0,.12,.24,'#f08aa0');
 for(const sd of [-1,1]){ell(P,.05,.055,.012,sd*.06,.21,.12,'#a7a3b1');ell(P,.035,.04,.01,sd*.06,.21,.125,'#f6b3c3');ell(P,.016,.018,.012,sd*.035,.16,.215,'#141018');ell(P,.006,.006,.004,sd*.03,.168,.226,'#ffffff');}
 for(let i=0;i<5;i++)ell(P,.014,.014,.03,Math.sin(m.t*8+i)*.02*i,.06+i*.012,-.17-i*.05,'#d9a3b0');
 for(const sd of [-1,1])ell(P,.03,.02,.04,sd*.07,.02,(sd*run)*.04+.02,'#8c8896');
 if(m.item){const Q=M4.mul(P,M4.trs(0,.16,-.02,0,.55));item3(m.item,Q,0);}}

// ---------- personnages ----------
function chef3(p,time){
 const S=SKINS[p.skin]||SKINS[0],ang=Math.atan2(p.dir.x,p.dir.z),ph=Math.sin(p.walk),bob=Math.abs(ph)*.05+(p.moving?0:Math.sin(time*3+p.i)*.012),lean=p.dash>0?.25:(p.moving?.08:0);
 let sink=0;if(p.dead>0){const k=DEADT-p.dead;if(k>.8)return;sink=k*1.4;}
 const P=M4.mul(M4.trs(p.x,-sink,p.z,ang,1.22),Mx(0,0,0,0,lean));
 for(const sd of [-1,1]){const sw=p.moving?Math.sin(p.walk+(sd>0?Math.PI:0))*.1:0;ell(P,.09,.065,.13,sd*.13,.06+Math.max(0,sw)*.4,sw,'#3a2a22',{gloss:.2});}
 const B=M4.mul(P,Mx(0,bob,0));
 ell(B,.31,.36,.29,0,.5,0,S.body,{gloss:.25,seg:20});
 ell(B,.23,.25,.09,0,.4,.215,PCOL[p.i],{seg:16});ell(B,.09,.06,.03,0,.47,.29,'#ffffff',{a:.35});
 rbox(B,.06,.12,.02,-.18,.52,.2,PCOL[p.i],{rz:.5,r:.01});rbox(B,.06,.12,.02,.18,.52,.2,PCOL[p.i],{rz:-.5,r:.01});
 // visage
 const blink=(Math.sin(time*1.7+p.i*3)>.985);
 for(const sd of [-1,1]){if(blink)rbox(B,.07,.012,.02,sd*.1,.64,.265,'#1d120d',{r:.005});else{ell(B,.045,.06,.03,sd*.1,.64,.262,'#1d120d',{gloss:.8});ell(B,.016,.016,.01,sd*.1-.012,.665,.29,'#ffffff');}
  ell(B,.05,.028,.02,sd*.18,.56,.245,'#ff8a9a',{a:.75});}
 rbox(B,.07,.02,.02,0,.56,.275,'#6a2a20',{r:.008});
 // chapeau
 if(S.hat==='toque'){cyl(B,.17,.17,.15,0,.82,0,'#ffffff');ell(B,.23,.13,.23,0,1.0,0,'#ffffff',{gloss:.2});ell(B,.15,.1,.15,.08,1.06,-.04,'#ffffff');}
 else if(S.hat==='cap'){ell(B,.4,.17,.4,0,.86,0,'#d4432f',{gloss:.4,seg:20});for(const [dx,dz,r] of [[-.18,.12,.06],[.12,-.15,.07],[.2,.15,.05],[-.05,-.02,.05]])ell(B,r,r*.5,r,dx,.98,dz,'#fff6ea');}
 else if(S.hat==='stem'){cyl(B,.04,.06,.2,0,.82,0,'#3f8f3a',{rz:.4});ell(B,.14,.04,.14,0,.84,0,'#3f8f3a');}
 else if(S.hat==='leaves'){for(const a of [-.5,0,.5])ell(B,.07,.2,.04,Math.sin(a)*.08,1.0,0,'#4f9e3f',{rz:a});cyl(B,.12,.12,.06,0,.82,0,'#ffffff');}
 // mains + objet tenu
 const chop=p.chopping?Math.abs(Math.sin(time*16))*.12:0,spray=p.spraying?Math.sin(time*30)*.01:0;
 if(p.held){for(const sd of [-1,1])ell(B,.085,.085,.085,sd*.22,.52-(sd<0?chop:0),.3+spray,S.body,{gloss:.3});item3(p.held,M4.mul(B,Mx(0,0,.44)),p.held.k==='extincteur'?.32:.52);}
 else{for(const sd of [-1,1]){const sw=p.moving?Math.sin(p.walk+(sd>0?0:Math.PI))*.12:0;ell(B,.085,.085,.085,sd*.34,.42-(sd<0?chop:0)+(p.chopping?.12:0),sw+(p.chopping?.22:0),S.body,{gloss:.3});}}
}

// ---------- cuisine ----------
function counterBody(t,P,body,top,noTop){const j=(t.seed-.5)*.08;rbox(P,.98,CH-.07,.98,0,0,0,body,{r:.05});rbox(P,.78,.36,.02,0,.16,.485,shade3(body,-.12),{r:.03});rbox(P,.16,.03,.03,0,.42,.5,'#f2d49a',{r:.012,gloss:.8});
 if(!noTop){rbox(P,1.0,.08,1.0,0,CH-.08,0,shade3(top,j),{r:.035,gloss:.3});rbox(P,.96,.006,.96,0,CH,0,shade3(top,.12+j),{r:.02,a:.35,noShadow:true});}}
function shade3(h,a){const c=hex3(h);return c.map(v=>Math.max(0,Math.min(1,a<0?v*(1+a):v+(1-v)*a)));}
function drawKitchen(time){
 const L=G.L,th=L.theme,W=G.W,H=G.H;
 put(geoPlane(80,80),Mx(W/2,-.02,H/2),'#2b2638',{noShadow:true});
 put(geoPlane(W,H),Mx(W/2,0,H/2),th.floor,{floor:1,noShadow:true});
 // murs
 rbox(ID,W+.6,2.7,.3,W/2,0,-.15,th.wall,{floor:2,r:.02});rbox(ID,W+.6,.12,.36,W/2,2.7,-.15,th.trim,{r:.03});
 rbox(ID,.22,1.0,H+.2,-.11,0,H/2-.1,th.wall,{floor:2,r:.02});rbox(ID,.22,1.0,H+.2,W+.11,0,H/2-.1,th.wall,{floor:2,r:.02});
 rbox(ID,.26,.07,H+.24,-.11,1.0,H/2-.1,shade3(th.wall,-.25),{r:.02});rbox(ID,.26,.07,H+.24,W+.11,1.0,H/2-.1,shade3(th.wall,-.25),{r:.02});
 // déco murale : étagère, casseroles, fenêtre
 rbox(ID,2.2,.06,.28,1.6,1.85,-.02+.14,'#8a5a36');for(let i=0;i<3;i++)cyl(ID,.12,.12,.2,1.0+i*.6,1.91,.14,['#d9a441','#c4573a','#5aa0b0'][i],{gloss:.5});
 for(let i=0;i<3;i++){const x=W-2.6+i*.55;cyl(ID,.015,.015,.4,x,1.7,.08,'#555');cyl(ID,.17,.17,.07,x,1.6,.12,'#b8bec6',{rx:1.3,gloss:.8});}
 rbox(ID,1.5,1.0,.05,W/2,1.35,.02,'#cfeaf7',{r:.03,e:'#283848'});rbox(ID,1.6,.08,.08,W/2,1.31,.06,th.trim,{r:.02});rbox(ID,.05,1.0,.06,W/2,1.35,.05,th.trim,{r:.01});
 for(const x of [W*.3,W*.7]){cyl(ID,.01,.01,.6,x,2.6,.6,'#333',{noShadow:true});cyl(ID,.22,.08,.18,x,2.42,.6,th.trim,{noShadow:true,e:'#3a2a10'});ell(ID,.08,.06,.08,x,2.4,.6,'#fff7d0',{e:'#ffe9a0',noShadow:true});}
 for(const row of G.tiles)for(const t of row){const P=Mx(t.x+.5,0,t.z+.5);if(t.type==='floor'){if(t.g)drawGround(t,P,time);continue;}drawTile(t,P,time,th);if(t.fire>0&&t.type!=='stove')fire3(P,CH+.05,time,t.fire);}
 for(const m of G.mice)mouse3(m,time);
}
function drawTile(t,P,time,th){
 const top=CH;
 switch(t.type){
  case 'counter':counterBody(t,P,th.body,th.top);if(t.ch==='E'&&!t.item){rbox(P,.3,.02,.3,0,top,0,'#c0392b',{r:.01,a:.5});}item3(t.item,P,top);break;
  case 'crate':{counterBody(t,P,'#9a6236','#b9834f');const c='#c58a52';rbox(P,.8,.3,.06,0,top,.37,c,{r:.02});rbox(P,.8,.3,.06,0,top,-.37,c,{r:.02});rbox(P,.06,.3,.8,.37,top,0,c,{r:.02});rbox(P,.06,.3,.8,-.37,top,0,c,{r:.02});
   for(const [dx,dz] of [[-.17,-.15],[.16,-.12],[-.12,.15],[.17,.16],[0,0]]){const Q=Mx2(P,dx,0,dz,dx*7);if(t.ing==='tomate')tomato3(Q,top+.06,.9);else if(t.ing==='oignon')onion3(Q,top+.05,.85);else if(t.ing==='pain')pain3(Q,top+.03,.8);else if(t.ing==='steak')steak3(Q,top+.03,'cru',.85);else lettuce3(Q,top+.04,.75);}
   rbox(P,.36,.2,.02,0,top-.42,.5,'#fff3d6',{r:.02});if(t.ing==='tomate')ell(P,.07,.06,.02,0,top-.32,.515,'#e2382a');else if(t.ing==='oignon')ell(P,.07,.065,.02,0,top-.32,.515,'#e3a64e');else if(t.ing==='pain')ell(P,.08,.055,.02,0,top-.32,.515,'#e39a48');else if(t.ing==='steak')ell(P,.08,.05,.02,0,top-.32,.515,'#d45f62');else ell(P,.08,.06,.02,0,top-.32,.515,'#58b13f');break;}
  case 'board':{counterBody(t,P,th.body,th.top);rbox(P,.66,.05,.46,0,top,0,'#dba36a',{r:.03,gloss:.2});
   const chopping=G.players.some(p=>p.chopping&&p.workTile===t),k=chopping?Math.abs(Math.sin(time*16))*.12:0;
   rbox(P,.05,.02,.32,.27,top+.06+k,.0,'#dfe5ec',{gloss:1,r:.008,ry:.2,rx:chopping?-.4:0});rbox(P,.05,.04,.12,.3,top+.06+k,.21,'#3b2a20',{r:.01,ry:.2});
   item3(t.item,P,top+.05);break;}
  case 'stove':{counterBody(t,P,'#4a4f58','#6f7782');torus(P,.26,.025,0,top+.01,0,'#2a2d33');
   const pot=t.pot,cooking=pot.c.length&&!pot.done&&!pot.burnt;if(cooking||pot.done)for(let i=0;i<10;i++){const a=i/10*Math.PI*2+time;ell(P,.03,.045,.03,Math.cos(a)*.24,top+.04,Math.sin(a)*.24,'#3d8bff',{e:'#3d8bff',a:.8,noShadow:true});}
   cyl(P,.29,.26,.26,0,top+.02,0,'#b9c1cb',{gloss:.9,seg:24,open:true,ds:true});cyl(P,.26,.26,.01,0,top+.03,0,'#2b2f35');torus(P,.285,.03,0,top+.28,0,'#dfe4ea',{seg:24});cyl(P,.25,.25,.005,0,top+.06,0,'#2b2f35');rbox(P,.12,.04,.06,.33,top+.2,0,'#2a2d33',{r:.015});rbox(P,.12,.04,.06,-.33,top+.2,0,'#2a2d33',{r:.015});
   if(!pot.c.length&&!pot.burnt)cyl(P,.25,.25,.01,0,top+.1,0,'#3a3f46');
   if(pot.c.length||pot.burnt){const on=pot.c[0]==='oignon',lvl=top+.1+Math.min(3,pot.c.length||3)*.05,col=pot.burnt?'#2a201c':pot.done?(on?'#c4893a':'#e5652e'):(on?'#e2c27a':'#d8503a');cyl(P,.25,.25,.02,0,lvl,0,col,{gloss:.5});
    if(!pot.done&&!pot.burnt)for(let i=0;i<pot.c.length;i++)(on?onionCut3:tomatoCut3)(Mx2(P,Math.cos(i*2.1)*.1,0,Math.sin(i*2.1)*.1,i),lvl+.02,.6);
    if(pot.done||cooking)for(let i=0;i<3;i++){const ph=(time*1.3+i/3)%1;ell(P,.03+ph*.03,.03+ph*.03,.03+ph*.03,Math.cos(i*2)*.1,lvl+.03,Math.sin(i*2)*.1,on?'#f6e0a8':'#ffb59a',{a:1-ph,noShadow:true});}}
   if(t.fire>0)fire3(P,top+.2,time,t.fire);break;}
  case 'sink':{counterBody(t,P,th.body,'#c9d3dc',true);const st='#c9d3dc';rbox(P,1.0,.08,.16,0,top-.08,.42,st,{r:.03,gloss:.8});rbox(P,1.0,.08,.16,0,top-.08,-.42,st,{r:.03,gloss:.8});rbox(P,.16,.08,1.0,.42,top-.08,0,st,{r:.03,gloss:.8});rbox(P,.16,.08,1.0,-.42,top-.08,0,st,{r:.03,gloss:.8});
   rbox(P,.7,.02,.7,0,top-.075,0,'#2b4d63',{r:.02});
   rbox(P,.68,.008,.68,0,top-.03,0,'#7cc3e6',{r:.01,a:.75,gloss:1,noShadow:true});
   cyl(P,.03,.03,.35,0,top,-.38,'#c9cfd6',{gloss:1});cyl(P,.025,.025,.2,0,top+.33,-.38,'#c9cfd6',{rx:1.57,gloss:1});
   if(t.dirty>0)dirtyStack3(Mx2(P,.05,0,.05,.3),top-.06,t.dirty);
   const washing=G.players.some(p=>p.chopping&&p.workTile===t);if(washing)for(let i=0;i<6;i++){const a=time*4+i;ell(P,.05,.05,.05,Math.cos(a)*.18,top+.06+Math.abs(Math.sin(a*2))*.05,Math.sin(a)*.15,'#ffffff',{a:.7,noShadow:true});}
   break;}
  case 'rack':{counterBody(t,P,th.body,th.top);rbox(P,.7,.04,.6,0,top,0,'#8a5a36',{r:.02});for(let i=0;i<Math.min(t.cnt,8);i++)plate3(P,top+.04+i*.045);break;}
  case 'dirty':{counterBody(t,P,'#6b7380','#8f98a5');rbox(P,.7,.04,.6,0,top,0,'#5b6370',{r:.02});dirtyStack3(P,top+.04,t.cnt);break;}
  case 'serve':{rbox(P,.98,CH-.07,.98,0,0,0,'#c0392b',{r:.05});rbox(P,1.0,.08,1.0,0,CH-.08,0,'#f2c14e',{r:.035,gloss:.6});rbox(P,.8,.03,.86,0,top-.01,0,'#1d1d24',{r:.02});
   for(let i=0;i<5;i++){const z=((time*.6+i/5)%1)*.8-.4;rbox(P,.74,.02,.08,0,top+.02,z,'#3b3b46',{r:.01});}
   ell(P,.11,.08,.11,.3,top+.03,-.34,'#f2c14e',{gloss:1});cyl(P,.02,.02,.04,.3,top+.11,-.34,'#f2c14e');
   rbox(P,.06,.5,.06,-.45,top,-.45,'#f2c14e',{r:.02});rbox(P,.06,.5,.06,-.45,top,.45,'#f2c14e',{r:.02});rbox(P,.06,.06,.96,-.45,top+.5,0,'#f2c14e',{r:.02});break;}
  case 'belt':{counterBody(t,P,'#596273','#596273',true);const [dx,dz]=t.bd,Q=M4.mul(P,Mx(0,0,0,Math.atan2(dx,dz)));
   rbox(Q,1.0,.06,1.0,0,top-.09,0,'#7c8594',{r:.02,gloss:.6});rbox(Q,.78,.03,1.0,0,top-.04,0,'#2a2d34',{r:.01});
   for(let i=0;i<5;i++){const s=((time/BELTT+i/5)%1)-.5;rbox(Q,.76,.014,.05,0,top-.012,s,'#565c68',{r:.004,noShadow:true});}
   rbox(Q,.1,.1,1.0,-.45,top-.07,0,'#c9ced6',{r:.03,gloss:.9});rbox(Q,.1,.1,1.0,.45,top-.07,0,'#c9ced6',{r:.03,gloss:.9});
   rbox(Q,.05,.012,.2,-.06,top+.02,.3,'#ffd34d',{ry:.8,r:.005,e:'#5a4400',noShadow:true});rbox(Q,.05,.012,.2,.06,top+.02,.3,'#ffd34d',{ry:-.8,r:.005,e:'#5a4400',noShadow:true});
   if(t.item){const off=t.bp-.5;item3(t.item,M4.mul(P,Mx(dx*off,0,dz*off)),top);}break;}
  case 'pan':{counterBody(t,P,'#4a4f58','#6f7782');torus(P,.26,.025,0,top+.01,0,'#2a2d33');const pn=t.pan,it=pn.it,on=it&&it.st!=='brule'&&!(t.fire>0);
   if(on)for(let i=0;i<10;i++){const a=i/10*Math.PI*2+time;ell(P,.03,.045,.03,Math.cos(a)*.24,top+.04,Math.sin(a)*.24,'#3d8bff',{e:'#3d8bff',a:.8,noShadow:true});}
   cyl(P,.3,.26,.07,0,top+.03,0,'#2c2f36',{gloss:.7,seg:24});cyl(P,.27,.27,.005,0,top+.1,0,'#3a3e46',{gloss:.9});torus(P,.29,.02,0,top+.1,0,'#3e434c',{seg:24});
   rbox(P,.36,.04,.07,.46,top+.07,0,'#2a2016',{r:.02,rz:-.12});
   if(it){const jig=it.st==='cru'||it.st==='cuit'?Math.sin(time*30)*.004:0;steak3(P,top+.1+jig,it.st,1);}
   break;}
  case 'hole':{counterBody(t,P,th.body,th.top);const f=NB.find(([dx,dz])=>{const n=T(t.x+dx,t.z+dz);return n&&n.type==='floor';})||[0,1],Q=M4.mul(P,Mx(0,0,0,Math.atan2(f[0],f[1])));
   ell(Q,.2,.2,.04,0,0,.49,'#120c10',{noShadow:true});ell(Q,.23,.23,.03,0,0,.485,shade3(th.body,-.35));rbox(Q,.12,.06,.1,.32,top,.15,'#f6d04a',{r:.02,rz:.2});break;}
  case 'trash':{counterBody(t,P,th.body,th.top);cyl(P,.24,.2,.3,0,top,0,'#5e6672',{gloss:.4});cyl(P,.26,.26,.04,0,top+.3,0,'#4a515c',{gloss:.4});rbox(P,.16,.04,.04,0,top+.34,0,'#2a2d33',{r:.01});break;}
 }
}
function drawGround(t,P,time){
 const g=t.g;
 if(g==='ice'){rbox(P,.99,.02,.99,0,0,0,(t.x+t.z)%2?'#a9dcf3':'#9cd3ee',{r:.012,gloss:1,a:.92});rbox(P,.5,.004,.03,(t.seed-.5)*.5,.021,(t.seed*3%1-.5)*.6,'#f4fbff',{r:.002,ry:t.seed*9,a:.85,noShadow:true});if(t.seed<.4)rbox(P,.3,.004,.02,(t.seed*7%1-.5)*.6,.021,(t.seed*5%1-.5)*.6,'#ffffff',{r:.002,ry:t.seed*13,a:.7,noShadow:true});return;}
 if(g==='water'||isBridge(t)){water3(t,P,time,!isBridge(t));if(isBridge(t))bridge3(t,P,time);return;}
 if(g==='portal'){const col=portalCol(t),dk=shade3(col,-.55),sp=time*2.2*(t.ch==='@'||t.ch==='%'?1:-1),pu=.5+Math.sin(time*4+t.x)*.5;
  cyl(P,.42,.42,.014,0,.003,0,'#140c26',{noShadow:true});torus(P,.38,.055,0,.035,0,col,{e:dk,gloss:.8,seg:28});
  cyl(P,.33,.33,.012,0,.016,0,col,{a:.75,e:dk,noShadow:true});cyl(P,.2+pu*.08,.2+pu*.08,.014,0,.02,0,'#ffffff',{a:.35,e:col,noShadow:true});
  cyl(P,.36,.3,.9,0,.02,0,col,{open:true,ds:true,a:.16+pu*.06,e:col,noShadow:true});
  for(let i=0;i<4;i++){const a=sp+i*Math.PI/2;ell(P,.07,.014,.028,Math.cos(a)*.24,.04,Math.sin(a)*.24,'#ffffff',{e:col,ry:-a,noShadow:true});}
  return;}
 if(g==='conv'){const [dx,dz]=t.push,Q=M4.mul(P,Mx(0,0,0,Math.atan2(dx,dz)));
  rbox(Q,.98,.03,.98,0,0,0,'#3b404c',{r:.01});rbox(Q,.07,.04,.98,-.46,0,0,'#f2c14e',{r:.012});rbox(Q,.07,.04,.98,.46,0,0,'#f2c14e',{r:.012});
  for(let i=0;i<2;i++){const s=((time*CONVV+i*.5)%1)-.5;rbox(Q,.05,.012,.32,-.1,.03,s,'#ffd34d',{ry:.8,e:'#4a3800',r:.005,noShadow:true});rbox(Q,.05,.012,.32,.1,.03,s,'#ffd34d',{ry:-.8,e:'#4a3800',r:.005,noShadow:true});}}
}
function water3(t,P,time,curbs){
 rbox(P,1.0,.014,1.0,0,0,0,'#2f86c4',{r:0,gloss:1,e:'#08243e',noShadow:true});
 for(let i=0;i<2;i++){const ph=(time*.35+t.seed+i*.5)%1;ell(P,.16+ph*.1,.004,.05+ph*.03,(t.seed-.5)*.5,.018,ph-.5,'#c9ecff',{a:(1-ph)*.55,noShadow:true});}
 if(curbs)for(const [dx,dz] of NB){const n=T(t.x+dx,t.z+dz);if(n&&n.type==='floor'&&n.g!=='water'&&!isBridge(n))rbox(P,dx?.09:1.0,.09,dz?.09:1.0,dx*.455,0,dz*.455,'#a3abb5',{r:.025});}
}
function bridge3(t,P,time){
 const f=bridgeF(t.g),left=bridgeLeft(t.g),warn=left>0&&left<2.4&&Math.sin(time*14)>0;if(f<=0)return;
 const n1=T(t.x-1,t.z),n2=T(t.x+1,t.z),alongX=!!(n1&&n1.type==='floor'&&n1.g!=='water'||n2&&n2.type==='floor'&&n2.g!=='water');
 const Q=alongX?P:M4.mul(P,Mx(0,0,0,Math.PI/2)),y=-(1-f)*.32,col=warn?'#e8783a':'#b07a45';
 for(let i=0;i<4;i++)rbox(Q,.21,.07,.94,-.375+i*.25,y,0,shade3(col,(i%2)*.08-.04),{r:.02});
 for(const sd of [-1,1])rbox(Q,1.0,.05,.06,0,y+.07,sd*.44,'#7a5230',{r:.015});
}
function fire3(P,y,time,f){for(let i=0;i<7;i++){const a=i*.9+time*2,r=.1+.06*Math.sin(time*9+i),h=(.18+.14*Math.abs(Math.sin(time*7+i*2)))*(.6+f*.5);
 ell(P,r,h,r,Math.cos(a)*.13,y+h*.8,Math.sin(a)*.13,i%2?'#ff7a1a':'#ffd23a',{e:i%2?'#ff5a00':'#ffb000',a:.85,noShadow:true});}}

// ---------- caméra et image ----------
let CAM=null;
function camFor(W,H,asp){const cx=W/2,cz=H/2+.35,need=Math.max(W*1.08/asp,H*1.22);const dist=need/(2*Math.tan(.36))*1.0;
 return {fov:.72*1.0,eye:[cx,dist*.8,cz+dist*.7],at:[cx,0,cz+.35],light:normalize3([-.42,-1,-.38]),shR:Math.max(W,H)*.82,bg:hex3('#2b2638')};}
function normalize3(v){const l=Math.hypot(...v);return v.map(x=>x/l);}
function render3D(time){
 if(!G||!R3.ready)return;
 const cv=document.getElementById('gl'),W=cv.width,H=cv.height;CAM=camFor(G.W,G.H,W/H);
 drawKitchen(time);for(const p of G.players)chef3(p,time);
 const me=G.players[meI()];if(me&&me.target&&state==='play'){const t=me.target;put(geoRoundBox(1.0,.02,1.0,.01,2),Mx(t.x+.5,CH+.012,t.z+.5),'#ffffff',{a:.22+Math.sin(time*6)*.08,e:'#ffffff',noShadow:true});}
 R3.count=R3.list.length;
 r3Render(W,H,CAM);
}
