
/* ================= IT ================= */
// Head without hair: a smooth skull with a ridge of bone down the crown and sunken temples.
function itHeadSDF(x,y,z){let d=headSDF(x,y,z);d=SD.smin(d,SD.cap(x,y,z,0,.25,-.02,0,.19,-.1,.006,.008),.012);d=SD.smax(d,-SD.sph(Math.abs(x),y,z,.085,.17,-.04,.02),.015);return d;}
let IT=null;
function buildIt(){
  const mat=fleshMat({roughness:.72});
  const rig={},root=grp(),body=grp();root.add(body);
  const spine=grp();spine.position.y=1.12;body.add(spine);
  spine.add(sculptMesh(torsoSDF,[-.29,-.13,-.17],[.29,1.12,.17],.0105,(x,y,z)=>skinCol(x,y,z,[.5,.49,.47]),mat));
  rig.legs=[];
  for(const s of[-1,1]){const hip=grp();hip.position.set(s*.095,1.08,0);body.add(hip);
    hip.add(sculptMesh(boneLimb(.6,.056,.038,.05,.044),[-.08,-.68,-.08],[.08,.07,.08],.009,(x,y,z)=>skinCol(x,y,z,[.5,.49,.47]),mat));
    const knee=grp();knee.position.y=-.6;hip.add(knee);
    knee.add(sculptMesh(boneLimb(.5,.04,.025,.042,.03),[-.07,-.56,-.07],[.07,.05,.07],.008,(x,y,z)=>skinCol(x,y,z,[.5,.49,.47]),mat));
    const foot=sculptMesh(footSDF,[-.05,-.07,-.06],[.05,.04,.23],.006,(x,y,z)=>skinCol(x,y,z,[.42,.4,.37]),mat);foot.position.y=-.5;knee.add(foot);
    rig.legs.push({hip,knee});}
  rig.arms=[];
  const up=surfaceNet(boneLimb(.76,.04,.03,.044,.03),[-.07,-.82,-.07],[.07,.06,.07],.008,(x,y,z)=>skinCol(x,y,z,[.5,.49,.47]));
  const lo=surfaceNet(boneLimb(.8,.032,.022,0,.03,true),[-.06,-.86,-.06],[.06,.04,.06],.0075,(x,y,z)=>skinCol(x,y,z,[.5,.49,.47]));
  const hg=surfaceNet(handSDF(1),[-.06,-.4,-.05],[.075,.05,.12],.0042,handCol);
  for(const s of[-1,1]){const sh=grp();sh.position.set(s*.205,.93,0);spine.add(sh);
    const u=new T.Mesh(up,mat);u.castShadow=true;sh.add(u);const el=grp();el.position.y=-.76;sh.add(el);const l=new T.Mesh(lo,mat);l.castShadow=true;el.add(l);
    const hand=grp();hand.position.y=-.8;el.add(hand);const hm=new T.Mesh(hg,mat);hm.castShadow=true;hm.scale.x=-s;hand.add(hm);
    rig.arms.push({sh,el,hand,s});}
  const neck=grp();neck.position.set(0,1.06,.012);spine.add(neck);
  const head=grp();head.position.set(0,.05,0);neck.add(head);
  head.add(sculptMesh(itHeadSDF,[-.12,-.09,-.15],[.12,.29,.16],.0042,headCol,mat));
  const jaw=grp();jaw.position.set(0,.052,0);head.add(jaw);
  jaw.add(sculptMesh(jawSDF,[-.075,-.13,-.04],[.075,.02,.11],.0038,(x,y,z)=>{const c=skinCol(x,y,z,[.6,.57,.52]);return z>.05&&y>-.08&&Math.abs(x)<.024?c.map((v,i)=>v*.3+[.14,.02,.02][i]*.7):c;},mat));
  const toothM=new T.MeshStandardMaterial({color:0xb9ae90,roughness:.35});
  for(let i=0;i<13;i++){const a=(i/12-.5)*2.3;const t=new T.Mesh(new T.ConeGeometry(rand(.0035,.0055),rand(.012,.022),5),toothM);t.position.set(Math.sin(a)*.026,.02,.07+Math.cos(a)*.022);t.rotation.x=Math.PI+rand(-.2,.2);t.rotation.z=rand(-.25,.25);head.add(t);}
  for(let i=0;i<11;i++){const a=(i/10-.5)*2.2;const t=new T.Mesh(new T.ConeGeometry(rand(.003,.005),rand(.01,.018),5),toothM);t.position.set(Math.sin(a)*.022,-.072,.058+Math.cos(a)*.018);t.rotation.z=rand(-.3,.3);jaw.add(t);}
  // the eye that shows between its fingers: wet, black, catches the torch
  const eyeM=new T.MeshStandardMaterial({color:0x020202,roughness:.03,metalness:.4});
  for(const s of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.016,14,10),eyeM);e.position.set(s*.033,.104,.088);head.add(e);}
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  Object.assign(rig,{root,body,spine,neck,head,jaw,peek:0,reveal:0,anim:0});
  return rig;
}
// two-bone IK in the spine's space; the hand gets a full orientation from finger and palm directions
const DOWN=new T.Vector3(0,-1,0),_sv=new T.Vector3(),_m4=new T.Matrix4(),_mi=new T.Matrix4(),_qa=new T.Quaternion(),_qb=new T.Quaternion();
function solveArm(arm,tgt,pole,fingerDir,palmN){
  const S=arm.sh.position,a=.76,b=.8;
  const d=tgt.clone().sub(S);let dist=clamp(d.length(),.08,a+b-.02);const dn=d.normalize();
  const A=Math.acos(clamp((a*a+dist*dist-b*b)/(2*a*dist),-1,1));
  const pv=pole.clone().sub(S);const perp=pv.sub(dn.clone().multiplyScalar(pv.dot(dn))).normalize();
  const u=dn.clone().multiplyScalar(Math.cos(A)).add(perp.multiplyScalar(Math.sin(A)));
  const E=S.clone().add(u.clone().multiplyScalar(a));const f=tgt.clone().sub(E).normalize();
  arm.sh.quaternion.setFromUnitVectors(DOWN,u);
  _qa.copy(arm.sh.quaternion).invert();arm.el.quaternion.setFromUnitVectors(DOWN,f.clone().applyQuaternion(_qa));
  const y=fingerDir.clone().negate().normalize(),z=palmN.clone().sub(y.clone().multiplyScalar(palmN.dot(y))).normalize(),x=new T.Vector3().crossVectors(y,z);
  _m4.makeBasis(x,y,z);_qb.setFromRotationMatrix(_m4);
  _qa.copy(arm.sh.quaternion).multiply(arm.el.quaternion).invert();arm.hand.quaternion.copy(_qa.multiply(_qb));
}
function headToSpine(p,dir){_mi.copy(IT.spine.matrixWorld).invert();_m4.multiplyMatrices(_mi,IT.head.matrixWorld);return dir?p.clone().transformDirection(_m4):p.clone().applyMatrix4(_m4);}
function poseIt(dt,speed,mode){
  const R_=IT;R_.anim+=dt*(speed>.05?speed*2.0:0);const a=R_.anim,t=performance.now()/1000,moving=speed>.05,chase=mode==='chase',scare=mode==='scare';
  R_.peek=lerp(R_.peek,mode==='peek'?1:0,dt*(mode==='peek'?5:3));R_.reveal=lerp(R_.reveal,scare||mode==='reveal'?1:0,dt*(scare?14:.8));
  R_.spine.rotation.x=(chase?.42:.2)+(R_.bow||0)*.4+Math.sin(a*2)*.03-R_.reveal*.12;R_.spine.rotation.z=Math.sin(a)*.05+Math.sin(t*.37)*.025;
  R_.body.position.y=(moving?Math.abs(Math.sin(a))*.045:0)-(R_.bow||0)*.18;
  R_.legs.forEach((l,i)=>{const ph=a+i*Math.PI;l.hip.rotation.x=moving?Math.sin(ph)*(chase?.75:.45)-(chase?.3:0):-.04;l.knee.rotation.x=moving?Math.max(0,-Math.sin(ph))*1.15+.15:.16;});
  // listening: long stillness, then the head snaps to a new angle
  R_.tw=(R_.tw||0)-dt;if(R_.tw<=0){R_.tw=rand(.6,3.4)*(chase?.5:1);R_.tgt=[rand(-.55,.55),rand(-.8,.8),rand(-.25,.3)];R_.snap=.07;}
  R_.snap=Math.max(0,(R_.snap||0)-dt);const k=R_.snap>0?1:dt*1.4;
  R_.head.rotation.z=lerp(R_.head.rotation.z,scare?.25:R_.tgt[0]*(1-R_.reveal),k);
  R_.head.rotation.x=lerp(R_.head.rotation.x,(scare?-.2:R_.tgt[2])-R_.spine.rotation.x*.9,k);
  R_.neck.rotation.y=lerp(R_.neck.rotation.y,mode==='listen'||mode==='peek'||scare?(R_.lookYaw||0):R_.tgt[1]*.25,mode==='peek'?dt*5:k);
  R_.jaw.rotation.x=scare?.8+Math.sin(t*30)*.04:.1+Math.sin(t*1.3)*.04+(R_.snap>0?.15:0)+R_.reveal*.25;
  R_.root.updateMatrixWorld(true);
  // hands clamped over the face; peeking spreads one hand; revealing pulls both away
  R_.arms.forEach(arm=>{const s=arm.s,pk=R_.peek*(s>0?1:.25),rv=R_.reveal;
    const wrist=new T.Vector3(s*(.045+pk*.06+rv*.32),-.04-pk*.05+rv*.06,.15+rv*.18);
    const fd=new T.Vector3(-s*(.12+pk*.0)+s*rv*1.2,1,-.32+pk*.25+rv*.3).normalize();
    const pn=new T.Vector3(-s*.15*(1-rv)+s*rv*.6,0,-1+rv*.8).normalize();
    const tg=headToSpine(wrist),fdS=headToSpine(fd,true),pnS=headToSpine(pn,true);
    const pole=new T.Vector3(s*.62,.5,.12);
    solveArm(arm,tg,pole,fdS,pnS);});
}

/* ================= THE DEN: what is left ================= */
function buildDenThings(){const g=grp();
  const coat=clothMesh(clothDrape(1.1,.9,[[-.28,.28,-.2,.2,.22],[-.12,.12,-.12,.12,.34]],{n:22,steps:170}),std(fabric('#7a2a24','plain'),{rough:1}));coat.position.set(31.1,0,18.85);coat.rotation.y=.5;g.add(coat);
  const tr=PR.shoe(.2,0xe6e2d8);tr.position.set(30.2,0,19.7);tr.rotation.set(0,1.1,1.45);tr.position.y=.06;g.add(tr);
  const w=PR.walkie(0x2a2a2a,'OWEN');w.position.set(29.6,0,18.5);w.rotation.set(-1.5,0,.6);w.position.y=.02;g.add(w);
  const tc=PR.torch();tc.position.set(28.9,.03,19.4);tc.rotation.y=2.2;g.add(tc);
  const cm=PR.comic();cm.position.set(28.6,0,18.6);cm.rotation.y=.3;g.add(cm);
  const tin=grp();lathe(tin,[[0,0],[.12,0],[.12,.09],[0,.09]],plain(0x2a4a8a,.4,{metal:.6}),0,0,0,20);tin.position.set(30.6,0,20.6);g.add(tin);
  return g;}
