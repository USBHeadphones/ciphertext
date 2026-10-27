
/* ================= STATE ================= */
const G={phase:'title',t:0,act:'evening',found:0,time0:0,
  inside:false,doorOpened:false,fuse:false,called:false,phoneRinging:false,machineDone:false,hasMatches:false,fireLit:false,
  keep:new Set(),carried:false,tea:0,teaDone:false,slept:false,keysGone:false,
  hasWalkie:false,knocked:false,hasHammer:false,strikes:0,wallBroken:false,ending:null,
  intentT:0,hold:0,fear:0,hit:0,heartT:0,clockT:0,glimpsed:false,winGlimpse:false,anomT:0,closedDoors:new Set(),usedHides:{},lockLost:false};
const P={x:HF.START.x,z:HF.START.z,yaw:HF.START.yaw,pitch:-.05,vx:0,vz:0,crouch:0,stam:100,exhaust:false,bob:0,lastStep:0,hidden:null,light:true,fx:0,fy:0,fz:-1,shake:0,
  breath:100,holding:false,noiseT:0,lastNoise:0,sit:0,cell:-1};
const keys={};
const D={state:'off',pressure:0,menace:0,relaxUntil:0,huntBudget:0,huntN:0,count:0,countT:0,countMax:10,menaceHighT:0,unlock:{ward:false,bed:false,listen:false,fast:false},heard:null,fastDescend:false};
const IT_S={where:'up',x:29,z:20,y:0,yaw:0,ux:30,uz:20,utx:30,utz:20,ustepT:0,path:[],pi:0,state:'idle',t:0,plan:[],planI:0,pause:0,mode:'walk',lostT:0,lastX:0,lastZ:0,compromised:null,checkHide:null,stepAcc:0,vis:false,stair:0,clickT:4,chaseT:0,heardT:-99,hx:0,hz:0};
const noises=[];
function noise(x,z,r){noises.push({x,z,r,t:G.t});if(noises.length>30)noises.shift();P.lastNoise=G.t;}
const losBlocked=(x,z)=>{const cx=cellOf(x),cz=cellOf(z),c=ch(cx,cz);if(c==='#')return true;
  if(c==='S'||c==='D'||c==='E'){const d=doorAtCell(cx,cz);if(c==='S'&&!G.wallBroken)return true;if(d&&c!=='S'&&!doorOpenFor(d))return true;const ax=doorAxis(cx,cz);const off=ax==='z'?Math.abs(x-(cx*CELL+1)):Math.abs(z-(cz*CELL+1));return off>.6;}
  if(c==='h'&&!G.wallBroken)return true;return false;};
const passM=(cx,cz)=>{const c=ch(cx,cz);return (c==='.'||c==='D')&&!mBlock[cz*W+cx];};
const passP=(cx,cz)=>HF.walk(cx,cz,G.wallBroken,decor.front&&decor.front.ang>.6);
const PASSABLE=[];for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(ch(x,z)==='.'&&roomOf(x,z)!=='den')PASSABLE.push([x,z]);

/* ================= UI ================= */
function sub(text,kind='me',dur=4){const el=document.createElement('div');el.className='sub '+kind;el.textContent=text;$('subs').appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));setTimeout(()=>{el.classList.remove('on');setTimeout(()=>el.remove(),700);},dur*1000);while($('subs').children.length>3)$('subs').firstChild.remove();}
// a sequence of lines spoken over time; returns total duration
function lines(seq,start=0){let t=start;seq.forEach(([who,text,dur,fn])=>{setTimeout(()=>{if(text)sub(text,who,dur);if(fn)fn();},t*1000);t+=dur+.25;});return t;}
function toast(t,d=2600){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),d);}
function intent(t){G.intentText=t;const e=$('intent');e.textContent=t||'';if(t){e.classList.add('on');G.intentT=9;}else e.classList.remove('on');}
function refreshIntent(){let t='';
  if(G.act==='evening'){
    if(!G.doorOpened)t='Get inside. The key\u2019s on my ring.';
    else if(!G.called)t=G.fuse?'':'The fuse box is in the kitchen.';
    else if(!G.fireLit)t=G.hasMatches?'Light the fire in the front room.':'Matches. The drawer by the cooker.';
    else if(G.keep.size<3)t='Albums. Dad\u2019s watch. Mum\u2019s ring box.';
    else if(!G.carried)t='Take Mum and Dad\u2019s things out to the car.';
    else t=G.teaDone?'Sit by the fire for a bit.':'Make a tea. Sit by the fire.';}
  else{if(!G.keysTried)t='Car keys. The bowl in the hall.';else if(!G.knockHeard)t='';else if(!G.knocked)t='The knocking. By the stairs.';else if(!G.hasHammer)t='Dad\u2019s toolbox. The study.';else if(!G.wallBroken)t='The wall by the stairs.';}
  if(t!==G.intentText)intent(t);}
function show(id,on){$(id).classList.toggle('on',on);}
let lastLine=0;function think(t,d=3.5){if(performance.now()-lastLine<600)return;lastLine=performance.now();sub(t,'me',d);}
