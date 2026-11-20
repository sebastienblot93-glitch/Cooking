// ================= MODÈLES SCULPTÉS (géométrie fusionnée, couleurs et brillance par sommet) =================
const TAU=Math.PI*2;
function hsh(x,y,z){const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h);}
function vnoise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,s=t=>t*t*(3-2*t),ux=s(fx),uy=s(fy),uz=s(fz),L=(a,b,t)=>a+(b-a)*t,h=(a,b,c)=>hsh(ix+a,iy+b,iz+c);
 return L(L(L(h(0,0,0),h(1,0,0),ux),L(h(0,1,0),h(1,1,0),ux),uy),L(L(h(0,0,1),h(1,0,1),ux),L(h(0,1,1),h(1,1,1),ux),uy),uz);}
const CC=(h,g)=>{const c=hex3(h);return [c[0],c[1],c[2],g===undefined?.25:g];};
const mixc=(a,b,t)=>{t=Math.max(0,Math.min(1,t));return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];};
const mulc=(c,k)=>[c[0]*k,c[1]*k,c[2]*k,c[3]];
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const MODELS={};
function mdl(k,f){let g=MODELS[k];if(!g){const mb=MB();f(mb);g=MODELS[k]={P:mb.P,N:mb.N,C:mb.C,I:mb.I};if(g.P.length/3>65000)console.warn('Modèle trop lourd',k,g.P.length/3);}return g;}
// petit générateur pseudo-aléatoire reproductible
function rng(seed){let s=seed*9301+49297;return ()=>{s=(s*9301+49297)%233280;return s/233280;};}
const ID4=M4.ident();
const MM=(m,x,y,z,o)=>M4.mul(m,TM(x,y,z,o));

// ---------- Ingrédients ----------
mdl('tomate',mb=>{const R=.15,ry=R*.84;
 const body=geoBlob(R,ry,R,44,26,(u,v)=>1+.05*Math.cos(u*TAU*5)*Math.pow(Math.sin(v*Math.PI),2)-.16*Math.exp(-v*v*40));
 const lo=CC('#a8170f',.9),mid=CC('#e3322a',.9),hi=CC('#ff7042',.9);
 mbAdd(mb,body,TM(0,ry,0),p=>{const y=p[1]/ry;let c=mixc(lo,mid,sstep(-1,-.15,y));c=mixc(c,hi,sstep(.25,.95,y)*.55);return mulc(c,.93+.12*vnoise(p[0]*22+3,p[1]*22,p[2]*22));});
 const leaf=geoLeaf(.1,.032,.3,-.1,.12,6,9),top=ry*1.84;
 for(let i=0;i<5;i++){const a=i/5*TAU+.4;mbAdd(mb,leaf,TM(Math.cos(a)*.008,top+.005,Math.sin(a)*.008,{ry:Math.PI/2-a,rx:-.06}),(p,n,uv)=>mixc(CC('#24621f',.3),CC('#5fb447',.3),uv[1]*.8+Math.abs(uv[0]-.5)*.4));}
 mbAdd(mb,geoBlob(.022,.014,.022,10,8),TM(0,top+.004,0),CC('#2f6e26',.3));
 mbAdd(mb,geoCyl(.009,.014,.055,8),TM(0,top,0,{rz:.35}),CC('#3c7a2e',.2));
});
function addSlice(mb,m,R,h){
 mbAdd(mb,geoLathe([[0,0],[R*.93,0],[R,h*.3],[R,h*.72],[R*.94,h],[0,h]],44,26),m,(p,n)=>{
  const skin=CC('#cf241b',.7);if(Math.abs(n[1])<.6)return skin;const r=Math.hypot(p[0],p[2])/R,a=Math.atan2(p[2],p[0]);
  if(r>.9)return skin;if(r>.8)return CC('#ef5238',.6);if(r<.2)return CC('#f47a5a',.75);
  const ch=Math.cos(a*4+.5);if(ch>-.15&&r>.3&&r<.74){const seed=hsh(Math.round(p[0]*300),Math.round(p[2]*300),3)>.8&&r>.42&&r<.68;return seed?CC('#fff2b5',.8):mixc(CC('#ffb59c',.95),CC('#ff8f74',.95),vnoise(p[0]*70,p[2]*70,1));}
  return CC('#ea4632',.6);});}
mdl('tomate_coupe',mb=>{for(const [x,y,z,o] of [[-.055,0,.025,{ry:.3}],[.05,.012,.035,{rz:-.12,ry:1}],[0,.022,-.045,{rx:.16,ry:2}]])addSlice(mb,TM(x,y,z,o),.1,.03);});
function lettuceShell(span,t0,t1,R,sd){return geoParam((u,v)=>{const s=u-.5,a=s*span*(.75+.25*v),t=t0+(t1-t0)*v;const ruff=1+.1*Math.sin(u*30+sd)*Math.pow(1-v,2)+.04*Math.sin(u*10+v*6+sd);const r=R*ruff;return [Math.sin(t)*Math.sin(a)*r,Math.cos(t)*r*.92,Math.sin(t)*Math.cos(a)*r];},16,12,{two:true,v0:0,v1:1});}
mdl('laitue',mb=>{const cy=.12,SC=.86;
 mbAdd(mb,geoBlob(.11,.1,.11,20,14),TM(0,cy,0,{s:SC}),p=>mixc(CC('#f0fac8',.3),CC('#c2e88a',.3),.5-p[1]*4));
 for(let i=0;i<7;i++){const sh=lettuceShell(2.1,(i%2?.06:.13)*Math.PI,.8*Math.PI,.165+(i%3)*.01,i*1.7);
  mbAdd(mb,sh,TM(0,cy,0,{ry:i/7*TAU+(i%2)*.3,s:SC}),(p,n,uv)=>{const vein=Math.exp(-Math.pow((uv[0]-.5)*14,2))*.55;let c=mixc(CC('#4aa634',.35),CC('#d4f29c',.35),Math.pow(uv[1],.7));c=mixc(c,CC('#eefad0',.35),vein*uv[1]);return mulc(c,.95+.1*vnoise(p[0]*40,p[1]*40,p[2]*40));});}
});
function flakeGeo(L,W,sd){return geoParam((u,v)=>{const s=u*2-1,x=s*W*(.7+.3*Math.sin(v*Math.PI)),z=(v-.5)*L;return [x,.022*Math.sin(s*2.5+v*7+sd)+.02*s*s+.01*Math.sin(v*22+sd),z];},9,9,{two:true,v0:0,v1:1});}
function addLettuceHeap(mb,m,n,sp){const r=rng(7);const greens=[['#4fae36','#d2f29c'],['#66c043','#e6f8bc'],['#3f9a2f','#b4e57a']];
 for(let i=0;i<n;i++){const a=r()*TAU,d=r()*sp,g=greens[i%3];mbAdd(mb,flakeGeo(.14+r()*.05,.055+r()*.02,i*2.3),M4.mul(m,TM(Math.cos(a)*d,.012+r()*.05,Math.sin(a)*d,{ry:r()*TAU,rx:(r()-.5)*.6,rz:(r()-.5)*.6})),
  (p,nn,uv)=>{const k=Math.abs(uv[0]-.5)*2;return mulc(mixc(CC(g[1],.4),CC(g[0],.4),k),.93+.12*vnoise(p[0]*50,p[2]*50,i));});}}
mdl('laitue_coupe',mb=>addLettuceHeap(mb,ID4,10,.1));
mdl('oignon',mb=>{const prof=[[0,0],[.06,.004],[.11,.028],[.143,.075],[.155,.125],[.146,.18],[.118,.225],[.075,.262],[.04,.285],[.02,.305],[.01,.322],[0,.33]];
 mbAdd(mb,geoLathe(prof,40,24,u=>1+.015*Math.sin(u*TAU*7)),TM(0,0,0),(p,n,uv)=>{const st=Math.pow(.5+.5*Math.cos(uv[0]*TAU*11+p[1]*9),5);let c=mixc(CC('#e2a54e',.5),CC('#a8642a',.4),st*.55);
  c=mixc(c,CC('#8e5222',.35),sstep(.24,.31,p[1]));c=mixc(c,CC('#efdcae',.3),sstep(.03,.0,p[1]));return mulc(c,.94+.1*vnoise(p[0]*30,p[1]*30,p[2]*30));});
 mbAdd(mb,geoCyl(.004,.016,.05,8),TM(0,.318,0,{rz:.25}),CC('#b07a3c',.2));
 const r=rng(3);for(let i=0;i<8;i++){const a=r()*TAU;mbAdd(mb,geoCyl(.003,.0015,.035,4),TM(Math.cos(a)*.02,.006,Math.sin(a)*.02,{ry:-a,rz:Math.PI*.6+r()*.4}),CC('#e6d5aa',.1));}
});
mdl('oignon_coupe',mb=>{const ringC=k=>k%2?CC('#f3e3f0',.6):CC('#fcf6e4',.6);
 for(const [x,y,z,o] of [[-.05,.012,.01,{rx:.08}],[.06,.02,.035,{rz:-.18}]]){for(let k=0;k<4;k++)mbAdd(mb,geoTorus(.028+k*.024,.0115,24,8),M4.mul(TM(x,y,z,o),TM(0,0,0)),ringC(k));mbAdd(mb,geoCyl(.022,.022,.012,12),TM(x,y-.004,z,o),CC('#fcf3dc',.6));}
 mbAdd(mb,geoTorus(.05,.011,22,8),TM(.0,.012,-.08,{rx:.1}),ringC(0));
});
const BUNTOP=[[0,0],[.15,0],[.158,.014],[.156,.038],[.142,.066],[.113,.092],[.07,.108],[0,.114]];
function bunH(r){for(let i=BUNTOP.length-1;i>0;i--){const a=BUNTOP[i],b=BUNTOP[i-1];if(r>=a[0]&&r<=b[0]&&b[1]<a[1]){const t=(r-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*t;}}return 0;}
function addBunBottom(mb,m){mbAdd(mb,geoLathe([[0,0],[.13,0],[.148,.01],[.152,.03],[.145,.045],[.12,.05],[0,.05]],36,12),m,(p,n)=>n[1]>.75&&p[1]>.04?mulc(CC('#f5d9a0',.15),.93+.1*vnoise(p[0]*45,p[2]*45,2)):mixc(CC('#c47f36',.4),CC('#eab26a',.4),p[1]/.05));}
function addBunTop(mb,m){
 mbAdd(mb,geoLathe(BUNTOP,40,16),m,(p,n)=>{if(n[1]<-.5)return CC('#f5d9a0',.15);const t=p[1]/.114;let c=mixc(CC('#f3cd8e',.45),CC('#e19a45',.6),sstep(0,.35,t));c=mixc(c,CC('#b85a1c',.7),sstep(.45,1,t));return mulc(c,.95+.08*vnoise(p[0]*30,p[1]*30,p[2]*30));});
 const seed=geoBlob(.0075,.004,.014,8,6);for(let k=0;k<18;k++){const rr=.018+.11*Math.sqrt(k/17),a=k*2.39996;mbAdd(mb,seed,M4.mul(m,TM(Math.cos(a)*rr,bunH(rr)+.0015,Math.sin(a)*rr,{ry:-a+.6})),CC('#fff6dc',.4));}}
mdl('pain',mb=>{addBunBottom(mb,ID4);addBunTop(mb,TM(0,.052,0));});
const STEAKP=[[0,0],[.14,0],[.158,.008],[.165,.028],[.158,.05],[.14,.058],[0,.06]];
const steakMod=u=>1+.07*(vnoise(Math.cos(u*TAU)*1.6+4,Math.sin(u*TAU)*1.6+4,7)-.5)*2;
for(const st of ['cru','cuit','brule'])mdl('steak_'+st,mb=>{
 mbAdd(mb,geoLathe(STEAKP,48,30,steakMod),ID4,(p,n)=>{const nz=vnoise(p[0]*30,p[1]*30,p[2]*30);
  if(st==='cru'){let c=mixc(CC('#c23b48',.7),CC('#e86a70',.7),nz);const sp=hsh(Math.round(p[0]*260),Math.round(p[1]*260),Math.round(p[2]*260));if(sp>.8)c=mixc(c,CC('#f6c8c4',.6),.35);else if(sp<.15)c=mulc(c,.86);return c;}
  if(st==='cuit'){if(Math.abs(n[1])<.55)return mixc(CC('#7a3b1d',.4),CC('#a35a2d',.4),nz);let c=mixc(CC('#5a2a12',.45),CC('#84441f',.45),nz);
   if(n[1]>0){const f=((p[0]*.7+p[2])*11)%1;if((f<0?f+1:f)<.2)c=CC('#2a1208',.3);}return c;}
  return mixc(CC('#1e130f',.15),CC('#3a2218',.15),nz).map((v,i)=>i<3&&vnoise(p[0]*50,p[2]*50,3)>.8?v+(i===0?.25:.05):v);});});
// ---------- Vaisselle et plats ----------
const PLATEP=[[0,0],[.15,0],[.165,.006],[.19,.016],[.235,.03],[.258,.042],[.262,.048],[.25,.05],[.228,.04],[.19,.028],[.17,.024],[0,.024]];
function addPlate(mb,m,dirty){mbAdd(mb,geoLathe(PLATEP,44,26),m,(p,n)=>{const r=Math.hypot(p[0],p[2]);let c=n[1]>0?CC('#fdfaf4',.85):CC('#e8e3da',.6);
 if(n[1]>0&&r>.231&&r<.246)c=CC('#6fa9cc',.85);if(n[1]>0&&r>.2&&r<.205)c=CC('#a9cfe2',.85);
 if(dirty&&n[1]>0){const k=vnoise(p[0]*20+1,p[2]*20,5);if(k>.58)c=mixc(c,CC('#b07a46',.3),(k-.58)*4);if(vnoise(p[0]*60,p[2]*60,8)>.83)c=CC('#8a5a30',.2);}return c;});}
mdl('assiette',mb=>addPlate(mb,ID4));
mdl('assiette_sale',mb=>addPlate(mb,ID4,true));
const BOWLP=[[0,0],[.075,0],[.08,.008],[.068,.016],[.085,.02],[.135,.052],[.165,.1],[.17,.114],[.162,.119],[.152,.108],[.12,.072],[.065,.046],[0,.043]];
function addSoup(mb,m,kind){
 if(kind==='soupe_oignon'){mbAdd(mb,geoLathe(BOWLP,40,24),m,(p,n)=>{const out=Math.hypot(p[0],p[2])>.12&&n[1]<.6&&p[1]<.112;return out?mulc(CC('#7b4526',.8),.92+.12*vnoise(p[0]*20,p[1]*20,p[2]*20)):CC('#f2e7d4',.7);});
  for(const sd of [-1,1])mbAdd(mb,geoArc(.04,.012,-1.3,1.3,12,8),M4.mul(m,TM(sd*.17,.085,0,{ry:sd>0?0:Math.PI,rx:Math.PI/2})),CC('#7b4526',.8));
  mbAdd(mb,geoLathe([[0,0],[.158,0],[.168,.008],[.15,.025],[.09,.036],[0,.04]],40,10,u=>1+.03*Math.sin(u*TAU*6)),M4.mul(m,TM(0,.098,0)),(p,n)=>{const k=vnoise(p[0]*28,p[2]*28,4);let c=mixc(CC('#f7cf68',.55),CC('#e9a63e',.55),k);if(vnoise(p[0]*14+5,p[2]*14,9)>.62)c=mixc(c,CC('#a8591c',.5),.8);return c;});
  for(let i=0;i<3;i++)mbAdd(mb,geoRoundBox(.04,.025,.04,.01,3),M4.mul(m,TM(Math.cos(i*2.1)*.07,.135,Math.sin(i*2.1)*.07,{ry:i})),CC('#d99a4e',.3));return;}
 mbAdd(mb,geoLathe(BOWLP,40,24),m,(p,n)=>{const out=Math.hypot(p[0],p[2])>.12&&n[1]<.6&&p[1]<.112;if(out)return p[1]>.065&&p[1]<.08?CC('#3f7fb0',.85):CC('#fff8ec',.85);return CC('#ffffff',.8);});
 mbAdd(mb,geoCyl(.153,.153,.006,40),M4.mul(m,TM(0,.093,0)),(p)=>{const r=Math.hypot(p[0],p[2])/.153,a=Math.atan2(p[2],p[0]);const sw=Math.sin(a+r*11);
  let c=mixc(CC('#e2501f',.75),CC('#f26a2c',.75),vnoise(p[0]*25,p[2]*25,2));if(sw>.82&&r>.12&&r<.78)c=CC('#fff3e2',.8);return c;});
 for(let i=0;i<3;i++)mbAdd(mb,geoRoundBox(.034,.024,.034,.008,3),M4.mul(m,TM(Math.cos(i*2.2+.5)*.085,.1,Math.sin(i*2.2+.5)*.085,{ry:i*.7})),CC('#e2b062',.3));
 const lf=geoLeaf(.06,.02,.3,0,.05,5,7);for(const [a,o] of [[0,.4],[2.3,-.3]])mbAdd(mb,lf,M4.mul(m,TM(.01,.103,-.01,{ry:a})),(p,n,uv)=>mixc(CC('#2f8a2a',.5),CC('#6cc04f',.5),uv[1]));}
function addBurger(mb,m,c){let y=0;const bun=c.includes('pain');
 if(bun){addBunBottom(mb,M4.mul(m,TM(0,y,0)));y+=.05;}
 if(c.includes('steak_cuit')){mbAdd(mb,MODELS.steak_cuit||mdl('steak_cuit',()=>{}),M4.mul(m,TM(0,y-.006,0,{s:.95})));y+=.052;}
 if(c.includes('laitue_coupe')){mbAdd(mb,geoParam((u,v)=>{const a=u*TAU,r=.178*v*(1+.06*Math.sin(a*9));return [Math.cos(a)*r,.014*Math.sin(a*11)*v*v-.004*v,Math.sin(a)*r];},48,6,{two:true,v0:0,v1:1}),M4.mul(m,TM(0,y+.006,0)),(p,n,uv)=>mixc(CC('#d6f2a2',.4),CC('#48a832',.4),Math.pow(uv[1],1.5)));y+=.016;}
 if(c.includes('tomate_coupe')){addSlice(mb,M4.mul(m,TM(-.045,y,.01,{ry:.4})),.075,.02);addSlice(mb,M4.mul(m,TM(.05,y+.004,-.01,{ry:1.3})),.075,.02);y+=.024;}
 if(bun){addBunTop(mb,M4.mul(m,TM(0,y,0)));
  if(c.length>=4){mbAdd(mb,geoCyl(.006,.006,.2,6),M4.mul(m,TM(.02,y+.03,.01,{rz:.08})),CC('#e8d6ae',.2));
   mbAdd(mb,geoParam((u,v)=>[u*.08,v*.05+.004*Math.sin(u*9),.006*Math.sin(u*6)],8,4,{two:true,v0:0,v1:1}),M4.mul(m,TM(.01,y+.17,.01,{rz:.08})),(p,n,uv)=>(Math.floor(uv[0]*4)+Math.floor(uv[1]*2))%2?CC('#ffffff',.3):CC('#e8463a',.3));}}}
function dishModel(c){const key='plat:'+c.slice().sort().join('+');return mdl(key,mb=>{addPlate(mb,ID4);const top=.024,T0=TM(0,top,0);
 const soup=c.find(x=>SOUPS.has(x));if(soup){addSoup(mb,T0,soup);return;}
 if(c.includes('pain')||c.includes('steak_cuit')){addBurger(mb,T0,c);return;}
 if(c.includes('laitue_coupe'))addLettuceHeap(mb,MM(T0,0,0,0,{s:1.15}),9,.09);
 if(c.includes('tomate_coupe'))for(const [x,z,a] of [[-.04,.02,.3],[.05,.03,1.2],[0,-.05,2]])addSlice(mb,MM(T0,x,c.includes('laitue_coupe')?.06:.0,z,{ry:a,rx:.15}),.08,.024);});}
// ---------- Ustensiles ----------
mdl('marmite',mb=>{const pr=[[0,0],[.24,0],[.265,.015],[.27,.04],[.272,.235],[.292,.25],[.292,.266],[.27,.264],[.256,.246],[.256,.03],[0,.03]];
 mbAdd(mb,geoLathe(pr,48,22),ID4,(p,n)=>{const r=Math.hypot(p[0],p[2]);if(r<.262&&p[1]>.028&&n[1]<.9&&!(p[1]>.244))return CC('#5d6670',.6);return mixc(CC('#7d8792',1),CC('#dfe5ea',1),p[1]/.27+(p[1]>.12&&p[1]<.14?.25:0));});
 for(const sd of [-1,1])mbAdd(mb,geoArc(.05,.014,-1.25,1.25,14,8),TM(sd*.27,.2,0,{ry:sd>0?0:Math.PI,rx:Math.PI/2}),CC('#2a2d33',.6));});
mdl('poele',mb=>{const pr=[[0,0],[.21,0],[.24,.012],[.285,.07],[.296,.08],[.284,.085],[.236,.032],[.2,.022],[0,.022]];
 mbAdd(mb,geoLathe(pr,48,16),ID4,(p,n)=>{const r=Math.hypot(p[0],p[2]);if(n[1]>.5&&r<.24)return mixc(CC('#363a43',.8),CC('#454a55',.8),.5+.5*Math.sin(r*120));return CC('#25282e',.55);});
 mbAdd(mb,geoCyl(.022,.022,.05,10),TM(.29,.07,0,{rz:Math.PI/2-.12}),CC('#a7b0ba',1));
 mbAdd(mb,geoRoundBox(.26,.036,.056,.016,3),TM(.44,.075,0,{rz:-.12}),p=>mixc(CC('#5a361c',.35),CC('#8a5a32',.35),vnoise(p[0]*30,0,0)+.2*Math.sin(p[0]*80)));});
mdl('extincteur',mb=>{
 mbAdd(mb,geoLathe([[0,0],[.085,0],[.092,.01],[.092,.33],[.08,.38],[.05,.405],[.03,.415],[0,.42]],32,18),ID4,(p,n)=>{if(p[1]<.012)return CC('#2a2d33',.4);if(p[1]>.12&&p[1]<.22&&p[2]>-.02)return p[1]>.16&&p[1]<.175?CC('#d4302a',.6):CC('#f8f4ec',.5);return mixc(CC('#b51f1b',.95),CC('#e8463a',.95),p[1]/.42);});
 mbAdd(mb,geoCyl(.028,.032,.06,12),TM(0,.41,0),CC('#2a2d33',.7));mbAdd(mb,geoRoundBox(.16,.025,.035,.01,3),TM(.05,.47,0,{rz:.12}),CC('#30333a',.6));
 mbAdd(mb,geoRoundBox(.12,.02,.03,.008,3),TM(.03,.445,0,{rz:-.1}),CC('#c9ced6',.9));
 mbAdd(mb,geoCyl(.013,.013,.27,10),TM(-.03,.43,0,{rz:2.82}),CC('#1e2025',.5));mbAdd(mb,geoCyl(.022,.014,.06,10),TM(-.12,.18,0,{rz:2.82}),CC('#1e2025',.5));});
mdl('couteau',mb=>{
 mbAdd(mb,geoParam((u,v)=>{const s=u*2-1,w=.028*(1-Math.pow(v,3)*.95)*(1+.15*(1-v));return [v*.24,.0,s*w+(1-Math.pow(1-v,4))*.0];},4,14,{two:true,v0:0,v1:1}),ID4,(p,n,uv)=>mixc(CC('#f4f7fa',1),CC('#aab4bf',1),Math.abs(uv[0]-.5)*2*.6+uv[1]*.2));
 mbAdd(mb,geoRoundBox(.12,.032,.04,.014,3),TM(-.065,0,0),p=>mixc(CC('#3c2416',.4),CC('#5a3a22',.4),.5+.5*Math.sin(p[0]*120)));
 for(const x of [-.09,-.045])mbAdd(mb,geoCyl(.007,.007,.036,8),TM(x,-.018,0),CC('#dfe4ea',1));});
mdl('planche',mb=>{mbAdd(mb,geoRoundBox(.66,.05,.46,.03,4),TM(0,0,0),p=>{const g=.5+.5*Math.sin(p[0]*50+vnoise(p[0]*6,p[2]*14,1)*7);return mulc(mixc(CC('#e2ad72',.25),CC('#c78f55',.25),g*.6),.95+.08*vnoise(p[0]*40,p[2]*40,2));});
 mbAdd(mb,geoCyl(.035,.035,.052,14),TM(-.26,-.001,.15),CC('#b07a44',.2));});
// caisse en bois avec ses ingrédients
function crateModel(ing){return mdl('caisse:'+ing,mb=>{const wood=p=>mulc(mixc(CC('#d7a065',.2),CC('#b47a42',.2),.5+.5*Math.sin(p[0]*35+p[2]*35+vnoise(p[0]*8,p[1]*8,p[2]*8)*6)),.92+.1*vnoise(p[0]*30,p[1]*30,p[2]*30));
 mbAdd(mb,geoRoundBox(.8,.04,.8,.015,3),TM(0,0,0),wood);
 for(const yy of [.035,.16])for(const sd of [-1,1]){mbAdd(mb,geoRoundBox(.84,.1,.05,.02,3),TM(0,yy,sd*.39),wood);mbAdd(mb,geoRoundBox(.05,.1,.74,.02,3),TM(sd*.39,yy,0),wood);}
 for(const sx of [-1,1])for(const sz of [-1,1])mbAdd(mb,geoRoundBox(.07,.28,.07,.02,3),TM(sx*.39,.0,sz*.39),p=>mulc(wood(p),.85));
 for(const sx of [-.33,.33])for(const yy of [.085,.21])mbAdd(mb,geoBlob(.01,.01,.006,6,5),TM(sx,yy,.418),CC('#3a3a40',.8));
 const it=ing==='steak'?'steak_cru':ing,M=MODELS[it]||mdl(it,()=>{}),r=rng(ing.length*7+3),pts=[[-.18,-.16],[.17,-.14],[-.15,.16],[.18,.17],[0,0],[0,-.2],[-.2,.02]];
 const sc=ing==='laitue'?.8:ing==='pain'?.85:ing==='steak'?.85:.95;
 pts.slice(0,ing==='laitue'?5:7).forEach(([x,z],i)=>mbAdd(mb,M,TM(x,.045+(i===4?.04:0),z,{ry:r()*TAU,s:sc,rx:(r()-.5)*.25})));});}

// ---------- Chefs ----------
const SKINS=[
 {id:'ours',nom:'Caramel',fur:'#b9794b',muz:'#f3d6b4',inner:'#eaa984',nose:'#3a2418',ears:'round',tail:'ball',paw:'#b9794b'},
 {id:'chat',nom:'Mandarine',fur:'#f49b40',stripe:'#d56f1c',muz:'#fff3e4',inner:'#ffb3c1',nose:'#ff8fa3',ears:'cat',tail:'cat',whisk:true,paw:'#fff3e4'},
 {id:'lapin',nom:'Guimauve',fur:'#f8f3f6',muz:'#ffffff',inner:'#ffb6c9',nose:'#ff8fa8',ears:'bunny',tail:'puff',teeth:true,paw:'#f8f3f6'},
 {id:'grenouille',nom:'Pistache',fur:'#8bd062',muz:'#dbf2b4',inner:'#8bd062',ears:'frog',paw:'#8bd062'},
 {id:'panda',nom:'Bambou',fur:'#f7f5f1',patch:'#26262c',muz:'#ffffff',inner:'#26262c',nose:'#1d1d22',ears:'panda',tail:'dark',paw:'#26262c'}
];
const BODYP=[[0,.05],[.16,.055],[.205,.1],[.228,.18],[.226,.27],[.205,.36],[.172,.44],[.125,.5],[.07,.53],[0,.54]];
function bodyR(y){for(let i=1;i<BODYP.length;i++){const a=BODYP[i-1],b=BODYP[i];if(y>=a[1]&&y<=b[1])return a[0]+(b[0]-a[0])*(y-a[1])/((b[1]-a[1])||1);}return 0;}
function chefBody(si,pi){return mdl('corps:'+si+':'+pi,mb=>{const S=SKINS[si],pc=CC(PCOL[pi],.25),white=CC('#fbf8f3',.3);
 mbAdd(mb,geoLathe(BODYP,48,24),ID4,(p,n)=>{const y=p[1];if(y<.07)return CC('#4a3d4c',.2);
  const fr=n[2]/Math.max(.2,Math.hypot(n[0],n[2]));if(fr>.42&&y>.085&&y<.34){return fr<.48||y>.325?mulc(pc,.78):mulc(pc,.97+.06*vnoise(p[0]*30,p[1]*30,2));}
  return mulc(white,.96+.05*vnoise(p[0]*25,p[1]*25,p[2]*25));});
 for(const sx of [-.055,.055])for(const by of [.37,.43]){const r=bodyR(by),z=Math.sqrt(Math.max(0,r*r-sx*sx))*.985;mbAdd(mb,geoBlob(.017,.017,.01,10,8),TM(sx,by,z,{ry:Math.atan2(sx,z)}),CC('#e2b84a',.95));}
 mbAdd(mb,geoRoundBox(.09,.06,.012,.01,2),TM(.07,.2,bodyR(.23)*.98,{ry:.3}),mulc(pc,.85));
 mbAdd(mb,geoTorus(.098,.033,22,10),TM(0,.52,0,{rx:.1}),pc);
 mbAdd(mb,geoBlob(.038,.032,.03,12,10),TM(0,.5,.12),pc);
 for(const sd of [-1,1])mbAdd(mb,geoLeaf(.1,.035,.25,.1,0,5,7),TM(sd*.025,.5,.13,{ry:sd*.25,rx:Math.PI/2-.35}),mulc(pc,.92));
 const fur=CC(S.fur,.25);
 if(S.tail==='ball')mbAdd(mb,geoBlob(.055,.055,.05,12,10),TM(0,.15,-.215),fur);
 if(S.tail==='dark')mbAdd(mb,geoBlob(.05,.05,.045,12,10),TM(0,.15,-.215),CC(S.patch,.25));
 if(S.tail==='puff')mbAdd(mb,geoBlob(.07,.065,.065,14,10,(u,v)=>1+.08*vnoise(Math.cos(u*TAU)*3,v*5,1)),TM(0,.15,-.22),CC('#ffffff',.2));
 if(S.tail==='cat')for(let i=0;i<8;i++){const t=i/7;mbAdd(mb,geoBlob(.036-.012*t,.036-.012*t,.036-.012*t,10,8),TM(.03*Math.sin(t*3),.1+t*.32,-.2-.09*Math.sin(t*2.4)),i%2?CC(S.stripe,.25):fur);}
});}
function chefHead(si){return mdl('tete:'+si,mb=>{const S=SKINS[si],fur=CC(S.fur,.3),muz=CC(S.muz,.3),blush=CC('#ff8a9c',.3),inner=CC(S.inner,.3);
 mbAdd(mb,geoBlob(.27,.24,.25,44,30),ID4,p=>{const d=[p[0]/.27,p[1]/.24,p[2]/.25];let c=fur;
  if(S.ears==='frog'){c=mixc(c,muz,sstep(.1,-.35,d[1]));}
  else c=mixc(c,muz,sstep(.55,.78,d[2])*sstep(.12,-.2,d[1]));
  if(S.stripe)for(const x0 of [-.2,0,.2])c=mixc(c,CC(S.stripe,.3),Math.exp(-Math.pow((d[0]-x0)*9,2))*sstep(.45,.75,d[1])*sstep(-.3,.2,d[2]));
  if(S.patch)for(const sx of [-1,1]){const dx=d[0]-sx*.36,dy=d[1]-.06,dz=d[2]-.86;c=mixc(c,CC(S.patch,.3),sstep(.034,.02,dx*dx*1.1+dy*dy*.7+dz*dz)*(dz>-.4?1:0));}
  for(const sx of [-1,1]){const dx=d[0]-sx*.58,dy=d[1]+.14,dz=d[2]-.76;c=mixc(c,blush,Math.exp(-(dx*dx+dy*dy*1.6+dz*dz)*26)*.85);}
  return mulc(c,.97+.04*vnoise(p[0]*30,p[1]*30,p[2]*30));});
 const ear=S.ears;
 if(ear==='round'||ear==='panda'){const ec=ear==='panda'?CC(S.patch,.3):fur;for(const sd of [-1,1]){mbAdd(mb,geoBlob(.088,.088,.05,16,12),TM(sd*.185,.18,-.03,{rz:-sd*.35}),ec);mbAdd(mb,geoBlob(.052,.052,.02,14,10),TM(sd*.18,.175,.012,{rz:-sd*.35}),ear==='panda'?mulc(ec,1.6):inner);}}
 if(ear==='cat')for(const sd of [-1,1]){mbAdd(mb,geoCyl(.0,.09,.15,16),TM(sd*.15,.15,-.01,{rz:-sd*.42,rx:-.08}),fur);mbAdd(mb,geoCyl(.0,.055,.11,14),TM(sd*.15,.16,.02,{rz:-sd*.42,rx:-.08}),inner);}
 if(ear==='bunny')for(const sd of [-1,1]){mbAdd(mb,geoBlob(.062,.2,.04,16,14),TM(sd*.085,.38,-.03,{rz:-sd*.16,rx:-.12}),fur);mbAdd(mb,geoBlob(.034,.15,.02,14,12),TM(sd*.087,.375,.005,{rz:-sd*.16,rx:-.12}),inner);}
 if(ear==='frog')for(const sd of [-1,1])mbAdd(mb,geoBlob(.095,.085,.09,18,14),TM(sd*.12,.17,.06),fur);
 if(S.nose){if(ear==='round'||ear==='panda'){mbAdd(mb,geoBlob(.05,.034,.034,14,10),TM(0,-.02,.252),CC(S.nose,.9));}else mbAdd(mb,geoBlob(.03,.02,.02,12,8),TM(0,-.015,.255),CC(S.nose,.8));}
 if(ear==='frog')for(const sd of [-1,1])mbAdd(mb,geoBlob(.01,.007,.006,6,5),TM(sd*.035,.0,.248),CC('#3a5a2a',.4));
 const mouth=CC('#3b1d22',.4);
 if(ear==='cat'||ear==='bunny'){for(const sd of [-1,1])mbAdd(mb,geoArc(.022,.0065,Math.PI*.1,Math.PI*.9,10,6),TM(sd*.021,-.058,.236,{rx:Math.PI/2-.35}),mouth);}
 else if(ear==='frog')mbAdd(mb,geoArc(.1,.008,Math.PI*.18,Math.PI*.82,18,6),TM(0,-.02,.17,{rx:Math.PI/2-.2}),mouth);
 else mbAdd(mb,geoArc(.034,.0075,Math.PI*.15,Math.PI*.85,12,6),TM(0,-.06,.232,{rx:Math.PI/2-.3}),mouth);
 if(S.teeth)for(const sd of [-1,1])mbAdd(mb,geoRoundBox(.02,.028,.01,.005,2),TM(sd*.011,-.098,.233,{rx:-.3}),CC('#ffffff',.6));
 if(S.whisk)for(const sd of [-1,1])for(let k=0;k<3;k++)mbAdd(mb,geoCyl(.0035,.0035,.12,4),TM(sd*.16,-.035+k*.022,.2,{rz:sd*(Math.PI/2+(k-1)*.18),ry:-sd*.35}),CC('#5a3a2a',.2));
});}
function chefEye(si){const frog=SKINS[si].ears==='frog';return mdl('oeil:'+(frog?'g':'n'),mb=>{
 if(frog){mbAdd(mb,geoBlob(.06,.06,.045,16,12),ID4,CC('#ffffff',.8));mbAdd(mb,geoBlob(.032,.042,.02,14,10),TM(0,0,.04),CC('#1b1220',1));mbAdd(mb,geoBlob(.012,.014,.006,8,6),TM(-.01,.015,.058),CC('#ffffff',1));return;}
 mbAdd(mb,geoBlob(.044,.058,.028,16,12),ID4,(p)=>mixc(CC('#2a1830',1),CC('#120a16',1),.5+p[1]*8));
 mbAdd(mb,geoBlob(.016,.019,.008,10,8),TM(-.013,.021,.024),CC('#ffffff',1));mbAdd(mb,geoBlob(.008,.008,.005,8,6),TM(.014,-.016,.025),CC('#ffffff',1));});}
function chefEyePos(si){return SKINS[si].ears==='frog'?[.12,.2,.13,.2]:[.1,.035,.222,.38];}
mdl('toque',mb=>{const w=p=>mixc(CC('#ffffff',.25),CC('#e3e6ef',.2),sstep(.12,-.02,p[1]));
 mbAdd(mb,geoLathe([[0,0],[.155,0],[.16,.012],[.158,.1],[.15,.11],[0,.11]],40,8,u=>1+.025*Math.cos(u*TAU*14)),ID4,p=>mulc(CC('#ffffff',.2),.92+.06*Math.cos(Math.atan2(p[2],p[0])*14)));
 mbAdd(mb,geoBlob(.14,.11,.14,22,16),TM(0,.2,0),w);
 for(let i=0;i<6;i++){const a=i/6*TAU;mbAdd(mb,geoBlob(.1,.095,.1,18,12),TM(Math.cos(a)*.1,.16,Math.sin(a)*.1),w);}});
function chefHand(si){return mdl('main:'+si,mb=>{const c=CC(SKINS[si].paw,.3);mbAdd(mb,geoBlob(.072,.066,.072,16,12),ID4,c);mbAdd(mb,geoBlob(.03,.028,.03,10,8),TM(.05,.02,.03),c);});}
mdl('pied',mb=>{mbAdd(mb,geoBlob(.072,.048,.1,16,10),TM(0,.045,.01),CC('#4b3c48',.5));mbAdd(mb,geoBlob(.074,.02,.102,16,8),TM(0,.015,.01),CC('#2e2530',.3));});
function hatPos(si){const e=SKINS[si].ears;return e==='frog'?[0,.14,-.09,-.3]:e==='bunny'?[0,.17,-.06,-.22]:[0,.165,-.03,-.16];}
