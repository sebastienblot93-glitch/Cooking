window.__bot=(()=>{
 const cm=window.__cm;const held={};const st={explore:null,lastAct:0,lvl:-1,acts:0,stuck:0,lastPos:null};
 const ev=(type,c)=>window.dispatchEvent(new KeyboardEvent(type,{code:c,key:c,bubbles:true,cancelable:true}));
 const kd=c=>{if(held[c])return;held[c]=1;ev('keydown',c);};
 const ku=c=>{if(!held[c])return;delete held[c];ev('keyup',c);};
 const ARROWS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
 const releaseMoves=()=>ARROWS.forEach(ku);
 const tap=c=>{ku(c);kd(c);setTimeout(()=>ku(c),45);};
 function me(){const G=cm.G,i=cm.NET.role==='guest'?1:0;return {G,i,p:G.players[i],K:G.kitchens[i]};}
 function bfs(K,sx,sy,goals){
  const k=(x,y)=>x+','+y,prev={},q=[[sx,sy]];prev[k(sx,sy)]=null;
  while(q.length){const [x,y]=q.shift();if(goals.has(k(x,y))){const path=[];let kk=k(x,y);while(kk){path.unshift(kk.split(',').map(Number));kk=prev[kk];}return path;}
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,kk=k(nx,ny);if(nx<0||ny<0||nx>=9||ny>=7||kk in prev)continue;if(K.tiles[ny][nx].type!=='floor')continue;prev[kk]=k(x,y);q.push([nx,ny]);}}
  return null;
 }
 function moveAxis(p,cx,cy,nx,ny){
  releaseMoves();
  if(nx!==cx){if(Math.abs(p.y-(cy+.5))>.12){kd(p.y<cy+.5?'ArrowDown':'ArrowUp');return;}kd(nx>cx?'ArrowRight':'ArrowLeft');}
  else{if(Math.abs(p.x-(cx+.5))>.12){kd(p.x<cx+.5?'ArrowRight':'ArrowLeft');return;}kd(ny>cy?'ArrowDown':'ArrowUp');}
 }
 function step(){
  if(cm.state!=='play'){releaseMoves();ku('Space');return;}
  const {G,i,p,K}=me();
  if(st.lvl!==G.idx){st.lvl=G.idx;st.explore=null;}
  if(!st.explore){st.explore=[];if(G.L.hidden)for(const r of K.tiles)for(const t of r)if(t.type==='lever'||t.type==='sink')st.explore.push(t);}
  let t=null,explore=false;
  if(st.explore.length){t=st.explore[0];explore=true;}else t=p.hint;
  if(!t){releaseMoves();ku('Space');return;}
  const cx=Math.floor(p.x),cy=Math.floor(p.y);
  const adj=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[t.x+dx,t.y+dy]).filter(([x,y])=>x>=0&&y>=0&&x<9&&y<7&&K.tiles[y][x].type==='floor');
  const path=bfs(K,cx,cy,new Set(adj.map(a=>a.join(','))));
  if(!path){releaseMoves();return;}
  if(path.length>1){ku('Space');const [nx,ny]=path[1];moveAxis(p,cx,cy,nx,ny);return;}
  const facingOk=p.target===t;
  if(!facingOk){
   const dx=t.x-cx,dy=t.y-cy;releaseMoves();
   if(dx!==0&&Math.abs(p.y-(cy+.5))>.15){kd(p.y<cy+.5?'ArrowDown':'ArrowUp');return;}
   if(dy!==0&&Math.abs(p.x-(cx+.5))>.15){kd(p.x<cx+.5?'ArrowRight':'ArrowLeft');return;}
   kd(dx>0?'ArrowRight':dx<0?'ArrowLeft':dy>0?'ArrowDown':'ArrowUp');return;
  }
  releaseMoves();
  const chop=(t.type==='wash'&&t.dirty>0)||(t.type==='board'&&((t.item&&t.item.st==='cru')||(!t.item&&!(p.held&&p.held.st==='cru'))));
  if(chop){kd('Space');return;}
  ku('Space');const now=performance.now();
  if(now-st.lastAct>380){st.lastAct=now;tap('Space');st.acts++;if(explore)st.explore.shift();}
 }
 let timer=null;
 return {start(){if(!timer)timer=setInterval(()=>{try{step();}catch(e){console.error('bot',e);}},20);},stop(){clearInterval(timer);timer=null;releaseMoves();ku('Space');},st};
})();
