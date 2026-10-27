<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.147.0/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"></script>
<script>
(function(){
'use strict';
const HF=window.__HF;
const {CELL,WALL_H,W,H,ch,roomOf,cellOf}=HF;
const $=id=>document.getElementById(id);
if(!window.THREE){$('loadmsg').textContent='The renderer could not load. Check your connection and reload.';return;}
const T=THREE;
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rand=(a,b)=>a+Math.random()*(b-a);
let seed=1987; const R=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};

/* ---------- settings ---------- */
const settings={sens:1,bright:0.35,vol:0.85,voice:true};
try{Object.assign(settings,JSON.parse(localStorage.getItem('homefree.settings')||'{}'));}catch(e){}
const saveSettings=()=>{try{localStorage.setItem('homefree.settings',JSON.stringify(settings));}catch(e){}};

/* ---------- renderer + post ---------- */
const renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
const DPR=Math.min(window.devicePixelRatio||1,1.5);
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.NoToneMapping;
$('stage').appendChild(renderer.domElement);
renderer.domElement.tabIndex=0;
const isGL2=renderer.capabilities.isWebGL2;
function makeRT(){
  const w=Math.floor(innerWidth*DPR), h=Math.floor(innerHeight*DPR);
  const opts={type:isGL2?T.HalfFloatType:T.UnsignedByteType,format:T.RGBAFormat,minFilter:T.LinearFilter,magFilter:T.LinearFilter};
  const rt=new T.WebGLRenderTarget(w,h,opts);if(isGL2)rt.samples=4;
  return rt;
}
let rt=makeRT();
const post=new T.ShaderMaterial({
  uniforms:{tD:{value:null},uT:{value:0},uFear:{value:0},uHit:{value:0},uBright:{value:0.35},uBlack:{value:0},uExpo:{value:1.25},uRes:{value:new T.Vector2(innerWidth,innerHeight)},uHide:{value:0},uFlash:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
  varying vec2 vUv; uniform sampler2D tD; uniform float uT,uFear,uHit,uBright,uBlack,uExpo,uHide,uFlash; uniform vec2 uRes;
  float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  void main(){
    vec2 c=vUv-.5; float r2=dot(c,c);
    vec2 uv=.5+c*(1.-r2*(.05+uFear*.10+uHit*.25));
    uv.x+=sin(uv.y*38.+uT*7.)*.0016*uFear+ (h(vec2(uT,uv.y*90.))-.5)*.012*uHit;
    float ab=(.0012+uFear*.0055+uHit*.025)*(.3+r2*4.);
    vec3 col=vec3(texture2D(tD,uv+c*ab).r,texture2D(tD,uv).g,texture2D(tD,uv-c*ab).b);
    col*=uExpo;
    col=aces(col);
    float l=dot(col,vec3(.299,.587,.114));
    col=mix(col,vec3(l),.22+uFear*.35);
    col=mix(col,col*vec3(1.05,.98,.9),smoothstep(.0,.6,l));
    col+=vec3(.010,.013,.022)*(1.-smoothstep(0.,.25,l));
    col=pow(col,vec3(1./(2.2+uBright*.9)));
    float v=smoothstep(.95,.18,length(c*vec2(1.,1.2))*(1.+uFear*.45+uHide*.6));
    col*=mix(.18,1.,v);
    col+=vec3(.13,0.,0.)*uFear*(1.-v)+vec3(.06,.0,0.)*uHit;
    float g=h(vUv*uRes+fract(uT*7.13)*97.)-.5;
    col+=g*(.055+uFear*.06+uHit*.2)*(1.-l*.6);
    col+=(h(vec2(floor(uT*24.),floor(vUv.y*uRes.y*.5)))-.5)*.012*(1.+uFear*3.);
    col=mix(col,vec3(1.),uFlash*.0);
    col*=1.-uBlack;
    gl_FragColor=vec4(col,1.);
  }`,
  depthTest:false,depthWrite:false
});
const postScene=new T.Scene(), postCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),post));

const scene=new T.Scene();
scene.background=new T.Color(0x000000);
scene.fog=new T.FogExp2(0x030407,0.045);
const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,0.04,140);
camera.rotation.order='YXZ';
scene.add(camera);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();rt.dispose();rt=makeRT();post.uniforms.uRes.value.set(innerWidth,innerHeight);});

/* ---------- lights ---------- */
const hemi=new T.HemisphereLight(0x7d8cb0,0x120e0b,0.1); scene.add(hemi);
const flash=new T.SpotLight(0xfff0dc,3.0,24,0.46,0.65,1.6);
flash.castShadow=true; flash.shadow.mapSize.set(1024,1024); flash.shadow.camera.near=0.12; flash.shadow.camera.far=24; flash.shadow.bias=-0.0004; flash.shadow.normalBias=0.02;
camera.add(flash); flash.position.set(0.24,-0.2,0.05); flash.target.position.set(0.06,-0.08,-4); camera.add(flash.target);
const fill=new T.PointLight(0xffe6c8,0.0,4,2); camera.add(fill); fill.position.set(0,0,-0.6); // bounce from the beam
const L={
  fire:new T.PointLight(0xff7a30,0,10,2),       // front-room fire, once lit
  street:new T.PointLight(0xff9a40,.9,22,2),    // sodium lamp at the end of the drive
  plough:new T.PointLight(0xffa020,0,26,2),     // gritter lights sweeping past
  hob:new T.PointLight(0x5a8cff,0,4,2)          // gas ring
};
L.fire.position.set(3.2,.55,36);L.street.position.set(5,5.2,61);L.plough.position.set(26,2.5,64);L.hob.position.set(49.2,1.05,27.4);
for(const k in L)scene.add(L[k]);
const carLights=new T.SpotLight(0xfff2d8,2.2,30,.42,.7,1.4);carLights.position.set(14.5,.75,54);carLights.target.position.set(17,0,40);scene.add(carLights);scene.add(carLights.target);

/* ---------- procedural textures ---------- */
const hex=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
const rgba=(c,k=1,a=1)=>`rgba(${clamp(c[0]*k,0,255)|0},${clamp(c[1]*k,0,255)|0},${clamp(c[2]*k,0,255)|0},${a})`;
const maxAniso=renderer.capabilities.getMaxAnisotropy();
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function tex(w,h,draw,{srgb=true,repeat=true}={}){const c=cvs(w,h),g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}t.anisotropy=Math.min(8,maxAniso);if(srgb)t.encoding=T.sRGBEncoding;t.canvas=c;return t;}
function speckle(g,w,h,n,a){for(let i=0;i<n;i++){const v=R()<.5?0:255;g.fillStyle=`rgba(${v},${v*.92|0},${v*.85|0},${R()*a})`;g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}}
function age(g,w,h,a){
  speckle(g,w,h,w*h/70,.06);
  for(let i=0;i<7*a;i++){const x=R()*w,y=R()*h,r=20+R()*130,gr=g.createRadialGradient(x,y,r*.15,x,y,r);gr.addColorStop(0,`rgba(62,42,18,${.1+R()*.2})`);gr.addColorStop(.75,'rgba(55,38,18,.05)');gr.addColorStop(1,'rgba(55,38,18,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
  for(let i=0;i<3*a;i++){const x=R()*w,y=R()*h,r=20+R()*60;g.strokeStyle=`rgba(85,55,22,${.12+R()*.12})`;g.lineWidth=1+R()*2;g.beginPath();g.ellipse(x,y,r,r*(.6+R()*.4),R()*3,0,TAU);g.stroke();}
  for(let i=0;i<16*a;i++){const x=R()*w,y0=R()*h*.4,len=40+R()*h*.6,gr=g.createLinearGradient(0,y0,0,y0+len);gr.addColorStop(0,`rgba(38,26,12,${.12+R()*.16})`);gr.addColorStop(1,'rgba(38,26,12,0)');g.fillStyle=gr;g.fillRect(x,y0,1+R()*2.5,len);}
  for(let i=0;i<10*a;i++){g.strokeStyle=`rgba(255,240,220,${R()*.07})`;g.lineWidth=.6;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<5;k++){x+=rand(-25,25);y+=rand(-8,8);g.lineTo(x,y);}g.stroke();}
}
function grime(g,w,h,top=.25,bottom=.38){
  let gr=g.createLinearGradient(0,0,0,h*.18);gr.addColorStop(0,`rgba(0,0,0,${top})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h*.18);
  gr=g.createLinearGradient(0,h*.72,0,h);gr.addColorStop(0,'rgba(20,12,4,0)');gr.addColorStop(1,`rgba(20,12,4,${bottom})`);g.fillStyle=gr;g.fillRect(0,h*.72,w,h*.28);
  gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(0,0,0,.18)');gr.addColorStop(.06,'rgba(0,0,0,0)');gr.addColorStop(.94,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=gr;g.fillRect(0,0,w,h);
}
function grain(g,x,y,w,h,col,n,amp){g.strokeStyle=col;for(let i=0;i<n;i++){g.lineWidth=.5+R()*1.2;g.globalAlpha=.08+R()*.18;g.beginPath();const yy=y+R()*h,ph=R()*9,fr=.005+R()*.03;g.moveTo(x,yy);for(let xx=x;xx<=x+w;xx+=8)g.lineTo(xx,yy+Math.sin(xx*fr+ph)*amp+Math.sin(xx*.11+ph)*.6);g.stroke();}g.globalAlpha=1;}
function damask(g,x,y,s,col){g.save();g.translate(x,y);g.fillStyle=col;for(const m of[1,-1]){g.save();g.scale(m,1);g.beginPath();g.moveTo(0,-44*s);g.bezierCurveTo(16*s,-34*s,30*s,-14*s,9*s,-2*s);g.bezierCurveTo(30*s,8*s,22*s,32*s,0,46*s);g.closePath();g.fill();g.beginPath();g.ellipse(24*s,-22*s,4.5*s,10*s,.7,0,TAU);g.fill();g.beginPath();g.ellipse(22*s,24*s,4*s,9*s,-.7,0,TAU);g.fill();g.beginPath();g.moveTo(9*s,-2*s);g.quadraticCurveTo(38*s,-2*s,40*s,-16*s);g.lineWidth=2.2*s;g.strokeStyle=col;g.stroke();g.restore();}g.beginPath();g.arc(0,0,5*s,0,TAU);g.fill();g.restore();}
function flower(g,x,y,s,col,col2){g.save();g.translate(x,y);g.fillStyle=col;for(let i=0;i<6;i++){g.rotate(TAU/6);g.beginPath();g.ellipse(0,-11*s,5*s,10*s,0,0,TAU);g.fill();}g.fillStyle=col2;g.beginPath();g.arc(0,0,4.5*s,0,TAU);g.fill();g.strokeStyle=col;g.lineWidth=1.6*s;g.beginPath();g.moveTo(0,20*s);g.bezierCurveTo(14*s,34*s,-10*s,44*s,4*s,60*s);g.stroke();g.restore();}
function star(g,x,y,r,col){g.fillStyle=col;g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();}
function wainscot(g,w,h,wood){
  const top=h*2/3, c=hex(wood);
  g.fillStyle=rgba(c);g.fillRect(0,top,w,h-top);
  grain(g,0,top,w,h-top,rgba(c,.55),70,3);
  for(let i=0;i<2;i++){const x=i*w/2+22,y=top+40,pw=w/2-44,ph=h-top-90;
    g.fillStyle=rgba(c,.82);g.fillRect(x,y,pw,ph);
    g.fillStyle=rgba(c,1.25);g.fillRect(x,y,pw,3);g.fillRect(x,y,3,ph);
    g.fillStyle=rgba(c,.5);g.fillRect(x,y+ph-3,pw,3);g.fillRect(x+pw-3,y,3,ph);
    grain(g,x+4,y+4,pw-8,ph-8,rgba(c,.6),24,2);}
  g.fillStyle=rgba(c,1.3);g.fillRect(0,top-10,w,12);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,top+2,w,4);
  g.fillStyle=rgba(c,.6);g.fillRect(0,h-34,w,34);g.fillStyle=rgba(c,1.2);g.fillRect(0,h-34,w,3);
}
function paper(opt){return tex(512,768,(g,w,h)=>{
  const b=hex(opt.base),f=hex(opt.fg);
  g.fillStyle=rgba(b);g.fillRect(0,0,w,h);
  if(opt.stripe){for(let x=0;x<w;x+=64){g.fillStyle=rgba(b,opt.stripe);g.fillRect(x,0,26,h);g.fillStyle=rgba(f,1,.25);g.fillRect(x+30,0,2,h);}}
  const rows=opt.wains?7:9;
  for(let j=-1;j<rows;j++)for(let i=0;i<=4;i++){const x=i*128+(j%2?64:0),y=j*96+40;
    if(opt.motif==='damask')damask(g,x,y,.9,rgba(f,1,.55));
    else if(opt.motif==='flower')flower(g,x,y,.85,rgba(f,1,.6),rgba(f,.7,.7));
    else if(opt.motif==='star'){star(g,x,y,9,rgba(f,1,.5));g.fillStyle=rgba(f,1,.35);g.beginPath();g.arc(x+48,y+40,8,.6,TAU-.6);g.fill();}
  }
  age(g,w,h,opt.age||1);
  if(opt.wains)wainscot(g,w,h,opt.wains);
  else{const c=hex(opt.board||'#2a1a10');g.fillStyle=rgba(c);g.fillRect(0,h-40,w,40);g.fillStyle=rgba(c,1.4);g.fillRect(0,h-40,w,3);}
  grime(g,w,h);
  if(opt.peel){for(let i=0;i<opt.peel;i++){const x=R()*w,y=R()*h*.6,pw=20+R()*60,ph=30+R()*90;g.fillStyle='rgba(160,150,128,.85)';g.beginPath();g.moveTo(x,y);for(let k=0;k<8;k++)g.lineTo(x+R()*pw,y+R()*ph);g.fill();g.strokeStyle='rgba(30,20,10,.5)';g.lineWidth=1.5;g.stroke();}}
});}
function woodFloor(base,n=8){return tex(512,512,(g,w,h)=>{const c=hex(base),ph=h/n;
  for(let i=0;i<n;i++){const k=.78+R()*.42;g.fillStyle=rgba(c,k);g.fillRect(0,i*ph,w,ph);grain(g,0,i*ph,w,ph,rgba(c,k*.55),18,2.5);
    for(let j=0;j<2;j++){const x=R()*w;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,i*ph,2,ph);}
    g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,i*ph,w,2);g.fillStyle=rgba(c,k*1.25,.5);g.fillRect(0,i*ph+2,w,1);}
  for(let i=0;i<40;i++){g.strokeStyle=`rgba(230,210,180,${R()*.08})`;g.lineWidth=.7;g.beginPath();const x=R()*w,y=R()*h;g.moveTo(x,y);g.lineTo(x+rand(-60,60),y+rand(-4,4));g.stroke();}
  age(g,w,h,.6);
});}
function tiles(a,b,n=8){return tex(512,512,(g,w,h)=>{const s=w/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){g.fillStyle=rgba(hex((i+j)%2?a:b),.9+R()*.15);g.fillRect(i*s,j*s,s,s);}
  g.strokeStyle='rgba(40,34,26,.7)';g.lineWidth=3;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*s,0);g.lineTo(i*s,h);g.stroke();g.beginPath();g.moveTo(0,i*s);g.lineTo(w,i*s);g.stroke();}
  for(let i=0;i<6;i++){g.strokeStyle='rgba(20,15,10,.5)';g.lineWidth=1;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=rand(-20,20);y+=rand(-20,20);g.lineTo(x,y);}g.stroke();}
  age(g,w,h,1.2);});}
function plaster(base,a=1.3){return tex(512,512,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);speckle(g,w,h,9000,.07);age(g,w,h,a);
  for(let i=0;i<5;i++){g.strokeStyle='rgba(30,22,14,.45)';g.lineWidth=1;g.beginPath();let x=R()*w,y=R()*h;g.moveTo(x,y);for(let k=0;k<14;k++){x+=rand(-18,18);y+=rand(-18,18);g.lineTo(x,y);}g.stroke();}});}
function panelDoor(base){return tex(256,512,(g,w,h)=>{const c=hex(base);g.fillStyle=rgba(c);g.fillRect(0,0,w,h);grain(g,0,0,w,h,rgba(c,.55),60,2);
  for(const [x,y,pw,ph] of [[30,30,80,190],[146,30,80,190],[30,260,80,220],[146,260,80,220]]){g.fillStyle=rgba(c,.8);g.fillRect(x,y,pw,ph);g.fillStyle=rgba(c,1.35);g.fillRect(x,y,pw,4);g.fillRect(x,y,4,ph);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x,y+ph-4,pw,4);g.fillRect(x+pw-4,y,4,ph);}
  age(g,w,h,.7);});}
function cloth(base){return tex(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<30;i++){const x=R()*w,gr=g.createLinearGradient(x-12,0,x+12,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,`rgba(0,0,0,${R()*.18})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-12,0,24,h);}speckle(g,w,h,3000,.05);age(g,w,h,.5);});}
function rug(c1,c2,c3){return tex(512,512,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.strokeStyle=c2;g.lineWidth=14;g.strokeRect(24,24,w-48,h-48);g.lineWidth=4;g.strokeStyle=c3;g.strokeRect(48,48,w-96,h-96);
  g.save();g.translate(w/2,h/2);for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillStyle=c2;g.beginPath();g.ellipse(0,-70,26,70,0,0,TAU);g.fill();g.fillStyle=c3;g.beginPath();g.ellipse(0,-70,10,40,0,0,TAU);g.fill();}g.restore();
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){if((i===0||i===3||j===0||j===3))damask(g,90+i*110,90+j*110,.5,c3);}
  speckle(g,w,h,20000,.12);age(g,w,h,1.4);
  g.globalAlpha=.25;g.fillStyle='#000';for(let i=0;i<w;i+=2)g.fillRect(i,0,1,h);g.globalAlpha=1;});}
/* ---------- materials ---------- */
const MATS={};
function std(map,o={}){const m=new T.MeshStandardMaterial({map:map||null,color:o.color!==undefined?o.color:0xffffff,roughness:o.rough!==undefined?o.rough:.86,metalness:o.metal||0});if(map&&o.bump!==0){m.bumpMap=map;m.bumpScale=o.bump||.012;}if(o.emissive!==undefined){m.emissive=new T.Color(o.emissive);m.emissiveIntensity=o.ei||1;if(o.emap)m.emissiveMap=o.emap;}if(o.side)m.side=o.side;if(o.transparent){m.transparent=true;m.depthWrite=false;}return m;}
const plain=(c,r=.85,o={})=>std(null,Object.assign({color:c,rough:r},o));
/* ---------- geometry batching for walls / floors / ceilings ---------- */
class Batch{constructor(){this.p=[];this.n=[];this.u=[];this.i=[];}
  quad(a,b,c,d,n,u0,v0,u1,v1){const k=this.p.length/3;this.p.push(...a,...b,...c,...d);for(let j=0;j<4;j++)this.n.push(...n);this.u.push(u0,v0,u1,v0,u1,v1,u0,v1);this.i.push(k,k+1,k+2,k,k+2,k+3);}
  mesh(mat){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.i);const m=new T.Mesh(g,mat);m.receiveShadow=true;return m;}}
const batches=new Map();
const B=mat=>{if(!batches.has(mat))batches.set(mat,new Batch());return batches.get(mat);};
// vertical quad from (ax,az) [bottom-left seen from front] to (bx,bz), y0..y1
// UVs are in world metres so scanned materials keep their real scale and run seamlessly along a wall
function vq(mat,ax,az,bx,bz,y0,y1,nx,nz){const alongX=Math.abs(bx-ax)>Math.abs(bz-az);const u0=alongX?ax:az,u1=alongX?bx:bz;const s=Math.sign(nx+nz)||1;B(mat).quad([ax,y0,az],[bx,y0,bz],[bx,y1,bz],[ax,y1,az],[nx,0,nz],u0*s,y0,u1*s,y1);}
function hq(mat,x0,z0,x1,z1,y,up){if(up)B(mat).quad([x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0],[0,1,0],x0,-z1,x1,-z0);else B(mat).quad([x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[0,-1,0],x0,z0,x1,z1);}

/* ---------- colliders ---------- */
const colliders=[], colGrid=Array.from({length:W*H},()=>[]);
const mBlock=new Uint8Array(W*H);
function addCol(x0,z0,x1,z1,tag){const c={x0,z0,x1,z1,on:true,tag};colliders.push(c);for(let z=Math.max(0,cellOf(z0));z<=Math.min(H-1,cellOf(z1));z++)for(let x=Math.max(0,cellOf(x0));x<=Math.min(W-1,cellOf(x1));x++)colGrid[z*W+x].push(c);return c;}
function collide(px,pz,r){
  for(let it=0;it<3;it++){let moved=false;const cx=cellOf(px),cz=cellOf(pz);
    for(let z=cz-1;z<=cz+1;z++)for(let x=cx-1;x<=cx+1;x++){if(x<0||z<0||x>=W||z>=H){continue;}
      for(const c of colGrid[z*W+x]){if(!c.on)continue;const nx=clamp(px,c.x0,c.x1),nz=clamp(pz,c.z0,c.z1);let dx=px-nx,dz=pz-nz;const d2=dx*dx+dz*dz;
        if(d2<r*r){if(d2>1e-9){const d=Math.sqrt(d2);px+=dx/d*(r-d);pz+=dz/d*(r-d);}else{const l=px-c.x0,rr=c.x1-px,t=pz-c.z0,b=c.z1-pz,m=Math.min(l,rr,t,b);if(m===l)px=c.x0-r;else if(m===rr)px=c.x1+r;else if(m===t)pz=c.z0-r;else pz=c.z1+r;}moved=true;}}}
    if(!moved)break;}
  return [px,pz];
}

/* ---------- object helpers ---------- */
function bx(p,w,h,d,mat,x,y,z,o={}){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;m.castShadow=o.cast!==false;m.receiveShadow=true;p.add(m);return m;}
function cy(p,rt,rb,h,mat,x,y,z,seg=12,o={}){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg,1,!!o.open),mat);m.position.set(x,y,z);if(o.rx)m.rotation.x=o.rx;if(o.rz)m.rotation.z=o.rz;m.castShadow=o.cast!==false;m.receiveShadow=true;p.add(m);return m;}
function sp(p,r,mat,x,y,z,sx=1,sy=1,sz=1,seg=12){const m=new T.Mesh(new T.SphereGeometry(r,seg,Math.max(6,seg*3/4|0)),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
function drape(w,h,d,mat){const g=new T.BoxGeometry(w,h,d,6,5,6),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);const low=(h/2-y)/h;pa.setXYZ(i,x*(1+low*.12)+rand(-.025,.025),y+(y>h*.45?rand(-.03,0):0),z*(1+low*.12)+rand(-.025,.025));}g.computeVertexNormals();const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m;}
function place(obj,x,z,r=0,{col=true,pad=0,block=true}={}){obj.position.x=x;obj.position.z=z;obj.rotation.y=r;scene.add(obj);obj.updateMatrixWorld(true);
  if(col||block){const b=new T.Box3().setFromObject(obj);if(col)obj.collider=addCol(b.min.x-pad,b.min.z-pad,b.max.x+pad,b.max.z+pad,'furn');
    if(block)for(let cz=cellOf(b.min.z);cz<=cellOf(b.max.z);cz++)for(let cx=cellOf(b.min.x);cx<=cellOf(b.max.x);cx++){const mx=(cx+.5)*CELL,mz=(cz+.5)*CELL;if(mx>b.min.x-.35&&mx<b.max.x+.35&&mz>b.min.z-.35&&mz<b.max.z+.35&&cx>=0&&cz>=0&&cx<W&&cz<H)mBlock[cz*W+cx]=1;}}
  return obj;}
const grp=()=>new T.Group();

