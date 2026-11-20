// ================= DONNÉES ET LOGIQUE (cuisine partagée) =================
const CH=0.92,SPEED=4.4,DASH=10.5,CHOPT=2.0,WASHT=1.6,COOKT=11,BURNT=9,EXT=1.4,DIRTYT=7;
const TYPE={'.':'floor','1':'floor','2':'floor','#':'counter','t':'crate','l':'crate','C':'board','F':'stove','P':'rack','W':'sink','D':'dirty','S':'serve','X':'trash','E':'counter'};
const CRATE={t:'tomate',l:'laitue'};
const CHOP=new Set(['tomate','laitue']);
const RECIPES={
 soupe:{nom:'Soupe de tomate',items:['soupe'],pipe:['tomate','tomate','tomate','pot']},
 salade:{nom:'Salade',items:['laitue_coupe','tomate_coupe'],pipe:['laitue','tomate','knife']}
};
const LEVELS=[
 {id:'o1',name:'Soupe de tomate',num:'1-1',dur:180,stars:[60,140,220],recipes:['soupe'],first:['soupe','soupe'],interval:20,patience:80,maxOrders:4,plates:3,
  theme:{body:'#2f8f9d',top:'#d9b07a',floor:'#e6d8bf',wall:'#a7dccf',trim:'#f2c14e'},
  map:["##tt#CC#FF#",
       "#.........S",
       "X...##....D",
       "#...##....#",
       "E.1....2..#",
       "#.........#",
       "##PW#######"]},
 {id:'o2',name:'Salade et soupe',num:'1-2',dur:180,stars:[80,180,280],recipes:['soupe','salade'],first:['salade','soupe','salade'],interval:16,patience:85,maxOrders:4,plates:4,
  theme:{body:'#c4573a',top:'#d9b07a',floor:'#dfe6ea',wall:'#f3c9a7',trim:'#2f8f9d'},
  map:["#tl#CC#FF##",
       "#.........S",
       "#...#..#..D",
       "X...#..#..#",
       "#.1.....2.#",
       "E.........#",
       "##PW##C####"]}
];
const COURSES=['Monde 1'];
const key=it=>it?(it.st?it.k+'_'+it.st:it.k):'';
function subMulti(a,b){const m={};for(const x of b)m[x]=(m[x]||0)+1;for(const x of a){if(!m[x])return false;m[x]--;}return true;}
function sameMulti(a,b){return a.length===b.length&&subMulti(a,b);}
const rnd=(a,b)=>a+Math.random()*(b-a);

let G=null;
function buildLevel(idx){
 const L=LEVELS[idx],H=L.map.length,W=L.map[0].length,tiles=[],spawns=[];
 for(let z=0;z<H;z++){const row=[];for(let x=0;x<W;x++){const ch=L.map[z][x],type=TYPE[ch]||'floor';
  const t={ch,type,x,z,item:null,seed:Math.random()};
  if(type==='crate')t.ing=CRATE[ch];
  if(type==='stove')t.pot={c:[],prog:0,done:false,burn:0,burnt:false},t.fire=0;
  if(type==='rack')t.cnt=L.plates;if(type==='dirty')t.cnt=0;if(type==='sink')t.dirty=0,t.wp=0;
  if(ch==='E')t.item={k:'extincteur'};if(type==='board')t.cp=0;
  if(ch==='1'||ch==='2')spawns[+ch-1]={x:x+.5,z:z+.5};row.push(t);}tiles.push(row);}

 const seen=new Set(),q=[[Math.floor(spawns[0].x),Math.floor(spawns[0].z)]];seen.add(q[0].join(','));
 while(q.length){const [x,z]=q.shift();for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(nx<0||nz<0||nx>=W||nz>=H||seen.has(k))continue;if(tiles[nz][nx].type!=='floor')continue;seen.add(k);q.push([nx,nz]);}}
 for(const row of tiles)for(const t of row)if(t.type!=='floor'&&t.type!=='counter'&&![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>seen.has((t.x+dx)+','+(t.z+dz))))console.warn('Poste inaccessible',t.type,t.x,t.z);
 return {L,W,H,tiles,spawns};
}
function startLevel(idx){
 levelIdx=idx;const B=buildLevel(idx),L=B.L;
 G={idx,L,W:B.W,H:B.H,tiles:B.tiles,time:L.dur,elapsed:0,score:0,served:0,lost:0,streak:0,tipsMax:0,
  orders:[],next:.5,nOrders:0,dirtyQ:[],fx:[],floats:[],parts:[],
  players:[0,1].map(i=>({i,x:B.spawns[i].x,z:B.spawns[i].z,dir:{x:0,z:1},held:null,walk:0,moving:false,working:false,workTile:null,target:null,dash:0,dashCd:0,sayCd:0,last:'',snd:0,skin:choice[i]}))};
}
const T=(x,z)=>G&&x>=0&&z>=0&&x<G.W&&z<G.H?G.tiles[z][x]:null;
const all=f=>{const r=[];for(const row of G.tiles)for(const t of row)if(f(t))r.push(t);return r;};
const solid=(x,z)=>{const t=T(x,z);return !t||t.type!=='floor';};
function collides(x,z,r){return solid(Math.floor(x-r),Math.floor(z-r))||solid(Math.floor(x+r),Math.floor(z-r))||solid(Math.floor(x-r),Math.floor(z+r))||solid(Math.floor(x+r),Math.floor(z+r));}
function moveP(p,inp,dt,other){
 const len=Math.hypot(inp.mx,inp.my);p.moving=len>.2;p.dashCd=Math.max(0,p.dashCd-dt);p.dash=Math.max(0,p.dash-dt);
 if(inp.dash&&p.dashCd<=0){p.dash=.17;p.dashCd=.7;emitLocal({s:'dash'});}
 if(p.moving||p.dash>0){let nx=p.dir.x,nz=p.dir.z;if(p.moving){nx=inp.mx/len;nz=inp.my/len;p.dir={x:nx,z:nz};}
  const sp=(p.dash>0?DASH:SPEED*Math.min(1,len))*dt,r=.3;
  if(!collides(p.x+nx*sp,p.z,r))p.x+=nx*sp;if(!collides(p.x,p.z+nz*sp,r))p.z+=nz*sp;p.walk+=dt*(p.dash>0?22:13);}
 else p.walk=0;
 if(other){const dx=p.x-other.x,dz=p.z-other.z,d=Math.hypot(dx,dz);if(d<.62&&d>1e-4){const push=(.62-d)/2;const ux=dx/d,uz=dz/d;if(!collides(p.x+ux*push,p.z,.3))p.x+=ux*push;if(!collides(p.x,p.z+uz*push,.3))p.z+=uz*push;}}
}
function facing(p){
 const tx=Math.floor(p.x),tz=Math.floor(p.z);let best=null,bs=1e9;
 for(let z=tz-1;z<=tz+1;z++)for(let x=tx-1;x<=tx+1;x++){const t=T(x,z);if(!t||t.type==='floor')continue;
  const cx=Math.max(x,Math.min(x+1,p.x)),cz=Math.max(z,Math.min(z+1,p.z)),d=Math.hypot(cx-p.x,cz-p.z);if(d>.75)continue;
  const vx=x+.5-p.x,vz=z+.5-p.z,vl=Math.hypot(vx,vz)||1,dot=(vx*p.dir.x+vz*p.dir.z)/vl;
  const sc=d-dot*.5+(x!==tx&&z!==tz?.25:0)-(useful(p,t)?.3:0);if(sc<bs){bs=sc;best=t;}}
 return best;
}
function useful(p,t){const h=p.held;if(h)return !t.item||['serve','trash','sink','stove','rack'].includes(t.type)||t.item.k==='assiette'||h.k==='assiette';
 return !!t.item||['crate','rack','dirty','board','stove','sink'].includes(t.type)&&(t.type!=='rack'||t.cnt>0)&&(t.type!=='dirty'||t.cnt>0)&&(t.type!=='sink'||t.dirty>0);}

// ---------- Effets (enregistrés pour être rejoués chez l'invité) ----------
function emitLocal(e){if(NET.role==='host'&&state==='play')NET.out.push(e);playFx(e);}
function playFx(e){
 if(e.s&&SFX0[e.s])SFX0[e.s]();
 if(e.f)G.floats.push({x:e.f[0],y:e.f[1],z:e.f[2],text:e.f[3],col:e.f[4]||'#fff',life:1.6,max:1.6,big:e.f[5]||0});
 if(e.p){const [x,y,z,col,n,kind]=e.p;for(let i=0;i<n;i++)G.parts.push({x,y,z,vx:rnd(-1.4,1.4),vy:rnd(1,3.2),vz:rnd(-1.4,1.4),g:kind==='steam'?-.5:7,life:rnd(.4,.9),max:.9,col,r:rnd(3,6),kind:kind||'bit'});}
}
const fx=(x,z,txt,col,big)=>emitLocal({f:[+x.toFixed(2),1.6,+z.toFixed(2),txt,col,big]});
const burst=(x,y,z,col,n,kind)=>emitLocal({p:[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2),col,n,kind]});
function say(p,txt){if(p.sayCd>0&&p.last===txt)return;p.sayCd=1.4;p.last=txt;emitLocal({f:[+p.x.toFixed(2),2.2,+p.z.toFixed(2),txt,'#ffffff',-1]});}

// ---------- Interactions ----------
const PLATEABLE=new Set(['tomate_coupe','laitue_coupe']);
function plateAccepts(pl,k){if(pl.c.includes('soupe'))return false;const cand=[...pl.c,k];return G.L.recipes.some(r=>subMulti(cand,RECIPES[r].items));}
function potReady(t){return t.pot&&t.pot.done&&!t.pot.burnt&&!t.fire;}
function press(p){
 const t=p.target,h=p.held;if(!t)return;
 if(t.fire>0){say(p,'Au feu ! Prends l’extincteur');return;}
 switch(t.type){
  case 'crate':if(!h){p.held={k:t.ing,st:'cru',cp:0};emitLocal({s:'pick'});}else if(h.k===t.ing&&h.st==='cru'){p.held=null;emitLocal({s:'drop'});}else say(p,'Les mains sont pleines');break;
  case 'rack':
   if(!h){if(t.cnt>0){t.cnt--;p.held={k:'assiette',c:[]};emitLocal({s:'pick'});}else say(p,'Plus d’assiette propre : à la plonge !');}
   else if(h.k==='assiette'&&!h.c.length){t.cnt++;p.held=null;emitLocal({s:'drop'});}
   else if(PLATEABLE.has(key(h))&&t.cnt>0){const pl={k:'assiette',c:[key(h)]};if(plateAccepts({c:[]},key(h))){t.cnt--;p.held=pl;emitLocal({s:'pick'});}}
   break;
  case 'dirty':if(!h&&t.cnt>0){p.held={k:'sales',n:t.cnt};t.cnt=0;emitLocal({s:'pick'});}else if(h&&h.k==='sales'){t.cnt+=h.n;p.held=null;emitLocal({s:'drop'});}break;
  case 'sink':if(h&&h.k==='sales'){t.dirty+=h.n;p.held=null;emitLocal({s:'splash'});}else if(!h&&t.dirty>0){p.working=true;p.workTile=t;}else if(!h)say(p,'Rien à laver');break;
  case 'trash':
   if(!h)break;
   if(h.k==='assiette'){if(h.c.length){h.c=[];emitLocal({s:'drop'});}}
   else if(h.k==='sales'||h.k==='extincteur'){say(p,'Pas à la poubelle !');}
   else{p.held=null;emitLocal({s:'drop'});burst(t.x+.5,CH+.2,t.z+.5,'#8a8f9c',6);}
   break;
  case 'serve':
   if(!h){break;}if(h.k!=='assiette'||!h.c.length){say(p,'Apporte une assiette garnie');break;}serve(p,t);break;
  case 'stove':{
   const pot=t.pot;
   if(!h){if(pot.burnt){pot.c=[];pot.prog=0;pot.done=false;pot.burn=0;pot.burnt=false;emitLocal({s:'drop'});say(p,'Marmite vidée');}break;}
   if(h.k==='assiette'){if(potReady(t)&&!h.c.length){h.c=['soupe'];pot.c=[];pot.prog=0;pot.done=false;pot.burn=0;emitLocal({s:'pick'});}else if(potReady(t))say(p,'Il faut une assiette vide');else say(p,pot.c.length?'Pas encore cuit…':'La marmite est vide');break;}
   if(key(h)==='tomate_coupe'){if(pot.c.length<3&&!pot.burnt&&!pot.done){pot.c.push('tomate');p.held=null;emitLocal({s:'plop'});burst(t.x+.5,CH+.4,t.z+.5,'#ff8a6a',5);}else say(p,'La marmite est pleine');}
   else if(h.st==='cru')say(p,'Coupe-la d’abord !');else say(p,'Pas dans la soupe');
   break;}
  case 'board':
   if(!h&&t.item&&t.item.st==='cru'){p.working=true;p.workTile=t;break;}
   if(!h&&t.item){p.held=t.item;t.item=null;emitLocal({s:'pick'});break;}
   if(h&&!t.item){if(h.st==='cru'){t.item=h;p.held=null;emitLocal({s:'drop'});}else say(p,'Seulement des produits crus');break;}
   if(h&&h.k==='assiette'&&t.item&&t.item.st==='coupe'){if(plateAccepts(h,key(t.item))){h.c.push(key(t.item));t.item=null;emitLocal({s:'drop'});}else say(p,'Ça ne va pas ensemble');}
   break;
  case 'counter':
   if(!h&&t.item){p.held=t.item;t.item=null;emitLocal({s:'pick'});break;}
   if(h&&!t.item){t.item=h;p.held=null;emitLocal({s:'drop'});break;}
   if(h&&t.item){
    if(h.k==='assiette'&&PLATEABLE.has(key(t.item))){if(plateAccepts(h,key(t.item))){h.c.push(key(t.item));t.item=null;emitLocal({s:'drop'});}else say(p,'Ça ne va pas ensemble');}
    else if(t.item.k==='assiette'&&PLATEABLE.has(key(h))){if(plateAccepts(t.item,key(h))){t.item.c.push(key(h));p.held=null;emitLocal({s:'drop'});}else say(p,'Ça ne va pas ensemble');}
    else say(p,'Déjà occupé');
   }
   break;
 }
}
function work(p,dt){
 const t=p.workTile;if(!t){p.working=false;return;}p.chopping=true;
 if(t.type==='board'){const it=t.item;if(!it||it.st!=='cru'){p.working=false;return;}it.cp+=dt/CHOPT;p.snd-=dt;if(p.snd<=0){emitLocal({s:'chop'});p.snd=.2;}
  if(Math.random()<dt*7)burst(t.x+.5,CH+.15,t.z+.5,it.k==='tomate'?'#e0412f':'#79c95a',1);
  if(it.cp>=1){it.st='coupe';it.cp=0;p.working=false;burst(t.x+.5,CH+.2,t.z+.5,it.k==='tomate'?'#e0412f':'#79c95a',8);emitLocal({s:'done'});}}
 else if(t.type==='sink'){if(t.dirty<=0){p.working=false;return;}t.wp+=dt/WASHT;p.snd-=dt;if(p.snd<=0){emitLocal({s:'scrub'});p.snd=.35;}
  if(Math.random()<dt*8)burst(t.x+.5,CH+.25,t.z+.5,'#d8f1ff',1,'steam');
  if(t.wp>=1){t.wp=0;t.dirty--;const r=all(x=>x.type==='rack')[0];if(r)r.cnt++;emitLocal({s:'done'});}}
}
function spray(p,dt){
 // l'extincteur éteint le feu du poste visé (et tout feu dans le cône devant le chef)
 if(p.target&&p.target.fire>0){const vx=p.target.x+.5-p.x,vz=p.target.z+.5-p.z,l=Math.hypot(vx,vz)||1;p.dir={x:vx/l,z:vz/l};}
 for(const t of all(x=>x.fire>0)){const vx=t.x+.5-p.x,vz=t.z+.5-p.z,d=Math.hypot(vx,vz),dot=(vx*p.dir.x+vz*p.dir.z)/(d||1);
  if(d<2.2&&dot>.55){t.fire=Math.max(0,t.fire-dt/EXT);if(t.fire<=0)emitLocal({s:'done'});}}
 if(Math.random()<dt*30)G.parts.push({x:p.x+p.dir.x*.5,y:1.0,z:p.z+p.dir.z*.5,vx:p.dir.x*5+rnd(-.6,.6),vy:rnd(-.2,.6),vz:p.dir.z*5+rnd(-.6,.6),g:0,life:.5,max:.5,col:'rgba(255,255,255,.9)',r:rnd(5,9),kind:'steam'});
 p.snd-=dt;if(p.snd<=0){emitLocal({s:'spray'});p.snd=.25;}
}
function serve(p,t){
 const pl=p.held,i=G.orders.findIndex(o=>sameMulti(pl.c,RECIPES[o.r].items));
 if(i<0){say(p,'Personne n’a commandé ça');emitLocal({s:'fail'});return;}
 const o=G.orders[i];G.streak=Math.min(4,G.streak+1);
 const tip=Math.round(8*o.t/o.max)*G.streak,pts=20+tip;G.score+=pts;G.served++;G.orders.splice(i,1);p.held=null;
 fx(t.x+.5,t.z+.5,'+'+pts+(G.streak>1?'  ×'+G.streak:''),'#ffd34d',1);emitLocal({s:'serve'});burst(t.x+.5,CH+.3,t.z+.5,'#ffd34d',14);
 G.dirtyQ.push(DIRTYT);
}
function updOrders(dt){
 const L=G.L,pick=()=>L.first&&G.nOrders<L.first.length?L.first[G.nOrders]:L.recipes[Math.floor(Math.random()*L.recipes.length)];
 for(const o of G.orders){o.t-=dt;o.age+=dt;}
 for(let i=G.orders.length-1;i>=0;i--)if(G.orders[i].t<=0){G.orders.splice(i,1);G.score=Math.max(0,G.score-10);G.lost++;G.streak=0;emitLocal({s:'fail'});emitLocal({f:[G.W/2,2,0,'Commande ratée −10','#ff7a6a',1]});}
 G.next-=dt;if(G.next<=0){if(G.orders.length<L.maxOrders){G.orders.push({r:pick(),t:L.patience,max:L.patience,age:0});G.nOrders++;emitLocal({s:'order'});}G.next=G.nOrders<2?3:L.interval;}
}
function update(dt){
 G.time-=dt;G.elapsed+=dt;if(G.time<=0){G.time=0;endLevel();return;}
 const [a,b]=G.players;
 control(a,dt,readInput(),b);control(b,dt,remoteInput(b,dt),a);
 for(const t of all(x=>x.type==='stove')){const pot=t.pot;
  if(t.fire>0){t.fire=Math.min(1,t.fire+dt*.02);continue;}
  if(pot.burnt)continue;
  if(pot.c.length&&!pot.done){pot.prog=Math.min(pot.c.length/3,pot.prog+dt/COOKT);if(pot.c.length===3&&pot.prog>=1){pot.done=true;pot.burn=0;emitLocal({s:'ding'});}}
  else if(pot.done){pot.burn+=dt/BURNT;if(pot.burn>.55){pot.warn=(pot.warn||0)-dt;if(pot.warn<=0){emitLocal({s:'warn'});pot.warn=.5;}}if(pot.burn>=1){pot.burnt=true;pot.done=false;t.fire=.6;emitLocal({s:'fire'});fx(t.x+.5,t.z+.5,'Au feu !','#ff7a3a',1);}}}
 for(let i=G.dirtyQ.length-1;i>=0;i--){G.dirtyQ[i]-=dt;if(G.dirtyQ[i]<=0){G.dirtyQ.splice(i,1);const d=all(x=>x.type==='dirty')[0];if(d){d.cnt++;emitLocal({s:'clink'});}}}
 updOrders(dt);
}
function control(p,dt,inp,other){
 if(inp.remote){p.moving=inp.mv;}else moveP(p,inp,dt,other);
 p.target=facing(p);
 if(inp.remote&&inp.tg){const t=T(inp.tg[0],inp.tg[1]);if(t&&t.type!=='floor'&&Math.hypot(t.x+.5-p.x,t.z+.5-p.z)<1.7)p.target=t;}
 p.sayCd=Math.max(0,p.sayCd-dt);p.chopping=false;
 const ext=p.held&&p.held.k==='extincteur',anyFire=all(t=>t.fire>0).length>0;
 if(ext&&anyFire){if(inp.actH){spray(p,dt);p.spraying=true;}else p.spraying=false;}
 else{p.spraying=false;if(inp.act)press(p);}
 if(p.working){if(inp.actH&&p.target===p.workTile)work(p,dt);else p.working=false;}
}
// ---------- Aide pour les joueurs automatiques (tests) ----------
function nearest(p,list){let b=null,bd=1e9;for(const t of list){const d=Math.hypot(t.x+.5-p.x,t.z+.5-p.z);if(d<bd){bd=d;b=t;}}return b;}
function countAll(pred){let n=0;for(const t of all(()=>true)){if(t.item&&pred(t.item))n++;}for(const p of G.players)if(p.held&&pred(p.held))n++;return n;}
function planFor(p,role){
 const h=p.held,pots=all(t=>t.type==='stove'),rack=all(t=>t.type==='rack')[0],sink=all(t=>t.type==='sink')[0],dirty=all(t=>t.type==='dirty')[0];
 const emptyCounter=()=>nearest(p,all(t=>t.type==='counter'&&!t.item));
 const soupsWanted=G.orders.filter(o=>o.r==='soupe').length,saladsWanted=G.orders.filter(o=>o.r==='salade').length;
 const fire=all(t=>t.fire>0)[0];
 // tout le monde : le feu d'abord
 if(fire){if(h&&h.k==='extincteur')return {t:fire,hold:true};if(!h){const e=all(t=>t.item&&t.item.k==='extincteur')[0];if(e)return {t:e};}else if(role===1)return {t:emptyCounter()};}
 if(h){
  if(h.k==='extincteur')return {t:nearest(p,all(t=>t.ch==='E'&&!t.item))||emptyCounter()};
  if(h.k==='sales')return {t:sink};
  if(h.k==='assiette'){
   if(h.c.length&&G.orders.some(o=>sameMulti(h.c,RECIPES[o.r].items)))return {t:all(t=>t.type==='serve')[0]};
   if(!h.c.length){const ready=pots.find(potReady);if(ready)return {t:ready};}
   const miss=[];for(const o of G.orders){if(subMulti(h.c,RECIPES[o.r].items))miss.push(...RECIPES[o.r].items.filter(x=>!h.c.includes(x)));}
   const comp=nearest(p,all(t=>(t.type==='counter'||t.type==='board')&&t.item&&miss.includes(key(t.item))));if(comp)return {t:comp};
   if(!h.c.length&&!saladsWanted)return {t:rack};
   return {t:emptyCounter()};
  }
  if(h.st==='cru')return {t:nearest(p,all(t=>t.type==='board'&&!t.item))||emptyCounter()};
  if(key(h)==='tomate_coupe'){const inPots=pots.reduce((s,t)=>s+(t.pot.done?3:t.pot.c.length),0);const pot=pots.find(t=>!t.pot.done&&!t.pot.burnt&&t.pot.c.length<3&&!t.fire);
   if(pot&&inPots<soupsWanted*3)return {t:pot};}
  const pl=nearest(p,all(t=>t.type==='counter'&&t.item&&t.item.k==='assiette'&&plateAccepts(t.item,key(h))));if(pl)return {t:pl};
  return {t:emptyCounter()};
 }
 const tasks=[];
 // rôle 1 : assiettes, service, plonge
 const serveTasks=()=>{
  const burnt=pots.find(t=>t.pot.burnt&&!t.fire);if(burnt)return {t:burnt};
  const full=nearest(p,all(t=>t.type==='counter'&&t.item&&t.item.k==='assiette'&&t.item.c.length&&G.orders.some(o=>sameMulti(t.item.c,RECIPES[o.r].items))));if(full)return {t:full};
  if(pots.some(potReady)&&rack.cnt>0)return {t:rack};
  const needPlate=saladsWanted>countAll(it=>it.k==='assiette'&&it.c.some(x=>x!=='soupe'))&&countAll(it=>it.k==='laitue'&&it.st==='coupe')+countAll(it=>it.k==='assiette'&&it.c.includes('laitue_coupe'))>0;
  if(needPlate&&rack.cnt>0)return {t:rack};
  if(dirty.cnt>0&&(rack.cnt<2||sink.dirty===0))return {t:dirty};
  if(sink.dirty>0&&rack.cnt<3)return {t:sink,hold:true};
  return null;};
 // rôle 0 : préparation
 const prepTasks=()=>{
  const ch=all(t=>t.type==='board'&&t.item&&t.item.st==='cru');if(ch.length)return {t:nearest(p,ch),hold:true};
  const cut=all(t=>t.type==='board'&&t.item&&t.item.st==='coupe');if(cut.length)return {t:nearest(p,cut)};
  const loose=all(t=>t.type==='counter'&&t.item&&t.item.k==='tomate'&&t.item.st==='coupe');
  const potRoom=pots.find(t=>!t.pot.done&&!t.pot.burnt&&t.pot.c.length<3&&!t.fire);
  const inPots=pots.reduce((s,t)=>s+(t.pot.done?3:t.pot.c.length),0);
  const tomOut=countAll(it=>it.k==='tomate');
  if(loose.length&&potRoom&&inPots<soupsWanted*3)return {t:nearest(p,loose)};
  const tomNeed=Math.max(0,soupsWanted*3-inPots)+Math.max(0,saladsWanted-countAll(it=>it.k==='assiette'&&it.c.includes('tomate_coupe')));
  const letNeed=Math.max(0,saladsWanted-countAll(it=>it.k==='assiette'&&it.c.includes('laitue_coupe')));
  if(tomOut<Math.min(tomNeed,potRoom||saladsWanted?tomNeed:0))return {t:nearest(p,all(t=>t.type==='crate'&&t.ing==='tomate'))};
  if(countAll(it=>it.k==='laitue')<letNeed)return {t:nearest(p,all(t=>t.type==='crate'&&t.ing==='laitue'))};
  return null;};
 const order=role===0?[prepTasks,serveTasks]:[serveTasks,prepTasks];
 for(const f of order){const r=f();if(r&&r.t)return r;}
 return null;
}
