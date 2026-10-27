
/* ================= SCULPT: signed-distance modelling + surface nets ================= */
// Parts are modelled as signed distance fields (smooth-blended capsules, ellipsoids, cones with
// noise displacement), then polygonised with naive surface nets. Vertex colours carry baked
// ambient occlusion and skin tone so creases, ribs and sockets darken like a sculpted model.
const SD={
  len:(x,y,z)=>Math.sqrt(x*x+y*y+z*z),
  smin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;},
  smax(a,b,k){return -SD.smin(-a,-b,k);},
  sph(x,y,z,cx,cy,cz,r){return SD.len(x-cx,y-cy,z-cz)-r;},
  ell(x,y,z,cx,cy,cz,rx,ry,rz){const k0=SD.len((x-cx)/rx,(y-cy)/ry,(z-cz)/rz),k1=SD.len((x-cx)/(rx*rx),(y-cy)/(ry*ry),(z-cz)/(rz*rz));return k0*(k0-1)/(k1||1e-6);},
  // capsule with radius tapering from ra (at a) to rb (at b)
  cap(x,y,z,ax,ay,az,bx,by,bz,ra,rb){const px=x-ax,py=y-ay,pz=z-az,dx=bx-ax,dy=by-ay,dz=bz-az;const t=Math.max(0,Math.min(1,(px*dx+py*dy+pz*dz)/(dx*dx+dy*dy+dz*dz)));return SD.len(px-dx*t,py-dy*t,pz-dz*t)-(ra+(rb-ra)*t);},
  box(x,y,z,cx,cy,cz,hx,hy,hz,r=0){const qx=Math.abs(x-cx)-hx,qy=Math.abs(y-cy)-hy,qz=Math.abs(z-cz)-hz;return SD.len(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r;}
};
// value noise for skin detail
const NZ=(()=>{const p=new Uint8Array(512);for(let i=0;i<256;i++)p[i]=i;for(let i=255;i>0;i--){const j=(R()*(i+1))|0;[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<256;i++)p[i+256]=p[i];
  const f=t=>t*t*(3-2*t),h=(i,j,k)=>p[p[p[i&255]+(j&255)]+(k&255)]/255;
  function n(x,y,z){const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z),u=f(x-X),v=f(y-Y),w=f(z-Z);
    const L=(a,b,t)=>a+(b-a)*t;return L(L(L(h(X,Y,Z),h(X+1,Y,Z),u),L(h(X,Y+1,Z),h(X+1,Y+1,Z),u),v),L(L(h(X,Y,Z+1),h(X+1,Y,Z+1),u),L(h(X,Y+1,Z+1),h(X+1,Y+1,Z+1),u),v),w)*2-1;}
  return {n,fbm(x,y,z,o=4){let a=0,s=.5,f2=1;for(let i=0;i<o;i++){a+=n(x*f2,y*f2,z*f2)*s;s*=.5;f2*=2.03;}return a;}};})();
function surfaceNet(sdf,min,max,res,colorFn){
  const [x0,y0,z0]=min,[x1,y1,z1]=max,h=res;
  const nx=Math.ceil((x1-x0)/h)+1,ny=Math.ceil((y1-y0)/h)+1,nz=Math.ceil((z1-z0)/h)+1;
  const V=new Float32Array(nx*ny*nz);let i=0;
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let ii=0;ii<nx;ii++)V[i++]=sdf(x0+ii*h,y0+j*h,z0+k*h);
  const idx=(a,b,c)=>a+nx*(b+ny*c);
  const vid=new Int32Array(nx*ny*nz).fill(-1),pos=[];
  const corners=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const edges=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const cv=new Float32Array(8);
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let ii=0;ii<nx-1;ii++){
    let m=0;for(let c=0;c<8;c++){const [a,b,d]=corners[c];cv[c]=V[idx(ii+a,j+b,k+d)];if(cv[c]<0)m|=1<<c;}
    if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,n=0;
    for(const [a,b] of edges){const va=cv[a],vb=cv[b];if((va<0)===(vb<0))continue;const t=va/(va-vb),A=corners[a],Bc=corners[b];sx+=A[0]+(Bc[0]-A[0])*t;sy+=A[1]+(Bc[1]-A[1])*t;sz+=A[2]+(Bc[2]-A[2])*t;n++;}
    vid[idx(ii,j,k)]=pos.length/3;pos.push(x0+(ii+sx/n)*h,y0+(j+sy/n)*h,z0+(k+sz/n)*h);
  }
  const ind=[];
  const quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(flip)ind.push(a,c,b,a,d,c);else ind.push(a,b,c,a,c,d);};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let ii=1;ii<nx-1;ii++){
    const v0=V[idx(ii,j,k)],inside=v0<0;
    if(ii<nx-1&&(V[idx(ii+1,j,k)]<0)!==inside)quad(vid[idx(ii,j-1,k-1)],vid[idx(ii,j,k-1)],vid[idx(ii,j,k)],vid[idx(ii,j-1,k)],!inside);
    if(j<ny-1&&(V[idx(ii,j+1,k)]<0)!==inside)quad(vid[idx(ii-1,j,k-1)],vid[idx(ii-1,j,k)],vid[idx(ii,j,k)],vid[idx(ii,j,k-1)],!inside);
    if(k<nz-1&&(V[idx(ii,j,k+1)]<0)!==inside)quad(vid[idx(ii-1,j-1,k)],vid[idx(ii,j-1,k)],vid[idx(ii,j,k)],vid[idx(ii-1,j,k)],!inside);
  }
  // normals from the field gradient, colour + baked occlusion from the field itself
  const N=new Float32Array(pos.length),C=new Float32Array(pos.length),e=h*.5;
  for(let v=0;v<pos.length;v+=3){const x=pos[v],y=pos[v+1],z=pos[v+2];
    let gx=sdf(x+e,y,z)-sdf(x-e,y,z),gy=sdf(x,y+e,z)-sdf(x,y-e,z),gz=sdf(x,y,z+e)-sdf(x,y,z-e);const gl=Math.hypot(gx,gy,gz)||1;gx/=gl;gy/=gl;gz/=gl;N[v]=gx;N[v+1]=gy;N[v+2]=gz;
    let ao=0;for(let s=1;s<=4;s++){const d=s*.018;ao+=(d-Math.min(d,sdf(x+gx*d,y+gy*d,z+gz*d)))/d/s;}ao=Math.max(.08,1-ao*1.25);
    const c=colorFn?colorFn(x,y,z,gx,gy,gz):[1,1,1];C[v]=c[0]*ao;C[v+1]=c[1]*ao;C[v+2]=c[2]*ao;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.setIndex(ind);
  return g;
}
// one material for every sculpted part: vertex colours + a wet sheen
const fleshMat=(o={})=>new T.MeshStandardMaterial(Object.assign({vertexColors:true,roughness:.62,metalness:0},o));
function sculptMesh(sdf,min,max,res,color,mat){const m=new T.Mesh(surfaceNet(sdf,min,max,res,color),mat||fleshMat());m.castShadow=true;m.receiveShadow=true;return m;}

const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// chalk-grey skin, mottled, with veins and a dusting of old plaster
function skinCol(x,y,z,base=[.6,.57,.53]){const n=NZ.fbm(x*18,y*18,z*18,3),m=NZ.n(x*70,y*70,z*70);const vein=Math.pow(1-Math.min(1,Math.abs(NZ.fbm(x*9+3,y*9,z*9,3))*9),6);const dust=Math.max(0,NZ.n(x*90+7,y*90,z*90))*.16;const k=(1+n*.24+m*.06)*.86;
  return [base[0]*k-vein*.09+dust,base[1]*k-vein*.06+dust,base[2]*k+vein*.02+Math.max(0,-n)*.05+dust*.95];}
function torsoSDF(x,y,z){
  const ax=Math.abs(x);
  let d=SD.ell(x,y,z,0,.72,-.005,.158,.25,.112);                 // ribcage
  d=SD.smin(d,SD.ell(x,y,z,0,.4,-.01,.085,.2,.068),.09);          // starved waist
  d=SD.smin(d,SD.ell(x,y,z,0,.08,0,.14,.12,.085),.08);            // pelvis
  d=SD.smax(d,-SD.ell(x,y,z,0,.36,.105,.075,.13,.05),.05);        // belly caves in under the ribs
  d=SD.smin(d,SD.sph(ax,y,z,.118,.16,.035,.026),.03);             // hip bones
  d=SD.smin(d,SD.sph(ax,y,z,.195,.93,0,.05),.06);                 // shoulder caps
  d=SD.smin(d,SD.cap(ax,y,z,.03,1.0,-.025,.17,.95,-.01,.034,.026),.05); // trapezius
  d=SD.smin(d,SD.cap(ax,y,z,.012,.925,.072,.165,.955,.02,.012,.01),.014); // collarbones
  d=SD.smax(d,-SD.sph(ax,y,z,.075,.895,.085,.028),.02);           // hollows above the collarbones
  d=SD.smin(d,SD.cap(x,y,z,0,.9,-.005,0,1.07,.012,.048,.04),.04);  // neck root
  d=SD.smin(d,SD.cap(ax,y,z,.035,1.07,.012,.012,.92,.07,.009,.008),.014); // neck tendons
  for(let i=0;i<15;i++){const yy=.06+i*.064;const back=-.098-Math.sin(yy*3)*.012;d=SD.smin(d,SD.sph(x,y,z,0,yy,back,.016+(yy>.55?.002:0)),.014);} // vertebrae
  d=SD.smin(d,SD.ell(ax,y,z,.085,.79,-.088,.06,.085,.018),.03);  // shoulder blades
  d=SD.smin(d,SD.cap(x,y,z,0,.58,.105,0,.86,.11,.012,.014),.025); // sternum
  if(y>.44&&y<.93){const ang=Math.atan2(ax,z);if(ang>.22){const ph=(y+.06*Math.cos(ang)-.02*ang)*60;const rib=Math.pow(Math.max(0,Math.sin(ph)),2.5);const fade=sstep(.44,.52,y)*(1-sstep(.86,.93,y))*sstep(.22,.4,ang);d-=.0075*rib*fade;}}
  return d+NZ.fbm(x*34,y*34,z*34,3)*.003+Math.abs(NZ.n(x*120,y*30,z*120))*.0012;
}
function headSDF(x,y,z){
  const ax=Math.abs(x);
  let d=SD.ell(x,y,z,0,.135,-.015,.083,.118,.104);               // cranium
  d=SD.smin(d,SD.ell(x,y,z,0,.06,.04,.06,.07,.066),.04);          // face
  d=SD.smin(d,SD.sph(ax,y,z,.056,.085,.058,.02),.025);            // cheekbones
  d=SD.smax(d,-SD.sph(ax,y,z,.07,.035,.068,.024),.02);            // sunken cheeks
  d=SD.smin(d,SD.cap(ax,y,z,.0,.138,.088,.058,.132,.072,.013,.01),.018); // brow
  d=SD.smax(d,-SD.ell(ax,y,z,.033,.104,.094,.024,.021,.032),.011);// eye sockets
  d=SD.smin(d,SD.cap(x,y,z,0,.122,.1,0,.078,.113,.007,.01),.011);  // nose ridge
  d=SD.smax(d,-SD.ell(ax,y,z,.006,.07,.115,.008,.011,.014),.005); // nostrils
  d=SD.smax(d,-SD.ell(x,y,z,0,.02,.088,.028,.034,.05),.008);      // upper mouth opening
  d=SD.smin(d,SD.cap(x,y,z,0,-.04,-.03,0,.07,-.015,.038,.045),.03); // neck
  d=SD.smin(d,SD.cap(ax,y,z,.046,.06,-.035,.012,-.07,.03,.008,.007),.012); // tendons
  d=SD.smax(d,-SD.ell(ax,y,z,.07,.11,-.005,.008,.02,.012),.006);  // temples
  return d+NZ.fbm(x*44,y*44,z*44,3)*.0016;
}
function headCol(x,y,z){const ax=Math.abs(x);let c=skinCol(x,y,z,[.66,.63,.58]);
  const eye=SD.len(ax-.033,y-.104,z-.094);if(eye<.04){const k=1-eye/.04;c=c.map((v,i)=>v*(1-k*.75)+[.12,.04,.06][i]*k*.75);}
  if(y<.05&&z>.06&&ax<.035){const k=sstep(.05,.0,y)*.8;c=c.map((v,i)=>v*(1-k)+[.18,.03,.03][i]*k);}
  return c;}
function jawSDF(x,y,z){ // origin at the hinge; hangs open
  const ax=Math.abs(x);
  let d=SD.cap(ax,y,z,.052,0,-.005,.034,-.085,.055,.013,.011);   // rami
  d=SD.smin(d,SD.cap(ax,y,z,.034,-.085,.055,.0,-.1,.075,.012,.014),.02);
  d=SD.smin(d,SD.ell(x,y,z,0,-.1,.07,.026,.016,.02),.015);       // chin
  d=SD.smax(d,-SD.ell(x,y,z,0,-.075,.075,.02,.02,.03),.008);      // tongue hollow
  return d+NZ.fbm(x*44,y*44,z*44,2)*.0014;}
function boneLimb(L,r0,r1,knob0,knob1,twin){return(x,y,z)=>{
  let d=twin?SD.smin(SD.cap(x,y,z,-.011,0,0,-.009,-L,.004,r0*.7,r1*.75),SD.cap(x,y,z,.011,0,0,.01,-L,-.003,r0*.72,r1*.7),.02):SD.cap(x,y,z,0,0,0,0,-L,0,r0,r1);
  d=SD.smin(d,SD.ell(x,y,z,0,-L*.3,.008,r0*1.08,L*.22,r0*1.05),.03);  // thin, stringy muscle
  if(knob0)d=SD.smin(d,SD.sph(x,y,z,0,0,0,knob0),.02);
  if(knob1)d=SD.smin(d,SD.sph(x,y,z,0,-L,-.006,knob1),.02);
  d=SD.smin(d,SD.cap(x,y,z,.006,-L*.15,r0*.8,.004,-L*.85,r1*.7,.005,.004),.01); // tendon
  return d+NZ.fbm(x*40,y*40,z*40,3)*.0026+Math.abs(NZ.n(x*140,y*25,z*140))*.0012;};}
function handSDF(side){return(x,y,z)=>{
  let d=SD.ell(x,y,z,0,-.055,-.002,.034,.058,.011);d=SD.smin(d,SD.cap(x,y,z,-.02,-.01,0,-.026,-.1,0,.008,.009),.015);d=SD.smin(d,SD.cap(x,y,z,.02,-.01,0,.026,-.1,0,.008,.009),.015); // palm, with tendons
  const fx=[-.027,-.009,.009,.026],fl=[.105,.125,.118,.094],curl=[.1,.08,.1,.16];
  for(let f=0;f<4;f++){let px=fx[f],py=-.1,pz=0,a=.08+f*.02,lens=[fl[f],fl[f]*.8,fl[f]*.68];
    d=SD.smin(d,SD.sph(x,y,z,px,py+.006,pz,.0105),.01);           // knuckle
    for(let s=0;s<3;s++){const L=lens[s];a+=curl[f];const nx=px+(f-1.5)*.004,ny=py-Math.cos(a)*L,nz=pz+Math.sin(a)*L;
      d=SD.smin(d,SD.cap(x,y,z,px,py,pz,nx,ny,nz,.0078-s*.0012,.0068-s*.0012),.006);d=SD.smin(d,SD.sph(x,y,z,nx,ny,nz,.0082-s*.0012),.004);px=nx;py=ny;pz=nz;}}
  let tx=.034,ty=-.02,tz=.01;for(let s=0;s<3;s++){const nx=tx+.012,ny=ty-.035,nz=tz+.018;d=SD.smin(d,SD.cap(x,y,z,tx,ty,tz,nx,ny,nz,.009,.0075),.008);tx=nx;ty=ny;tz=nz;}
  d=SD.smin(d,SD.cap(x,y,z,0,.02,0,0,-.03,0,.017,.02),.02);       // wrist
  return d+NZ.fbm(x*60,y*60,z*60,2)*.0011;};}
function handCol(x,y,z){const c=skinCol(x,y,z,[.55,.52,.48]);const tip=sstep(-.17,-.26,y);return c.map((v,i)=>v*(1-tip*.65)+[.14,.11,.09][i]*tip*.65);}
function footSDF(x,y,z){let d=SD.ell(x,y,z,0,-.03,.06,.04,.025,.11);d=SD.smin(d,SD.sph(x,y,z,0,-.03,-.03,.035),.03);
  for(let t=0;t<5;t++){const tx=-.026+t*.013;d=SD.smin(d,SD.cap(x,y,z,tx,-.04,.15,tx*1.1,-.05,.2-t*.008,.008,.006),.008);}
  d=SD.smin(d,SD.cap(x,y,z,0,.02,0,0,-.02,.0,.025,.03),.02);return d+NZ.fbm(x*50,y*50,z*50,2)*.0012;}
