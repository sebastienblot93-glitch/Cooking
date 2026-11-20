// ================= SCÈNE 3D =================
const PCOL=['#e8603c','#2a9d9f'],PNAME=['Soleil','Lune'];
const Mx=(x,y,z,ry,rx,rz)=>M4.trs(x,y,z,ry||0,1,rx||0,rz||0);
function rbox(P,w,h,d,lx,ly,lz,col,o){o=o||{};put(geoRoundBox(w,h,d,o.r===undefined?.04:o.r,o.N||4),M4.mul(P,Mx(lx,ly+h/2,lz,o.ry,o.rx,o.rz)),col,o);}
function ell(P,rx,ry,rz,lx,ly,lz,col,o){o=o||{};put(geoEllipsoid(rx,ry,rz,o.seg||14),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
function cyl(P,rt,rb,h,lx,ly,lz,col,o){o=o||{};put(geoCyl(rt,rb,h,o.seg||20,!o.open),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
function torus(P,R,r,lx,ly,lz,col,o){o=o||{};put(geoTorus(R,r,o.seg||24,8),M4.mul(P,Mx(lx,ly,lz,o.ry,o.rx,o.rz)),col,o);}
const ID=M4.ident();

// ---------- objets ----------
const OLI=.009,WH='#ffffff';
const ITEMK={tomate_cru:'tomate',tomate_coupe:'tomate_coupe',laitue_cru:'laitue',laitue_coupe:'laitue_coupe',oignon_cru:'oignon',oignon_coupe:'oignon_coupe',pain:'pain',steak_cru:'steak_cru',steak_cuit:'steak_cuit',steak_brule:'steak_brule',extincteur:'extincteur'};
function item3(it,P,y,s){if(!it)return;if(it.k==='sales'){dirtyStack3(P,y,it.n);return;}const g=it.k==='assiette'?dishModel(it.c):MODELS[ITEMK[key(it)]];if(!g)return;put(g,M4.mul(P,TM(0,y,0,{s:s||1})),WH,{ol:it.k==='laitue'?.005:OLI});}
function dirtyStack3(P,y,n){const g=MODELS.assiette_sale;for(let i=0;i<Math.min(n,6);i++)put(g,M4.mul(P,TM((i%2)*.015,y+i*.032,0,{ry:i})),WH,{ol:OLI});}
const Mx2=(P,x,y,z,ry)=>M4.mul(P,Mx(x,y,z,ry));

// ---------- souris ----------
function mouse3(m,time){const run=Math.sin(m.t*28),P=M4.trs(m.x,Math.abs(run)*.03,m.z,m.a,1.5);
 ell(P,.11,.085,.16,0,.09,0,'#9c98a6',{gloss:.3});ell(P,.08,.07,.08,0,.13,.15,'#a7a3b1');ell(P,.025,.02,.03,0,.12,.24,'#f08aa0');
 for(const sd of [-1,1]){ell(P,.05,.055,.012,sd*.06,.21,.12,'#a7a3b1');ell(P,.035,.04,.01,sd*.06,.21,.125,'#f6b3c3');ell(P,.016,.018,.012,sd*.035,.16,.215,'#141018');ell(P,.006,.006,.004,sd*.03,.168,.226,'#ffffff');}
 for(let i=0;i<5;i++)ell(P,.014,.014,.03,Math.sin(m.t*8+i)*.02*i,.06+i*.012,-.17-i*.05,'#d9a3b0');
 for(const sd of [-1,1])ell(P,.03,.02,.04,sd*.07,.02,(sd*run)*.04+.02,'#8c8896');
 if(m.item){const Q=M4.mul(P,M4.trs(0,.16,-.02,0,.55));item3(m.item,Q,0);}}

// ---------- personnages ----------
function chef3(p,time){
 const si=SKINS[p.skin]?p.skin:0,ang=Math.atan2(p.dir.x,p.dir.z),mv=p.moving,OL=.013;
 let sink=0;if(p.dead>0){const k=DEADT-p.dead;if(k>.8)return;sink=k*1.4;}
 const ph=Math.sin(p.walk),bob=Math.abs(ph)*.045+(mv?0:Math.sin(time*3+p.i)*.01),lean=p.dash>0?.28:(mv?.1:0),sq=mv?Math.abs(Math.cos(p.walk))*.035:Math.sin(time*3+p.i)*.012;
 const P=M4.mul(M4.trs(p.x,-sink,p.z,ang,1.22),Mx(0,0,0,0,lean));
 for(const sd of [-1,1]){const sw=mv?Math.sin(p.walk+(sd>0?Math.PI:0))*.11:0;put(MODELS.pied,M4.mul(P,TM(sd*.1,Math.max(0,sw)*.25,sw)),WH,{ol:OL});}
 const B=M4.mul(P,TM(0,bob,0,{sx:1+sq*.6,sy:1-sq,sz:1+sq*.6}));
 put(chefBody(si,p.i),B,WH,{ol:OL});
 const nod=p.chopping?Math.abs(Math.sin(time*16))*.07:0,tilt=mv?Math.sin(p.walk)*.05:Math.sin(time*1.3+p.i)*.05;
 const H=M4.mul(B,TM(0,.77,0,{rz:tilt,rx:nod}));
 put(chefHead(si),H,WH,{ol:OL});
 const blink=Math.sin(time*1.7+p.i*3)>.985,E=chefEyePos(si),eye=chefEye(si);
 for(const sd of [-1,1])put(eye,M4.mul(H,TM(sd*E[0],E[1],E[2],{ry:sd*E[3],sy:blink?.12:1})),WH,{ol:blink?0:.005});
 const hp=hatPos(si);put(MODELS.toque,M4.mul(H,TM(hp[0],hp[1],hp[2],{rx:hp[3]})),WH,{ol:OL});
 const hand=chefHand(si),chop=p.chopping?Math.abs(Math.sin(time*16))*.12:0,spray=p.spraying?Math.sin(time*30)*.01:0;
 if(p.held){for(const sd of [-1,1])put(hand,M4.mul(B,TM(sd*.19,.5-(sd<0?chop:0),.26+spray)),WH,{ol:OL});item3(p.held,M4.mul(B,TM(0,0,.3)),p.held.k==='extincteur'?.36:.55);}
 else for(const sd of [-1,1]){const sw=mv?Math.sin(p.walk+(sd>0?0:Math.PI))*.1:0;put(hand,M4.mul(B,TM(sd*.29,.3-(sd<0?chop:0)+(p.chopping?.14:0),sw+(p.chopping?.2:0))),WH,{ol:OL});}
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
  case 'crate':{counterBody(t,P,'#9a6236','#b9834f');put(crateModel(t.ing),M4.mul(P,TM(0,top,0)),WH,{ol:.008});
   rbox(P,.36,.2,.02,0,top-.42,.5,'#fff3d6',{r:.02});const g=MODELS[ITEMK[t.ing+(t.ing==='pain'?'':'_cru')]];if(g)put(g,M4.mul(P,TM(0,top-.4,.52,{rx:Math.PI/2,s:.45})),WH);break;}
  case 'board':{counterBody(t,P,th.body,th.top);put(MODELS.planche,M4.mul(P,TM(0,top+.025,0)),WH,{ol:.007});
   const chopping=G.players.some(p=>p.chopping&&p.workTile===t),k=chopping?Math.abs(Math.sin(time*16))*.12:0;
   put(MODELS.couteau,M4.mul(P,TM(.24,top+.065+k,.02,{ry:-1.35,rz:chopping?.4:0})),WH,{ol:.006});
   item3(t.item,P,top+.05);break;}
  case 'stove':{counterBody(t,P,'#4a4f58','#6f7782');torus(P,.26,.025,0,top+.01,0,'#2a2d33');
   const pot=t.pot,cooking=pot.c.length&&!pot.done&&!pot.burnt;if(cooking||pot.done)for(let i=0;i<10;i++){const a=i/10*Math.PI*2+time;ell(P,.03,.045,.03,Math.cos(a)*.24,top+.04,Math.sin(a)*.24,'#3d8bff',{e:'#3d8bff',a:.8,noShadow:true});}
   put(MODELS.marmite,M4.mul(P,TM(0,top+.012,0)),WH,{ol:.008});
   if(pot.c.length||pot.burnt){const on=pot.c[0]==='oignon',lvl=top+.07+Math.min(3,pot.c.length||3)*.05,col=pot.burnt?'#2a201c':pot.done?(on?'#c4893a':'#e5652e'):(on?'#e2c27a':'#d8503a');cyl(P,.255,.255,.02,0,lvl,0,col,{gloss:.6,seg:32});
    if(!pot.done&&!pot.burnt)for(let i=0;i<pot.c.length;i++)put(MODELS[on?'oignon_coupe':'tomate_coupe'],M4.mul(P,TM(Math.cos(i*2.1)*.1,lvl+.005,Math.sin(i*2.1)*.1,{ry:i,s:.6})),WH);
    if(pot.done||cooking)for(let i=0;i<3;i++){const ph=(time*1.3+i/3)%1;ell(P,.03+ph*.03,.03+ph*.03,.03+ph*.03,Math.cos(i*2)*.1,lvl+.03,Math.sin(i*2)*.1,on?'#f6e0a8':'#ffb59a',{a:1-ph,noShadow:true});}}
   if(t.fire>0)fire3(P,top+.2,time,t.fire);break;}
  case 'sink':{counterBody(t,P,th.body,'#c9d3dc',true);const st='#c9d3dc';rbox(P,1.0,.08,.16,0,top-.08,.42,st,{r:.03,gloss:.8});rbox(P,1.0,.08,.16,0,top-.08,-.42,st,{r:.03,gloss:.8});rbox(P,.16,.08,1.0,.42,top-.08,0,st,{r:.03,gloss:.8});rbox(P,.16,.08,1.0,-.42,top-.08,0,st,{r:.03,gloss:.8});
   rbox(P,.7,.02,.7,0,top-.075,0,'#2b4d63',{r:.02});
   rbox(P,.68,.008,.68,0,top-.03,0,'#7cc3e6',{r:.01,a:.75,gloss:1,noShadow:true});
   cyl(P,.03,.03,.35,0,top,-.38,'#c9cfd6',{gloss:1});cyl(P,.025,.025,.2,0,top+.33,-.38,'#c9cfd6',{rx:1.57,gloss:1});
   if(t.dirty>0)dirtyStack3(Mx2(P,.05,0,.05,.3),top-.06,t.dirty);
   const washing=G.players.some(p=>p.chopping&&p.workTile===t);if(washing)for(let i=0;i<6;i++){const a=time*4+i;ell(P,.05,.05,.05,Math.cos(a)*.18,top+.06+Math.abs(Math.sin(a*2))*.05,Math.sin(a)*.15,'#ffffff',{a:.7,noShadow:true});}
   break;}
  case 'rack':{counterBody(t,P,th.body,th.top);rbox(P,.7,.04,.6,0,top,0,'#8a5a36',{r:.02});for(let i=0;i<Math.min(t.cnt,8);i++)put(MODELS.assiette,M4.mul(P,TM(0,top+.04+i*.03,0,{ry:i*.7})),WH,{ol:OLI});break;}
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
   put(MODELS.poele,M4.mul(P,TM(0,top+.012,0)),WH,{ol:.008});
   if(it){const jig=it.st==='cru'||it.st==='cuit'?Math.sin(time*30)*.004:0;item3(it,P,top+.034+jig);if(on&&Math.sin(time*3)>.2)ell(P,.04,.04,.04,Math.sin(time*5)*.08,top+.14+((time*.8)%1)*.2,.03,'#ffffff',{a:.35,noShadow:true});}
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
 return {fov:.72*1.0,eye:[cx,dist*.76,cz+dist*.75],at:[cx,0,cz+.3],light:normalize3([-.42,-1,-.38]),shR:Math.max(W,H)*.82,bg:hex3('#2b2638')};}
function render3D(time){
 if(!G||!R3.ready)return;
 const cv=document.getElementById('gl'),W=cv.width,H=cv.height;CAM=camFor(G.W,G.H,W/H);
 drawKitchen(time);for(const p of G.players)chef3(p,time);
 const me=G.players[meI()];if(me&&me.target&&state==='play'){const t=me.target;put(geoRoundBox(1.0,.02,1.0,.01,2),Mx(t.x+.5,CH+.012,t.z+.5),'#ffffff',{a:.22+Math.sin(time*6)*.08,e:'#ffffff',noShadow:true});}
 R3.count=R3.list.length;
 r3Render(W,H,CAM);
}
