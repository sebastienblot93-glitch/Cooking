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
const R3={gl:null,list:[],shadowSize:2048,ready:false};
const VS=`#version 300 es
in vec3 aP;in vec3 aN;uniform mat4 uM,uVP,uL;out vec3 vN;out vec3 vW;out vec4 vL;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vL=uL*w;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vN;in vec3 vW;in vec4 vL;uniform vec3 uC,uE,uLd,uCam;uniform float uFloor,uAlpha,uGloss;uniform sampler2D uSh;uniform vec2 uShT;out vec4 o;
float shadow(){vec3 p=vL.xyz/vL.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return 1.;float s=0.;float b=.0018;
 for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){float d=texture(uSh,p.xy+vec2(i,j)*uShT).r;s+=p.z-b>d?0.:1.;}return s/9.;}
void main(){vec3 N=normalize(vN);vec3 c=uC;
 if(uFloor>.5){vec2 g=vW.xz;vec2 f=fract(g);float ch=mod(floor(g.x)+floor(g.y),2.);c=mix(uC,uC*vec3(.86,.9,.95),ch);
  float gr=smoothstep(.0,.04,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));c*=mix(.72,1.,gr);
  vec2 d=abs(f-.5);float dia=step(d.x+d.y,.22);c=mix(c,c*vec3(1.04,1.,.95),dia*.6);}
 if(uFloor>1.5){vec2 g=vW.xy*vec2(2.,2.5);vec2 f=fract(g);float gr=smoothstep(.0,.05,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));c=uC*mix(.78,1.,gr);}
 vec3 L=normalize(-uLd);float nd=max(dot(N,L),0.);float sh=shadow();
 float diff=smoothstep(0.,.55,nd)*mix(.35,1.,sh);
 vec3 sky=vec3(1.,.97,.92),gnd=vec3(.5,.45,.55);vec3 amb=mix(gnd,sky,N.y*.5+.5)*.46;
 vec3 V=normalize(uCam-vW);float rim=pow(1.-max(dot(N,V),0.),3.)*.22;
 vec3 H=normalize(L+V);float sp=pow(max(dot(N,H),0.),40.)*uGloss*sh;
 vec3 col=c*(amb+diff*vec3(1.,.95,.86)*.8)+rim*vec3(1.,.95,.9)+sp+uE;
 o=vec4(pow(col,vec3(.92)),uAlpha);}`;
const SVS=`#version 300 es
in vec3 aP;uniform mat4 uM,uL;void main(){gl_Position=uL*uM*vec4(aP,1.);}`;
const SFS=`#version 300 es
precision mediump float;out vec4 o;void main(){o=vec4(1.);}`;
function r3Init(canvas){
 const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:false});if(!gl)return false;R3.gl=gl;
 const mk=(vs,fs)=>{const p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}
  gl.bindAttribLocation(p,0,'aP');gl.bindAttribLocation(p,1,'aN');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name);}return {p,u};};
 R3.main=mk(VS,FS);R3.sh=mk(SVS,SFS);
 const S=R3.shadowSize;R3.shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,R3.shTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,S,S,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 R3.fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,R3.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,R3.shTex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 R3.ready=true;return true;
}
function r3Mesh(g){if(g.vao)return g;const gl=R3.gl;g.vao=gl.createVertexArray();gl.bindVertexArray(g.vao);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
 const n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(g.I),gl.STATIC_DRAW);g.n=g.I.length;gl.bindVertexArray(null);return g;}
// file de dessin de l'image courante
function put(g,m,col,o){o=o||{};R3.list.push({g,m,c:typeof col==='string'?hex3(col):col,e:o.e?(typeof o.e==='string'?hex3(o.e):o.e):[0,0,0],f:o.floor||0,a:o.a===undefined?1:o.a,gl:o.gloss||0,ns:!!o.noShadow,ds:!!o.ds});}
function r3Render(W,H,cam){
 const gl=R3.gl,S=R3.shadowSize;
 const proj=M4.persp(cam.fov,W/H,.5,80),view=M4.look(cam.eye,cam.at,[0,1,0]),VP=M4.mul(proj,view);R3.VP=VP;R3.W=W;R3.H=H;
 const ld=cam.light,c=cam.at,le=[c[0]-ld[0]*20,c[1]-ld[1]*20,c[2]-ld[2]*20];
 const LV=M4.mul(M4.ortho(-cam.shR,cam.shR,-cam.shR,cam.shR,1,45),M4.look(le,c,[0,1,0]));
 // ombres
 gl.bindFramebuffer(gl.FRAMEBUFFER,R3.fb);gl.viewport(0,0,S,S);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
 gl.useProgram(R3.sh.p);gl.uniformMatrix4fv(R3.sh.u.uL,false,LV);
 for(const d of R3.list){if(d.ns||d.a<1)continue;r3Mesh(d.g);gl.uniformMatrix4fv(R3.sh.u.uM,false,d.m);gl.bindVertexArray(d.g.vao);gl.drawElements(gl.TRIANGLES,d.g.n,gl.UNSIGNED_SHORT,0);}
 // image
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(cam.bg[0],cam.bg[1],cam.bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const u=R3.main.u;gl.useProgram(R3.main.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uL,false,LV);gl.uniform3fv(u.uLd,ld);gl.uniform3fv(u.uCam,cam.eye);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R3.shTex);gl.uniform1i(u.uSh,0);gl.uniform2f(u.uShT,1/S,1/S);
 const draw=d=>{r3Mesh(d.g);if(d.ds)gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniform3fv(u.uC,d.c);gl.uniform3fv(u.uE,d.e);gl.uniform1f(u.uFloor,d.f);gl.uniform1f(u.uAlpha,d.a);gl.uniform1f(u.uGloss,d.gl);gl.bindVertexArray(d.g.vao);gl.drawElements(gl.TRIANGLES,d.g.n,gl.UNSIGNED_SHORT,0);};
 gl.disable(gl.BLEND);for(const d of R3.list)if(d.a>=1)draw(d);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);for(const d of R3.list)if(d.a<1)draw(d);gl.depthMask(true);gl.disable(gl.BLEND);
 R3.list=[];
}
function r3Project(p){const v=M4.xform(R3.VP,p);return {x:(v[0]*.5+.5)*R3.W,y:(1-(v[1]*.5+.5))*R3.H,ok:v[3]>0};}
