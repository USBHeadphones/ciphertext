
/* ================= THE EVENING ================= */
const KEEP={albums:{x:13.05,y:.52,z:39.55,label:'Photo albums',line:'Four albums. Mum labelled every one. The last one stops at 1994.'},
  watch:{x:7.65,y:.765,z:2.25,label:'Dad’s watch',line:'Dad’s watch. Still going. He must have wound it the week he went into hospital.'},
  ring:{x:44.95,y:.57,z:2.38,label:'Mum’s ring box',line:'Mum’s rings. Ruth can have them. She’ll want them.'}};
function buildKeepItems(){
  const al=grp();for(let i=0;i<4;i++)rb(al,.3,.05,.24,plain([0x5a2a2a,0x2a3a5a,0x3a4a2a,0x6a5a3a][i],.7),rand(-.01,.01),.025+i*.05,0,.008,{ry:rand(-.1,.1)});
  const wa=grp();lathe(wa,[[0,0],[.018,0],[.018,.008],[0,.01]],MATS.chrome,0,0,0,16);rb(wa,.016,.003,.09,plain(0x3a2a1a,.6),0,.002,0,.002);
  const rg=grp();rb(rg,.06,.045,.06,plain(0x4a1020,.7),0,.022,0,.01);
  for(const [k,m] of [['albums',al],['watch',wa],['ring',rg]]){const it=KEEP[k];m.position.set(it.x,it.y,it.z);m.rotation.y=rand(0,3);scene.add(m);it.mesh=m;
    it.int=addInteract({x:it.x,y:it.y+.05,z:it.z,r:2.5,label:()=>'Take '+it.label.toLowerCase().replace('dad’s','Dad’s').replace('mum’s','Mum’s'),act:()=>takeKeep(k)});}
}
function takeKeep(k){const it=KEEP[k];if(G.keep.has(k))return;if(!G.called){think('I should find out what Ruth wants kept first.');return;}
  G.keep.add(k);it.int.gone=true;scene.remove(it.mesh);snd.pickup();think(it.line,5);
  if(G.keep.size===2)setTimeout(()=>overheadWalk(3,.35),9000);
  if(G.keep.size===3)setTimeout(()=>{refreshIntent();},5200);
}
function frontLabel(outside){const d=decor.front;if(G.act==='night')return'The front door';if(!G.doorOpened)return'Unlock the door';return d.target>.5?'Close the door':'Open the door';}
function frontDoor(outside){const d=decor.front;
  if(G.act==='night'){snd.knock(d.x,1,d.z+.9,2,.5);think(G.triedDoor?'Locked. The key was on the ring with the car keys.':'Locked. Dad deadlocked it from inside. The key was on my ring.',4);G.triedDoor=true;return;}
  if(!G.doorOpened){G.doorOpened=true;d.locked=false;snd.pickup();setTimeout(()=>{d.target=1.5;snd.doorCreak(d.x,1.2,d.z,.8);},500);
    setTimeout(()=>think('Still smells of his pipe.',3.5),3600);return;}
  d.locked=false;toggleDoor(d);}
function stairsLine(){if(G.act==='night'&&D.state!=='off'){think('No. No.',2);return;}think(['Third step from the top went through in 2017. Dad lived downstairs after that.','The landing’s propped up with a bit of four-by-two. I’m not going up there.'][(G.stairN=(G.stairN||0)+1)%2],4.5);}
function clockLine(){think(G.act==='night'?'Twenty. I counted to twenty, against this clock.':'The hall clock. It stopped at ten past four years ago and nobody wound it.',4.5);}
function bowlLine(){if(G.keysGone){G.keysTried=true;refreshIntent();think('The bowl’s empty. I put them in there. I know I put them in there.',4);return;}if(!G.keysDropped){think('Keys in the bowl. Same as when we were kids.',3);G.keysDropped=true;decor.keys.visible=true;snd.pickup();}else think('My car keys.',2);}
function marksLine(){if(G.marksSeen){think('O 6. Then just mine.',3);return;}G.marksSeen=true;
  lines([['me','Dad did these every birthday. Back against the frame, book flat on your head.',4.5],['me','Owen’s stop at six. Mine go all the way to fifteen.',4],['me','He never painted over them.',3]]);}
function toolboxLine(){if(G.hasHammer){think('Screwdrivers. Spirit level. His initials scratched in the lid.',3.5);return;}
  if(!G.knocked){think('Dad’s toolbox. Everything in it older than me.',3.5);return;}
  G.hasHammer=true;snd.pickup();decor.toolbox.hammer.visible=false;decor.toolbox.lid.rotation.x=-1.2;think('His claw hammer.',2.5);refreshIntent();D.unlock.bed=true;D.unlock.fast=true;D.pressure=Math.max(D.pressure,.4);}
function takeWalkie(){if(G.hasWalkie)return;G.hasWalkie=true;scene.remove(decor.walkie);snd.pickup();$('walkie').classList.add('on');
  lines([['me','My walkie-talkie. Owen had the other one.',3.5],['me','Channel fourteen. It still turns on.',3,()=>{if(S.walkieG){S.walkieG.gain.setTargetAtTime(.05,ac.currentTime,.1);setTimeout(()=>S.walkieG.gain.setTargetAtTime(0,ac.currentTime,.3),900);}}]]);}
function fuseLine(){if(G.fuse){think('Nothing. It’s the lines, not the fuses.',3);return;}G.fuse=true;snd.click([34.2,1.7,28.6],.2,.3);
  lines([['sfx','click. click. click.',2],['me','Nothing. The whole lane was dark when I drove in.',4]]);
  if(!G.called)setTimeout(()=>startRinging(),9000);}
function drawerLine(){if(G.hasMatches){think('Elastic bands, batteries, takeaway menus from 1998.',3.5);return;}G.hasMatches=true;snd.pickup();think('Matches. Swan Vestas. Of course.',3);
  if(!G.fireLit)refreshIntent();}
function fireLabel(){if(G.act==='night')return'The fireplace';if(G.fireLit)return'The fire';return G.hasMatches?'Light the fire':'The fireplace';}
function fireAct(){if(G.act==='night'){think('Cold. Not even warm ash.',3);return;}if(G.fireLit){think('Better.',2);return;}
  if(!G.hasMatches){think('There’ll be matches in the kitchen drawer.',3);return;}
  G.fireLit=true;snd.match();setTimeout(()=>{snd.ignite(2.7,.4,36);G.fireK=0;},900);
  setTimeout(()=>think('There. Like Dad used to do it.',3),3500);
  if(G.keep.size<3)setTimeout(()=>refreshIntent(),6000);}
function hobLabel(){if(G.act==='night')return'The cooker';if(G.tea===0)return G.hasMatches?'Put the kettle on':'The cooker';if(G.tea===1)return'The kettle';return G.teaDone?'The cooker':'Make the tea';}
function hobAct(){if(G.act==='night'){think('Gas is off at the meter. I turned it off.',3);return;}
  if(G.tea===0){if(!G.hasMatches){think('Gas works. No igniter. Need matches.',3);return;}G.tea=1;G.kettleT=0;snd.match();setTimeout(()=>{snd.ignite(49.5,1,27.5);decor.cooker.ring.material.emissiveIntensity=1.6;L.hob.intensity=.8;if(S.hobG)S.hobG.gain.setTargetAtTime(.06,ac.currentTime,.3);},800);think('Old kettle. Takes forever.',3);return;}
  if(G.tea===1){think('Not yet.',1.5);return;}
  if(G.tea===2&&!G.teaDone){G.teaDone=true;decor.cooker.ring.material.emissiveIntensity=0;L.hob.intensity=0;if(S.hobG){S.hobG.gain.setTargetAtTime(0,ac.currentTime,.2);S.kettleG.gain.setTargetAtTime(0,ac.currentTime,.1);}snd.pickup();think('No milk. Black, then.',3);
    if(G.carried)refreshIntent();}}
function sofaLabel(){if(G.act==='night')return'The sofa';return G.carried&&G.fireLit?'Sit down':'The sofa';}
function sofaAct(){if(G.act==='night'){think('I was asleep. I was actually asleep.',3);return;}
  if(!(G.carried&&G.fireLit)){think(G.fireLit?'Not yet. Get Mum and Dad’s things in the car first.':'Not yet.',3);return;}
  if(!G.teaDone&&!G.teaNag){G.teaNag=true;think('I could make a tea first. Or not.',3);return;}
  fallAsleep();}
function carLabel(){if(G.act==='night')return'The car';if(G.keep.size===3&&!G.carried)return'Put them in the boot';return'My car';}
function carAct(){if(G.act==='night'){snd.carDoor();think('Locked. The keys are inside. Somewhere.',3);return;}
  if(G.keep.size===3&&!G.carried){G.carried=true;snd.carDoor();setTimeout(()=>snd.carDoor(),700);think('That’s everything worth keeping. Four albums, a watch and some rings.',4.5);setTimeout(()=>refreshIntent(),5000);return;}
  if(!G.keep.size)think('I left the heating on in the car. Waste.',3);else think('Not yet. Ruth wanted three things.',3);}
/* ---------- the phone and the machine ---------- */
let ringIv=null;
function startRinging(){if(G.phoneRinging)return;G.phoneRinging=true;const r=()=>{if(!G.phoneRinging){clearInterval(ringIv);return;}snd.ring(46.2,1,18.5);decor.machine.led.material.color.set(0xff3020);setTimeout(()=>decor.machine.led.material.color.set(0x3a0a06),400);};r();ringIv=setInterval(r,3000);
  if(G.act==='evening'){setTimeout(()=>{if(G.phoneRinging&&!G.called)think('The landline. Only Ruth has this number.',3);},4000);}}
function phoneOrMachine(){
  if(G.phoneRinging){G.phoneRinging=false;clearInterval(ringIv);snd.pickup();if(G.act==='night'){nightCall();return;}ruthCall();return;}
  if(!G.machineDone){playMachine();return;}
  think('Three messages. I don’t want to hear them again.',3);}
function ruthCall(){G.called=true;const v=f0=>(d)=>()=>snd.phoneVoice(d,f0);
  const t=lines([['phone','You got there, then. Power’s off all down the valley, it was on the news.',4.5,()=>snd.phoneVoice(4.5,205)],['me','I’ve got the big torch.',2.5],
    ['phone','Right. Albums, Dad’s watch, Mum’s ring box. Everything else is for the skip.',4.5,()=>snd.phoneVoice(4.5,205)],['phone','Crew’s there at seven. Light the fire, you’ll freeze. Matches are in the drawer by the cooker.',5,()=>snd.phoneVoice(5,210)],
    ['phone','Are you alright, being there?',3,()=>snd.phoneVoice(2.4,195)],['me','It’s a house, Ruth.',2.5],['phone','Okay. Ring me in the morning.',2.5,()=>snd.phoneVoice(2.2,200)]]);
  setTimeout(()=>{snd.pickup();refreshIntent();},t*1000+400);}
function playMachine(){G.machineDone=true;snd.beep();
  const t=lines([['sfx','Three new messages.',2.2],['sfx','Thursday, 9:14 a.m.',2,()=>snd.tape(30)],
    ['phone','Hi, this is Karen at Pellow and Rudd, just confirming the crew’s booked for Tuesday the fourteenth, seven a.m.',5,()=>snd.message(5,215)],
    ['phone','Anything left in the property goes in the skip, so take what you want before then. Thanks. Bye.',4.5,()=>snd.message(4.5,215)],
    ['sfx','Saturday, 11:52 p.m.',2,()=>snd.beep()],
    ['phone','It’s Dad. Sorry, it’s late.',2.5,()=>snd.message(2.3,105)],['phone','The pipes are going again. Knocking. Your mum always said it was the pipes.',5,()=>snd.message(4.6,100)],
    ['phone','Doesn’t matter. Ring me back if you like.',3.5,()=>snd.message(3,98)],
    ['sfx','Sunday, 3:03 a.m.',2,()=>snd.beep()],['sfx','(hiss)',2.5],['sfx','knock. knock. knock.',2.6,()=>snd.knock(46.2,.9,18.5,3,.25,true)],['sfx','End of messages.',2,()=>snd.beep()]]);
  setTimeout(()=>think('I never rang him back.',3),t*1000+600);}
/* ---------- evening wrongness: nothing you can point at ---------- */
function overheadWalk(n,g){let x=P.x+rand(-3,3),z=P.z+rand(-3,3);const dx=rand(-1,1),dz=rand(-1,1);for(let i=0;i<n;i++)setTimeout(()=>snd.overhead(x+dx*i*.7,z+dz*i*.7,g),i*720);}
function eveningAnomalies(dt){
  G.anomT-=dt;if(G.anomT>0)return;G.anomT=rand(18,34);
  if(G.fireLit&&G.closedDoors.size){const d=[...G.closedDoors].map(k=>doors[k]).find(d=>d&&Math.hypot(d.x-P.x,d.z-P.z)>7&&!AG_visible(d.x,1,d.z));if(d){d.target=1.2;G.closedDoors.delete(doors.indexOf(d));}}
  if(G.inside&&Math.random()<.4)snd.creakAt(P.x+rand(-6,6),rand(0,2.6),P.z+rand(-6,6),.25,rand(.6,1.2));
}
function AG_visible(x,y,z){const v=new T.Vector3(x,y,z),p=v.clone().project(camera);if(p.z>1||Math.abs(p.x)>1.1||Math.abs(p.y)>1.1)return false;return HF.los(P.x,P.z,x,z,losBlocked);}
function windowGlimpse(){
  if(G.winGlimpse||G.act!=='evening'||G.keep.size<3||G.carried===false&&roomOf(cellOf(P.x),cellOf(P.z))!=='outside')return;
  if(roomOf(cellOf(P.x),cellOf(P.z))!=='outside'||!G.carried)return;
  const w=decor.upWins[2].position,dx=w.x-camera.position.x,dy=w.y-camera.position.y,dz=w.z-camera.position.z,d=Math.hypot(dx,dy,dz);
  if(d>24||d<7)return;const dot=(dx*P.fx+dy*P.fy+dz*P.fz)/d;
  if(!G.winT&&dot>.8){G.winT=.01;IT.root.position.set(w.x+.15,2.62,41.25);IT.root.rotation.y=0;IT.root.visible=true;IT_S.where='window';}
  if(G.winT){G.winT+=1/60;poseIt(1/60,0,'listen');if((dot>.97&&G.winT>.8)||G.winT>5||dot<.5){IT.root.visible=false;IT_S.where='up';G.winGlimpse=true;G.winT=0;setTimeout(()=>think('...Was that the curtain?',3),600);}}
}
function fallAsleep(){G.phase='cut';intent('');G.slept=true;show('hud',false);P.light=false;
  lines([['me','Five minutes.',2.5]]);
  setTimeout(()=>{post.uniforms.uBlack.value=1;$('blackout');},2600);
  setTimeout(()=>startNight(),7000);}
/* ================= THE NIGHT ================= */
function startNight(){G.act='night';G.fireLit=false;G.keysGone=true;decor.keys.visible=false;
  // the box with his name on it has come downstairs on its own
  const ob=decor.owenBox;if(ob){scene.remove(ob);}const nb=PR.box('OWEN',.5,.36,.4,false);place(nb,4.4,37.6,.5,{col:true,block:false});decor.owenBox=nb;
  addInteract({x:4.4,y:.4,z:37.6,r:2,label:()=>'The box marked OWEN',act:()=>owenBoxLine()});
  P.x=7.0;P.z=36;P.yaw=Math.PI/2;P.pitch=-.15;P.sit=1;P.light=false;
  if(ac){S.fireG.gain.setTargetAtTime(0,ac.currentTime,.1);S.windG.gain.setTargetAtTime(.2,ac.currentTime,2);}
  show('intro',true);$('introText').innerHTML='<p class="on" style="text-align:center;font-size:34px">3:03 a.m.</p>';
  setTimeout(()=>{show('intro',false);post.uniforms.uBlack.value=0;G.phase='play';show('hud',true);lockPointer();
    startRinging();setTimeout(()=>think('The fire’s out. How long was I...',3.5),1500);setTimeout(()=>{P.light=true;snd.pickup();},4200);},3800);}
function owenBoxLine(){if(G.boxSeen){think('I didn’t move it. I didn’t move it.',3);return;}G.boxSeen=true;
  lines([['me','That was upstairs. In our room. Taped.',3.5],['me','It’s open. His jumpers. His Beano annuals. Dad packed it.',4.5],['me','Somebody’s in the house.',3]]);
  D.pressure=Math.max(D.pressure,.25);}
function nightCall(){lines([['me','Hello?',1.6],['sfx','(hiss)',2.4],['me','Ruth?',1.6],['sfx','knock. knock. knock.',2.8,()=>{snd.knock(P.x+.4,P.y||1.5,P.z,3,.3,true);}],['sfx','(the line goes dead)',2.4,()=>snd.beep()]]);
  setTimeout(()=>{think('I’m going. I’ll sleep in the car.',3.5);refreshIntent();},12500);
  D.state='presence';D.presenceT=0;}
/* ---------- the wall ---------- */
function wallLabel(){if(G.wallBroken)return'';if(G.hasHammer)return'Hit the wall';if(G.knocked)return'Knock back';return'This wall';}
function wallAct(){
  if(G.hasHammer){strike();return;}
  if(G.knocked){snd.knock(24,1.2,21,3,.5);setTimeout(()=>{snd.knock(25,.6,21,3,.28,true);think('It knocked back.',2.5);},1600);return;}
  if(G.act==='night'&&G.knockHeard){G.knocked=true;snd.knock(24,1.2,21,3,.5);
    setTimeout(()=>{snd.knock(25,.6,21,3,.28,true);},1500);
    lines([['me','That’s ours. Three knocks. Owen’s knock.',4],['me','This was the den. There was a little door here. Dad boarded it up the week after.',5],['me','The twenty-second. On the calendar. Plasterboard.',4],['me','Dad’s toolbox is in the study.',3]],1.8);
    setTimeout(()=>refreshIntent(),15000);return;}
  think(G.act==='night'?'Fresh plaster. Fresher than the rest.':'The paint’s different here. Newer.',3);}
function strike(){if(G.wallBroken||G.strikeCd>0)return;G.strikeCd=1.25;G.swing=0;snd.swing();
  setTimeout(()=>{G.strikes++;snd.plaster(G.strikes);P.shake=.45;noise(24,21,46);D.heardBig=true;crackWall(G.strikes);
    if(G.strikes===1)think('Again.',1.5);if(G.strikes===3&&D.state!=='hunt')think('It heard that. It heard that.',3);
    if(G.strikes>=HF.WALL.strikes)breakWall();},230);}
function crackWall(n){const m=decor.plasterMat;if(!m)return;const c=m.map.canvas,g=c.getContext('2d');g.strokeStyle='rgba(40,30,20,.85)';
  for(let i=0;i<5+n*3;i++){g.lineWidth=1+Math.random()*2.5;g.beginPath();let x=256+rand(-40,40),y=256+rand(-60,60);g.moveTo(x,y);for(let k=0;k<6;k++){x+=rand(-40,40);y+=rand(-40,40);g.lineTo(x,y);}g.stroke();}
  g.fillStyle='rgba(30,22,16,.9)';g.beginPath();g.ellipse(256,256,n*14,n*20,0,0,TAU);g.fill();m.map.needsUpdate=true;
  for(let i=0;i<6;i++)debris(24-.1,rand(.8,1.6),21+rand(-.3,.3));}
const chunks=[];function debris(x,y,z){const m=rb(scene,rand(.03,.09),rand(.02,.05),rand(.03,.08),plain(0xd0c8b4,.9),x,y,z,.005);chunks.push({m,vx:rand(-2.2,-.6),vy:rand(.2,1.6),vz:rand(-.8,.8),t:0});}
function updateChunks(dt){for(const c of chunks){if(c.t>3)continue;c.t+=dt;c.vy-=9.8*dt;c.m.position.x+=c.vx*dt;c.m.position.y+=c.vy*dt;c.m.position.z+=c.vz*dt;c.m.rotation.x+=dt*4;if(c.m.position.y<.02){c.m.position.y=.02;c.vy*=-.25;c.vx*=.5;c.vz*=.5;}}}
function breakWall(){G.wallBroken=true;const d=decor.wall;d.leaf.visible=false;d.col.on=false;colliders.forEach(c=>{if(c.tag==='den')c.on=false;});for(let i=0;i<24;i++)debris(24-.1,rand(.2,2),21+rand(-.5,.5));
  snd.sting(.8);intent('');setTimeout(()=>think('Owen?',2),1500);
  // it stops. wherever it is, it stops.
  D.state='still';if(ac){S.huntG.gain.setTargetAtTime(0,ac.currentTime,.4);S.chaseG.gain.setTargetAtTime(0,ac.currentTime,.4);S.tensG.gain.setTargetAtTime(.04,ac.currentTime,2);}
  addInteract({x:30,y:.4,z:19.5,r:3.3,label:()=>'Owen',act:()=>startEnding()});}
