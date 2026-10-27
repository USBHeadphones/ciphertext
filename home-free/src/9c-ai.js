
/* ================= THE DIRECTOR ================= */
// It knows only what it hears and (when it peeks) sees. The director knows where you are,
// keeps a menace gauge, decides when it comes down, and sends it back up when you've had enough.
const NUM=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'];
function director(dt){
  if(G.act!=='night'||G.phase!=='play')return;
  const itDown=IT_S.where==='down'||IT_S.where==='stairs';
  // menace: proximity and sight, never attacks
  if(itDown){const d=Math.hypot(IT_S.x-P.x,IT_S.z-P.z),seen=IT_S.vis;let r=d<4?.28:d<9?.12:d<16?.04:.0;if(seen)r*=2;if(IT_S.state==='chase')r+=.25;D.menace=clamp(D.menace+r*dt,0,1);}
  else D.menace=Math.max(0,D.menace-dt*.05);
  D.menaceHighT=D.menace>.88?D.menaceHighT+dt:0;
  switch(D.state){
    case 'presence':{ // it is up there. you can hear it. nothing else yet.
      D.presenceT+=dt;upstairsWander(dt,G.keysGone?.35:.2);
      if(!G.glimpsed)stairGlimpse();
      if(D.presenceT>70&&G.t>D.relaxUntil){startCount(20);}break;}
    case 'idle':{ // between hunts
      upstairsWander(dt,.3);
      const base=G.hasHammer?1/55:G.knocked?1/80:1/95;D.pressure+=dt*base;
      if(G.t>D.relaxUntil){if(D.heardBig&&G.hasHammer){D.heardBig=false;descend(true);}else if(D.pressure>=1)startCount(G.hasHammer?0:10);}
      D.heardBig=false;break;}
    case 'count':{D.countT-=dt;if(D.countT<=0){
        if(D.count<D.countMax){D.count++;const w=NUM[D.count];sub(w.toLowerCase()+'…','it',1.1);say(w,.08,.55,.8);snd.overhead(IT_S.ux,IT_S.uz,.25);D.countT=D.countMax>10?.95:1.15;
          if(D.falseStop&&D.count===D.falseStop){D.state='false';D.countT=rand(7,11);}}
        else{sub('Coming. Ready or not.','it',2.6);say('Coming, ready or not',.08,.6,.9);D.state='wait';D.waitT=1.8;}}break;}
    case 'wait':{D.waitT-=dt;if(D.waitT<=0)descend(false);break;}
    case 'false':{D.countT-=dt;if(D.countT<=0)descend(false,true);break;} // it stopped counting. it comes down anyway, quietly.
    case 'hunt':{D.huntBudget-=dt;
      const peaked=D.menaceHighT>7&&IT_S.state!=='chase';
      if((D.huntBudget<=0&&IT_S.state!=='chase'&&IT_S.state!=='check')||peaked){withdraw();}break;}
  }
  // what it hears from upstairs
  if(IT_S.where==='up')for(const n of noises){if(n.t<G.t-dt*1.5)continue;const d=Math.hypot(n.x-IT_S.ux,n.z-IT_S.uz);if(d<n.r*.75){D.pressure+=n.r/40;D.heard={x:n.x,z:n.z,t:G.t};IT_S.utx=n.x;IT_S.utz=n.z;if(n.r>20)D.heardBig=true;}}
}
function upstairsWander(dt,bias){
  const dx=IT_S.utx-IT_S.ux,dz=IT_S.utz-IT_S.uz,d=Math.hypot(dx,dz);
  if(d<.5){IT_S.upPause=(IT_S.upPause||0)-dt;if(IT_S.upPause<=0){IT_S.upPause=rand(2,9);const toP=Math.random()<bias;IT_S.utx=toP?P.x+rand(-3,3):rand(4,48);IT_S.utz=toP?P.z+rand(-3,3):rand(4,38);}return;}
  const sp=.9;IT_S.ux+=dx/d*sp*dt;IT_S.uz+=dz/d*sp*dt;IT_S.ustepT-=dt;if(IT_S.ustepT<=0){IT_S.ustepT=.85;const above=Math.hypot(IT_S.ux-P.x,IT_S.uz-P.z);snd.overhead(IT_S.ux,IT_S.uz,above<5?.75:.5);}
}
function stairGlimpse(){ // it is standing at the top of the stairs, looking down
  if(roomOf(cellOf(P.x),cellOf(P.z))!=='front'||D.presenceT<25)return;
  const tx=29.1,ty=3.3,tz=24.5,dx=tx-camera.position.x,dy=ty-camera.position.y,dz=tz-camera.position.z,d=Math.hypot(dx,dy,dz);
  if(d>11)return;const dot=(dx*P.fx+dy*P.fy+dz*P.fz)/d;
  if(!G.glT&&dot>.75){G.glT=.01;IT_S.where='glimpse';IT.root.position.set(tx,HF.STAIRS.height,24.05);IT.root.rotation.y=0;IT.root.visible=true;snd.voiceIt([tx,3.4,24.3],.18,1.6);}
  if(G.glT){G.glT+=1/60;poseIt(1/60,0,'listen');if((dot>.96&&G.glT>.9)||G.glT>4){IT.root.position.z-=.6;}if(G.glT>4.4||(dot>.96&&G.glT>1.5)){IT.root.visible=false;IT_S.where='up';IT_S.ux=29;IT_S.uz=22;G.glimpsed=true;G.glT=0;D.presenceT=Math.max(D.presenceT,50);snd.overhead(29,21,.6);setTimeout(()=>think('There’s someone up there.',3),700);}}
}
function startCount(n){if(n<=0){descend(true);return;}D.state='count';D.count=0;D.countMax=n;D.countT=1.2;D.falseStop=(D.huntN>=2&&Math.random()<.3)?(4+Math.random()*4|0):0;D.pressure=0;
  if(D.huntN===0){setTimeout(()=>think('Someone’s counting.',2.5),2500);setTimeout(()=>think('Up to twenty. Like I did.',3),9000);}}
function descend(fast,quiet){D.state='descend';IT_S.where='stairs';IT_S.stair=0;IT_S.fast=fast;IT_S.quiet=quiet;IT.root.visible=true;IT_S.x=HF.STAIRS.x;IT_S.z=HF.STAIRS.top;IT_S.y=HF.STAIRS.height;IT_S.yaw=0;
  if(fast){snd.voiceIt([29.1,3.6,24.5],.55,2);}else if(!quiet)snd.click([29.1,3.6,24.5],.3,1.4);}
function withdraw(){D.state='withdraw';IT_S.state='leave';itGo(HF.STAIRS.landX,HF.STAIRS.landZ,true);}
/* ================= IT ================= */
function itGo(tx,tz,exact){const s=[cellOf(IT_S.x),cellOf(IT_S.z)],g=nearestPass(cellOf(tx),cellOf(tz));IT_S.path=HF.bfs(s[0],s[1],g[0],g[1],passM)||[];IT_S.pi=0;IT_S.goal=exact?{x:tx,z:tz}:null;}
function nearestPass(cx,cz){if(passM(cx,cz))return[cx,cz];for(let r=1;r<5;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++)if(passM(cx+dx,cz+dz))return[cx+dx,cz+dz];return[cx,cz];}
function itFollow(dt,speed){
  if(IT_S.pi>=IT_S.path.length)return true;
  const [cx,cz]=IT_S.path[IT_S.pi];let tx=(cx+.5)*CELL,tz=(cz+.5)*CELL;if(IT_S.pi===IT_S.path.length-1&&IT_S.goal){tx=IT_S.goal.x;tz=IT_S.goal.z;}
  const c=ch(cx,cz);
  if(c==='D'){const d=doorAtCell(cx,cz);if(d&&!doorOpenFor(d)){IT_S.doorWait=(IT_S.doorWait||(IT_S.state==='chase'?.4:D.unlock.listen?2.6:1.4))-dt;
      if(D.unlock.listen&&IT_S.doorWait>1.2&&!IT_S.listening){IT_S.listening=true;IT_S.mode='listen';}
      if(IT_S.doorWait<=0){IT_S.doorWait=0;IT_S.listening=false;d.target=1.55;d.fast=IT_S.state==='chase';if(d.fast)snd.slam(d.x,1,d.z);else snd.doorCreak(d.x,1.2,d.z,.5);}return false;}}
  IT.bow=c==='D'?1:Math.max(0,(IT.bow||0)-dt*2);
  const dx=tx-IT_S.x,dz=tz-IT_S.z,d=Math.hypot(dx,dz);if(d<.12){IT_S.pi++;return IT_S.pi>=IT_S.path.length;}
  const st=Math.min(d,speed*dt);IT_S.x+=dx/d*st;IT_S.z+=dz/d*st;const want=Math.atan2(dx,dz);IT_S.yaw+=Math.atan2(Math.sin(want-IT_S.yaw),Math.cos(want-IT_S.yaw))*Math.min(1,dt*6);
  IT_S.stepAcc+=st;if(IT_S.stepAcc>(IT_S.state==='chase'?1.2:.85)){IT_S.stepAcc=0;snd.itStep(IT_S.x,.05,IT_S.z,IT_S.state==='chase');noise(IT_S.x,IT_S.z,0);}
  return false;}
// it searches an area of interest in a deliberately imperfect order, doubling back
function planSearch(ax,az){const c=[];for(const [x,z] of PASSABLE){const wx=(x+.5)*CELL,wz=(z+.5)*CELL,d=Math.hypot(wx-ax,wz-az);if(d<7.5&&!mBlock[z*W+x])c.push([wx,wz,d]);}
  c.sort((a,b)=>a[2]-b[2]);const pts=[];for(let i=0;i<Math.min(c.length,14);i+=1+(Math.random()*2|0))pts.push(c[i]);
  for(let i=0;i<pts.length-1;i++)if(Math.random()<.35){const t=pts[i];pts[i]=pts[i+1];pts[i+1]=t;}
  if(pts.length>2&&Math.random()<.5)pts.splice(2+(Math.random()*(pts.length-2)|0),0,pts[0]); // goes back to check again
  IT_S.plan=pts.slice(0,7);IT_S.planI=0;IT_S.state='search';IT_S.pause=0;if(IT_S.plan.length)itGo(IT_S.plan[0][0],IT_S.plan[0][1],true);}
function areaOfInterest(){
  const recent=noises.filter(n=>n.r>0&&G.t-n.t<6&&Math.hypot(n.x-IT_S.x,n.z-IT_S.z)<n.r*(HF.los(n.x,n.z,IT_S.x,IT_S.z,losBlocked)?1:.55)).sort((a,b)=>b.t-a.t)[0];
  if(recent)return [recent.x,recent.z,true];
  // the director's hint: roughly where you are, never exactly
  const first=D.huntN===0,rm=roomOf(cellOf(P.x),cellOf(P.z));
  if(first||Math.random()<.35){const p=PASSABLE[Math.random()*PASSABLE.length|0];return [(p[0]+.5)*CELL,(p[1]+.5)*CELL,false];}
  return [P.x+rand(-5,5),P.z+rand(-5,5),false];}
function itSees(){if(P.hidden)return false;const dx=P.x-IT_S.x,dz=P.z-IT_S.z,d=Math.hypot(dx,dz);
  if(d<1.4)return HF.los(IT_S.x,IT_S.z,P.x,P.z,losBlocked);           // it can feel you that close
  if(IT_S.mode!=='peek')return false;                                    // otherwise only between its fingers
  const lit=P.light,range=lit?15:(P.crouch>.5?3:6);if(d>range)return false;
  const fx=Math.sin(IT_S.yaw+(IT.neck?IT.neck.rotation.y:0)),fz=Math.cos(IT_S.yaw+(IT.neck?IT.neck.rotation.y:0));if((dx*fx+dz*fz)/d<.55)return false;
  return HF.los(IT_S.x,IT_S.z,P.x,P.z,losBlocked);}
function itHears(){for(let i=noises.length-1;i>=0;i--){const n=noises[i];if(n.r<=0||n.t<G.t-.12)continue;const d=Math.hypot(n.x-IT_S.x,n.z-IT_S.z);const k=HF.los(n.x,n.z,IT_S.x,IT_S.z,losBlocked)?1:.55;if(d<n.r*k)return n;}return null;}
function huntStart(){D.state='hunt';D.huntN++;D.huntBudget=D.huntN===1?38:(G.hasHammer?60:50);IT_S.where='down';IT_S.compromised=null;IT_S.checked=new Set();
  if(D.huntN>=2)D.unlock.listen=true;
  const [ax,az]=areaOfInterest();planSearch(ax,az);}
function killPlayer(how){if(G.phase!=='play')return;const hd=$('hud');hd.style.transition='none';hd.classList.remove('on');void hd.offsetWidth;hd.style.transition='';$('hidev').className='layer';G.phase='dead';G.found++;IT_S.state='scare';G.scareT=0;G.scareHow=how;exitHideSilently();try{document.exitPointerLock&&document.exitPointerLock();}catch(e){}snd.scare();P.shake=1;}
function updateIt(dt){
  if(!IT)return;
  if(IT_S.where==='stairs'){ // walking down or up the actual stairs
    const up=D.state==='withdraw';IT_S.stair+=(IT_S.fast?5:2.6)*dt;
    const k=clamp(IT_S.stair/12,0,1),kk=up?1-k:k;
    IT_S.x=HF.STAIRS.x;IT_S.z=lerp(HF.STAIRS.top,HF.STAIRS.bottom,kk);IT_S.y=HF.STAIRS.height*(1-kk);IT_S.yaw=up?Math.PI:0;
    const si=Math.floor(IT_S.stair);if(si!==IT_S.lastStair){IT_S.lastStair=si;if(!IT_S.quiet||up)snd.stair(up?12-si:si,IT_S.fast?.9:.6);}
    poseIt(dt,1.2,'walk');syncIt();
    if(k>=1){if(up){IT_S.where='up';IT.root.visible=false;IT_S.ux=29;IT_S.uz=21;IT_S.utx=rand(10,40);IT_S.utz=rand(6,30);D.state='idle';D.relaxUntil=G.t+rand(45,75);D.menace*=.4;if(ac)S.huntG.gain.setTargetAtTime(0,ac.currentTime,2);setTimeout(()=>{if(D.state==='idle')toast('Quiet',1800);},2500);}
      else{IT_S.where='down';IT_S.y=0;IT_S.z=HF.STAIRS.landZ;IT_S.x=HF.STAIRS.landX;huntStart();}}
    return;}
  if(IT_S.where!=='down')return;
  IT_S.t+=dt;const dist=Math.hypot(P.x-IT_S.x,P.z-IT_S.z);IT_S.vis=itVisible();
  let speed=0;IT_S.mode='walk';
  if(D.state==='still'){IT_S.mode='listen';poseIt(dt,0,'listen');syncIt();return;}
  const sees=itSees(),heard=itHears();
  if(sees&&IT_S.state!=='chase'&&IT_S.state!=='leave'){IT_S.state='chase';IT_S.repath=0;IT_S.chaseT=0;snd.sting(1);snd.voiceIt([IT_S.x,2,IT_S.z],.8,1.6);}
  if(heard&&IT_S.state!=='chase'&&IT_S.state!=='leave'&&IT_S.state!=='check'){IT_S.hx=heard.x;IT_S.hz=heard.z;IT_S.heardT=G.t;
    if(Math.hypot(heard.x-IT_S.x,heard.z-IT_S.z)<5&&heard.r>=5&&!P.hidden){IT_S.state='chase';IT_S.repath=0;snd.voiceIt([IT_S.x,2,IT_S.z],.7,1.4);}
    else if(IT_S.state==='search'){planSearch(heard.x,heard.z);IT_S.pause=0;IT_S.mode='listen';}}
  switch(IT_S.state){
    case 'search':{speed=D.unlock.fast?1.95:1.6;
      if(IT_S.pause>0){IT_S.pause-=dt;speed=0;IT_S.mode=IT_S.peeking?'peek':'listen';IT.lookYaw=Math.sin(IT_S.t*1.4)*.8;break;}
      if(itFollow(dt,speed)){ // reached a search point: stop, listen, maybe peek, maybe check a hiding place
        IT_S.peeking=Math.random()<(D.unlock.fast?.6:.4);IT_S.pause=rand(1.3,2.8);if(IT_S.peeking)snd.click([IT_S.x,2.1,IT_S.z],.22,.8);
        const h=nearbyHide();if(h){IT_S.state='check';IT_S.checkHide=h;itGo(h.ex,h.ez,true);break;}
        IT_S.planI++;if(IT_S.planI>=IT_S.plan.length){const [ax,az]=areaOfInterest();planSearch(ax,az);}else itGo(IT_S.plan[IT_S.planI][0],IT_S.plan[IT_S.planI][1],true);}
      break;}
    case 'check':{const h=IT_S.checkHide;
      if(IT_S.pi<IT_S.path.length){speed=1.5;itFollow(dt,speed);break;}
      const want=Math.atan2(h.x-IT_S.x,h.z-IT_S.z);IT_S.yaw+=Math.atan2(Math.sin(want-IT_S.yaw),Math.cos(want-IT_S.yaw))*dt*4;
      IT_S.checkT=(IT_S.checkT||0)+dt;IT_S.mode=IT_S.checkT>1.2?'peek':'listen';
      if(IT_S.checkT>1.2&&!IT_S.opened){IT_S.opened=true;IT_S.checked.add(h);
        if(h.type==='ward'){h.o.doors.forEach(dd=>dd.rotation.y=dd.side*-1.2);snd.wardrobe(true);}else snd.creakAt(h.x,.3,h.z,.3,.6);
        if(P.hidden===h){snd.rip();killPlayer('opened');return;}}
      if(IT_S.checkT>2.6){if(h.type==='ward')h.o.doors.forEach(dd=>dd.rotation.y=0);IT_S.checkT=0;IT_S.opened=false;IT_S.state='search';IT_S.planI++;if(IT_S.planI<IT_S.plan.length)itGo(IT_S.plan[IT_S.planI][0],IT_S.plan[IT_S.planI][1],true);else{const [ax,az]=areaOfInterest();planSearch(ax,az);}}
      break;}
    case 'chase':{speed=4.25+(D.unlock.fast?.25:0);IT_S.mode='chase';IT_S.chaseT+=dt;
      const moving=P.speed>.4&&!P.hidden,heardYou=G.t-P.lastNoise<.6;
      if(sees||heardYou||moving&&dist<7){IT_S.lastX=P.x;IT_S.lastZ=P.z;IT_S.lostT=0;}else IT_S.lostT+=dt;
      const tg=P.hidden&&IT_S.compromised===P.hidden?[P.hidden.ex,P.hidden.ez]:[IT_S.lastX,IT_S.lastZ];
      IT_S.repath=(IT_S.repath||0)-dt;if(IT_S.repath<=0){IT_S.repath=.3;itGo(tg[0],tg[1],true);}
      if(!P.hidden&&dist<3&&HF.los(IT_S.x,IT_S.z,P.x,P.z,losBlocked)){const dx=P.x-IT_S.x,dz=P.z-IT_S.z;IT_S.x+=dx/dist*speed*dt;IT_S.z+=dz/dist*speed*dt;IT_S.yaw=Math.atan2(dx,dz);IT_S.stepAcc+=speed*dt;if(IT_S.stepAcc>1.2){IT_S.stepAcc=0;snd.itStep(IT_S.x,.05,IT_S.z,true);}}
      else itFollow(dt,speed);
      if(!P.hidden&&dist<.85)killPlayer('caught');
      if(P.hidden&&IT_S.compromised===P.hidden&&Math.hypot(P.hidden.ex-IT_S.x,P.hidden.ez-IT_S.z)<1.2){snd.rip();killPlayer('watched');}
      if(IT_S.lostT>1.8&&(IT_S.pi>=IT_S.path.length||IT_S.lostT>4)){IT_S.state='search';planSearch(IT_S.lastX,IT_S.lastZ);IT_S.pause=rand(1.5,2.5);IT_S.peeking=true;snd.click([IT_S.x,2.1,IT_S.z],.35,1.2);}
      break;}
    case 'leave':{speed=1.7;if(itFollow(dt,speed)){IT_S.where='stairs';IT_S.stair=0;IT_S.fast=false;IT_S.quiet=false;IT_S.lastStair=-1;}break;}
  }
  // a hidden player breathing next to it gives themselves away
  if(P.hidden&&IT_S.state!=='chase'&&!P.holding&&dist<2.3&&G.fear>.45){IT_S.breathT=(IT_S.breathT||0)+dt;if(IT_S.breathT>1.6&&IT_S.state!=='check'){IT_S.state='check';IT_S.checkHide=P.hidden;itGo(P.hidden.ex,P.hidden.ez,true);IT_S.breathT=0;snd.click([IT_S.x,2.1,IT_S.z],.4,.8);}}else IT_S.breathT=0;
  IT_S.clickT-=dt;if(IT_S.clickT<=0){IT_S.clickT=rand(4,9);Math.random()<.65?snd.click([IT_S.x,2.1,IT_S.z],.3):snd.voiceIt([IT_S.x,2,IT_S.z],.3,rand(1.5,2.4));}
  poseIt(dt,speed,IT_S.mode);syncIt();
}
function nearbyHide(){let best=null,bd=3.2;for(const h of hides){if(IT_S.checked&&IT_S.checked.has(h))continue;const d=Math.hypot(h.ex-IT_S.x,h.ez-IT_S.z);if(d>=bd)continue;
  const used=(G.usedHides[h.i]||0);let p=h.type==='ward'?(D.unlock.ward||used>=2?.55:.08):(D.unlock.bed?.45:0);if(used>=3)p+=.25;if(Math.random()<p){best=h;bd=d;}}return best;}
function itVisible(){if(!IT.root.visible)return false;const v=new T.Vector3(IT_S.x,1.9+IT_S.y,IT_S.z),d=v.distanceTo(camera.position);if(d>30)return false;const p=v.clone().project(camera);if(p.z>1||Math.abs(p.x)>1.05||Math.abs(p.y)>1.05)return false;return HF.los(P.x,P.z,IT_S.x,IT_S.z,losBlocked);}
function syncIt(){IT.root.position.set(IT_S.x,IT_S.y,IT_S.z);IT.root.rotation.y=IT_S.yaw;
  if(ac){setPos(S.iPan,IT_S.x,1.9+IT_S.y,IT_S.z);const occ=!HF.los(P.x,P.z,IT_S.x,IT_S.z,losBlocked);S.iOcc.frequency.setTargetAtTime(occ?450:8000,ac.currentTime,.1);
    const br=IT_S.where==='down'||IT_S.where==='stairs'?(IT_S.state==='chase'?.5:IT_S.state==='check'?.55:.26):0;const ph=Math.sin(performance.now()/1000*(IT_S.state==='chase'?4:1.3));S.iBreath.gain.setTargetAtTime(br*(.3+.7*Math.max(0,ph)),ac.currentTime,.05);}}
