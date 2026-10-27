
/* ================= YOU ================= */
const tmpV=new T.Vector3();
function surfaceAt(x,z){const r=roomOf(cellOf(x),cellOf(z));if(!r)return'boards';const f=HF.ROOMS[r].floor;return f==='snow'?'snow':f==='lino'?'lino':f.startsWith('carpet')?'carpet':'boards';}
const creakSet=new Set(HF.CREAKS.map(([x,z])=>z*W+x));
function updatePlayer(dt){G.strikeCd=Math.max(0,(G.strikeCd||0)-dt);
  P.holding=!!keys.Space&&P.breath>0;
  if(P.holding){P.breath=Math.max(0,P.breath-dt*11);if(P.breath<=0){P.holding=false;keys.Space=false;snd.gasp();noise(P.x,P.z,5.5);P.breathLock=2.5;}}
  else{P.breath=Math.min(100,P.breath+dt*(P.breathLock>0?8:16));P.breathLock=Math.max(0,(P.breathLock||0)-dt);}
  if(P.wasHolding&&!P.holding&&P.breath>0){if(P.breath<35){snd.gasp();noise(P.x,P.z,3.2);}else snd.exhale();}P.wasHolding=P.holding;
  if(P.hidden){const h=P.hidden;P.speed=0;P.stam=Math.min(100,P.stam+dt*20);const base=Math.atan2(-h.fx,-h.fz);let d=Math.atan2(Math.sin(P.yaw-base),Math.cos(P.yaw-base));P.yaw=base+clamp(d,h.type==='bed'?-.7:-.45,h.type==='bed'?.7:.45);P.pitch=clamp(P.pitch,h.type==='bed'?-.12:-.35,h.type==='bed'?.18:.25);
    if(h.type==='ward')camera.position.set(h.x+h.fx*.12,1.55,h.z+h.fz*.12);else camera.position.set(h.x+h.fx*.55,.24,h.z+h.fz*.55);return;}
  if(P.sit>0){P.sit-=dt*(keys.KeyW||keys.KeyS||keys.KeyA||keys.KeyD?1.5:0);camera.position.set(P.x,lerp(1.62,1.05,clamp(P.sit,0,1)),P.z);if(P.sit>0)return;}
  let mx=0,mz=0;if(keys.KeyW||keys.ArrowUp)mz-=1;if(keys.KeyS||keys.ArrowDown)mz+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;
  const ml=Math.hypot(mx,mz);if(ml>0){mx/=ml;mz/=ml;}
  const crouch=!!(keys.KeyC||keys.ControlLeft);P.crouch=lerp(P.crouch,crouch?1:0,Math.min(1,dt*8));
  const wantRun=(keys.ShiftLeft||keys.ShiftRight)&&mz<0&&!P.exhaust&&!crouch;
  const surf=surfaceAt(P.x,P.z);const spd=(crouch?1.2:wantRun?4.9:2.25)*(surf==='snow'?.85:1);
  const sy=Math.sin(P.yaw),cyw=Math.cos(P.yaw),tvx=(mx*cyw+mz*sy)*spd,tvz=(-mx*sy+mz*cyw)*spd,k=1-Math.exp(-dt*(ml?9:12));P.vx=lerp(P.vx,tvx,k);P.vz=lerp(P.vz,tvz,k);
  const [nx,nz]=collide(P.x+P.vx*dt,P.z+P.vz*dt,.28);const moved=Math.hypot(nx-P.x,nz-P.z);P.x=nx;P.z=nz;P.speed=moved/dt;
  const running=wantRun&&P.speed>3;
  if(running){P.stam-=dt*22;if(P.stam<=0){P.stam=0;P.exhaust=true;snd.gasp();noise(P.x,P.z,4);}}else{P.stam=Math.min(100,P.stam+dt*(P.speed<.2?18:11));if(P.exhaust&&P.stam>35)P.exhaust=false;}
  P.bob+=moved*(running?1.9:2.3);const ph=Math.floor(P.bob/Math.PI);
  if(ph!==P.lastStep){P.lastStep=ph;snd.step(running,surf,crouch);const mult=surf==='carpet'?.65:surf==='snow'?.8:1;noise(P.x,P.z,(running?14:crouch?1.3:4.5)*mult);}
  // floorboards that give you away
  const cell=cellOf(P.z)*W+cellOf(P.x);if(cell!==P.cell){P.cell=cell;if(creakSet.has(cell)&&P.speed>.5&&G.inside){if(!crouch||P.speed>1.6){snd.board(P.x,P.z,running?.9:.6);noise(P.x,P.z,running?13:8.5);}else snd.board(P.x,P.z,.18);}}
  const bobA=Math.min(1,P.speed/2.3)*(running?.055:.03);camera.position.set(P.x,lerp(1.62,1.0,P.crouch)+Math.abs(Math.sin(P.bob))*bobA,P.z);P.sway=Math.sin(P.bob*.5)*bobA*.6;
  const r=roomOf(cellOf(P.x),cellOf(P.z));G.inside=r&&r!=='outside';
}
function updateCamera(dt){P.shake=Math.max(0,P.shake-dt*1.5);const sh=P.shake*P.shake*.06+G.fear*.0035;
  camera.rotation.set(P.pitch+rand(-sh,sh),P.yaw+rand(-sh,sh),(P.sway||0)*.5+rand(-sh,sh)*.5);
  const f=tmpV.set(0,0,-1).applyQuaternion(camera.quaternion);P.fx=f.x;P.fy=f.y;P.fz=f.z;
  camera.fov=lerp(camera.fov,72-G.fear*7+(P.speed>3.5?4:0),dt*3);camera.updateProjectionMatrix();}
function enterHide(h){if(P.hidden||G.phase!=='play')return;
  if(IT_S.state==='chase'&&IT_S.vis&&Math.hypot(IT_S.x-P.x,IT_S.z-P.z)<11)IT_S.compromised=h;
  P.hidden=h;G.usedHides[h.i]=(G.usedHides[h.i]||0)+1;if(G.usedHides[h.i]>=2&&D.huntN>=1)D.unlock.ward=D.unlock.ward||h.type==='ward';
  if(h.type==='ward'){snd.wardrobe(true);h.o.doors.forEach(d=>d.rotation.y=d.side*-.9);setTimeout(()=>{h.o.doors.forEach(d=>{d.rotation.y=0;if(P.hidden===h)d.visible=false;});snd.wardrobe(false);},380);}
  else snd.creakAt(h.x,.2,h.z,.2,.5);
  P.yaw=Math.atan2(-h.fx,-h.fz);P.pitch=h.type==='bed'?.02:-.05;const hv=$('hidev');hv.className='layer on '+(h.type==='ward'?'ward':'bed');}
function exitHide(){const h=P.hidden;if(!h)return;P.hidden=null;P.x=h.ex;P.z=h.ez;$('hidev').className='layer';
  if(h.type==='ward'){h.o.doors.forEach(d=>{d.visible=true;d.rotation.y=d.side*-1.1;});setTimeout(()=>h.o.doors.forEach(d=>d.rotation.y=0),600);snd.wardrobe(true);noise(P.x,P.z,3.5);}else{snd.creakAt(h.x,.2,h.z,.2,.5);noise(P.x,P.z,3);}}
function exitHideSilently(){if(P.hidden){const h=P.hidden;P.hidden=null;P.x=h.ex;P.z=h.ez;if(h.o)h.o.doors.forEach(d=>d.visible=true);$('hidev').className='layer';}}
/* ---------- the torch in your hand, and the hammer ---------- */
const hand=grp();camera.add(hand);
lathe(hand,[[0,0],[.021,0],[.021,.17],[.03,.2],[.032,.23],[0,.23]],new T.MeshStandardMaterial({color:0x2a2a2c,roughness:.35,metalness:.6}),0,0,.08,14,{rx:-Math.PI/2});
const lens=new T.Mesh(new T.CircleGeometry(.029,18),std(null,{color:0x111111,emissive:0xfff3dd,ei:2}));lens.position.z=-.1505;lens.rotation.y=Math.PI;hand.add(lens);
const fingers=new T.Mesh(sculpt(new T.BoxGeometry(.06,.05,.11,3,3,3),(x,y,z)=>[x*(1+y*3),y,z]),new T.MeshStandardMaterial({color:0x5a4438,roughness:.7}));fingers.position.set(.005,-.03,.03);hand.add(fingers);
const hamV=PR.hammer();hamV.visible=false;camera.add(hamV);
hand.traverse(o=>{if(o.isMesh)o.castShadow=false;});hamV.traverse(o=>{if(o.isMesh)o.castShadow=false;});
function updateTorch(dt){
  let fl=P.light?1:0;
  if(fl&&IT&&(IT_S.where==='down'||IT_S.where==='stairs')&&Math.hypot(IT_S.x-P.x,IT_S.z-P.z)<8)fl*=Math.random()<.2?.12:1; // it does something to the bulb
  if(D.state==='count'&&Math.random()<.04)fl*=.15;
  flash.intensity=lerp(flash.intensity,fl*3.0,Math.min(1,dt*25));fill.intensity=flash.intensity*.06;
  hand.visible=!P.hidden&&G.phase!=='ending'&&P.sit<=0;const t=performance.now()/1000;
  hand.position.set(.25+Math.sin(P.bob*.5)*.012,-.24+Math.abs(Math.cos(P.bob*.5))*.01+Math.sin(t*1.3)*.003-P.crouch*.01,-.4);hand.rotation.set(.05+Math.sin(t*.9)*.01,.08,0);
  lens.material.emissiveIntensity=flash.intensity>.3?2.2:0;
  // the hammer comes up when you swing it
  if(G.swing!==undefined&&G.swing<1){G.swing+=dt*2.2;const s=G.swing;hamV.visible=true;hamV.position.set(-.18,-.22+Math.sin(s*Math.PI)*.12,-.45);hamV.rotation.set(-1.2+Math.sin(Math.min(1,s*1.6)*Math.PI)*1.6,0,.3);if(s>=1)hamV.visible=false;}
}
function findTarget(){if(P.hidden||G.phase!=='play'||P.sit>0)return null;let best=null,bs=0;const cp=camera.position;
  for(const o of inter){if(o.gone)continue;const dx=o.x-cp.x,dy=o.y-cp.y,dz=o.z-cp.z,d=Math.hypot(dx,dy,dz);if(d>o.r)continue;const dot=(dx*P.fx+dy*P.fy+dz*P.fz)/d;if(dot<(d<1.2?.78:d<2.3?.86:.9))continue;
    if(!HF.los(cp.x,cp.z,o.x-dx/d*.25,o.z-dz/d*.25,losBlocked))continue;const lab=typeof o.label==='function'?o.label():o.label;if(!lab)continue;const sc=dot-d*.02;if(sc>bs){bs=sc;best=o;}}
  return best;}
let target=null;
function updateUI(dt){target=findTarget();const pr=$('prompt'),cr=$('cross');
  if(P.hidden){if(G.hiddenT===undefined||!G.wasHidden)G.hiddenT=0;G.hiddenT+=dt;pr.innerHTML='<b>E</b>Get out';pr.classList.toggle('on',G.hiddenT<2.5);cr.classList.remove('hot');}
  else if(P.sit>0&&G.act==='night'){pr.innerHTML='<b>W</b>Get up';pr.classList.add('on');}
  else if(target){pr.innerHTML=`<b>E</b>${target.label()}`;pr.classList.add('on');cr.classList.add('hot');}
  else{pr.classList.remove('on');cr.classList.remove('hot');}
  G.wasHidden=!!P.hidden;G.intentT-=dt;if(G.intentT<=0)$('intent').classList.remove('on');
  $('stam').firstChild.style.width=P.stam+'%';$('stam').classList.toggle('on',P.stam<99);
  $('breath').firstChild.style.width=P.breath+'%';$('breath').classList.toggle('on',P.holding||P.breath<99);$('breath').classList.toggle('low',P.breath<30);
}
/* ---------- fear and the mix ---------- */
function updateFear(dt){
  let f=0;const down=IT&&(IT_S.where==='down'||IT_S.where==='stairs');
  if(down){const d=Math.hypot(IT_S.x-P.x,IT_S.z-P.z);f=clamp(1-(d-1.5)/14,0,1)*(IT_S.state==='chase'?1:IT_S.vis?.85:.55);if(IT_S.state==='check'&&P.hidden)f=Math.max(f,.9);}
  if(D.state==='count'||D.state==='false')f=Math.max(f,.32);
  if(G.act==='night'&&D.state==='presence')f=Math.max(f,.12);
  G.fear=lerp(G.fear,f,Math.min(1,dt*(f>G.fear?3:.6)));
  if(!ac)return;const t=ac.currentTime;
  const tens=G.act==='evening'?(G.slept?0:0):clamp(D.menace*.3+(D.state==='count'?.12:0)+(D.state==='presence'?.04:0)+G.fear*.15,0,.4);
  S.tensG.gain.setTargetAtTime(G.phase==='ending'?0:tens,t,.6);
  S.huntG.gain.setTargetAtTime(down&&IT_S.state!=='chase'&&D.state!=='still'?.18+G.fear*.25:0,t,1);
  S.chaseG.gain.setTargetAtTime(IT_S.state==='chase'&&down?.45:0,t,IT_S.state==='chase'?.1:1.5);
  S.droneG.gain.setTargetAtTime(.04+G.fear*.05+(G.act==='night'?.02:0),t,.6);
  const inside=G.inside;S.windLP.frequency.setTargetAtTime(inside?500:2400,t,.5);S.windG.gain.setTargetAtTime(inside?.1:.24,t,.8);
  const exert=(100-P.stam)/100,breath=Math.max(exert*.35,P.hidden?.1+G.fear*.25:G.fear*.14),ph=Math.sin(performance.now()/1000*(1.6+exert*2.5+G.fear*1.5));
  S.pBreath.gain.setTargetAtTime(P.holding?0:breath*(.3+.7*Math.max(0,ph)),t,.08);
  G.heartT-=dt;if(G.fear>.32&&G.heartT<=0){G.heartT=1.05-G.fear*.55;snd.heart(.22+G.fear*.45);}
  // the walkie: static that rises when it is near, ch 14 picking something up
  if(G.hasWalkie){const d=down?Math.hypot(IT_S.x-P.x,IT_S.z-P.z):IT_S.where==='up'?Math.hypot(IT_S.ux-P.x,IT_S.uz-P.z)+6:99;const s=clamp(1-d/16,0,1);const flick=s>0&&Math.random()<s*.5;
    S.walkieG.gain.setTargetAtTime(s*.06*(flick?1:.4),t,.05);$('walkie').firstChild.classList.toggle('hot',flick);}
  S.fireG.gain.setTargetAtTime(G.fireLit?.14:0,t,1);
}
function updateProps(dt,now){
  const t=now/1000;
  // fire
  const fk=G.fireLit?Math.min(1,(G.fireK=(G.fireK||0)+dt*.35)):0;decor.fire.flames.forEach(f=>f.visible=fk>0);drawFlame(MATS.flameT,t,fk);
  L.fire.intensity=fk*(1.25+Math.sin(t*9)*.12+Math.sin(t*23)*.07);MATS.ember.emissiveIntensity=G.act==='night'?.15+Math.sin(t*.7)*.05:fk*1.4;
  // kettle
  if(G.tea===1){G.kettleT+=dt;if(G.kettleT>22){G.tea=2;if(S.kettleG)S.kettleG.gain.setTargetAtTime(.05,ac.currentTime,2);think('Kettle.',1.5);}}
  // kitchen clock (battery) ticks; hall clock never does
  const kc=decor.kclock,sec=Math.floor(t);if(sec!==G.lastSec){G.lastSec=sec;kc.hands[2].rotation.z=-(sec%60)/60*TAU;if(Math.hypot(P.x-34,P.z-22.5)<10)snd.tick(34.1,1.95,22.5,sec%2);}
  kc.hands[1].rotation.z=-1.1;kc.hands[0].rotation.z=G.act==='night'?-1.6:-4.2;
  // the gritter: amber light sweeping the front of the house
  G.gritT=(G.gritT===undefined?120:G.gritT)-dt;if(G.gritT<=0){G.gritT=rand(160,260);G.gritRun=snd.gritter()||14;G.gritS=0;}
  if(G.gritRun){G.gritS+=dt;const k=G.gritS/G.gritRun;L.plough.position.set(-30+110*k,2.5,64);L.plough.intensity=(Math.sin(G.gritS*6)>0?1:.1)*Math.max(0,1-Math.abs(k-.5)*2.2)*1.6;MATS.window.emissiveIntensity=.5+L.plough.intensity*.4;if(k>=1){G.gritRun=0;L.plough.intensity=0;}}
  // light outside vs inside
  const out=!G.inside,base=(out?.16:.035)+settings.bright*.1;hemi.intensity=lerp(hemi.intensity,base,dt*2);
  scene.fog.color.lerp(tmpC.setRGB(out?.07:.012,out?.08:.013,out?.1:.02),dt*2);scene.fog.density=lerp(scene.fog.density,out?.028:.045,dt*2);
  carLights.intensity=G.act==='evening'&&!G.doorOpened?2.2:Math.max(0,carLights.intensity-dt*.5);
  updateSnow(dt,t);updateChunks(dt);
}
