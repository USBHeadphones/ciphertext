
/* ================= THE HOUSE ================= */
const LINTEL=2.05;
const doors=[],inter=[],hides=[],decor={};
const isDoorCh=c=>c==='D'||c==='S'||c==='E';
function doorAxis(cx,cz){return(ch(cx-1,cz)==='#'&&ch(cx+1,cz)==='#')?'z':'x';}
const doorMap={};function doorAtCell(cx,cz){const k=cz*W+cx;if(!(k in doorMap))doorMap[k]=doors.find(d=>d.cx===cx&&d.cz===cz)||null;return doorMap[k];}
function addInteract(o){inter.push(o);return o;}
function wallFor(x,z){const c=ch(x,z);if(c==='o')return MATS.walls.brick;const r=roomOf(x,z);return MATS.walls[r?HF.ROOMS[r].wall:'hall'];}
function buildShell(){
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
    const c=ch(x,z);if(c==='#')continue;
    const x0=x*CELL,x1=x0+CELL,z0=z*CELL,z1=z0+CELL;
    if(isDoorCh(c)){const ax=doorAxis(x,z),mid=ax==='z'?x0+1:z0+1,wm=c==='S'?MATS.walls.den:MATS.walls.jamb;
      hq(c==='S'?MATS.floors.bare:MATS.floors.boards,x0,z0,x1,z1,0,true);hq(MATS.walls.jamb,x0,z0,x1,z1,LINTEL,false);
      if(ax==='z'){vq(wm,mid-.6,z1,mid-.6,z0,0,LINTEL,1,0);vq(wm,mid+.6,z0,mid+.6,z1,0,LINTEL,-1,0);addCol(x0,z0,mid-.6,z1,'jamb');addCol(mid+.6,z0,x1,z1,'jamb');}
      else{vq(wm,x0,mid-.6,x1,mid-.6,0,LINTEL,0,1);vq(wm,x1,mid+.6,x0,mid+.6,0,LINTEL,0,-1);addCol(x0,z0,x1,mid-.6,'jamb');addCol(x0,mid+.6,x1,z1,'jamb');}
      continue;}
    const out=c==='o',room=roomOf(x,z),info=room?HF.ROOMS[room]:null,wm=wallFor(x,z),wh=out?2.7:WALL_H;
    hq(MATS.floors[info?info.floor:'boards'],x0,z0,x1,z1,0,true);
    const stairHole=(z===12&&x>=13&&x<=15);
    if(!out&&!stairHole)hq(MATS.ceil,x0,z0,x1,z1,WALL_H,false);
    const faces=[[0,-1,x0,z0,x1,z0,0,1],[0,1,x1,z1,x0,z1,0,-1],[-1,0,x0,z1,x0,z0,1,0],[1,0,x1,z0,x1,z1,-1,0]];
    for(const [dx,dz,ax,az,bx_,bz,nx,nz] of faces){const n=ch(x+dx,z+dz);
      if(out&&(n==='o'||(x+dx<0||x+dx>=W||z+dz>=H)))continue;
      if(n==='#'){vq(wm,ax,az,bx_,bz,0,wh,nx,nz);}
      else if(isDoorCh(n)){const p=t=>[ax+(bx_-ax)*t,az+(bz-az)*t];const [a1x,a1z]=p(.2),[b1x,b1z]=p(.8);
        vq(wm,ax,az,a1x,a1z,0,wh,nx,nz);vq(wm,b1x,b1z,bx_,bz,0,wh,nx,nz);vq(wm,a1x,a1z,b1x,b1z,LINTEL,wh,nx,nz);
        if(n!=='S'){const along=Math.abs(bx_-ax)>0,mx=(a1x+b1x)/2,mz=(a1z+b1z)/2,fr=grp();const trim=out?MATS.whiteGloss:MATS.whiteGloss;
          rb(fr,along?1.38:.045,.09,along?.045:1.38,trim,mx+nx*.02,LINTEL+.045,mz+nz*.02,.008);
          for(const s of[-1,1])rb(fr,along?.08:.045,LINTEL,along?.045:.08,trim,mx+(along?s*.64:nx*.02),LINTEL/2,mz+(along?nz*.02:s*.64),.008);scene.add(fr);}}
    }
  }
  for(const [mat,b] of batches)scene.add(b.mesh(mat));
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){const c=ch(x,z);if(c==='#')addCol(x*CELL,z*CELL,x*CELL+CELL,z*CELL+CELL,'wall');if(c==='h')addCol(x*CELL,z*CELL,x*CELL+CELL,z*CELL+CELL,'den');}
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){const c=ch(x,z);if(isDoorCh(c))makeDoor(x,z,c);}
  // garden bounds
  addCol(-1,42,.3,63,'bound');addCol(51.7,42,53,63,'bound');addCol(-1,61.4,53,63,'bound');
}
function makeDoor(cx,cz,c){
  const ax=doorAxis(cx,cz),x0=cx*CELL,z0=cz*CELL,xc=x0+1,zc=z0+1;
  const off=c==='D'?0:c==='S'?-.96:.96;
  const piv=grp();let base;if(ax==='z'){piv.position.set(xc-.6,0,zc+off);base=0;}else{piv.position.set(xc+off,0,zc-.6);base=-Math.PI/2;}piv.rotation.y=base;
  let leaf;
  if(c==='S'){const m=std(plaster('#cfc8b6',.4),{bump:.01});leaf=rb(piv,1.2,LINTEL+.6,.06,m,.6,(LINTEL+.6)/2,0,.004);decor.plasterMat=m;}
  else{leaf=rb(piv,1.18,LINTEL-.02,c==='E'?.07:.045,c==='E'?std(panelDoor('#3a4a3a'),{rough:.4}):MATS.door,.59,(LINTEL-.02)/2,0,.006);
    for(const s of[-1,1]){lathe(piv,[[0,0],[.022,0],[.022,.01],[.01,.02],[.01,.05],[.02,.06],[0,.065]],MATS.brass,1.06,1.0,s*.03,10,{rx:s*Math.PI/2});}
    if(c==='E'){const lb=rb(piv,.16,.03,.02,MATS.brass,.59,1.45,.045,.004);}}
  scene.add(piv);
  const d={cx,cz,c,ax,piv,leaf,base,ang:0,target:0,x:xc,z:zc,locked:c==='E',openSide:1,fast:false};
  d.col=ax==='z'?addCol(xc-.6,zc+off-.06,xc+.6,zc+off+.06,'door'):addCol(xc+off-.06,zc-.6,xc+off+.06,zc+.6,'door');
  doors.push(d);
  if(c==='D'){if(R()<.5)d.ang=d.target=rand(1.1,1.55);addInteract({x:xc,y:1.1,z:zc,r:2.1,door:d,label:()=>d.target>.5?'Close the door':'Open the door',act:()=>toggleDoor(d)});}
  if(c==='E'){decor.front=d;addInteract({x:xc,y:1.1,z:zc+.6,r:2.3,label:()=>frontLabel(),act:()=>frontDoor()});addInteract({x:xc,y:1.1,z:zc+1.6,r:2.3,label:()=>frontLabel(true),act:()=>frontDoor(true)});}
  if(c==='S')decor.wall=d;
  return d;
}
function doorOpenFor(d){return d.ang>.6;}
function toggleDoor(d,byIt,fast){if(d.locked)return;d.target=d.target>.5?0:rand(1.35,1.6);d.fast=!!fast;snd.doorCreak(d.x,1.2,d.z,fast?.35:1);if(d.target===0)setTimeout(()=>{if(d.target===0)snd.thud(d.x,1,d.z,.35);},fast?250:700);if(!byIt){noise(d.x,d.z,fast?9:4.5);const k=doors.indexOf(d);if(d.target===0)G.closedDoors.add(k);else G.closedDoors.delete(k);}}
function updateDoors(dt){for(const d of doors){d.ang+=(d.target-d.ang)*Math.min(1,dt*(d.fast?9:3));d.piv.rotation.y=d.base+d.ang*d.openSide;d.col.on=d.ang<.55&&!(d.c==='S'&&G.wallBroken);if(Math.abs(d.target-d.ang)<.01)d.fast=false;}}

function furnish(){
  const P_=(o,x,z,r=0,opt)=>place(o,x,z,r,opt);
  /* ---- FRONT HALL ---- */
  const st=grp();const rise=WALL_H/12;
  for(let i=0;i<12;i++){const y=(i+1)*rise,z=-(i+.5)*.5;rb(st,3,y,.5,MATS.teak,0,y/2,z,.006);rb(st,1.7,.02,.52,MATS.floors.carpetBrown,0,y+.01,z,.004,{cast:false});rb(st,1.7,.01,.02,MATS.brass,0,y+.015,z+.25,.004,{cast:false});
    lathe(st,turned(.92,.022),MATS.whiteGloss,-1.45,y,z,8);}
  lathe(st,turned(1.15,.055),MATS.teak,-1.45,0,.15,12);
  const rail=rb(st,.07,.06,Math.hypot(6,WALL_H)+.3,MATS.teak,-1.45,0,0,.02);rail.rotation.x=Math.atan2(WALL_H,6);rail.position.set(-1.45,WALL_H/2+.92,-3);
  P_(st,29.1,30.2,0,{col:false,block:true});addCol(27.3,24,32,30.3,'stairs');
  addInteract({x:28.6,y:1.0,z:30.6,r:2.2,label:()=>'The stairs',act:()=>stairsLine()});
  const clock=grp();rb(clock,.5,1.95,.34,MATS.teak,0,.975,0,.01);rb(clock,.56,.12,.38,MATS.teak,0,2.0,0,.02);const cf=new T.Mesh(new T.CircleGeometry(.17,24),plain(0xe2dccb,.6));cf.position.set(0,1.66,.175);clock.add(cf);
  for(let i=0;i<12;i++){const a=i/12*TAU;rb(clock,.01,.03,.004,MATS.blackPlastic,Math.sin(a)*.14,1.66+Math.cos(a)*.14,.18,.001,{rz:-a,cast:false});}
  rb(clock,.012,.1,.004,MATS.blackPlastic,.03,1.69,.182,.001,{rz:-.6,cast:false});rb(clock,.008,.13,.004,MATS.blackPlastic,-.02,1.62,.183,.001,{rz:2.6,cast:false});
  rb(clock,.32,.8,.01,MATS.glass,0,.85,.172,.004,{cast:false});lathe(clock,[[0,0],[.06,0],[.06,.012],[0,.012]],MATS.brass,0,.6,.1,16,{rx:Math.PI/2});
  P_(clock,18.32,30.2,Math.PI/2);decor.hallClock=clock;
  addInteract({x:18.6,y:1.6,z:30.2,r:2,label:()=>'The hall clock',act:()=>clockLine()});
  P_(PR.hallTable(),18.3,36.4,Math.PI/2);
  const bowl=grp();lathe(bowl,[[0,0],[.06,0],[.1,.04],[.11,.05],[0,.05]],plain(0x3a5a6a,.3),0,0,0,18);bowl.position.set(18.3,.8,36.1);scene.add(bowl);
  const keys=grp();rb(keys,.06,.008,.025,MATS.steel,0,.005,0,.003);rb(keys,.03,.008,.07,MATS.brass,.03,.005,.03,.003,{ry:.6});keys.position.set(18.3,.805,36.1);keys.visible=false;scene.add(keys);decor.keys=keys;
  addInteract({x:18.3,y:.85,z:36.1,r:2,label:()=>G.keysGone?'The bowl':'Car keys',act:()=>bowlLine(),gone:false});
  const hooks=PR.coatHooks();P_(hooks,18.03,38.7,Math.PI/2,{col:false,block:false});decor.coats=hooks.coats;
  P_(PR.shoeRack(),18.2,38.7,Math.PI/2,{pad:.02});
  P_(PR.radiator(),31.94,36.2,-Math.PI/2,{block:false});
  P_(PR.boxStack(['BOOKS','DAD']),30.9,39.2,.2);P_(PR.boxStack(['KEEP']),30.8,25.2+5,0);
  const pd=PR.pendant();pd.position.set(25,WALL_H,34);scene.add(pd);
  const fp=PR.frame(.4,.3,photoTex('beach'));fp.position.set(31.97,1.6,33.4);fp.rotation.y=-Math.PI/2;scene.add(fp);
  /* ---- HALL ---- */
  const run=new T.Mesh(new T.PlaneGeometry(44,1.1),std(carpet('#5a2a24','swirl'),{rough:1,bump:.02}));run.rotation.x=-Math.PI/2;run.position.set(26,.004,14);run.receiveShadow=true;scene.add(run);
  P_(PR.hallTable(),12,12.24);P_(PR.radiator(1.1),31,12.05,0,{block:false});
  [[14.5,'beach'],[26,'school'],[39.5,'xmas']].forEach(([x,k])=>{const f=PR.frame(.36,.28,photoTex(k));f.position.set(x,1.62,12.02);scene.add(f);});
  P_(PR.boxStack(['TIP','TIP']),46.8,15.3,.3);P_(PR.boxStack(['CHARITY']),20.5,12.4,-.1);
  const mk=new T.Mesh(new T.PlaneGeometry(.26,1.9),new T.MeshStandardMaterial({map:marksTex(),transparent:true,roughness:.9,depthWrite:false}));mk.position.set(8.415,.95,16.4);mk.rotation.y=Math.PI/2;scene.add(mk);
  addInteract({x:8.45,y:1.15,z:16.4,r:1.9,label:()=>'Pencil marks',act:()=>marksLine()});
  const winAt=(x,z,r,cm)=>{const w=PR.windowUnit(1.1,1.2,cm);w.position.set(x,0,z);w.rotation.y=r;scene.add(w);};
  winAt(49.98,14,-Math.PI/2);winAt(2.02,14,Math.PI/2);
  /* ---- STUDY ---- */
  P_(PR.desk(),7,2.4,0);P_(PR.officeChair(),7.3,3.5,2.8);
  const cork=grp();rb(cork,1.6,.95,.03,MATS.teak,0,0,0,.006);rb(cork,1.52,.87,.01,MATS.cork,0,0,.017,.003,{cast:false});
  const cal=new T.Mesh(new T.PlaneGeometry(.38,.49),std(new T.CanvasTexture(calendarCanvas()),{bump:0,rough:.9}));cal.material.map.encoding=T.sRGBEncoding;cal.position.set(-.45,.0,.024);cal.rotation.z=.02;cork.add(cal);
  const pos=new T.Mesh(new T.PlaneGeometry(.3,.42),std(new T.CanvasTexture(posterCanvas()),{bump:0,rough:.9}));pos.material.map.encoding=T.sRGBEncoding;pos.position.set(.42,.02,.024);pos.rotation.z=-.03;cork.add(pos);
  for(let i=0;i<5;i++){const n=new T.Mesh(new T.PlaneGeometry(.1,.08),plain([0xe8e070,0xd8d8d0,0x9ad0e0][i%3],.9));n.position.set(rand(-.1,.1),rand(-.3,.3),.023);n.rotation.z=rand(-.2,.2);cork.add(n);}
  cork.position.set(6.8,1.6,2.02);scene.add(cork);
  addInteract({x:5.9,y:1.55,z:2.06,r:2.3,label:()=>'Dad’s calendar',act:()=>showDoc('calendar')});
  addInteract({x:7.75,y:1.55,z:2.06,r:2.3,label:()=>'The poster',act:()=>showDoc('poster')});
  P_(PR.bookshelf(),2.17,4.4,Math.PI/2);P_(PR.bookshelf(),2.17,6.4,Math.PI/2);P_(PR.filing(),12.6,2.32,0);
  const tb=PR.toolbox();P_(tb,10.6,2.75,.15,{pad:.02});decor.toolbox=tb;
  addInteract({x:10.6,y:.3,z:2.75,r:2.2,label:()=>G.hasHammer?'The toolbox':G.knocked?'Take the hammer':'Dad’s toolbox',act:()=>toolboxLine()});
  P_(PR.boxStack(['DAD','BOOKS']),4.5,9.3,.1);P_(PR.boxStack(['TIP']),9.5,9.4,-.2);
  winAt(10.3,2.02,0,MATS.curtainB);
  const sp_=PR.pendant();sp_.position.set(8,WALL_H,6);scene.add(sp_);
  /* ---- BATHROOM ---- */
  P_(PR.tub(),23,2.43,0);P_(PR.basin(),16.32,5.6,Math.PI/2);P_(PR.toilet(),16.32,8.2,Math.PI/2);
  const mir=grp();rb(mir,.5,.6,.12,MATS.whiteGloss,0,0,0,.01);const mg=new T.Mesh(new T.PlaneGeometry(.44,.54),new T.MeshStandardMaterial({color:0x0b0f12,roughness:.02,metalness:.95}));mg.position.z=.062;mir.add(mg);mir.position.set(16.06,1.6,5.6);mir.rotation.y=Math.PI/2;scene.add(mir);
  const tw=new T.Mesh(hangGeo(.4,.7,2,.03,.1),plain(0x6a8aa0,.95,{side:T.DoubleSide}));tw.position.set(16.05,1.25,7.2);tw.rotation.y=Math.PI/2;scene.add(tw);
  winAt(19,2.02,0,plain(0xc8c8b8,.95));
  /* ---- MUM AND DAD'S ROOM ---- */
  P_(PR.bed(),43.5,2.05,0);P_(PR.nightstand(),42.2,2.3);P_(PR.nightstand(),44.8,2.3);P_(PR.dresser(),31.4,2.3);
  P_(PR.boxStack(['KEEP','CHARITY']),33.4,9.2,.3);P_(PR.boxStack(['CHARITY']),47.4,9.3,-.2);
  winAt(38.4,2.02,0);const pp=PR.pendant();pp.position.set(39,WALL_H,6);scene.add(pp);
  const wf=PR.frame(.5,.38,photoTex('garden'));wf.position.set(36,1.6,2.02);scene.add(wf);
  /* ---- OUR ROOM ---- */
  P_(PR.bunk(),2.95,24,0);
  P_(PR.table(1.0,.5,.7,MATS.pine),13,18.4);P_(PR.chair(MATS.pine),13,19.2,Math.PI+.4);
  const wk=PR.walkie(0x2a3a2a,'J');wk.position.set(13.25,.7,18.55);wk.rotation.y=-.3;scene.add(wk);decor.walkie=wk;
  addInteract({x:13.25,y:.78,z:18.6,r:2.1,label:()=>'My walkie-talkie',act:()=>takeWalkie(),walkie:true});
  [[4.6,18.02,0,'space'],[10.5,18.02,0,'football'],[7,29.98,Math.PI,'dino']].forEach(([x,z,r,k])=>{const p=new T.Mesh(new T.PlaneGeometry(.5,.7),std(posterTex(k),{bump:0}));p.position.set(x,1.55,z+(r?-.005:.005));p.rotation.y=r;scene.add(p);});
  P_(PR.box('OWEN',.5,.36,.4),12.1,29.4,0);decor.owenBox=scene.children[scene.children.length-1];
  const rg=new T.Mesh(new T.PlaneGeometry(3,2),std(fabric('#2a4a7a','check','#c8b040'),{rough:1}));rg.rotation.x=-Math.PI/2;rg.position.set(8.5,.006,25);rg.receiveShadow=true;scene.add(rg);
  winAt(2.02,20.6,Math.PI/2,MATS.curtainB);const bp=PR.pendant();bp.position.set(8.5,WALL_H,24);scene.add(bp);
  /* ---- KITCHEN ---- */
  P_(PR.baseUnit(6),49.69,22.2,-Math.PI/2);P_(PR.baseUnit(3.6),46.6,18.31,0);
  P_(PR.wallUnit(2),49.84,19.9,-Math.PI/2,{col:false,block:false});P_(PR.wallUnit(1.6),49.84,24.9,-Math.PI/2,{col:false,block:false});P_(PR.wallUnit(3.6),46.6,18.16,0,{col:false,block:false});
  const sk=PR.sink();sk.position.set(49.69,0,22.2);sk.rotation.y=-Math.PI/2;scene.add(sk);
  const ck=PR.cooker();P_(ck,49.69,27.6,-Math.PI/2);decor.cooker=ck;
  P_(PR.fridge(),49.69,29.35,-Math.PI/2);
  const kt=PR.kettle();kt.position.set(49.55,.92,27.45);scene.add(kt);decor.kettle=kt;
  const spl=new T.Mesh(new T.PlaneGeometry(10,.55),MATS.tilesKitchen);spl.position.set(49.995,1.18,24);spl.rotation.y=-Math.PI/2;scene.add(spl);
  const spl2=new T.Mesh(new T.PlaneGeometry(3.6,.55),MATS.tilesKitchen);spl2.position.set(46.6,1.18,18.005);scene.add(spl2);
  P_(PR.table(1.4,.85,.74,MATS.pine),41,23.5);[[40.5,22.75,0],[41.5,22.75,0],[40.5,24.25,Math.PI],[41.6,24.4,Math.PI-.5]].forEach(([x,z,r])=>P_(PR.chair(MATS.pine),x,z,r));
  const pm=PR.phoneMachine();pm.position.set(46.2,.895,18.5);scene.add(pm);decor.machine=pm;
  addInteract({x:46.3,y:.97,z:18.55,r:2.1,label:()=>G.phoneRinging?'Answer the phone':G.machineDone?'The answering machine':'Play the messages',act:()=>phoneOrMachine()});
  const kc=PR.wallClock();kc.position.set(34.03,1.95,22.5);kc.rotation.y=Math.PI/2;scene.add(kc);decor.kclock=kc;
  addInteract({x:49.4,y:.8,z:24.7,r:1.9,label:()=>G.hasMatches?'The drawer':'Open the drawer',act:()=>drawerLine()});
  addInteract({x:49.5,y:1.0,z:27.5,r:2,label:()=>hobLabel(),act:()=>hobAct()});
  const fb=grp();rb(fb,.42,.5,.12,plain(0x8a8a80,.5),0,0,0,.01);for(let i=0;i<6;i++)rb(fb,.03,.05,.02,MATS.blackPlastic,-.15+i*.06,.05,.07,.004);rb(fb,.08,.1,.03,plain(0xa02020,.5),0,-.12,.07,.006);fb.position.set(34.08,1.7,28.6);fb.rotation.y=Math.PI/2;scene.add(fb);
  addInteract({x:34.15,y:1.7,z:28.6,r:2,label:()=>'The fuse box',act:()=>fuseLine()});
  P_(PR.boxStack(['KITCHEN','KITCHEN']),36.6,29.2,.2);P_(PR.boxStack(['KITCHEN']),44,29.3,-.1);
  winAt(49.98,22.2,-Math.PI/2,plain(0xc8b890,.95));const kp=PR.pendant();kp.position.set(41,WALL_H,24);scene.add(kp);
  /* ---- DINING ---- */
  P_(PR.table(2.2,1.0,.74,MATS.teak),42,36.2);[[41.2,35.3,0],[42.8,35.3,0],[41.2,37.1,Math.PI],[42.8,37.1,Math.PI],[40.6,36.2,Math.PI/2],[43.4,36.2,-Math.PI/2]].forEach(([x,z,r])=>P_(PR.chair(MATS.teak,MATS.armchair),x,z,r));
  P_(PR.chinaCabinet(),47,39.6,Math.PI);
  P_(PR.boxStack(['KEEP','KITCHEN','BOOKS']),35.2,38.7,.25);P_(PR.boxStack(['CHARITY','TIP']),48.5,33.2,-.3);P_(PR.boxStack(['KEEP']),36.8,32.9,.1);
  winAt(38.4,39.98,Math.PI);winAt(44.4,39.98,Math.PI);const dp=PR.pendant();dp.position.set(42,WALL_H,36.2);scene.add(dp);
  /* ---- FRONT ROOM ---- */
  const fire=PR.fireplace();P_(fire,2.15,36,Math.PI/2);decor.fire=fire;
  addInteract({x:2.7,y:.4,z:36,r:2.1,label:()=>fireLabel(),act:()=>fireAct()});
  P_(PR.logBasket(),2.6,34.3);
  const ph=new T.Mesh(new T.PlaneGeometry(.13,.155),std(new T.CanvasTexture(polaroidCanvas()),{bump:0,rough:.6}));ph.material.map.encoding=T.sRGBEncoding;ph.position.set(2.32,1.26,36.7);ph.rotation.set(0,Math.PI/2,0);ph.rotation.x=-.12;scene.add(ph);
  rb(scene,.04,.18,.14,MATS.teak,2.27,1.26,36.7,.004,{rz:.12});
  addInteract({x:2.5,y:1.25,z:36.7,r:2.1,label:()=>'A photo on the mantelpiece',act:()=>showDoc('photo')});
  const sofa=PR.sofa();P_(sofa,7.2,36,-Math.PI/2);decor.sofa=sofa;
  addInteract({x:6.9,y:.6,z:36,r:2.2,label:()=>sofaLabel(),act:()=>sofaAct()});
  P_(PR.armchair(true),5,33.2,Math.PI*.8);P_(PR.pianoSheeted(),11.5,32.33,0);P_(PR.tvUnit(),12.5,39.7,Math.PI);
  P_(PR.boxStack(['BOOKS','BOOKS']),14.4,33.1,0);
  winAt(5,39.98,Math.PI);const lp=PR.pendant();lp.position.set(8,WALL_H,36);scene.add(lp);
  /* ---- THE DEN ---- */
  scene.add(buildDenThings());
  /* ---- HIDING PLACES ---- */
  HF.HIDES.forEach((h,i)=>{if(h.type==='ward'){const o=PR.wardrobe(1.2);P_(o,h.x,h.z,h.r);hides.push(Object.assign({o,i},h));addInteract({x:h.x+h.fx*.35,y:1.2,z:h.z+h.fz*.35,r:2.0,hide:hides[hides.length-1],label:()=>'Get in',act:()=>enterHide(hides.find(q=>q.i===i))});}
    else{hides.push(Object.assign({i,o:null},h));addInteract({x:h.ex-(h.lx*.6),y:.4,z:h.ez-(h.lz*.6),r:1.8,hide:hides[hides.length-1],label:()=>'Crawl underneath',act:()=>enterHide(hides.find(q=>q.i===i))});}});
}
function buildOutside(){
  // upper storey, roof and gable seen from the garden
  const up=new T.Mesh(new T.PlaneGeometry(52,3),MATS.render);up.position.set(26,4.2,42.01);scene.add(up);
  MATS.render.map.repeat.set(1,1);
  const sideL=new T.Mesh(new T.PlaneGeometry(42,5.7),MATS.walls.brick);sideL.position.set(-.01,2.85,21);sideL.rotation.y=-Math.PI/2;scene.add(sideL);
  const sideR=sideL.clone();sideR.position.x=52.01;sideR.rotation.y=Math.PI/2;scene.add(sideR);
  const roof=new T.Mesh(new T.PlaneGeometry(53,22),MATS.roof);roof.position.set(26,7.3,36.8);roof.rotation.x=-Math.PI/2+.5;scene.add(roof);
  rb(scene,52.6,.14,.16,plain(0x1a1a1a,.5),26,5.68,42.12,.02);
  const upGlass=new T.MeshStandardMaterial({color:0x05070b,roughness:.04,metalness:.6,transparent:true,opacity:.55});
  decor.upWins=[];[6,15,25.5,36,45].forEach(x=>{const w=grp();rb(w,1.2,1.3,.08,MATS.whiteGloss,0,0,0,.01);const g=new T.Mesh(new T.PlaneGeometry(1.08,1.18),upGlass);g.position.z=.045;w.add(g);rb(w,.05,1.18,.03,MATS.whiteGloss,0,0,.05,.004);rb(w,1.36,.05,.16,MATS.whiteGloss,0,-.66,.07,.006);w.position.set(x,4.15,42.03);scene.add(w);decor.upWins.push(w);});
  // downstairs windows from outside
  [5,38.4,44.4].forEach(x=>{const w=grp();rb(w,1.24,1.32,.08,MATS.whiteGloss,0,0,0,.01);const g=new T.Mesh(new T.PlaneGeometry(1.1,1.2),new T.MeshStandardMaterial({color:0x07080b,roughness:.04,metalness:.6}));g.position.z=.045;w.add(g);rb(w,1.4,.06,.2,MATS.whiteGloss,0,-.68,.09,.006);w.position.set(x,1.5,42.03);scene.add(w);});
  const porch=grp();rb(porch,2.4,.12,.9,MATS.whiteGloss,0,2.4,.45,.02);lathe(porch,[[0,0],[.1,0],[.12,.08],[.1,.16],[0,.18]],std(null,{color:0x222,emissive:0xffd8a0,ei:0}),0,2.2,.4,12);porch.position.set(25,0,42);scene.add(porch);
  const path=new T.Mesh(new T.PlaneGeometry(1.4,15),std(snowTex(),{color:0x8a919e,rough:.8}));path.rotation.x=-Math.PI/2;path.rotation.z=.6;path.position.set(20,.01,48);scene.add(path);
  const car=PR.car();place(car,HF.CAR.x,HF.CAR.z,Math.PI+HF.CAR.r,{block:false});decor.car=car;
  addInteract({x:HF.CAR.x+1,y:1,z:HF.CAR.z-.5,r:2.4,label:()=>carLabel(),act:()=>carAct()});
  place(PR.skip(),HF.SKIP.x,HF.SKIP.z,.08,{block:false});
  const fn=PR.fence(44);fn.position.set(8,0,61.6);scene.add(fn);
  const lamp=PR.streetLamp();lamp.position.set(5.6,0,61.3);lamp.rotation.y=-.2;scene.add(lamp);
  for(let i=0;i<22;i++){const t=PR.tree(rand(5,9));const side=i%3;t.position.set(side===0?rand(-6,-1):side===1?rand(53,58):rand(-4,56),0,side===2?rand(63,70):rand(44,70));t.rotation.y=rand(0,6);scene.add(t);}
  for(let i=0;i<6;i++){const t=PR.tree(rand(4,6));t.position.set(rand(30,50),0,rand(57,60.5));scene.add(t);addCol(t.position.x-.3,t.position.z-.3,t.position.x+.3,t.position.z+.3,'tree');}
}
// snow: falls everywhere outside, drifts past the windows
const SNOW=(()=>{const n=2600,g=new T.BufferGeometry(),p=new Float32Array(n*3),v=new Float32Array(n);for(let i=0;i<n;i++){p[i*3]=rand(-2,54);p[i*3+1]=rand(0,9);p[i*3+2]=rand(41,70);v[i]=rand(.5,1.2);}g.setAttribute('position',new T.BufferAttribute(p,3));
  const m=new T.PointsMaterial({color:0xdfe6f0,size:.035,transparent:true,opacity:.85,depthWrite:false});const pts=new T.Points(g,m);pts.frustumCulled=false;scene.add(pts);return {pts,v};})();
function updateSnow(dt,t){const a=SNOW.pts.geometry.attributes.position.array;const wind=Math.sin(t*.13)*.6+.4;for(let i=0;i<SNOW.v.length;i++){a[i*3+1]-=SNOW.v[i]*dt;a[i*3]+=(wind+Math.sin(t+i))*dt*.4;if(a[i*3+1]<0){a[i*3+1]=9;a[i*3]=rand(-2,54);}}SNOW.pts.geometry.attributes.position.needsUpdate=true;}
