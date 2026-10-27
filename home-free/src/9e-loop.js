
/* ================= DOCUMENTS ================= */
const DOCS={calendar:{draw:calendarCanvas,cap:'December 1994. He never took it down.'},poster:{draw:posterCanvas,cap:'We put these up in every shop window from here to Northfield.'},photo:{draw:polaroidCanvas,cap:'The den. The cupboard beside the stairs. Our torch, our comics, our biscuit tin.'}};
const docCache={};
function showDoc(k){const d=DOCS[k];if(!docCache[k])docCache[k]=d.draw();const slot=$('docslot');slot.innerHTML='';const c=docCache[k];c.style.width='auto';slot.appendChild(c);$('doccap').textContent=d.cap;G.docOpen=k;G.phase='doc';show('doc',true);snd.pickup();G.seen=G.seen||{};G.seen[k]=true;}
function closeDoc(){const k=G.docOpen;G.docOpen=null;show('doc',false);G.phase='play';snd.pickup();
  if(k==='photo'&&!G.photoLine){G.photoLine=true;think('I’d forgotten the den. We were in there every day that year.',4);}
  if(k==='calendar'&&!G.calLine){G.calLine=true;setTimeout(()=>think(G.knocked?'The day after. He sealed it up the day after.':'The twenty-second. Plasterboard, under the stairs. The day after.',4),400);}
  if(G.lockLost)pauseGame();}
/* ================= ENDING ================= */
function startEnding(){G.phase='ending';G.ending=0;intent('');show('hud',true);$('prompt').classList.remove('on');$('walkie').classList.remove('on');
  IT_S.where='down';IT_S.state='still';IT.root.visible=false;
  if(ac){S.huntG.gain.setTargetAtTime(0,ac.currentTime,.2);S.chaseG.gain.setTargetAtTime(0,ac.currentTime,.2);S.tensG.gain.setTargetAtTime(0,ac.currentTime,2);S.windG.gain.setTargetAtTime(.05,ac.currentTime,3);}
  G.endScript=[
    [1.2,()=>sub('Owen.','me',3)],
    [4.5,()=>sub('His torch. His trainer. His walkie-talkie, still switched on.','me',4.5)],
    [9.5,()=>{sub('Found you.','me',4);warmChord();}],
    [14,()=>{IT_S.x=22.4;IT_S.z=21;IT_S.y=0;IT_S.yaw=Math.PI/2;IT.root.visible=true;snd.itStep(21.5,.05,21,false);}],
    [15,()=>snd.itStep(22,.05,21,false)],
    [16.5,()=>{G.turn=true;}],
    [20,()=>{G.lower=true;}],
    [24.5,()=>{G.leave=true;}],
    [31,()=>{for(let i=0;i<12;i++)setTimeout(()=>snd.stair(12-i,.45),i*420);}],
    [38,()=>{post.uniforms.uBlack.value=1;show('hud',false);}],
    [41,()=>showEpilogue()]];}
function warmChord(){if(!ac)return;const t=ac.currentTime,d=ear(0,.8);[[48,.08],[55,.06],[60,.05],[64,.04],[67,.03]].forEach(([m,g],i)=>tone(d,t+i*.4,12,{f:midi(m),g,a:3,type:'triangle'}));}
function updateEnding(dt){G.ending+=dt;const e=G.ending;
  const tx=29.3,tz=19.9;P.x=lerp(P.x,tx,Math.min(1,dt*.7));P.z=lerp(P.z,tz,Math.min(1,dt*.7));P.crouch=lerp(P.crouch,.75,dt);
  let want;if(!G.turn)want=Math.atan2(-(30.6-P.x),-(19.2-P.z));else want=Math.atan2(-(IT_S.x-P.x),-(IT_S.z-P.z));
  P.yaw+=Math.atan2(Math.sin(want-P.yaw),Math.cos(want-P.yaw))*Math.min(1,dt*(G.turn?.9:1.2));P.pitch=lerp(P.pitch,G.turn?.12:-.35,dt*.9);
  while(G.endScript.length&&e>=G.endScript[0][0])G.endScript.shift()[1]();
  if(IT.root.visible){let mode='listen',speed=0;if(G.lower){mode='reveal';IT.lookYaw=0;}
    if(G.leave){IT_S.yaw=lerp(IT_S.yaw,Math.PI,dt*1.2);if(e>26){speed=1.1;IT_S.z+=dt*1.1;IT_S.x=lerp(IT_S.x,23,dt);}if(e>30)IT.root.visible=false;mode='walk';}
    poseIt(dt,speed,mode);syncIt();}
  camera.position.set(P.x,lerp(1.62,.95,P.crouch),P.z);
  flash.intensity=G.lower&&!G.leave?(Math.random()<.15?.3:1.6):2.2;
}
function showEpilogue(){G.phase='end';show('end',true);
  const L_=['The crew came at seven. I was sitting on the front step in the snow.','They found Owen in the space beside the stairs. His torch, one trainer, and his walkie-talkie, switched on, the battery long dead.','He was buried next to Dad on the third of February.','I was It. I finished the game.'];
  const epi=$('epi');epi.innerHTML='';epi.style.display='';epi.style.opacity=1;L_.forEach((l,i)=>{const p=document.createElement('p');p.textContent=l;epi.appendChild(p);setTimeout(()=>p.classList.add('on'),900+i*4200);});
  const end=900+L_.length*4200+2500;setTimeout(()=>{epi.style.transition='opacity 2s';epi.style.opacity=0;},end);
  setTimeout(()=>{epi.style.display='none';const m=Math.floor((G.t)/60),s=Math.floor(G.t%60);$('stTime').textContent=m+':'+String(s).padStart(2,'0');$('stFound').textContent=G.found;$('fin').classList.add('on');},end+2200);}
/* ================= BEING FOUND ================= */
function updateScare(dt){G.scareT+=dt;const s=G.scareT;
  const f=tmpV.set(0,0,-1).applyQuaternion(camera.quaternion);const d=lerp(1.2,.38,Math.min(1,s*4));
  IT.root.visible=true;IT.root.rotation.y=Math.atan2(-f.x,-f.z);poseIt(dt,0,'scare');IT.root.position.set(camera.position.x+f.x*d,0,camera.position.z+f.z*d);IT.root.updateMatrixWorld(true);
  const hp=IT.head.getWorldPosition(new T.Vector3()),want=camera.position.clone().addScaledVector(f,d);want.y=camera.position.y-.03+Math.sin(s*40)*.01;IT.root.position.add(want.sub(hp));
  G.hit=Math.max(0,1-s*.7);flash.intensity=s<.08?6:(Math.random()<.7?3.2:.6);fill.position.set(.18,-.16,-.05);fill.intensity=(s<.08?4:Math.random()<.8?1.6:.5);$('hud').classList.remove('on');P.pitch=lerp(P.pitch,.05,dt*5);
  if(s>1.25&&!G.deadShown){G.deadShown=true;post.uniforms.uBlack.value=1;IT.root.visible=false;show('hud',false);
    setTimeout(()=>{$('deadline').textContent=G.scareHow==='watched'?'It watched you climb in.':G.scareHow==='opened'?'It knew where to look.':['It found you.','Coming, ready or not.','You were never good at hiding.'][G.found%3];show('dead',true);},900);}}
function respawn(){fill.position.set(0,0,-.6);show('dead',false);G.deadShown=false;G.hit=0;IT.root.visible=false;IT_S.where='up';IT_S.state='idle';IT_S.ux=29;IT_S.uz=21;IT_S.utx=rand(5,45);IT_S.utz=rand(5,35);
  D.state='idle';D.relaxUntil=G.t+30;D.pressure=0;D.menace=0;P.x=G.hasHammer?20.5:8.6;P.z=G.hasHammer?33:37.6;P.yaw=0;P.pitch=0;P.vx=P.vz=0;P.stam=100;P.breath=100;P.exhaust=false;P.sit=0;
  post.uniforms.uBlack.value=0;show('hud',true);G.phase='play';lockPointer();think(G.hasHammer?'Again. Quieter.':'Not in the open. Not when it’s down here.',3.5);}
/* ================= INPUT ================= */
let lockOK=true;
function lockPointer(){const c=renderer.domElement;try{const r=c.requestPointerLock&&c.requestPointerLock();if(r&&r.catch)r.catch(()=>{lockOK=false;});}catch(e){lockOK=false;}}
document.addEventListener('pointerlockerror',()=>{lockOK=false;});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement){G.lockLost=false;return;}if(!lockOK)return;if(G.phase==='play')pauseGame();else if(G.phase==='doc')G.lockLost=true;});
let dragging=false;
renderer.domElement.addEventListener('mousedown',()=>{if(G.phase==='play'&&!document.pointerLockElement){lockPointer();dragging=true;}});
addEventListener('mouseup',()=>dragging=false);
addEventListener('mousemove',e=>{if(G.phase!=='play')return;if(!document.pointerLockElement&&!dragging)return;const s=.0022*settings.sens;P.yaw-=e.movementX*s;P.pitch=clamp(P.pitch-e.movementY*s,-1.35,1.35);});
addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','Tab'].includes(e.code))e.preventDefault();
  if(G.phase==='intro'&&(e.code==='Space'||e.code==='Enter'||e.code==='Escape')){finishIntro();return;}
  if(G.phase==='doc'){if(e.code==='KeyE'||e.code==='Escape'||e.code==='Space')closeDoc();return;}
  if(G.phase==='pause'&&e.code==='Escape'){resumeGame();return;}
  if(G.phase!=='play')return;
  keys[e.code]=true;if(e.repeat)return;
  if(e.code==='Tab'&&G.intentText){$('intent').classList.add('on');G.intentT=5;}
  if(e.code==='KeyF'){P.light=!P.light;snd.pickup();}
  if(e.code==='KeyE'){if(P.hidden){exitHide();return;}const t=findTarget();if(t)t.act();}
  if(e.code==='Escape'&&!lockOK)pauseGame();
});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(G.phase==='play')pauseGame();});
function pauseGame(){if(G.phase!=='play')return;G.phase='pause';for(const k in keys)keys[k]=false;show('pause',true);if(ac)S.master.gain.setTargetAtTime(settings.vol*.3,ac.currentTime,.2);if('speechSynthesis' in window)speechSynthesis.cancel();}
function resumeGame(){show('pause',false);G.phase='play';if(ac)S.master.gain.setTargetAtTime(settings.vol,ac.currentTime,.2);lockPointer();renderer.domElement.focus();}
$('resume').onclick=resumeGame;$('retry').onclick=respawn;$('again').onclick=()=>location.reload();
const sS=$('sSens'),sB=$('sBright'),sV=$('sVol'),sVo=$('sVoice');
sS.value=settings.sens;sB.value=settings.bright;sV.value=settings.vol;sVo.textContent=settings.voice?'On':'Off';
sS.oninput=()=>{settings.sens=+sS.value;saveSettings();};sB.oninput=()=>{settings.bright=+sB.value;post.uniforms.uBright.value=settings.bright;saveSettings();};
sV.oninput=()=>{settings.vol=+sV.value;if(ac)S.master.gain.value=settings.vol*.3;saveSettings();};
sVo.onclick=()=>{settings.voice=!settings.voice;sVo.textContent=settings.voice?'On':'Off';saveSettings();};
post.uniforms.uBright.value=settings.bright;
/* ================= INTRO ================= */
const INTRO=['My brother Owen was six. I was nine.','On the twenty-first of December 1994 we played hide-and-seek, and I was It.','I counted to twenty against the hall clock. I looked for him for about an hour. Then I gave up and put the telly on.','They searched the woods behind the house for eleven days.','Dad stayed in that house until he died in October. They’re knocking it down in the morning.','Somebody had to clear it out.'];
let introTimers=[];
function startIntro(){G.phase='intro';show('title',false);show('intro',true);const box=$('introText');box.innerHTML='';
  INTRO.forEach((l,i)=>{const p=document.createElement('p');p.textContent=l;box.appendChild(p);introTimers.push(setTimeout(()=>p.classList.add('on'),700+i*3800));});
  introTimers.push(setTimeout(finishIntro,700+INTRO.length*3800+2500));}
function finishIntro(){if(G.phase!=='intro')return;introTimers.forEach(clearTimeout);show('intro',false);G.phase='play';show('hud',true);
  P.x=HF.START.x;P.z=HF.START.z;P.yaw=HF.START.yaw;P.pitch=-.05;snd.carDoor();refreshIntent();lockPointer();renderer.domElement.focus();
  setTimeout(()=>think('Still snowing.',2.5),2200);}
$('begin').onclick=()=>{aInit();ambience();if('speechSynthesis' in window){try{speechSynthesis.speak(new SpeechSynthesisUtterance(''));}catch(e){}}startIntro();};
/* ================= LOOP ================= */
const tmpC=new T.Color();
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;post.uniforms.uT.value=now/1000;
  if(G.phase==='title'){const t=now/1000;camera.position.set(17.5+Math.sin(t*.05)*.6,1.55,58.5);P.yaw=.18+Math.sin(t*.06)*.06;P.pitch=.06;camera.rotation.set(P.pitch,P.yaw,0);flash.intensity=0;G.inside=false;updateProps(dt,now);}
  else if(G.phase==='play'){G.t+=dt;G.intentClock=(G.intentClock||0)-dt;if(G.intentClock<=0){G.intentClock=1;refreshIntent();}updatePlayer(dt);updateCamera(dt);updateTorch(dt);updateDoors(dt);updateProps(dt,now);
    if(G.act==='evening'){eveningAnomalies(dt);windowGlimpse();}
    else{director(dt);updateIt(dt);knockBeat(dt);}
    updateFear(dt);updateUI(dt);}
  else if(G.phase==='dead'){updateScare(dt);updateCamera(dt);updateDoors(dt);updateProps(dt,now);updateFear(dt);}
  else if(G.phase==='ending'){updateEnding(dt);updateCamera(dt);updateDoors(dt);updateProps(dt,now);updateTorch(dt);}
  else if(G.phase==='cut'){updateProps(dt,now);}
  post.uniforms.uFear.value=G.phase==='title'?.04:G.fear;post.uniforms.uHit.value=G.hit;post.uniforms.uHide.value=P.hidden?1:0;
  if(G.phase!=='intro'&&G.phase!=='end'){listener();renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);post.uniforms.tD.value=rt.texture;renderer.render(postScene,postCam);}}
// after the first hunt, while it is back upstairs: three knocks from the wall
function knockBeat(dt){if(G.knockHeard||D.huntN<1||D.state!=='idle')return;G.kbT=(G.kbT||0)+dt;const near=Math.hypot(P.x-23,P.z-21)<22;if(G.kbT<(near?8:25))return;
  G.knockHeard=true;snd.knock(24.6,.7,21,3,.45,true);if(G.hasWalkie&&ac){S.walkieG.gain.setTargetAtTime(.06,ac.currentTime,.05);setTimeout(()=>S.walkieG.gain.setTargetAtTime(0,ac.currentTime,.2),1400);}
  setTimeout(()=>{snd.knock(24.6,.7,21,3,.45,true);},3500);setTimeout(()=>think('Three knocks. From the front hall. Low down.',3.5),1600);setTimeout(()=>refreshIntent(),5500);}
/* ================= BOOT ================= */
const fontsReady=document.fonts&&document.fonts.load?Promise.race([Promise.all(['40px "Kalam"','700 40px "Kalam"','40px "Courier Prime"','40px "Fraunces"'].map(f=>document.fonts.load(f))),new Promise(r=>setTimeout(r,3000))]):Promise.resolve();
const nextFrame=()=>new Promise(r=>setTimeout(r,30));
fontsReady.then(async()=>{
  try{
    $('loadmsg').textContent='Papering the walls';await nextFrame();buildMaterials();
    $('loadmsg').textContent='Building the house';await nextFrame();buildShell();furnish();buildOutside();buildKeepItems();
    addInteract({x:23.2,y:1.15,z:21,r:2.3,label:wallLabel,act:wallAct});
    $('loadmsg').textContent='Something upstairs';await nextFrame();IT=buildIt();scene.add(IT.root);IT.root.visible=false;
  }catch(e){console.error(e);$('loadmsg').textContent='The house failed to build: '+e.message;return;}
  renderer.compile(scene,camera);$('loadmsg').textContent='';$('begin').disabled=false;$('begin').focus();requestAnimationFrame(frame);
});
// advance the simulation without rendering (tests run on a software renderer)
function sim(sec,dt=.05){for(let t=0;t<sec;t+=dt){G.t+=dt;updatePlayer(dt);updateCamera(dt);updateDoors(dt);if(G.act==='night'){director(dt);updateIt(dt);knockBeat(dt);}updateFear(dt);if(G.phase==='dead'){updateScare(dt);}}}
HF.debug={sim,noise,G,P,D,IT_S,doors,inter,hides,colliders,decor,get IT(){return IT;},get camera(){return camera;},scene,hemi,flash,keys,startNight,startCount,descend,huntStart,killPlayer,respawn,finishIntro,closeDoc,enterHide,exitHide,findTarget,breakWall,strike,startEnding,takeKeep,fallAsleep,phoneOrMachine,ruthCall};
})();
</script>
</body>
</html>
