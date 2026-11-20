// ================= ENTRÉES, SON, RÉSEAU, ÉCRANS =================
let state='title',levelIdx=0,ANIM=0;
function load(k,d){try{const v=localStorage.getItem('chaudDevant.'+k);return v?JSON.parse(v):d;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem('chaudDevant.'+k,JSON.stringify(v));}catch(e){}}
let BEST=load('best',{}),mySkin=load('skin',null),choice=[0,2];

// ---------- son ----------
let AC=null,muted=false;
function audioInit(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){}}
function tone(f,d,type,v,delay,slide){if(!AC||muted)return;try{const t0=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v||.1,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g).connect(AC.destination);o.start(t0);o.stop(t0+d+.05);}catch(e){}}
function noise(d,v,f){if(!AC||muted)return;try{const n=AC.sampleRate*d,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();fl.type='bandpass';fl.frequency.value=f||1800;g.gain.value=v||.15;s.buffer=b;s.connect(fl).connect(g).connect(AC.destination);s.start();}catch(e){}}
const SFX0={pick:()=>tone(660,.07,'triangle',.1),drop:()=>tone(420,.08,'triangle',.1),chop:()=>{noise(.05,.25,2600);tone(180,.04,'square',.03);},done:()=>{tone(880,.08,'sine',.1);tone(1320,.12,'sine',.08,.07);},
 plop:()=>tone(300,.12,'sine',.14,0,.5),ding:()=>{tone(1320,.25,'sine',.1);tone(1760,.35,'sine',.06,.08);},warn:()=>tone(1000,.06,'square',.04),fire:()=>{noise(.6,.3,600);tone(140,.5,'sawtooth',.05,0,.6);},
 spray:()=>noise(.22,.18,3500),scrub:()=>noise(.18,.12,1200),splash:()=>noise(.3,.2,900),clink:()=>{tone(1500,.06,'triangle',.06);tone(1900,.06,'triangle',.05,.05);},
 serve:()=>{tone(1047,.12,'triangle',.1);tone(1319,.12,'triangle',.1,.08);tone(1568,.3,'triangle',.1,.16);},fail:()=>tone(160,.35,'sawtooth',.06,0,.6),order:()=>{tone(784,.1,'triangle',.07);tone(988,.14,'triangle',.07,.08);},
 dash:()=>noise(.12,.12,700),star:()=>[1319,1568,2093].forEach((f,i)=>tone(f,.22,'sine',.09,i*.07)),pop:()=>{tone(500,.1,'sine',.1,0,2.2);},
 bridgeUp:()=>{noise(.35,.12,400);tone(220,.3,'triangle',.05,0,1.6);},bridgeDown:()=>{noise(.35,.12,400);tone(330,.3,'triangle',.05,0,.5);},end:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.4,'triangle',.09,i*.12))};

// ---------- entrées : flèches (ou ZQSD), Espace/Entrée, Maj pour le sprint ----------
const MOVE={up:['ArrowUp','KeyW'],down:['ArrowDown','KeyS'],left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD']};
const ACT=['Space','Enter','NumpadEnter','KeyE'],DASHK=['ShiftLeft','ShiftRight','KeyQ'];
const GAMEKEYS=new Set([...Object.values(MOVE).flat(),...ACT,...DASHK,'Escape','KeyP']);
const keys={},pressed={};
const typing=()=>{const a=document.activeElement;return !!a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA');};
addEventListener('keydown',e=>{if(typing())return;if(GAMEKEYS.has(e.code))e.preventDefault();if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;if(!e.repeat)onKey(e.code);});
addEventListener('keyup',e=>{keys[e.code]=false;if(!typing()&&GAMEKEYS.has(e.code))e.preventDefault();});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pauseGame();});
let padPrev={};
function readInput(){
 const any=a=>a.some(k=>keys[k]);
 let mx=(any(MOVE.right)?1:0)-(any(MOVE.left)?1:0),my=(any(MOVE.down)?1:0)-(any(MOVE.up)?1:0);
 let act=ACT.some(k=>pressed[k]),actH=any(ACT),dash=DASHK.some(k=>pressed[k]);
 try{const g=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean)[0];if(g){const ax=g.axes[0]||0,ay=g.axes[1]||0;if(Math.hypot(ax,ay)>.3){mx=ax;my=ay;}
  const b=n=>!!(g.buttons[n]&&g.buttons[n].pressed);if(b(14))mx=-1;if(b(15))mx=1;if(b(12))my=-1;if(b(13))my=1;
  const ba=b(0)||b(2),bd=b(1)||b(5);if(ba&&!padPrev.a)act=true;if(ba)actH=true;if(bd&&!padPrev.d)dash=true;padPrev={a:ba,d:bd};}}catch(e){}
 return {mx,my,act,actH,dash};
}

// ---------- réseau ----------
const NET={ws:null,role:null,code:null,partner:false,out:[],remote:{x:0,z:0,dx:0,dz:1,mv:0,w:0,pr:0,h:0,ds:0},lastPr:0,lastDs:0,pr:0,ds:0,sendT:0,snapT:0,ready:[false,false],ping:null,pingT:0,joinErr:'',onOpen:null};
const meI=()=>NET.role==='guest'?1:0,otherI=()=>1-meI(),isHost=()=>NET.role==='host';
const R2=v=>Math.round(v*100)/100;
function wsUrl(){return (location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws';}
function netOpen(then){
 if(NET.ws&&NET.ws.readyState===1){then();return;}if(NET.ws&&NET.ws.readyState===0){NET.onOpen=then;return;}
 let ws;try{if(!/^https?:$/.test(location.protocol))throw 0;ws=new WebSocket(wsUrl());}catch(e){noServer();return;}
 NET.ws=ws;NET.onOpen=then;ws.onopen=()=>{const f=NET.onOpen;NET.onOpen=null;f&&f();};
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}netMsg(m);};
 ws.onclose=()=>{const had=!!NET.role;NET.ws=null;NET.role=null;NET.partner=false;NET.code=null;updBar();if(had)lostServer();else noServer();};
}
function netSend(o){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(o));}
function netClose(){const ws=NET.ws;NET.role=null;NET.partner=false;NET.code=null;NET.ws=null;if(ws){ws.onclose=null;try{ws.close();}catch(e){}}updBar();}
function createRoom(){audioInit();NET.joinErr='';showMsg('Création de la salle…');netOpen(()=>netSend({t:'create'}));}
function joinRoom(code){code=String(code||'').toUpperCase().replace(/[^A-Z]/g,'');if(code.length!==4){NET.joinErr='Le code de la salle fait 4 lettres.';titleScreen();return;}audioInit();NET.joinErr='';showMsg('Connexion à la salle '+code+'…');netOpen(()=>netSend({t:'join',code}));}
function netMsg(m){
 switch(m.t){
  case 'created':if(mySkin===null)mySkin=0;NET.role='host';NET.code=m.code;NET.partner=false;waitScreen();break;
  case 'joined':if(mySkin===null)mySkin=2;NET.role='guest';NET.code=m.code;NET.partner=true;choice[1]=mySkin;netSend({t:'skin',i:mySkin});charsScreen();break;
  case 'partner':NET.partner=true;choice[0]=mySkin;netSend({t:'skin',i:mySkin});charsScreen();break;
  case 'error':NET.joinErr=m.msg;netClose();titleScreen();break;
  case 'left':partnerLeft(!!m.hostLeft);break;
  case 'pong':NET.ping=Math.round(performance.now()-m.at);break;
  case 'skin':choice[otherI()]=m.i;if(G)G.players[otherI()].skin=m.i;if(state==='chars')charsScreen();break;
  case 'chars':if(!isHost())charsScreen();break;
  case 'menu':if(!isHost())guestMenuWait();break;
  case 'brief':if(!isHost())briefScreen(m.i);break;
  case 'ready':NET.ready[otherI()]=true;updReady();tryStart();break;
  case 'start':if(!isHost()){startLevel(m.i);go();}break;
  case 'in':if(isHost())NET.remote=m;break;
  case 'snap':if(!isHost()&&(state==='play'||state==='pause'))applySnap(m);break;
  case 'pause':if(state==='play')pauseGame(true);break;
  case 'resume':if(state==='pause')resumeGame(true);break;
  case 'result':if(!isHost())showResult(m.r);break;
 }
 updBar();
}
function snapshot(){
 const tl=[];let i=0;for(const row of G.tiles)for(const t of row){if(t.type!=='floor'){const pot=t.pot?[t.pot.c.length,R2(t.pot.prog),t.pot.done?1:0,R2(t.pot.burn),t.pot.burnt?1:0,t.pot.c[0]||'']:0;
  tl.push([i,t.item,t.cnt===undefined?null:t.cnt,t.dirty||0,R2(t.wp||0),R2(t.fire||0),pot,t.bp===undefined?0:R2(t.bp)]);}i++;}
 const pos=t=>t?[t.x,t.z]:null;
 const s={t:'snap',lvl:G.idx,tm:R2(G.time),el:R2(G.elapsed),sc:G.score,sv:G.served,lo:G.lost,st:G.streak,o:G.orders.map(o=>[o.r,R2(o.t),o.max,R2(o.age)]),tl,
  p:G.players.map(p=>({x:R2(p.x),z:R2(p.z),dx:R2(p.dir.x),dz:R2(p.dir.z),h:p.held,w:R2(p.walk),m:p.moving?1:0,c:p.chopping?1:0,sp:p.spraying?1:0,d:R2(p.dash),wt:pos(p.workTile&&p.chopping?p.workTile:null),tg:pos(p.target),sk:p.skin,dd:R2(p.dead)})),ev:NET.out};
 NET.out=[];return s;
}
function applySnap(s){
 if(!G||G.idx!==s.lvl)startLevel(s.lvl);
 G.time=s.tm;G.elapsed=s.el;G.score=s.sc;G.served=s.sv;G.lost=s.lo;G.streak=s.st;G.orders=s.o.map(([r,t,max,age])=>({r,t,max,age}));
 const flat=[];for(const row of G.tiles)for(const t of row)flat.push(t);
 for(const [i,item,cnt,dirty,wp,fire,pot,bp] of s.tl){const t=flat[i];if(!t)continue;t.item=item;if(cnt!==null)t.cnt=cnt;t.dirty=dirty;t.wp=wp;t.fire=fire;if(t.type==='belt')t.bp=bp;
  if(pot&&t.pot){const n=pot[0];t.pot.c=Array(n).fill(pot[5]||'tomate');t.pot.prog=pot[1];t.pot.done=!!pot[2];t.pot.burn=pot[3];t.pot.burnt=!!pot[4];}}
 s.p.forEach((ps,i)=>{const p=G.players[i];p.held=ps.h;p.chopping=!!ps.c;p.spraying=!!ps.sp;p.workTile=ps.wt?T(ps.wt[0],ps.wt[1]):null;p.skin=ps.sk;
  if(i===meI()){if(ps.dd>0){if(!(p.dead>0)){p.held=null;p.vx=p.vz=0;}p.dead=ps.dd;}else if(p.dead>0){p.dead=0;const sp=G.spawns[i];p.x=sp.x;p.z=sp.z;p.vx=p.vz=0;}}
  else p.dead=ps.dd;
  if(i!==meI()){p.tx=ps.x;p.tz=ps.z;p.dir={x:ps.dx,z:ps.dz};p.walk=ps.w;p.moving=!!ps.m;p.dash=ps.d;p.target=ps.tg?T(ps.tg[0],ps.tg[1]):null;}});
 for(const e of s.ev)playFx(e);
}
function remoteInput(p,dt){
 const r=NET.remote,press=r.pr>NET.lastPr,dash=r.ds>NET.lastDs;NET.lastPr=r.pr;NET.lastDs=r.ds;
 if(p.await&&!(p.dead>0)){const s=G.spawns[p.i];if(Math.hypot(r.x-s.x,r.z-s.z)<1.2)p.await=false;}
 if(p.dead>0||p.await){}else if(press){p.x=r.x;p.z=r.z;}else{const a=Math.min(1,dt*20);p.x+=(r.x-p.x)*a;p.z+=(r.z-p.z)*a;}
 p.dir={x:r.dx,z:r.dz};p.walk=r.w;if(dash){p.dash=.17;emitLocal({s:'dash'});}else p.dash=Math.max(0,(p.dash||0)-dt);
 return {remote:true,mv:!!r.mv,act:press,actH:!!r.h,tg:r.tg};
}
function guestStep(dt){
 const me=G.players[1],o=G.players[0],inp=readInput();
 if(o.tx!==undefined){const a=Math.min(1,dt*14);o.x+=(o.tx-o.x)*a;o.z+=(o.tz-o.z)*a;}
 if(me.dead>0)me.dead=Math.max(.01,me.dead-dt);
 moveP(me,inp,dt,o);me.target=facing(me);G.elapsed+=dt;
 if(inp.act)NET.pr++;if(inp.dash)NET.ds++;
 NET.sendT-=dt;if(NET.sendT<=0||inp.act||inp.dash){netSend({t:'in',x:R2(me.x),z:R2(me.z),dx:R2(me.dir.x),dz:R2(me.dir.z),mv:me.moving?1:0,w:R2(me.walk),pr:NET.pr,ds:NET.ds,h:inp.actH?1:0,tg:me.target?[me.target.x,me.target.z]:null});NET.sendT=1/30;}
 G.time=Math.max(0,G.time-dt);for(const o2 of G.orders){o2.t-=dt;o2.age+=dt;}
}
function updFx(dt){if(!G)return;for(const q of G.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=q.g*dt;q.life-=dt;if(q.y<CH&&q.kind==='bit'){q.y=CH;q.vy=0;q.vx*=.8;q.vz*=.8;}}G.parts=G.parts.filter(q=>q.life>0);
 for(const f of G.floats)f.life-=dt;G.floats=G.floats.filter(f=>f.life>0);
 for(const p of G.players)if(p.moving&&Math.random()<dt*(p.dash>0?40:6))G.parts.push({x:p.x-p.dir.x*.25+rnd(-.1,.1),y:.08,z:p.z-p.dir.z*.25+rnd(-.1,.1),vx:rnd(-.3,.3),vy:rnd(.3,.8),vz:rnd(-.3,.3),g:0,life:.45,max:.45,col:'rgba(255,255,255,.6)',r:rnd(4,7),kind:'steam'});
 for(const t of all(x=>x.type==='stove')){if((t.pot.done||t.pot.c.length&&!t.pot.burnt)&&Math.random()<dt*3)G.parts.push({x:t.x+.5+rnd(-.1,.1),y:CH+.45,z:t.z+.5+rnd(-.1,.1),vx:rnd(-.1,.1),vy:rnd(.5,.9),vz:rnd(-.1,.1),g:0,life:1.2,max:1.2,col:'rgba(255,255,255,.55)',r:rnd(6,10),kind:'steam'});
  if(t.fire>0&&Math.random()<dt*10)G.parts.push({x:t.x+.5+rnd(-.2,.2),y:CH+.8,z:t.z+.5+rnd(-.2,.2),vx:rnd(-.2,.2),vy:rnd(.8,1.4),vz:rnd(-.2,.2),g:0,life:1.4,max:1.4,col:'rgba(60,55,60,.6)',r:rnd(8,13),kind:'steam'});}
}

// ---------- écrans ----------
const ov=document.getElementById('overlay');
function show(html){ov.innerHTML=html;ov.classList.remove('hidden');}
function hide(){ov.classList.add('hidden');ov.innerHTML='';}
const starsHtml=n=>{let s='';for(let i=0;i<4;i++)s+=i<n?'<span class="on">★</span>':'<span class="off">★</span>';return s;};
const KEYS=`<div class="keys"><div><span class="pad"><kbd>↑</kbd><br><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></span><span>bouger</span></div><div><kbd class="space">Espace</kbd><span>prendre · poser<br>rester appuyé : couper, laver</span></div><div><kbd class="shift">Maj</kbd><span>sprint</span></div></div>`;
function showMsg(t){state='lobby';show(`<div class="card"><h2>${t}</h2></div>`);}
function titleScreen(){state='title';const pre=(location.hash||'').replace('#','').toUpperCase().replace(/[^A-Z]/g,'').slice(0,4);
 show(`<div class="card"><h1>Chaud<br><span>Devant !</span></h1><p class="sub">Cuisinez à deux, chacun sur son ordinateur.</p>
 <div class="lobby"><div><button class="btn big" data-act="create">Créer une salle</button></div><div><input id="joinCode" maxlength="4" placeholder="CODE" value="${pre}" autocomplete="off" spellcheck="false"><button class="btn" data-act="join">Rejoindre</button></div></div>
 ${NET.joinErr?`<p class="err">${NET.joinErr}</p>`:''}<p class="tiny"><a href="/miroir">Ancienne version : Cuisine Miroir</a></p></div>`);
 const inp=document.getElementById('joinCode');inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();joinRoom(inp.value);}});inp.addEventListener('input',()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,4);});}
function noServer(){state='title';show(`<div class="card"><h2>Serveur introuvable</h2><p class="small">Ouvre le jeu depuis son adresse Render. S’il dormait, réessaie dans une minute.</p><button class="btn" data-act="title">Retour</button></div>`);}
function lostServer(){state='title';show(`<div class="card"><h2>Connexion perdue</h2><button class="btn" data-act="title">Retour</button></div>`);}
function waitScreen(info){state='lobby';const link=location.origin+location.pathname+'#'+NET.code;
 show(`<div class="card"><p class="small">Code de la salle</p><div class="bigcode">${NET.code}</div><button class="btn" data-act="copy" data-l="${link}">Copier le lien</button><button class="btn ghost" data-act="leave">Annuler</button>${info?`<p class="err">${info}</p>`:''}<p class="sub">En attente de ton partenaire…</p></div>`);}
function partnerLeft(hostLeft){if(hostLeft){netClose();state='title';show(`<div class="card"><h2>Salle fermée</h2><button class="btn" data-act="title">Retour</button></div>`);}else{NET.partner=false;NET.ready=[false,false];waitScreen('Partenaire déconnecté.');}}
function charsScreen(){state='chars';const me=meI();choice[me]=mySkin;
 const team=k=>{const mine=k===me;return `<div class="team" style="--pc:${PCOL[k]}"><h3>${mine?'Toi':'Partenaire'}</h3><div class="roster">${mine?SKINS.map((s,i)=>`<button class="chr${choice[k]===i?' sel':''}" data-act="pick" data-i="${i}"><canvas width="96" height="96" data-s="${i}" data-p="${k}"></canvas><span>${s.nom}</span></button>`).join(''):`<div class="chr sel"><canvas width="96" height="96" data-s="${choice[k]}" data-p="${k}"></canvas><span>${SKINS[choice[k]].nom}</span></div>`}</div></div>`;};
 show(`<div class="card wide"><h2>Choisis ton chef</h2><div class="chars">${team(0)}${team(1)}</div>${isHost()?'<button class="btn big" data-act="menu">Continuer</button>':'<p class="sub">Ton partenaire choisit le niveau…</p>'}</div>`);
 ov.querySelectorAll('canvas[data-s]').forEach(cv=>chefPortrait(cv,+cv.dataset.s,+cv.dataset.p));}
function setChoice(i){mySkin=(i+SKINS.length)%SKINS.length;choice[meI()]=mySkin;save('skin',mySkin);netSend({t:'skin',i:mySkin});charsScreen();}
function hostMenu(){netSend({t:'menu'});menuScreen();}
const ALL=/[?&]tout\b/.test(location.search);
const unlocked=i=>ALL||i===0||(BEST[LEVELS[i-1].id]||0)>=1;
function menuScreen(){state='menu';const tot=LEVELS.reduce((s,L)=>s+(BEST[L.id]||0),0);
 show(`<div class="card wide"><h2>Chaud Devant ! <small class="tot">★ ${tot} / ${LEVELS.length*4}</small></h2>${WORLDS.map((Wd,w)=>`<div class="world"><h3>${w+1} · ${Wd.nom}</h3><div class="levels">${LEVELS.map((L,i)=>L.w!==w?'':unlocked(i)?`<button class="lvl" data-act="brief" data-i="${i}"><b>${L.num}</b><span>${L.name}</span><em>${starsHtml(BEST[L.id]||0)}</em></button>`:`<div class="lvl locked"><b>${L.num}</b><span>🔒</span><em class="small">1 ★ au niveau d’avant</em></div>`).join('')}</div></div>`).join('')}<button class="btn ghost" data-act="tochars">Changer de chef</button></div>`);}
function guestMenuWait(){state='menu';show(`<div class="card"><h2>Chaud Devant !</h2><p class="sub">Ton partenaire choisit le niveau…</p></div>`);}
function hostBrief(i){netSend({t:'brief',i});briefScreen(i);}
function briefScreen(i){state='brief';levelIdx=i;NET.ready=[false,false];startLevel(i);const L=LEVELS[i];
 show(`<div class="card"><div class="tag">${L.num}</div><h2>${L.name}</h2><div class="recipes">${L.recipes.map(r=>`<div><canvas width="120" height="90" data-r="${r}"></canvas><span>${RECIPES[r].nom}</span></div>`).join('')}</div>${L.hint?`<p class="hint">${L.hint}</p>`:''}<div class="goal">${L.stars.map((v,k)=>`<span><i>${'★'.repeat(k+1)}</i>${v}</span>`).join('')}<em>plats</em></div>${i===0?KEYS:''}
 <div class="readies"><span id="rd0"></span><span id="rd1"></span></div><button class="btn big" data-act="ready" id="readyBtn">Prêt !</button>${isHost()?'<button class="btn ghost" data-act="menu">Menu</button>':''}</div>`);
 ov.querySelectorAll('canvas[data-r]').forEach(cv=>{const c=cv.getContext('2d');icon(c,dishIcon(cv.dataset.r),60,45,38);});updReady();}
function updReady(){for(const k of [0,1]){const el=document.getElementById('rd'+k);if(el)el.innerHTML=`<i style="background:${PCOL[k]}"></i>${k===meI()?'Toi':'Partenaire'} ${NET.ready[k]?'<b class="ok">✓</b>':'…'}`;}
 const b=document.getElementById('readyBtn');if(b&&NET.ready[meI()]){b.textContent='En attente…';b.disabled=true;}}
function setReady(){if(state!=='brief'||NET.ready[meI()])return;NET.ready[meI()]=true;netSend({t:'ready'});updReady();tryStart();}
function tryStart(){if(isHost()&&state==='brief'&&NET.ready[0]&&NET.ready[1]){netSend({t:'start',i:levelIdx});startLevel(levelIdx);go();}}
function go(){hide();state='play';for(const k in pressed)delete pressed[k];NET.lastPr=NET.remote.pr;NET.lastDs=NET.remote.ds;NET.snapT=0;NET.out=[];G.players.forEach(p=>p.skin=choice[p.i]);
 const sp=G.players[1];NET.remote=Object.assign({},NET.remote,{x:sp.x,z:sp.z,dx:0,dz:1,mv:0,h:0});}
function pauseGame(fromNet){if(state!=='play')return;state='pause';if(!fromNet)netSend({t:'pause'});show(`<div class="card"><h2>Pause</h2><button class="btn big" data-act="resume">Reprendre</button>${isHost()?`<button class="btn ghost" data-act="brief" data-i="${levelIdx}">Recommencer</button><button class="btn ghost" data-act="menu">Menu</button>`:''}</div>`);}
function resumeGame(fromNet){if(state!=='pause')return;hide();state='play';if(!fromNet)netSend({t:'resume'});}
function endLevel(){state='result';const L=G.L,n=starsFor(L,G.served);const r={idx:levelIdx,n,s:G.score,served:G.served,lost:G.lost};netSend({t:'result',r});showResult(r);}
function showResult(r){state='result';const L=LEVELS[r.idx];levelIdx=r.idx;if(r.n>(BEST[L.id]||0)){BEST[L.id]=r.n;save('best',BEST);}SFX0.end();
 const next=r.idx+1<LEVELS.length&&r.n>=1,toGo=L.stars.find(v=>v>r.served);
 show(`<div class="card"><div class="tag">${L.num}</div><h2>${r.n?['','Pas mal !','Bien joué !','Excellent !','Parfait !'][r.n]:'Encore un essai ?'}</h2><div class="stars">${starsHtml(r.n)}</div><div class="stats"><div><b>${r.served}</b>plats servis</div><div><b>${r.lost}</b>ratés</div><div><b>${r.s}</b>pièces</div></div><p class="small">${toGo?`Prochaine étoile : ${toGo} plats`:'Toutes les étoiles !'}</p>
 ${isHost()?(next?`<button class="btn big" data-act="brief" data-i="${r.idx+1}">Niveau suivant</button>`:'')+`<button class="btn" data-act="brief" data-i="${r.idx}">Rejouer</button><button class="btn ghost" data-act="menu">Menu</button>`:'<p class="sub">Ton partenaire choisit la suite…</p>'}</div>`);}
ov.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;audioInit();const a=b.dataset.act;
 if(a==='create')createRoom();else if(a==='join'){const i=document.getElementById('joinCode');joinRoom(i?i.value:'');}
 else if(a==='title'||a==='leave'){netClose();titleScreen();}
 else if(a==='copy'){try{navigator.clipboard.writeText(b.dataset.l).then(()=>{b.textContent='Lien copié ✓';},()=>{b.textContent=b.dataset.l;});}catch(err){b.textContent=b.dataset.l;}}
 else if(a==='pick')setChoice(+b.dataset.i);else if(a==='menu'){if(isHost())hostMenu();}else if(a==='tochars'){if(isHost()){netSend({t:'chars'});charsScreen();}}
 else if(a==='brief'){if(isHost())hostBrief(+b.dataset.i);}else if(a==='ready')setReady();else if(a==='resume')resumeGame();});
function onKey(code){audioInit();const ok=code==='Enter'||code==='Space';
 if(state==='chars'){if(code==='ArrowLeft'||code==='KeyA')setChoice(mySkin-1);else if(code==='ArrowRight'||code==='KeyD')setChoice(mySkin+1);else if(ok&&isHost())hostMenu();}
 else if(state==='brief'&&ok)setReady();else if(state==='play'&&(code==='Escape'||code==='KeyP'))pauseGame();else if(state==='pause'&&(code==='Escape'||code==='KeyP'))resumeGame();
 else if(state==='result'&&ok&&isHost()&&levelIdx+1<LEVELS.length&&unlocked(levelIdx+1))hostBrief(levelIdx+1);}
function updBar(){const r=document.getElementById('status');if(r)r.innerHTML=NET.role?`Salle <b>${NET.code}</b> · ${NET.partner?'2/2':'1/2'}${NET.ping!=null?' · '+NET.ping+' ms':''}`:'';}
document.getElementById('muteBtn').addEventListener('click',e=>{e.currentTarget.blur();muted=!muted;e.currentTarget.textContent=muted?'🔇':'🔊';});
document.getElementById('pauseBtn').addEventListener('click',e=>{e.currentTarget.blur();if(state==='play')pauseGame();else if(state==='pause')resumeGame();});

// ---------- boucle ----------
function resize(){const st=document.getElementById('stage'),w=st.clientWidth,h=st.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);
 for(const id of ['gl','hud']){const cv=document.getElementById(id);cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}}
addEventListener('resize',resize);
let last=performance.now();
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;ANIM+=dt;
 try{
  if(state==='play'){if(isHost()){update(dt);NET.snapT-=dt;if(state==='play'&&NET.snapT<=0){NET.snapT=.05;netSend(snapshot());}}else if(NET.role==='guest')guestStep(dt);}
  updFx(dt);
  NET.pingT-=dt;if(NET.pingT<=0&&NET.ws&&NET.ws.readyState===1){NET.pingT=3;netSend({t:'ping',at:performance.now()});updBar();}
  if(!window.__noRender){if(!R3.ready)initGL();render3D(ANIM);drawHUD(ANIM);}
 }catch(err){console.error(err);}
 for(const k in pressed)delete pressed[k];requestAnimationFrame(frame);
}
function initGL(){if(R3.tried)return;R3.tried=true;try{if(!r3Init(document.getElementById('gl')))show(`<div class="card"><h2>3D indisponible</h2><p class="small">Ton navigateur ne gère pas WebGL2. Essaie Chrome, Firefox ou Edge à jour.</p></div>`);}catch(e){console.error(e);}}
resize();startLevel(0);titleScreen();updBar();requestAnimationFrame(frame);
window.__cm={R3,get G(){return G},get state(){return state},NET,startLevel,go,LEVELS,press,planFor,briefScreen,update,botSafe,bridgeF,camFor};
