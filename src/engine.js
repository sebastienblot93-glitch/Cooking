// ================= MOTEUR 3D MINIMAL (WebGL2, sans dépendance) =================
const M4={
 ident(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);},
 mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s;}return o;},
 persp(fov,asp,n,f){const t=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;},
 ortho(l,r,b,t,n,f){const o=M4.ident();o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);return o;},
 look(e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2];let l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz);xx/=l;xy/=l;xz/=l;const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
  return new Float32Array([xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*e[0]+xy*e[1]+xz*e[2]),-(yx*e[0]+yy*e[1]+yz*e[2]),-(zx*e[0]+zy*e[1]+zz*e[2]),1]);},
 // translation + rotation Y + rotation X/Z optionnelles + échelle uniforme
 trs(x,y,z,ry,s,rx,rz){s=s||1;rx=rx||0;rz=rz||0;
  const cy=Math.cos(ry||0),sy=Math.sin(ry||0),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
  // R = Ry * Rx * Rz
  const m00=cy*cz+sy*sx*sz,m01=cx*sz,m02=-sy*cz+cy*sx*sz,
        m10=-cy*sz+sy*sx*cz,m11=cx*cz,m12=sy*sz+cy*sx*cz,
        m20=sy*cx,m21=-sx,m22=cy*cx;
  return new Float32Array([m00*s,m01*s,m02*s,0,m10*s,m11*s,m12*s,0,m20*s,m21*s,m22*s,0,x,y,z,1]);},
 xform(m,p){const x=p[0],y=p[1],z=p[2];const w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w,w];}
};
function hex3(h){h=h.replace('#','');const n=parseInt(h,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];}

// ---------- Géométries (dimensions intégrées, normales exactes) ----------
const GEO={};
function geoRoundBox(w,h,d,r,N){
 N=N||5;const key='rb'+[w,h,d,r,N].join(',');if(GEO[key])return GEO[key];
 const hw=w/2,hh=h/2,hd=d/2;r=Math.min(r,hw,hh,hd)*.999;const P=[],Nn=[],I=[];
 const faces=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
 for(const [a,b,c,sg] of faces){const base=P.length/3;
  for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){
   const p=[0,0,0];p[a]=-1+2*i/N;p[b]=-1+2*j/N;p[c]=sg;
   const q=[p[0]*hw,p[1]*hh,p[2]*hd],inn=[Math.max(-hw+r,Math.min(hw-r,q[0])),Math.max(-hh+r,Math.min(hh-r,q[1])),Math.max(-hd+r,Math.min(hd-r,q[2]))];
   let n=[q[0]-inn[0],q[1]-inn[1],q[2]-inn[2]];let l=Math.hypot(...n);if(l<1e-6){n=[0,0,0];n[c]=sg;l=1;}n=n.map(v=>v/l);
   P.push(inn[0]+n[0]*r,inn[1]+n[1]*r,inn[2]+n[2]*r);Nn.push(...n);}
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const v=base+i*(N+1)+j;const t=[v,v+N+1,v+1,v+1,v+N+1,v+N+2];if(sg<0||c===1&&sg<0){I.push(t[0],t[2],t[1],t[3],t[5],t[4]);}else I.push(...t);}
 }
 return GEO[key]=fixWinding({P,N:Nn,I});
}
function geoEllipsoid(rx,ry,rz,seg){seg=seg||16;const key='el'+[rx,ry,rz,seg].join(',');if(GEO[key])return GEO[key];
 const P=[],Nn=[],I=[],rs=Math.round(seg*.75);
 for(let i=0;i<=rs;i++){const th=Math.PI*i/rs;for(let j=0;j<=seg;j++){const ph=2*Math.PI*j/seg;const x=Math.sin(th)*Math.cos(ph),y=Math.cos(th),z=Math.sin(th)*Math.sin(ph);
  P.push(x*rx,y*ry,z*rz);let n=[x/rx,y/ry,z/rz];const l=Math.hypot(...n)||1;Nn.push(n[0]/l,n[1]/l,n[2]/l);}}
 for(let i=0;i<rs;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;I.push(a,a+1,b,a+1,b+1,b);}
 return GEO[key]=fixWinding({P,N:Nn,I});
}
function geoCyl(rt,rb,h,seg,caps){seg=seg||20;caps=caps===undefined?true:caps;const key='cy'+[rt,rb,h,seg,caps].join(',');if(GEO[key])return GEO[key];
 const P=[],Nn=[],I=[],sl=(rb-rt)/h;
 for(let j=0;j<=seg;j++){const a=2*Math.PI*j/seg,c=Math.cos(a),s=Math.sin(a),l=Math.hypot(1,sl);
  P.push(c*rb,0,s*rb);Nn.push(c/l,sl/l,s/l);P.push(c*rt,h,s*rt);Nn.push(c/l,sl/l,s/l);}
 for(let j=0;j<seg;j++){const a=j*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}
 if(caps){for(const [y,r,ny] of [[h,rt,1],[0,rb,-1]]){if(r<=0)continue;const c0=P.length/3;P.push(0,y,0);Nn.push(0,ny,0);for(let j=0;j<=seg;j++){const a=2*Math.PI*j/seg;P.push(Math.cos(a)*r,y,Math.sin(a)*r);Nn.push(0,ny,0);}for(let j=0;j<seg;j++)I.push(c0,c0+1+j,c0+2+j);}}
 return GEO[key]=fixWinding({P,N:Nn,I});
}
function geoPlane(w,d){const key='pl'+w+','+d;if(GEO[key])return GEO[key];return GEO[key]={P:[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2],N:[0,1,0,0,1,0,0,1,0,0,1,0],I:[0,2,1,0,3,2]};}
function geoTorus(R,r,seg,ring){seg=seg||24;ring=ring||10;const key='to'+[R,r,seg,ring].join(',');if(GEO[key])return GEO[key];const P=[],Nn=[],I=[];
 for(let i=0;i<=seg;i++){const u=2*Math.PI*i/seg;for(let j=0;j<=ring;j++){const v=2*Math.PI*j/ring;const cx=Math.cos(u),sx=Math.sin(u),cv=Math.cos(v),sv=Math.sin(v);P.push((R+r*cv)*cx,r*sv,(R+r*cv)*sx);Nn.push(cv*cx,sv,cv*sx);}}
 for(let i=0;i<seg;i++)for(let j=0;j<ring;j++){const a=i*(ring+1)+j,b=a+ring+1;I.push(a,b,a+1,a+1,b,b+1);}
 return GEO[key]=fixWinding({P,N:Nn,I});
}
// oriente chaque triangle pour que sa normale géométrique suive les normales des sommets
function fixWinding(g){const P=g.P,N=g.N,I=g.I;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
 const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
 const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,ax=N[a]+N[b]+N[c],ay=N[a+1]+N[b+1]+N[c+1],az=N[a+2]+N[b+2]+N[c+2];
 if(nx*ax+ny*ay+nz*az<0){const tmp=I[t+1];I[t+1]=I[t+2];I[t+2]=tmp;}}return g;}

// ---------- Rendu ----------
// Chaque maillage peut porter une couleur par sommet (rgb + brillance dans a).
// Éclairage « dessin animé » : rampe douce, ombres teintées de bleu, reflet net, liseré de lumière, contours sombres.
const R3={gl:null,list:[],shadowSize:2048,ready:false};
const VS=`#version 300 es
in vec3 aP;in vec3 aN;in vec4 aC;uniform mat4 uM,uVP,uL;out vec3 vN;out vec3 vW;out vec4 vL;out vec4 vC;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vL=uL*w;vC=aC;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vN;in vec3 vW;in vec4 vL;in vec4 vC;uniform vec3 uC,uE,uLd,uCam;uniform float uFloor,uAlpha,uGloss,uNoSh;uniform sampler2D uSh;uniform vec2 uShT;out vec4 o;
float shadow(){if(uNoSh>.5)return 1.;vec3 p=vL.xyz/vL.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return 1.;float s=0.;float b=.0016;
 for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){float d=texture(uSh,p.xy+vec2(i,j)*uShT*1.2).r;s+=p.z-b>d?0.:1.;}return s/9.;}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 c=uC*vC.rgb;float gloss=uGloss*vC.a;
 if(uFloor>.5&&uFloor<1.5){vec2 g=vW.xz;vec2 f=fract(g);vec2 id=floor(g);float ch=mod(id.x+id.y,2.);c=mix(uC,uC*vec3(.9,.92,.97),ch);
  c*=.95+.08*h21(id);float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y));c*=mix(.66,1.,smoothstep(.0,.035,e));c*=mix(1.06,1.,smoothstep(.035,.09,e));
  vec2 d=abs(f-.5);c=mix(c,c*vec3(1.05,1.02,.95),step(d.x+d.y,.2)*.5);}
 if(uFloor>1.5){vec2 g=vW.xy*vec2(2.,2.5);vec2 f=fract(g);float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y));c=uC*(mix(.74,1.,smoothstep(.0,.05,e))*(.96+.06*h21(floor(g))));}
 vec3 L=normalize(-uLd);float nd=dot(N,L);float sh=shadow();
 float lit=smoothstep(-.05,.45,nd)*mix(.22,1.,sh);
 vec3 cold=c*vec3(.44,.45,.64),warm=c*vec3(.97,.93,.85);
 vec3 col=mix(cold,warm,lit);
 col+=c*mix(vec3(.07,.06,.1),vec3(.11,.11,.14),N.y*.5+.5);
 float ao=uFloor>.5?1.:mix(.72,1.,smoothstep(0.,.35,vW.y));col*=ao;
 vec3 V=normalize(uCam-vW);float fr=pow(1.-max(dot(N,V),0.),3.);
 col+=fr*vec3(1.,.95,.9)*(.08+.22*lit)*(uFloor>.5?0.:1.);
 vec3 H=normalize(L+V);float sp=pow(max(dot(N,H),0.),mix(18.,110.,clamp(gloss,0.,1.)));
 col+=(smoothstep(.45,.62,sp)*.55+sp*.2)*gloss*sh*vec3(1.,.98,.94);
 col+=uE;
 float lum=dot(col,vec3(.299,.587,.114));col=mix(vec3(lum),col,1.14);col=pow(col,vec3(1.06));
 o=vec4(col,uAlpha);}`;
const SVS=`#version 300 es
in vec3 aP;uniform mat4 uM,uL;void main(){gl_Position=uL*uM*vec4(aP,1.);}`;
const SFS=`#version 300 es
precision mediump float;out vec4 o;void main(){o=vec4(1.);}`;
// contour : coque inversée gonflée le long des normales
const OVS=`#version 300 es
in vec3 aP;in vec3 aN;uniform mat4 uM,uVP;uniform float uOl;void main(){vec4 w=uM*vec4(aP,1.);vec3 n=normalize(mat3(uM)*aN);w.xyz+=n*uOl;gl_Position=uVP*w;}`;
const OFS=`#version 300 es
precision mediump float;uniform vec3 uOC;out vec4 o;void main(){o=vec4(uOC,1.);}`;
function r3Init(canvas){
 const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:false});if(!gl)return false;R3.gl=gl;
 const mk=(vs,fs)=>{const p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}
  gl.bindAttribLocation(p,0,'aP');gl.bindAttribLocation(p,1,'aN');gl.bindAttribLocation(p,2,'aC');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name);}return {p,u};};
 R3.main=mk(VS,FS);R3.sh=mk(SVS,SFS);R3.ol=mk(OVS,OFS);
 gl.vertexAttrib4f(2,1,1,1,1);
 const S=R3.shadowSize;R3.shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,R3.shTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,S,S,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 R3.fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,R3.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,R3.shTex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 R3.ready=true;return true;
}
function r3Mesh(g){if(g.vao)return g;const gl=R3.gl;g.vao=gl.createVertexArray();gl.bindVertexArray(g.vao);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
 const n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
 if(g.C){const c=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,c);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.C),gl.STATIC_DRAW);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,0,0);}
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(g.I),gl.STATIC_DRAW);g.n=g.I.length;gl.bindVertexArray(null);return g;}
// file de dessin de l'image courante ; o.ol = épaisseur du contour, o.oc = couleur du contour
const OLC=hex3('#2a1a2e');
function put(g,m,col,o){o=o||{};const c=typeof col==='string'?hex3(col):col;R3.list.push({g,m,c,e:o.e?(typeof o.e==='string'?hex3(o.e):o.e):[0,0,0],f:o.floor||0,a:o.a===undefined?1:o.a,gl:o.gloss===undefined?(g.C?1:0):o.gloss,ns:!!o.noShadow,ds:!!o.ds,
 ol:o.ol||0,oc:o.oc?(typeof o.oc==='string'?hex3(o.oc):o.oc):(g.C?OLC:[c[0]*.28+OLC[0]*.5,c[1]*.28+OLC[1]*.5,c[2]*.28+OLC[2]*.5])});}
function r3Draw(list,W,H,cam,opt){
 opt=opt||{};const gl=R3.gl,S=R3.shadowSize,useSh=opt.shadow!==false;
 const proj=M4.persp(cam.fov,W/H,cam.near||.5,cam.far||80),view=M4.look(cam.eye,cam.at,[0,1,0]),VP=M4.mul(proj,view);
 const ld=cam.light,c=cam.at,le=[c[0]-ld[0]*20,c[1]-ld[1]*20,c[2]-ld[2]*20];
 const LV=M4.mul(M4.ortho(-cam.shR,cam.shR,-cam.shR,cam.shR,1,45),M4.look(le,c,[0,1,0]));
 gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
 if(useSh){gl.bindFramebuffer(gl.FRAMEBUFFER,R3.fb);gl.viewport(0,0,S,S);gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(R3.sh.p);gl.uniformMatrix4fv(R3.sh.u.uL,false,LV);
  for(const d of list){if(d.ns||d.a<1)continue;r3Mesh(d.g);if(d.ds)gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);gl.uniformMatrix4fv(R3.sh.u.uM,false,d.m);gl.bindVertexArray(d.g.vao);gl.drawElements(gl.TRIANGLES,d.g.n,gl.UNSIGNED_SHORT,0);}}
 gl.bindFramebuffer(gl.FRAMEBUFFER,opt.fbo||null);gl.viewport(0,0,W,H);const bg=opt.clear||[cam.bg[0],cam.bg[1],cam.bg[2],1];gl.clearColor(bg[0],bg[1],bg[2],bg[3]);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const u=R3.main.u;gl.useProgram(R3.main.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uL,false,LV);gl.uniform3fv(u.uLd,ld);gl.uniform3fv(u.uCam,cam.eye);gl.uniform1f(u.uNoSh,useSh?0:1);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R3.shTex);gl.uniform1i(u.uSh,0);gl.uniform2f(u.uShT,1/S,1/S);
 const draw=d=>{r3Mesh(d.g);if(d.ds)gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniform3fv(u.uC,d.c);gl.uniform3fv(u.uE,d.e);gl.uniform1f(u.uFloor,d.f);gl.uniform1f(u.uAlpha,d.a);gl.uniform1f(u.uGloss,d.gl);gl.bindVertexArray(d.g.vao);gl.drawElements(gl.TRIANGLES,d.g.n,gl.UNSIGNED_SHORT,0);};
 gl.disable(gl.BLEND);for(const d of list)if(d.a>=1)draw(d);
 // contours
 const ou=R3.ol.u;gl.useProgram(R3.ol.p);gl.uniformMatrix4fv(ou.uVP,false,VP);gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);
 for(const d of list){if(!d.ol||d.a<1)continue;gl.uniformMatrix4fv(ou.uM,false,d.m);gl.uniform1f(ou.uOl,d.ol*(opt.olk||1));gl.uniform3fv(ou.uOC,d.oc);gl.bindVertexArray(d.g.vao);gl.drawElements(gl.TRIANGLES,d.g.n,gl.UNSIGNED_SHORT,0);}
 gl.cullFace(gl.BACK);gl.useProgram(R3.main.p);
 gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);for(const d of list)if(d.a<1)draw(d);gl.depthMask(true);gl.disable(gl.BLEND);
 return VP;
}
function r3Render(W,H,cam){R3.VP=r3Draw(R3.list,W,H,cam);R3.W=W;R3.H=H;R3.list=[];}
function r3Project(p){const v=M4.xform(R3.VP,p);return {x:(v[0]*.5+.5)*R3.W,y:(1-(v[1]*.5+.5))*R3.H,ok:v[3]>0};}
// ---------- Rendu hors écran : vignettes (icônes, portraits) ----------
function r3Snapshot(drawFn,size,frame){
 const gl=R3.gl,S=size||160;
 if(!R3.ifb||R3.ifbS!==S){R3.ifb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,R3.ifb);const cb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,cb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.RGBA8,S,S);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cb);
  const db=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,db);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,S,S);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db);R3.ifbS=S;}
 const saved=R3.list;R3.list=[];drawFn();const list=R3.list;R3.list=saved;
 const f=frame||{},r=f.r||.25,cy=f.y===undefined?r*.6:f.y,dir=normalize3(f.dir||[0,.95,1.15]),dist=r/Math.sin(.21)*1.02;
 const cam={fov:.42,eye:[dir[0]*dist,cy+dir[1]*dist,dir[2]*dist],at:[0,cy,0],light:normalize3([-.5,-1,-.55]),shR:1,bg:[0,0,0],near:.05,far:20};
 r3Draw(list,S,S,cam,{fbo:R3.ifb,clear:[0,0,0,0],shadow:false,olk:f.olk||1});
 const px=new Uint8Array(S*S*4);gl.readPixels(0,0,S,S,gl.RGBA,gl.UNSIGNED_BYTE,px);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),im=c.createImageData(S,S);
 for(let y=0;y<S;y++)im.data.set(px.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);c.putImageData(im,0,0);return cv;
}
function normalize3(v){const l=Math.hypot(...v);return v.map(x=>x/l);}
// ---------- Constructeur de modèles fusionnés ----------
M4.scl=(x,y,z)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]);
function TM(x,y,z,o){o=o||{};let m=M4.trs(x,y,z,o.ry||0,1,o.rx||0,o.rz||0);if(o.s!==undefined||o.sx!==undefined||o.sy!==undefined||o.sz!==undefined){const s=o.s===undefined?1:o.s;m=M4.mul(m,M4.scl((o.sx===undefined?1:o.sx)*s,(o.sy===undefined?1:o.sy)*s,(o.sz===undefined?1:o.sz)*s));}return m;}
function MB(){return {P:[],N:[],C:[],I:[]};}
function mbAdd(mb,g,m,col){
 const a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],gg=m[8],h=m[9],i=m[10];
 const cf=[e*i-h*f,-(b*i-h*c),b*f-e*c,-(d*i-gg*f),a*i-gg*c,-(a*f-d*c),d*h-gg*e,-(a*h-gg*b),a*e-d*b],det=a*cf[0]+d*cf[1]+gg*cf[2],sg=det<0?-1:1;
 const base=mb.P.length/3,n=g.P.length/3;
 for(let k=0;k<n;k++){const x=g.P[k*3],y=g.P[k*3+1],z=g.P[k*3+2],nx=g.N[k*3],ny=g.N[k*3+1],nz=g.N[k*3+2];
  const p=[a*x+d*y+gg*z+m[12],b*x+e*y+h*z+m[13],c*x+f*y+i*z+m[14]];
  let q=[cf[0]*nx+cf[1]*ny+cf[2]*nz,cf[3]*nx+cf[4]*ny+cf[5]*nz,cf[6]*nx+cf[7]*ny+cf[8]*nz];const l=(Math.hypot(q[0],q[1],q[2])||1)*sg;
  mb.P.push(p[0],p[1],p[2]);mb.N.push(q[0]/l,q[1]/l,q[2]/l);
  let cc=col===undefined&&g.C?[g.C[k*4],g.C[k*4+1],g.C[k*4+2],g.C[k*4+3]]:typeof col==='function'?col([x,y,z],[nx,ny,nz],g.UV?[g.UV[k*2],g.UV[k*2+1]]:null,p):col;
  if(cc.length===3)cc=[cc[0],cc[1],cc[2],.3];mb.C.push(cc[0],cc[1],cc[2],cc[3]);}
 if(sg<0)for(let t=0;t<g.I.length;t+=3)mb.I.push(base+g.I[t],base+g.I[t+2],base+g.I[t+1]);else for(const x of g.I)mb.I.push(base+x);
 return mb;}
// surface paramétrique (u autour, v le long) ; normales calculées numériquement
function geoParam(fn,nu,nv,o){o=o||{};const P=[],N=[],UV=[],I=[],e=1e-3,v0=o.v0===undefined?.0008:o.v0,v1=o.v1===undefined?.9992:o.v1;
 for(let j=0;j<=nv;j++){const v=v0+(v1-v0)*j/nv,vn=Math.max(.003,Math.min(.997,v));for(let i=0;i<=nu;i++){const u=i/nu,p=fn(u,v);
  const A=fn(u+e,vn),B=fn(u-e,vn),Cc=fn(u,vn+e),D=fn(u,vn-e);const du=[A[0]-B[0],A[1]-B[1],A[2]-B[2]],dv=[Cc[0]-D[0],Cc[1]-D[1],Cc[2]-D[2]];
  let n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];const l=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/l,n[1]/l,n[2]/l];
  P.push(p[0],p[1],p[2]);N.push(n[0],n[1],n[2]);UV.push(u,v);}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;I.push(a,b,a+1,a+1,b,b+1);}
 if(o.out){let cx=0,cy=0,cz=0;const n=P.length/3;for(let k=0;k<n;k++){cx+=P[k*3];cy+=P[k*3+1];cz+=P[k*3+2];}cx/=n;cy/=n;cz/=n;
  let s=0;for(let k=0;k<n;k++)s+=(P[k*3]-cx)*N[k*3]+(P[k*3+1]-cy)*N[k*3+1]+(P[k*3+2]-cz)*N[k*3+2];if(s<0)for(let k=0;k<N.length;k++)N[k]=-N[k];}
 if(o.flip)for(let k=0;k<N.length;k++)N[k]=-N[k];
 let g={P,N,I,UV};
 if(o.two){const n=P.length/3;g={P:P.concat(P),N:N.concat(N.map(x=>-x)),UV:UV.concat(UV),I:I.concat(I.map(x=>x+n))};}
 return fixWinding(g);}
function profFn(pts){const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const tot=L[L.length-1];
 return v=>{const dd=Math.max(0,Math.min(1,v))*tot;let i=1;while(i<pts.length-1&&L[i]<dd)i++;const t=(dd-L[i-1])/((L[i]-L[i-1])||1);return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t];};}
// tour (surface de révolution) : profil [[rayon,hauteur],...] de bas en haut
function geoLathe(pts,nu,nv,mod){const f=Array.isArray(pts)?profFn(pts):pts;return geoParam((u,v)=>{const q=f(v),r=q[0]*(mod?mod(u,v):1),a=u*Math.PI*2;return [Math.cos(a)*r,q[1],Math.sin(a)*r];},nu,nv,{flip:true,v0:0,v1:1});}
function geoBlob(rx,ry,rz,nu,nv,def){return geoParam((u,v)=>{const a=u*Math.PI*2,t=v*Math.PI,s=Math.sin(t),dd=[s*Math.cos(a),Math.cos(t),s*Math.sin(a)],k=def?def(u,v,dd):1;return [dd[0]*rx*k,dd[1]*ry*k,dd[2]*rz*k];},nu,nv,{out:true});}
// feuille : base à l'origine, pointe vers +z ; curl = creux, bend = courbure, wave = ondulation du bord
function geoLeaf(len,wid,curl,bend,wave,nu,nv){return geoParam((u,v)=>{const s=u*2-1,w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,v*.98+.02)),.75);const x=s*w,z=v*len;
 const y=curl*s*s*w+bend*v*v*len+wave*Math.sin(v*16+s*4)*w*Math.abs(s);return [x,y,z];},nu||6,nv||10,{two:true,v0:0,v1:1});}
// arc de tore (sourires, anses)
function geoArc(R,r,a0,a1,seg,ring){return geoParam((u,v)=>{const a=a0+(a1-a0)*v,b=u*Math.PI*2;return [(R+r*Math.cos(b))*Math.cos(a),r*Math.sin(b),(R+r*Math.cos(b))*Math.sin(a)];},ring||8,seg||12,{v0:0,v1:1});}
