window.__bot=(()=>{
 const cm=window.__cm;const held={};const st={lastAct:0,acts:0,goal:null,lx:0,lz:0,still:0,side:0,sideKey:null,holdT:0};
 const ev=(type,c)=>window.dispatchEvent(new KeyboardEvent(type,{code:c,key:c,bubbles:true,cancelable:true}));
 const kd=c=>{if(held[c])return;held[c]=1;ev('keydown',c);};
 const ku=c=>{if(!held[c])return;delete held[c];ev('keyup',c);};
 const AR=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];const rel=()=>AR.forEach(ku);
 const tap=c=>{ku(c);kd(c);setTimeout(()=>ku(c),45);};
 function me(){const G=cm.G,i=cm.NET.role==='guest'?1:0;return {G,i,p:G.players[i]};}
 function bfs(G,sx,sz,goals,other){const k=(x,z)=>x+','+z,prev={},step={},q=[[sx,sz]];prev[k(sx,sz)]=null;const ox=Math.floor(other.x),oz=Math.floor(other.z);
  while(q.length){const [x,z]=q.shift();if(goals.has(k(x,z))){const path=[];let kk=k(x,z);while(kk){path.unshift(step[kk]||kk.split(',').map(Number));kk=prev[kk];}return path;}
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=G.W||nz>=G.H)continue;if(!cm.botSafe(nx,nz))continue;const t=G.tiles[nz][nx],st=[nx,nz];
    if(t.pair&&!goals.has(k(nx,nz))){nx=t.pair.x;nz=t.pair.z;}
    const kk=k(nx,nz);if(kk in prev)continue;if(nx===ox&&nz===oz&&!goals.has(kk))continue;prev[kk]=k(x,z);step[kk]=st;q.push([nx,nz]);}}return null;}
 const LA=p=>{const t=cm.G.tiles[Math.floor(p.z)]&&cm.G.tiles[Math.floor(p.z)][Math.floor(p.x)];const k=t&&t.g==='ice'?.38:0;return {x:p.x+(p.vx||0)*k,z:p.z+(p.vz||0)*k};};
 function moveAxis(p0,cx,cz,nx,nz){rel();const p=LA(p0);
  if(nx!==cx){if(Math.abs(p.z-(cz+.5))>.12){kd(p.z<cz+.5?'ArrowDown':'ArrowUp');return;}kd(nx>cx?'ArrowRight':'ArrowLeft');}
  else{if(Math.abs(p.x-(cx+.5))>.12){kd(p.x<cx+.5?'ArrowRight':'ArrowLeft');return;}kd(nz>cz?'ArrowDown':'ArrowUp');}}
 function step(){
  if(cm.state!=='play'){rel();ku('Space');return;}
  const {G,i,p}=me();window.__stolen=G.stolen;if(p.dead>0&&!st.wasDead)window.__deaths=(window.__deaths||0)+1;st.wasDead=p.dead>0;const plan=cm.planFor(p,i);
  if(!plan||!plan.t&&!plan.m){rel();ku('Space');st.goal=null;return;}
  if(plan.m){const m=plan.m;st.goal='souris';const cx=Math.floor(p.x),cz=Math.floor(p.z),mx=Math.floor(m.x),mz=Math.floor(m.z);ku('Space');
   if(cx===mx&&cz===mz||Math.hypot(m.x-p.x,m.z-p.z)<1){rel();const dx=m.x-p.x,dz=m.z-p.z;if(Math.abs(dx)>.15)kd(dx>0?'ArrowRight':'ArrowLeft');if(Math.abs(dz)>.15)kd(dz>0?'ArrowDown':'ArrowUp');return;}
   const path=bfs(G,cx,cz,new Set([mx+','+mz]),{x:-9,z:-9});if(path&&path.length>1){const [nx,nz]=path[1];moveAxis(p,cx,cz,nx,nz);}else rel();return;}
  const t=plan.t;st.goal=t.type+'('+t.x+','+t.z+')';
  const cx=Math.floor(p.x),cz=Math.floor(p.z),other=G.players[1-i];
  const adj=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>[t.x+dx,t.z+dz]).filter(([x,z])=>x>=0&&z>=0&&x<G.W&&z<G.H&&G.tiles[z][x].type==='floor'&&G.tiles[z][x].g!=='water');
  let path=bfs(G,cx,cz,new Set(adj.map(a=>a.join(','))),other);if(!path)path=bfs(G,cx,cz,new Set(adj.map(a=>a.join(','))),{x:-9,z:-9});
  if(!path){rel();return;}
  if(st.side>0){st.side-=.02;rel();kd(st.sideKey);return;}
  if(path.length>1){ku('Space');const dist=path.length+Math.hypot(p.x-(cx+.5),p.z-(cz+.5));if(st.best===undefined||dist<st.best-.15||st.gk!==st.goal){st.best=dist;st.still=0;st.gk=st.goal;}else st.still+=.02;
   if(st.still>.7){st.still=0;st.best=undefined;st.side=.3+Math.random()*.3;const [nx,nz]=path[1];const opts=(nx!==cx?[['ArrowUp',0,-1],['ArrowDown',0,1]]:[['ArrowLeft',-1,0],['ArrowRight',1,0]]).filter(([k,dx,dz])=>cm.botSafe(cx+dx,cz+dz));if(!opts.length){st.side=0;return;}st.sideKey=opts[Math.floor(Math.random()*opts.length)][0];return;}
   const [nx,nz]=path[1];moveAxis(p,cx,cz,nx,nz);return;}
  if(p.target!==t){const dx=t.x-cx,dz=t.z-cz,p1=p;rel();{const q=LA(p1);var px=q.x,pz=q.z;}
   if(dx!==0&&Math.abs(pz-(cz+.5))>.15){kd(pz<cz+.5?'ArrowDown':'ArrowUp');return;}
   if(dz!==0&&Math.abs(px-(cx+.5))>.15){kd(px<cx+.5?'ArrowRight':'ArrowLeft');return;}
   kd(dx>0?'ArrowRight':dx<0?'ArrowLeft':dz>0?'ArrowDown':'ArrowUp');return;}
  rel();
  if(plan.hold){if(!held['Space']){kd('Space');st.holdT=0;}else{st.holdT+=.02;if(st.holdT>.4&&!p.chopping&&!p.spraying){ku('Space');st.holdT=0;}}return;}
  ku('Space');const now=performance.now();if(now-st.lastAct>350){st.lastAct=now;tap('Space');st.acts++;}
 }
 let timer=null;
 return {start(){if(!timer)timer=setInterval(()=>{try{step();}catch(e){console.error('bot',e);}},20);},stop(){clearInterval(timer);timer=null;rel();ku('Space');},st};
})();
