// ================= DONNÉES ET LOGIQUE (cuisine partagée) =================
const CH=0.92,SPEED=4.4,DASH=10.5,CHOPT=2.0,WASHT=1.6,COOKT=11,BURNT=9,EXT=1.4,DIRTYT=7,BELTT=1.1,CONVV=1.8,DEADT=3,PANT=7,PANBURN=8,FIRESPREAD=7,MOUSEV=2.3;
// Légende des plans :
//  .  sol        1 2 départs     #  comptoir     E  comptoir de l'extincteur
//  t l o  caisses (tomate, laitue, oignon)       C  planche     F  feu + marmite
//  P  assiettes propres   W  plonge   D  retour de vaisselle   S  passe   X  poubelle
//  *  glace      ~  eau          =  pont A       -  pont B (en alternance)
//  > < ^ v  tapis roulants au sol (poussent les chefs)
//  } { ) (  convoyeurs à objets (vers la droite, la gauche, le bas, le haut)
//  b m  caisses (pain, steak)   G  poêle     H  trou de souris
//  @ &  et  % $  paires de portails
const TYPE={'G':'pan','b':'crate','m':'crate','H':'hole','#':'counter','E':'counter','t':'crate','l':'crate','o':'crate','C':'board','F':'stove','P':'rack','W':'sink','D':'dirty','S':'serve','X':'trash','}':'belt','{':'belt',')':'belt','(':'belt'};
const GROUND={'@':'portal','&':'portal','%':'portal','$':'portal','*':'ice','~':'water','=':'bridgeA','-':'bridgeB','>':'conv','<':'conv','^':'conv','v':'conv'};
const DIRS={'>':[1,0],'<':[-1,0],'v':[0,1],'^':[0,-1],'}':[1,0],'{':[-1,0],')':[0,1],'(':[0,-1]};
const CRATE={t:'tomate',l:'laitue',o:'oignon',b:'pain',m:'steak'};
const NOSTATE=new Set(['pain']);
const PAIR={'@':'&','&':'@','%':'$','$':'%'};
const BURN=new Set(['counter','board','crate','stove','pan','trash','rack','dirty','belt']);
const CHOP=new Set(['tomate','laitue','oignon']);
const SOUPING={tomate:'soupe',oignon:'soupe_oignon'};   // ingrédient → contenu de l'assiette
const SOUPS=new Set(Object.values(SOUPING));
const RECIPES={
 soupe:{nom:'Soupe de tomate',items:['soupe'],pipe:['tomate','tomate','tomate','pot'],ing:'tomate'},
 oignon:{nom:'Soupe à l’oignon',items:['soupe_oignon'],pipe:['oignon','oignon','oignon','pot'],ing:'oignon'},
 salade:{nom:'Salade',items:['laitue_coupe','tomate_coupe'],pipe:['laitue','tomate','knife']},
 burger:{nom:'Burger',items:['pain','steak_cuit'],pipe:['steak','pan','pain']},
 burger_garni:{nom:'Burger garni',items:['pain','steak_cuit','laitue_coupe','tomate_coupe'],pipe:['steak','pan','pain','laitue','tomate']}
};
const WORLDS=[{nom:'Le Bistrot'},{nom:'Terrains piégés'},{nom:'Les Folies'}];
const LEVELS=[
 {id:'o1',w:0,num:'1-1',name:'Soupe de tomate',dur:180,stars:[3,6,9,12],recipes:['soupe'],first:['soupe','soupe'],interval:15,patience:80,maxOrders:4,plates:3,
  theme:{body:'#2f8f9d',top:'#d9b07a',floor:'#e6d8bf',wall:'#a7dccf',trim:'#f2c14e'},
  map:["##tt#CC#FF#",
       "#.........S",
       "X...##....D",
       "#...##....#",
       "E.1....2..#",
       "#.........#",
       "##PW#######"]},
 {id:'o2',w:0,num:'1-2',name:'Salade et soupe',dur:180,stars:[3,6,8,10],recipes:['soupe','salade'],first:['salade','soupe','salade'],interval:14,patience:85,maxOrders:4,plates:4,
  theme:{body:'#c4573a',top:'#d9b07a',floor:'#dfe6ea',wall:'#f3c9a7',trim:'#2f8f9d'},
  map:["#tl#CC#FF##",
       "#.........S",
       "#...#..#..D",
       "X...#..#..#",
       "#.1.....2.#",
       "E.........#",
       "##PW##C####"]},
 {id:'o3',w:0,num:'1-3',name:'Coup de feu',dur:180,stars:[3,6,8,10],recipes:['soupe','oignon'],first:['oignon','soupe','oignon'],interval:14,patience:80,maxOrders:4,plates:4,hint:'Nouvel ingrédient : l’oignon',
  theme:{body:'#6b4fa0',top:'#e0b884',floor:'#efe2cc',wall:'#f6d78b',trim:'#c4573a'},
  map:["#to#CC#FFF#",
       "#.........S",
       "X..#..#...D",
       "#..#..#...#",
       "E.1....2..#",
       "#.........#",
       "##PW#C#####"]},
 {id:'t1',w:1,num:'2-1',name:'Le passe-plat',dur:180,stars:[3,6,9,11],recipes:['soupe','salade'],first:['soupe','salade','soupe'],interval:15,patience:90,maxOrders:4,plates:4,hint:'Un comptoir vous sépare : passez-vous les ingrédients.',
  theme:{body:'#3d7a4f',top:'#d9b07a',floor:'#e9dfc9',wall:'#bfe0c0',trim:'#e8603c'},
  map:["#tt#l#FF#S#",
       "C....#....D",
       "#....#....#",
       "C.1..#..2.#",
       "#....#....E",
       "X....#....#",
       "###C##PW###"]},
 {id:'t2',w:1,num:'2-2',name:'La patinoire',dur:180,stars:[2,4,6,8],recipes:['soupe','salade'],first:['soupe','salade','soupe'],interval:16,patience:90,maxOrders:4,plates:4,hint:'Sol gelé : ça glisse !',
  theme:{body:'#4a78a8',top:'#e8eef4',floor:'#dff2fa',wall:'#cfe7f5',trim:'#ffffff',snow:1},
  map:["#tl#CC#FF#S#",
       "#**********D",
       "X**#****#**#",
       "#*1*****2**#",
       "E**#****#**#",
       "#**********#",
       "##PW##C#####"]},
 {id:'t3',w:1,num:'2-3',name:'Le pont-levis',dur:180,stars:[2,4,6,8],recipes:['soupe','salade'],first:['soupe','salade','soupe'],interval:16,patience:95,maxOrders:4,plates:4,bridge:{period:16,up:.6},hint:'Les ponts montent et descendent. Gare à l’eau !',
  theme:{body:'#8a5a36',top:'#d9b07a',floor:'#d8d2c4',wall:'#b9c7a5',trim:'#f2c14e'},
  map:["#tl#C~~#FFS#",
       "#....~~....D",
       "C....==....#",
       "#.1..~~..2.#",
       "X....~~....E",
       "#....--....#",
       "#....~~....#",
       "##C##~~#PW##"]},
 {id:'t4',w:1,num:'2-4',name:'L’usine',dur:180,stars:[4,7,10,12],recipes:['soupe','oignon','salade'],first:['soupe','salade','oignon'],interval:14,patience:90,maxOrders:4,plates:4,hint:'Les tapis roulants vous emportent.',
  theme:{body:'#596273',top:'#c9ced6',floor:'#d9d6cf',wall:'#e3c08a',trim:'#f2c14e'},
  map:["#tlo#CC##FFS#",
       "#...........D",
       "#.>>>>>>>>>.#",
       "X.1..}}}}..2#",
       "#.<<<<<<<<<.#",
       "E...........#",
       "##PW#C##C####"]},
 {id:'f1',w:2,num:'3-1',name:'Le grill',dur:180,stars:[3,6,9,12],recipes:['burger','burger_garni'],first:['burger','burger','burger_garni'],interval:14,patience:85,maxOrders:4,plates:4,vip:.2,hint:'Nouveau : la poêle. Et le feu se propage !',
  theme:{body:'#a33b2b',top:'#e2c08e',floor:'#f1e4cf',wall:'#f2b880',trim:'#2b2140'},
  map:["#bmtl#CGG##",
       "#.........S",
       "X...#..#..D",
       "#...#..#..#",
       "E.1....2..#",
       "#.........#",
       "##PW#C#####"]},
 {id:'f2',w:2,num:'3-2',name:'Les portails',dur:180,stars:[3,6,9,12],recipes:['burger_garni','salade','burger'],first:['burger','salade','burger_garni'],interval:15,patience:95,maxOrders:4,plates:4,vip:.2,hint:'Deux cuisines, reliées par des portails.',
  theme:{body:'#4b3f8f',top:'#d9b07a',floor:'#e4ddf0',wall:'#c9b8ef',trim:'#3ad6ff'},
  map:["#bmtl##C#GG##",
       "#....##.....S",
       "C..@.##..&..D",
       "#.1..##...2.#",
       "X..%.##..$..#",
       "#....##.....E",
       "###C###PW####"]},
 {id:'f3',w:2,num:'3-3',name:'La panne',dur:180,stars:[3,5,8,11],recipes:['burger_garni','soupe','burger'],first:['burger','soupe','burger_garni'],interval:15,patience:90,maxOrders:4,plates:4,vip:.2,dark:{period:40,dur:14,first:20},hint:'Des coupures de courant plongent la cuisine dans le noir.',
  theme:{body:'#2f4f6f',top:'#d9b07a',floor:'#dcd6c8',wall:'#9fb8c8',trim:'#ffd34d'},
  map:["#tl#CC#FF#S#",
       "#..........D",
       "X..........#",
       "#.1.bmGG.2.#",
       "E..........#",
       "#..........#",
       "##PW#C######"]},
 {id:'f4',w:2,num:'3-4',name:'Les souris',dur:180,stars:[3,5,8,10],recipes:['burger','oignon','salade'],first:['burger','salade','oignon'],interval:15,patience:90,maxOrders:4,plates:4,vip:.2,mice:{first:14,every:17,max:2},hint:'Des souris volent les ingrédients : attrapez-les !',
  theme:{body:'#7a5a3a',top:'#e8cf9a',floor:'#ece3d0',wall:'#d6c3a0',trim:'#c4573a'},
  map:["#bmo#CC#GFS#",
       "#..........D",
       "H..#....#..#",
       "#.1#....#2.#",
       "X..#....#..H",
       "#..........E",
       "##PW#C#tl###"]},
 {id:'f5',w:2,num:'3-5',name:'Le grand banquet',dur:200,stars:[3,6,9,12],recipes:['burger','soupe','oignon'],first:['burger','soupe','oignon'],interval:14,patience:95,maxOrders:5,plates:5,vip:.25,dark:{period:45,dur:13,first:35},mice:{first:20,every:19,max:2},hint:'Portails, souris et coupures : tout à la fois !',
  theme:{body:'#8a2f5a',top:'#e8cf9a',floor:'#efe2d6',wall:'#f2c6a0',trim:'#ffd34d'},
  map:["#tbmo#CC#FF#S#",
       "#............D",
       "H..@..##..&..#",
       "#.1...##...2.#",
       "X.....##.....#",
       "#..%..##..$..H",
       "#............E",
       "##PW#C##GG#C##"]}
];
const key=it=>it?(it.st?it.k+'_'+it.st:it.k):'';
function subMulti(a,b){const m={};for(const x of b)m[x]=(m[x]||0)+1;for(const x of a){if(!m[x])return false;m[x]--;}return true;}
function sameMulti(a,b){return a.length===b.length&&subMulti(a,b);}
const rnd=(a,b)=>a+Math.random()*(b-a);
const NB=[[1,0],[-1,0],[0,1],[0,-1]];

let G=null;
function buildLevel(idx){
 const L=LEVELS[idx],H=L.map.length,W=L.map[0].length,tiles=[],spawns=[];
 for(let z=0;z<H;z++){if(L.map[z].length!==W)console.warn('Ligne de longueur différente',L.num,z);const row=[];for(let x=0;x<W;x++){const ch=L.map[z][x]||'#',type=TYPE[ch]||'floor';
  const t={ch,type,x,z,item:null,seed:Math.random()};
  if(type==='floor'&&GROUND[ch]){t.g=GROUND[ch];if(t.g==='conv')t.push=DIRS[ch];}
  if(type==='pan')t.pan={it:null,prog:0,burn:0},t.fire=0;
  if(type==='belt'){t.bd=DIRS[ch];t.bp=.5;}
  if(type==='crate')t.ing=CRATE[ch];
  if(type==='stove')t.pot={c:[],prog:0,done:false,burn:0,burnt:false},t.fire=0;
  if(type==='rack')t.cnt=L.plates;if(type==='dirty')t.cnt=0;if(type==='sink')t.dirty=0,t.wp=0;
  if(ch==='E')t.item={k:'extincteur'};if(type==='board')t.cp=0;
  if(ch==='1'||ch==='2')spawns[+ch-1]={x:x+.5,z:z+.5};row.push(t);}tiles.push(row);}
 for(const row of tiles)for(const t of row)if(t.g==='portal'){for(const r2 of tiles)for(const u of r2)if(u.ch===PAIR[t.ch])t.pair=u;if(!t.pair)console.warn('Portail sans paire',L.num,t.x,t.z);}
 // contrôle : chaque poste doit être atteignable par au moins un chef
 const seen=new Set();for(const s of spawns){const q=[[Math.floor(s.x),Math.floor(s.z)]];seen.add(q[0].join(','));
  while(q.length){const [x,z]=q.shift();for(const [dx,dz] of NB){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(nx<0||nz<0||nx>=W||nz>=H||seen.has(k))continue;const t=tiles[nz][nx];if(t.type!=='floor'||t.g==='water')continue;seen.add(k);q.push([nx,nz]);if(t.pair&&!seen.has(t.pair.x+','+t.pair.z)){seen.add(t.pair.x+','+t.pair.z);q.push([t.pair.x,t.pair.z]);}}}}
 for(const row of tiles)for(const t of row)if(t.type!=='floor'&&t.type!=='counter'&&!NB.some(([dx,dz])=>seen.has((t.x+dx)+','+(t.z+dz))))console.warn('Poste inaccessible',L.num,t.type,t.x,t.z);
 return {L,W,H,tiles,spawns};
}
function startLevel(idx){
 levelIdx=idx;const B=buildLevel(idx),L=B.L;
 G={idx,L,W:B.W,H:B.H,tiles:B.tiles,spawns:B.spawns,time:L.dur,elapsed:0,score:0,served:0,lost:0,streak:0,
  orders:[],next:.5,nOrders:0,dirtyQ:[],fx:[],floats:[],parts:[],bridgeState:{},mice:[],mouseT:L.mice?L.mice.first:0,mouseId:0,stolen:0,darkOn:false,
  players:[0,1].map(i=>({i,x:B.spawns[i].x,z:B.spawns[i].z,vx:0,vz:0,dir:{x:0,z:1},held:null,walk:0,moving:false,working:false,workTile:null,target:null,dash:0,dashCd:0,sayCd:0,last:'',snd:0,skin:choice[i],dead:0,await:false}))};
}
const T=(x,z)=>G&&x>=0&&z>=0&&x<G.W&&z<G.H?G.tiles[z][x]:null;
const all=f=>{const r=[];for(const row of G.tiles)for(const t of row)if(f(t))r.push(t);return r;};
const solid=(x,z)=>{const t=T(x,z);return !t||t.type!=='floor';};
function collides(x,z,r){return solid(Math.floor(x-r),Math.floor(z-r))||solid(Math.floor(x+r),Math.floor(z-r))||solid(Math.floor(x-r),Math.floor(z+r))||solid(Math.floor(x+r),Math.floor(z+r));}

// ---------- terrain ----------
// Ponts : déterministes à partir du temps écoulé (identiques chez les deux joueurs)
function bridgePhase(g){const B=G.L.bridge;if(!B)return null;const per=B.period;return {per,up:B.up*per,ph:(G.elapsed+(g==='bridgeB'?per/2:0)+per*.5)%per};}
function bridgeF(g){const b=bridgePhase(g);if(!b)return 1;const tr=.7,{ph,up}=b;if(ph<tr)return ph/tr;if(ph<up-tr)return 1;if(ph<up)return (up-ph)/tr;return 0;}
function bridgeLeft(g){const b=bridgePhase(g);if(!b)return 99;return b.ph<b.up?b.up-b.ph:-(b.per-b.ph);}   // >0 : secondes avant la descente ; <0 : avant la montée
const isBridge=t=>t.g==='bridgeA'||t.g==='bridgeB';
const deadly=t=>!!t&&t.type==='floor'&&(t.g==='water'||isBridge(t)&&bridgeF(t.g)<.5);
const groundAt=(x,z)=>T(Math.floor(x),Math.floor(z));
// Coupures de courant : déterministes elles aussi (0 = lumière, 1 = noir complet)
function darkF(){const D=G&&G.L.dark;if(!D)return 0;const ph=(G.elapsed+D.period-D.first)%D.period;
 if(ph<D.dur){if(ph<1.2)return Math.floor(ph*9)%2?.95:.35;if(ph>D.dur-.8)return (D.dur-ph)/.8;return 1;}
 if(ph>D.period-1.6)return Math.floor(ph*7)%2?.25:0;return 0;}

function moveP(p,inp,dt,other){
 if(p.dead>0){p.moving=false;p.walk=0;p.vx=p.vz=0;return;}
 const len=Math.hypot(inp.mx,inp.my);p.moving=len>.2;p.dashCd=Math.max(0,p.dashCd-dt);p.dash=Math.max(0,p.dash-dt);
 if(inp.dash&&p.dashCd<=0){p.dash=.17;p.dashCd=.7;emitLocal({s:'dash'});}
 const g=groundAt(p.x,p.z),ice=g&&g.g==='ice';
 let tx=0,tz=0;
 if(p.moving){const nx=inp.mx/len,nz=inp.my/len;p.dir={x:nx,z:nz};const s=SPEED*Math.min(1,len);tx=nx*s;tz=nz*s;}
 if(p.dash>0){tx=p.dir.x*DASH;tz=p.dir.z*DASH;}
 if(ice){const k=Math.min(1,dt*(p.dash>0?5:p.moving?2.6:1.1));p.vx+=(tx-p.vx)*k;p.vz+=(tz-p.vz)*k;}else{p.vx=tx;p.vz=tz;}
 let mx=p.vx,mz=p.vz;if(g&&g.push){mx+=g.push[0]*CONVV;mz+=g.push[1]*CONVV;}
 const r=.3;
 if(!collides(p.x+mx*dt,p.z,r))p.x+=mx*dt;else p.vx*=ice?-.25:0;
 if(!collides(p.x,p.z+mz*dt,r))p.z+=mz*dt;else p.vz*=ice?-.25:0;
 if(p.moving||p.dash>0)p.walk+=dt*(p.dash>0?22:13);else if(Math.hypot(mx,mz)>.6)p.walk+=dt*4;else p.walk=0;
 const gt=groundAt(p.x,p.z);
 if(gt&&gt.g==='portal'&&gt.pair){if(p.portalLock!==gt){const d=gt.pair;burst(p.x,.6,p.z,portalCol(gt),10,'steam');p.x=d.x+.5;p.z=d.z+.5;p.portalLock=d;emitLocal({s:'warp'});burst(p.x,.6,p.z,portalCol(d),12,'steam');}}else p.portalLock=null;
 if(other&&!(other.dead>0)){const dx=p.x-other.x,dz=p.z-other.z,d=Math.hypot(dx,dz);if(d<.62&&d>1e-4){const push=(.62-d)/2;const ux=dx/d,uz=dz/d;if(!collides(p.x+ux*push,p.z,.3))p.x+=ux*push;if(!collides(p.x,p.z+uz*push,.3))p.z+=uz*push;}}
}
const portalCol=t=>t.ch==='@'||t.ch==='&'?'#c08cff':'#7fe6ff';
function fall(p){
 p.dead=DEADT;p.working=false;p.workTile=null;p.target=null;p.spraying=false;p.chopping=false;p.vx=p.vz=0;
 emitLocal({s:'splash'});burst(p.x,.2,p.z,'#7cc3e6',16);fx(p.x,p.z,'Plouf !','#bfe8ff',1);
 const h=p.held;p.held=null;if(!h)return;
 // les assiettes reviennent sales, l'extincteur retourne à sa place, le reste est perdu
 if(h.k==='assiette')G.dirtyQ.push(DIRTYT);
 else if(h.k==='sales')for(let i=0;i<h.n;i++)G.dirtyQ.push(DIRTYT);
 else if(h.k==='extincteur'){const e=all(t=>t.ch==='E'&&!t.item)[0]||all(t=>t.type==='counter'&&!t.item)[0];if(e)e.item=h;}
}
function respawn(p){const s=G.spawns[p.i];p.dead=0;p.x=s.x;p.z=s.z;p.vx=p.vz=0;p.dir={x:0,z:1};p.await=true;emitLocal({s:'pop'});burst(s.x,.6,s.z,'#ffffff',10,'steam');}

function facing(p){
 if(p.dead>0)return null;
 const tx=Math.floor(p.x),tz=Math.floor(p.z);let best=null,bs=1e9;
 for(let z=tz-1;z<=tz+1;z++)for(let x=tx-1;x<=tx+1;x++){const t=T(x,z);if(!t||t.type==='floor')continue;
  const cx=Math.max(x,Math.min(x+1,p.x)),cz=Math.max(z,Math.min(z+1,p.z)),d=Math.hypot(cx-p.x,cz-p.z);if(d>.75)continue;
  const vx=x+.5-p.x,vz=z+.5-p.z,vl=Math.hypot(vx,vz)||1,dot=(vx*p.dir.x+vz*p.dir.z)/vl;
  const sc=d-dot*.5+(x!==tx&&z!==tz?.25:0)-(useful(p,t)?.3:0);if(sc<bs){bs=sc;best=t;}}
 return best;
}
function useful(p,t){const h=p.held;if(h)return !t.item||['serve','trash','sink','stove','rack','pan'].includes(t.type)||t.item.k==='assiette'||h.k==='assiette';
 return !!t.item||t.type==='pan'&&!!t.pan.it||['crate','rack','dirty','board','stove','sink'].includes(t.type)&&(t.type!=='rack'||t.cnt>0)&&(t.type!=='dirty'||t.cnt>0)&&(t.type!=='sink'||t.dirty>0);}

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
const PLATEABLE=new Set(['tomate_coupe','laitue_coupe','pain','steak_cuit']);
const hasSoup=c=>c.some(x=>SOUPS.has(x));
function plateAccepts(pl,k){if(hasSoup(pl.c))return false;const cand=[...pl.c,k];return G.L.recipes.some(r=>subMulti(cand,RECIPES[r].items));}
function potReady(t){return t.pot&&t.pot.done&&!t.pot.burnt&&!t.fire;}
function potTakes(t,ing){const pot=t.pot;return !!SOUPING[ing]&&!pot.burnt&&!pot.done&&!t.fire&&pot.c.length<3&&(!pot.c.length||pot.c[0]===ing);}
function emptyPot(pot){pot.c=[];pot.prog=0;pot.done=false;pot.burn=0;pot.burnt=false;}
function press(p){
 const t=p.target,h=p.held;if(!t)return;
 if(t.fire>0){say(p,'Au feu ! Prends l’extincteur');return;}
 switch(t.type){
  case 'crate':if(!h){p.held=NOSTATE.has(t.ing)?{k:t.ing}:{k:t.ing,st:'cru',cp:0};emitLocal({s:'pick'});}
   else if(h.k==='assiette'&&PLATEABLE.has(t.ing)){if(plateAccepts(h,t.ing)){h.c.push(t.ing);emitLocal({s:'drop'});}else say(p,'Ça ne va pas ensemble');}
   else if(h.k===t.ing&&(h.st==='cru'||NOSTATE.has(h.k))){p.held=null;emitLocal({s:'drop'});}else say(p,'Les mains sont pleines');break;
  case 'rack':
   if(!h){if(t.cnt>0){t.cnt--;p.held={k:'assiette',c:[]};emitLocal({s:'pick'});}else say(p,'Plus d’assiette propre : à la plonge !');}
   else if(h.k==='assiette'&&!h.c.length){t.cnt++;p.held=null;emitLocal({s:'drop'});}
   else if(PLATEABLE.has(key(h))&&t.cnt>0){if(plateAccepts({c:[]},key(h))){t.cnt--;p.held={k:'assiette',c:[key(h)]};emitLocal({s:'pick'});}}
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
   if(!h){if(pot.burnt){emptyPot(pot);emitLocal({s:'drop'});say(p,'Marmite vidée');}break;}
   if(h.k==='assiette'){if(potReady(t)&&!h.c.length){h.c=[SOUPING[pot.c[0]]];emptyPot(pot);emitLocal({s:'pick'});}else if(potReady(t))say(p,'Il faut une assiette vide');else say(p,pot.c.length?'Pas encore cuit…':'La marmite est vide');break;}
   if(h.st==='coupe'&&SOUPING[h.k]){if(potTakes(t,h.k)){pot.c.push(h.k);p.held=null;emitLocal({s:'plop'});burst(t.x+.5,CH+.4,t.z+.5,h.k==='oignon'?'#f3e1a8':'#ff8a6a',5);}
    else say(p,pot.done||pot.c.length>=3?'La marmite est pleine':'Pas le même ingrédient');}
   else if(h.st==='cru')say(p,'Coupe-la d’abord !');else say(p,'Pas dans la soupe');
   break;}
  case 'board':
   if(!h&&t.item&&t.item.st==='cru'){p.working=true;p.workTile=t;break;}
   if(!h&&t.item){p.held=t.item;t.item=null;emitLocal({s:'pick'});break;}
   if(h&&!t.item){if(h.st==='cru'&&CHOP.has(h.k)){t.item=h;p.held=null;emitLocal({s:'drop'});}else say(p,h.k==='steak'?'Le steak va dans la poêle':'Seulement des légumes crus');break;}
   if(h&&h.k==='assiette'&&t.item&&t.item.st==='coupe'){if(plateAccepts(h,key(t.item))){h.c.push(key(t.item));t.item=null;emitLocal({s:'drop'});}else say(p,'Ça ne va pas ensemble');}
   break;
  case 'pan':{const pn=t.pan,it=pn.it;
   if(!h){if(it&&it.st==='brule'){pn.it=null;pn.prog=0;pn.burn=0;emitLocal({s:'drop'});say(p,'Poêle vidée');}
    else if(it&&it.st==='cuit'){p.held=it;pn.it=null;pn.prog=0;pn.burn=0;emitLocal({s:'pick'});}else if(it)say(p,'Pas encore cuit…');break;}
   if(h.k==='steak'&&!it&&h.st!=='brule'){pn.it=h;if(h.st==='cru')pn.prog=0;pn.burn=0;p.held=null;emitLocal({s:'sizzle'});burst(t.x+.5,CH+.2,t.z+.5,'#ffffff',5,'steam');break;}
   if(h.k==='steak')say(p,'La poêle est occupée');
   else if(h.k==='assiette'){if(it&&it.st==='cuit'){if(plateAccepts(h,'steak_cuit')){h.c.push('steak_cuit');pn.it=null;pn.prog=0;pn.burn=0;emitLocal({s:'pick'});}else say(p,'Ça ne va pas ensemble');}else say(p,it?(it.st==='brule'?'C’est brûlé !':'Pas encore cuit…'):'La poêle est vide');}
   else say(p,'Pas dans la poêle');
   break;}
  case 'counter':case 'belt':
   if(!h&&t.item){p.held=t.item;t.item=null;emitLocal({s:'pick'});break;}
   if(h&&!t.item){t.item=h;t.bp=.5;p.held=null;emitLocal({s:'drop'});break;}
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
 const col=k=>k==='tomate'?'#e0412f':k==='oignon'?'#f3e1a8':'#79c95a';
 if(t.type==='board'){const it=t.item;if(!it||it.st!=='cru'){p.working=false;return;}it.cp+=dt/CHOPT;p.snd-=dt;if(p.snd<=0){emitLocal({s:'chop'});p.snd=.2;}
  if(Math.random()<dt*7)burst(t.x+.5,CH+.15,t.z+.5,col(it.k),1);
  if(it.cp>=1){it.st='coupe';it.cp=0;p.working=false;burst(t.x+.5,CH+.2,t.z+.5,col(it.k),8);emitLocal({s:'done'});}}
 else if(t.type==='sink'){if(t.dirty<=0){p.working=false;return;}t.wp+=dt/WASHT;p.snd-=dt;if(p.snd<=0){emitLocal({s:'scrub'});p.snd=.35;}
  if(Math.random()<dt*8)burst(t.x+.5,CH+.25,t.z+.5,'#d8f1ff',1,'steam');
  if(t.wp>=1){t.wp=0;t.dirty--;const r=all(x=>x.type==='rack')[0];if(r)r.cnt++;emitLocal({s:'done'});}}
}
function spray(p,dt){
 // l'extincteur éteint le feu du poste visé (et tout feu dans le cône devant le chef)
 if(p.target&&p.target.fire>0){const vx=p.target.x+.5-p.x,vz=p.target.z+.5-p.z,l=Math.hypot(vx,vz)||1;p.dir={x:vx/l,z:vz/l};}
 for(const t of all(x=>x.fire>0)){const vx=t.x+.5-p.x,vz=t.z+.5-p.z,d=Math.hypot(vx,vz),dot=(vx*p.dir.x+vz*p.dir.z)/(d||1);
  if(d<2.2&&dot>.55){t.fire=Math.max(0,t.fire-dt/EXT);if(t.fire<=0){t.spreadT=0;emitLocal({s:'done'});}}}
 if(Math.random()<dt*30)G.parts.push({x:p.x+p.dir.x*.5,y:1.0,z:p.z+p.dir.z*.5,vx:p.dir.x*5+rnd(-.6,.6),vy:rnd(-.2,.6),vz:p.dir.z*5+rnd(-.6,.6),g:0,life:.5,max:.5,col:'rgba(255,255,255,.9)',r:rnd(5,9),kind:'steam'});
 p.snd-=dt;if(p.snd<=0){emitLocal({s:'spray'});p.snd=.25;}
}
function starsFor(L,served){return L.stars.filter(v=>served>=v).length;}
function serve(p,t){
 const pl=p.held,i=G.orders.findIndex(o=>sameMulti(pl.c,RECIPES[o.r].items));
 if(i<0){say(p,'Personne n’a commandé ça');emitLocal({s:'fail'});return;}
 const o=G.orders[i];G.streak=Math.min(4,G.streak+1);
 const before=starsFor(G.L,G.served);
 const tip=Math.round(8*o.t/o.max)*G.streak,pts=(20+tip)*(o.vip?2:1);G.score+=pts;G.served++;G.orders.splice(i,1);p.held=null;
 fx(t.x+.5,t.z+.5,(o.vip?'VIP ':'')+'+'+pts+(G.streak>1?'  ×'+G.streak:''),'#ffd34d',1);emitLocal({s:'serve'});burst(t.x+.5,CH+.3,t.z+.5,'#ffd34d',14);
 if(starsFor(G.L,G.served)>before){emitLocal({s:'star'});emitLocal({f:[G.W/2,2.4,G.H-.5,'★'.repeat(starsFor(G.L,G.served)),'#ffd34d',1]});}
 G.dirtyQ.push(DIRTYT);
}
function updOrders(dt){
 const L=G.L,pick=()=>L.first&&G.nOrders<L.first.length?L.first[G.nOrders]:L.recipes[Math.floor(Math.random()*L.recipes.length)];
 for(const o of G.orders){o.t-=dt;o.age+=dt;}
 for(let i=G.orders.length-1;i>=0;i--)if(G.orders[i].t<=0){G.orders.splice(i,1);G.score=Math.max(0,G.score-10);G.lost++;G.streak=0;emitLocal({s:'fail'});emitLocal({f:[G.W/2,2,0,'Commande ratée −10','#ff7a6a',1]});}
 if(!G.orders.length&&G.nOrders>=2)G.next=Math.min(G.next,2);G.next-=dt;if(G.next<=0){if(G.orders.length<L.maxOrders){const vip=!!L.vip&&G.nOrders>=3&&Math.random()<L.vip,pa=Math.round(L.patience*(vip?.62:1));G.orders.push({r:pick(),t:pa,max:pa,age:0,vip});G.nOrders++;emitLocal({s:'order'});}G.next=G.nOrders<2?3:L.interval;}
}
function updBelts(dt){
 for(const t of all(x=>x.type==='belt')){
  if(!t.item){t.bp=.5;continue;}
  const n=T(t.x+t.bd[0],t.z+t.bd[1]),free=!!n&&!n.item&&(n.type==='belt'||n.type==='counter'&&n.ch!=='E');
  const lim=free?1:.5;if(t.bp<lim)t.bp=Math.min(lim,t.bp+dt/BELTT);
  if(t.bp>=1&&free){n.item=t.item;n.bp=n.type==='belt'?0:.5;t.item=null;t.bp=.5;}
 }
}
function updPans(dt){
 for(const t of all(x=>x.type==='pan')){const pn=t.pan,it=pn.it;if(!it||t.fire>0)continue;
  if(it.st==='cru'){pn.prog+=dt/PANT;if(pn.prog>=1){pn.prog=1;it.st='cuit';pn.burn=0;emitLocal({s:'ding'});}}
  else if(it.st==='cuit'){pn.burn+=dt/PANBURN;if(pn.burn>.55){pn.warn=(pn.warn||0)-dt;if(pn.warn<=0){emitLocal({s:'warn'});pn.warn=.5;}}
   if(pn.burn>=1){it.st='brule';t.fire=.6;t.spreadT=0;emitLocal({s:'fire'});fx(t.x+.5,t.z+.5,'Au feu !','#ff7a3a',1);}}}
}
// le feu grandit et gagne un poste voisin toutes les FIRESPREAD secondes
function updFires(dt){
 for(const t of all(x=>x.fire>0)){t.fire=Math.min(1,t.fire+dt*.02);t.spreadT=(t.spreadT||0)+dt;
  if(t.spreadT>=FIRESPREAD){t.spreadT=0;const nb=NB.map(([dx,dz])=>T(t.x+dx,t.z+dz)).filter(n=>n&&BURN.has(n.type)&&n.ch!=='E'&&!(n.fire>0));
   if(nb.length){const n=nb[Math.floor(Math.random()*nb.length)];n.fire=.5;n.spreadT=0;emitLocal({s:'fire'});burst(n.x+.5,CH+.3,n.z+.5,'#ff8a3a',8);}}}
}
// ---------- Souris voleuses ----------
const stealable=t=>(t.type==='counter'||t.type==='board'||t.type==='belt')&&t.item&&!['assiette','extincteur','sales'].includes(t.item.k)&&!(t.fire>0);
function gridPath(sx,sz,goal){const k=(a,b)=>a+','+b,prev={},q=[[sx,sz]];prev[k(sx,sz)]=null;
 while(q.length){const [x,z]=q.shift();if(goal(x,z)){const path=[];let kk=k(x,z);while(kk){path.unshift(kk.split(',').map(Number));kk=prev[kk];}return path;}
  for(const [dx,dz] of NB){const nx=x+dx,nz=z+dz,kk=k(nx,nz);if(kk in prev)continue;const t=T(nx,nz);if(!t||t.type!=='floor'||t.g==='water'||t.g==='portal')continue;prev[kk]=k(x,z);q.push([nx,nz]);}}return null;}
function mouseHome(m){m.path=[[m.hx,m.hz],[m.hole.x,m.hole.z]];const p=gridPath(Math.floor(m.x),Math.floor(m.z),(x,z)=>x===m.hx&&z===m.hz);if(p)m.path=p.concat([[m.hole.x,m.hole.z]]);m.wp=0;}
function updMice(dt){
 const M=G.L.mice;if(!M)return;
 G.mouseT-=dt;
 if(G.mouseT<=0){G.mouseT=3;const holes=all(t=>t.type==='hole'),targets=all(stealable);
  if(G.mice.length<M.max&&holes.length&&targets.length){const hole=holes[Math.floor(Math.random()*holes.length)],ex=NB.map(([dx,dz])=>T(hole.x+dx,hole.z+dz)).find(n=>n&&n.type==='floor');
   const tg=targets[Math.floor(Math.random()*targets.length)],path=ex&&gridPath(ex.x,ex.z,(x,z)=>NB.some(([dx,dz])=>x+dx===tg.x&&z+dz===tg.z));
   if(path){G.mice.push({id:++G.mouseId,x:hole.x+.5,z:hole.z+.5,a:0,st:'go',tg,path,wp:0,hole,hx:ex.x,hz:ex.z,item:null,t:0});G.mouseT=M.every*rnd(.8,1.2);emitLocal({s:'squeak'});}}}
 for(let i=G.mice.length-1;i>=0;i--){const m=G.mice[i];m.t+=dt;
  // un chef qui touche la souris la fait fuir et récupère l'ingrédient
  const ch=G.players.find(p=>!(p.dead>0)&&Math.hypot(p.x-m.x,p.z-m.z)<.6);
  if(ch&&m.st!=='flee'&&m.st!=='home'){if(m.item){if(!ch.held)ch.held=m.item;else{const c=nearest({x:m.x,z:m.z},all(t=>t.type==='counter'&&t.ch!=='E'&&!t.item));if(c)c.item=m.item;}m.item=null;fx(m.x,m.z,'Attrapée !','#9ff09a',1);}
   emitLocal({s:'squeak'});m.st='flee';mouseHome(m);}
  const sp=MOUSEV*(m.st==='flee'?1.5:1),w=m.path[m.wp];
  if(w){const tx=w[0]+.5,tz=w[1]+.5,dx=tx-m.x,dz=tz-m.z,d=Math.hypot(dx,dz);if(d>.01){m.a=Math.atan2(dx,dz);const st=Math.min(d,sp*dt);m.x+=dx/d*st;m.z+=dz/d*st;}if(d<.05)m.wp++;continue;}
  if(m.st==='go'){if(stealable(m.tg)){m.item=m.tg.item;m.tg.item=null;emitLocal({s:'squeak'});burst(m.tg.x+.5,CH+.2,m.tg.z+.5,'#ffffff',4,'steam');}m.st='back';mouseHome(m);continue;}
  // arrivée au trou
  if(m.item){G.stolen++;fx(m.x,m.z,'Volé !','#ff9a8a',1);emitLocal({s:'fail'});}
  G.mice.splice(i,1);
 }
}
function update(dt){
 G.time-=dt;G.elapsed+=dt;if(G.time<=0){G.time=0;endLevel();return;}
 const [a,b]=G.players;
 control(a,dt,readInput(),b);control(b,dt,remoteInput(b,dt),a);
 for(const p of G.players){if(p.dead>0){p.dead-=dt;if(p.dead<=0)respawn(p);}else if(deadly(groundAt(p.x,p.z)))fall(p);}
 if(G.L.bridge)for(const g of ['bridgeA','bridgeB']){const up=bridgeF(g)>.5;if(G.bridgeState[g]!==undefined&&G.bridgeState[g]!==up)emitLocal({s:up?'bridgeUp':'bridgeDown'});G.bridgeState[g]=up;}
 for(const t of all(x=>x.type==='stove')){const pot=t.pot;
  if(t.fire>0||pot.burnt)continue;
  if(pot.c.length&&!pot.done){pot.prog=Math.min(pot.c.length/3,pot.prog+dt/COOKT);if(pot.c.length===3&&pot.prog>=1){pot.done=true;pot.burn=0;emitLocal({s:'ding'});}}
  else if(pot.done){pot.burn+=dt/BURNT;if(pot.burn>.55){pot.warn=(pot.warn||0)-dt;if(pot.warn<=0){emitLocal({s:'warn'});pot.warn=.5;}}if(pot.burn>=1){pot.burnt=true;pot.done=false;t.fire=.6;emitLocal({s:'fire'});fx(t.x+.5,t.z+.5,'Au feu !','#ff7a3a',1);}}}
 updBelts(dt);updPans(dt);updFires(dt);updMice(dt);
 if(G.L.dark){const on=darkF()>.5;if(on!==G.darkOn)emitLocal({s:on?'powerOff':'powerOn'});G.darkOn=on;}
 for(let i=G.dirtyQ.length-1;i>=0;i--){G.dirtyQ[i]-=dt;if(G.dirtyQ[i]<=0){G.dirtyQ.splice(i,1);const d=all(x=>x.type==='dirty')[0];if(d){d.cnt++;emitLocal({s:'clink'});}}}
 updOrders(dt);
}
function control(p,dt,inp,other){
 if(inp.remote){p.moving=inp.mv&&!(p.dead>0);}else moveP(p,inp,dt,other);
 p.sayCd=Math.max(0,p.sayCd-dt);p.chopping=false;
 if(p.dead>0){p.target=null;p.spraying=false;p.working=false;return;}
 p.target=facing(p);
 if(inp.remote&&inp.tg){const t=T(inp.tg[0],inp.tg[1]);if(t&&t.type!=='floor'&&Math.hypot(t.x+.5-p.x,t.z+.5-p.z)<1.7)p.target=t;}
 const ext=p.held&&p.held.k==='extincteur',anyFire=all(t=>t.fire>0).length>0;
 if(ext&&anyFire){if(inp.actH){spray(p,dt);p.spraying=true;}else p.spraying=false;}
 else{p.spraying=false;if(inp.act)press(p);}
 if(p.working){if(inp.actH&&p.target===p.workTile)work(p,dt);else p.working=false;}
}

// ---------- Aide pour les joueurs automatiques (tests) ----------
function nearest(p,list){let b=null,bd=1e9;for(const t of list){if(!t)continue;const d=Math.hypot(t.x+.5-p.x,t.z+.5-p.z);if(d<bd){bd=d;b=t;}}return b;}
function countAll(pred,noPans){let n=0;for(const row of G.tiles)for(const t of row){if(t.item&&pred(t.item))n++;if(!noPans&&t.pan&&t.pan.it&&pred(t.pan.it))n++;}for(const p of G.players)if(p.held&&pred(p.held))n++;return n;}
// zone où un chef peut marcher (les ponts et les portails comptent, pas l'eau)
function regionFrom(x,z){const k=(a,b)=>a+','+b,seen=new Set([k(x,z)]),q=[[x,z]];
 const add=(nx,nz)=>{const kk=k(nx,nz);if(seen.has(kk))return;const t=T(nx,nz);if(!t||t.type!=='floor'||t.g==='water')return;seen.add(kk);q.push([nx,nz]);if(t.pair)add(t.pair.x,t.pair.z);};
 while(q.length){const [cx,cz]=q.shift();for(const [dx,dz] of NB)add(cx+dx,cz+dz);}return seen;}
function regionOf(p){const s=p.dead>0?G.spawns[p.i]:p;let x=Math.floor(s.x),z=Math.floor(s.z);const t=T(x,z);if(t&&t.g==='water'){const s2=G.spawns[p.i];x=Math.floor(s2.x);z=Math.floor(s2.z);}return regionFrom(x,z);}
const reachT=(R,t)=>!!t&&NB.some(([dx,dz])=>R.has((t.x+dx)+','+(t.z+dz)));
function beltEnd(t){let c=t,n=0;while(c&&c.type==='belt'&&n<30){const nx=T(c.x+c.bd[0],c.z+c.bd[1]);if(!nx||!(nx.type==='belt'||nx.type==='counter'&&nx.ch!=='E'))return c;c=nx;n++;}return c;}
// case praticable pour le bot à cet instant (évite l'eau et les ponts qui vont descendre)
function botSafe(x,z){const t=T(x,z);if(!t||t.type!=='floor'||t.g==='water')return false;if(isBridge(t)){const l=bridgeLeft(t.g);return bridgeF(t.g)>.95&&l>2.4;}return true;}
function planFor(p,role){
 if(p.dead>0)return null;
 const o=G.players[1-p.i],R=regionOf(p),R2=regionOf(o),can=t=>reachT(R,t),U=f=>all(t=>f(t)&&reachT(R,t));
 const partnerCan=t=>reachT(R2,t)||t.type==='belt'&&reachT(R2,beltEnd(t));
 const h=p.held,pots=all(t=>t.type==='stove'),pans=all(t=>t.type==='pan');
 const rack=U(t=>t.type==='rack')[0],sink=U(t=>t.type==='sink')[0],dirty=U(t=>t.type==='dirty')[0],serveT=U(t=>t.type==='serve')[0];
 const surf=t=>(t.type==='counter'||t.type==='belt')&&t.ch!=='E'&&!(t.fire>0);
 const emptyHere=()=>nearest(p,U(t=>surf(t)&&!t.item));
 const handoff=()=>nearest(p,U(t=>surf(t)&&!t.item&&partnerCan(t)))||emptyHere();
 const want={};for(const od of G.orders)want[od.r]=(want[od.r]||0)+1;
 // soupes
 const soupR=ing=>ing==='tomate'?'soupe':'oignon';
 const inPots=ing=>pots.reduce((s,t)=>s+(t.pot.c[0]===ing&&!t.pot.burnt?(t.pot.done?3:t.pot.c.length):0),0);
 const plated=ing=>countAll(it=>it.k==='assiette'&&it.c.includes(SOUPING[ing]));
 const soupNeed=ing=>Math.max(0,(want[soupR(ing)]||0)*3-inPots(ing)-plated(ing)*3);
 const potFor=ing=>{const ok=pots.filter(t=>potTakes(t,ing));ok.sort((a,b)=>b.pot.c.length-a.pot.c.length);return ok[0];};
 // plats assemblés sur l'assiette (salade, burgers)
 const ASM=G.orders.filter(od=>!RECIPES[od.r].ing);
 const asmNeed=c=>Math.max(0,ASM.reduce((s,od)=>s+RECIPES[od.r].items.filter(x=>x===c).length,0)-countAll(it=>it.k==='assiette'&&it.c.includes(c)));
 const itemAt=t=>t.type==='pan'?(t.pan.it&&t.pan.it.st==='cuit'&&!(t.fire>0)?t.pan.it:null):(t.fire>0?null:t.item);
 const asmPlates=()=>countAll(it=>it.k==='assiette'&&!hasSoup(it.c)&&(it.c.length>0||it!==h));
 const fire=all(t=>t.fire>0&&can(t))[0];
 // tout le monde : le feu d'abord
 if(fire){if(h&&h.k==='extincteur')return {t:fire,hold:true};const e=all(t=>t.item&&t.item.k==='extincteur'&&can(t)&&!(t.fire>0))[0];if(!h){if(e)return {t:e};}else if(e&&(role===1||!o.held||o.held.k!=='extincteur'))return {t:emptyHere()};}
 // souris : on attrape celle qui emporte quelque chose, si elle est proche
 const ms=G.mice.filter(m=>(m.item||m.st==='go')&&R.has(Math.floor(m.x)+','+Math.floor(m.z))&&Math.hypot(m.x-p.x,m.z-p.z)<(m.item?4.5:2.5));
 if(ms.length&&!(h&&h.k==='assiette'&&h.c.length)){ms.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));return {m:ms[0]};}
 if(h){
  if(h.k==='extincteur')return {t:nearest(p,U(t=>t.ch==='E'&&!t.item))||emptyHere()};
  if(h.k==='sales')return {t:sink||handoff()};
  if(h.k==='assiette'){
   if(h.c.length&&G.orders.some(od=>sameMulti(h.c,RECIPES[od.r].items)))return {t:serveT||handoff()};
   if(!h.c.length){const ready=pots.find(t=>potReady(t)&&can(t));if(ready)return {t:ready};}
   const miss=[];for(const od of G.orders){if(!RECIPES[od.r].ing&&subMulti(h.c,RECIPES[od.r].items))miss.push(...RECIPES[od.r].items.filter(x=>!h.c.includes(x)));}
   const comp=nearest(p,U(t=>(surf(t)||t.type==='board'||t.type==='pan')&&itemAt(t)&&miss.includes(key(itemAt(t)))));if(comp)return {t:comp};
   if(miss.includes('pain')&&miss.some(x=>x!=='pain')){const c=nearest(p,U(t=>t.type==='crate'&&t.ing==='pain'));if(c)return {t:c};}
   if(miss.length&&miss.every(x=>x==='pain')){const c=nearest(p,U(t=>t.type==='crate'&&t.ing==='pain'));if(c)return {t:c};}
   if(!h.c.length&&!ASM.length)return {t:rack||handoff()};
   return {t:handoff()};
  }
  if(h.st==='cru'&&CHOP.has(h.k))return {t:nearest(p,U(t=>t.type==='board'&&!t.item))||handoff()};
  if(h.k==='steak'&&h.st==='cru'){const pan=nearest(p,pans.filter(t=>!t.pan.it&&!(t.fire>0)));if(pan&&can(pan))return {t:pan};return {t:pan?handoff():emptyHere()};}
  if(h.k==='steak'&&h.st==='brule')return {t:nearest(p,U(t=>t.type==='trash'))||emptyHere()};
  const k=key(h);
  if(SOUPING[h.k]&&h.st==='coupe'&&soupNeed(h.k)>0){const pot=potFor(h.k);if(pot&&can(pot))return {t:pot};if(pot)return {t:handoff()};}
  const pl=nearest(p,U(t=>surf(t)&&t.item&&t.item.k==='assiette'&&plateAccepts(t.item,k)));if(pl)return {t:pl};
  return {t:rack?emptyHere():handoff()};
 }
 // rôle 1 : assiettes, service, plonge
 const compAvail=c=>c==='pain'?U(t=>t.type==='crate'&&t.ing==='pain').length>0:U(t=>(surf(t)||t.type==='board'||t.type==='pan')&&itemAt(t)&&key(itemAt(t))===c).length>0;
 const serveTasks=()=>{
  const burnt=pots.find(t=>t.pot.burnt&&!t.fire&&can(t));if(burnt)return {t:burnt};
  const burntPan=pans.find(t=>t.pan.it&&t.pan.it.st==='brule'&&!t.fire&&can(t));if(burntPan)return {t:burntPan};
  const full=nearest(p,U(t=>surf(t)&&t.item&&t.item.k==='assiette'&&t.item.c.length&&G.orders.some(od=>sameMulti(t.item.c,RECIPES[od.r].items))));if(full&&serveT)return {t:full};
  if(pots.some(t=>potReady(t)&&can(t))){const lying=nearest(p,U(t=>surf(t)&&t.item&&t.item.k==='assiette'&&!t.item.c.length));if(lying)return {t:lying};if(rack&&rack.cnt>0)return {t:rack};}
  // assiette en attente sur un comptoir dont un composant manquant est disponible
  const part=nearest(p,U(t=>surf(t)&&t.item&&t.item.k==='assiette'&&!hasSoup(t.item.c)&&ASM.some(od=>subMulti(t.item.c,RECIPES[od.r].items)&&RECIPES[od.r].items.some(x=>!t.item.c.includes(x)&&compAvail(x)&&(x!=='pain'||RECIPES[od.r].items.filter(y=>!t.item.c.includes(y)).length===1||t.item.c.length===0)))));
  if(part)return {t:part};
  const anyComp=['laitue_coupe','tomate_coupe','steak_cuit'].some(c=>asmNeed(c)>0&&countAll(it=>key(it)===c)>0);
  if(ASM.length>asmPlates()&&anyComp&&rack&&rack.cnt>0)return {t:rack};
  if(dirty&&dirty.cnt>0&&(!rack||rack.cnt<2||!sink||sink.dirty===0))return {t:dirty};
  if(sink&&sink.dirty>0&&(!rack||rack.cnt<3))return {t:sink,hold:true};
  return null;};
 // rôle 0 : préparation
 const prepTasks=()=>{
  const rescue=pans.find(t=>t.pan.it&&t.pan.it.st==='cuit'&&t.pan.burn>.5&&can(t)&&!t.fire);if(rescue&&emptyHere())return {t:rescue};
  const ch=U(t=>t.type==='board'&&t.item&&t.item.st==='cru'&&!t.fire);if(ch.length)return {t:nearest(p,ch),hold:true};
  const cut=U(t=>t.type==='board'&&t.item&&t.item.st==='coupe'&&!t.fire);if(cut.length)return {t:nearest(p,cut)};
  for(const ing of ['oignon','tomate']){const pot=potFor(ing);if(!pot||!can(pot)||soupNeed(ing)<=0)continue;
   const loose=U(t=>surf(t)&&t.item&&t.item.k===ing&&t.item.st==='coupe');if(loose.length)return {t:nearest(p,loose)};}
  if(U(t=>t.type==='board'&&!t.item).length){const raw=U(t=>surf(t)&&t.item&&t.item.st==='cru'&&CHOP.has(t.item.k));if(raw.length)return {t:nearest(p,raw)};}
  const freePans=pans.filter(t=>!t.pan.it&&!(t.fire>0)&&can(t));
  if(freePans.length){const raw=U(t=>surf(t)&&t.item&&t.item.k==='steak'&&t.item.st==='cru');if(raw.length)return {t:nearest(p,raw)};}
  const out=ing=>countAll(it=>it.k===ing&&it.st!=='brule');
  const room=ing=>!!potFor(ing);
  const need={steak:asmNeed('steak_cuit'),oignon:room('oignon')?soupNeed('oignon'):0,tomate:(room('tomate')?soupNeed('tomate'):0)+asmNeed('tomate_coupe'),laitue:asmNeed('laitue_coupe')};
  const rawSteakLoose=countAll(it=>it.k==='steak'&&it.st==='cru',true);
  for(const ing of ['steak','oignon','tomate','laitue']){
   if(ing==='steak'&&(!freePans.length||rawSteakLoose>0))continue;
   if(out(ing)<need[ing]){const c=nearest(p,U(t=>t.type==='crate'&&t.ing===ing));if(c)return {t:c};}}
  return null;};
 const order=role===0?[prepTasks,serveTasks]:[serveTasks,prepTasks];
 for(const f of order){const r=f();if(r&&(r.t||r.m))return r;}
 return null;
}
