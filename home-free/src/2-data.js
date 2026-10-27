<script>
/* Pure data and grid logic, no rendering. Read by the engine and by tests/home-free. */
window.__HF=(function(){
'use strict';
const CELL=2, WALL_H=2.7;
// # wall  . floor  D door  S plastered-over cupboard  E front door  h the cupboard  o outside (garden, drive)
const MAP=[
"##########################",
"#......#.....#...........#",
"#......#.....#...........#",
"#......#.....#...........#",
"#......#.....#...........#",
"###D#####D#######D########",
"#........................#",
"#........................#",
"####D#####..#########D####",
"#.......#...#hhh#........#",
"#.......#...Shhh#........#",
"#.......#...#####........#",
"#.......D.......D........#",
"#.......#.......#........#",
"#.......#.......#........#",
"#########.......####D#####",
"#.......#.......#........#",
"#.......D.......D........#",
"#.......#.......#........#",
"#.......#.......#........#",
"############E#############",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo",
"oooooooooooooooooooooooooo"];
const W=MAP[0].length, H=MAP.length;
const ROOMS={
  study:{x:[1,6],z:[1,4],wall:'study',floor:'carpetBrown',name:'Dad’s study'},
  bath:{x:[8,12],z:[1,4],wall:'bath',floor:'lino',name:'the bathroom'},
  bedroom:{x:[14,24],z:[1,4],wall:'parents',floor:'carpetRose',name:'Mum and Dad’s room'},
  hall:{x:[1,24],z:[6,7],wall:'hall',floor:'boards',name:'the landing hall'},
  boys:{x:[1,7],z:[9,14],wall:'boys',floor:'carpetBlue',name:'our room'},
  kitchen:{x:[17,24],z:[9,14],wall:'kitchen',floor:'lino',name:'the kitchen'},
  front:{x:[9,15],z:[12,19],wall:'hall',floor:'boards',name:'the front hall'},
  nook:{x:[9,11],z:[9,11],wall:'hall',floor:'boards',name:'the front hall'},
  living:{x:[1,7],z:[16,19],wall:'living',floor:'carpetBrown',name:'the front room'},
  dining:{x:[17,24],z:[16,19],wall:'dining',floor:'boards',name:'the dining room'},
  den:{x:[13,15],z:[9,10],wall:'den',floor:'bare',name:'the den'},
  outside:{x:[0,25],z:[21,30],wall:'brick',floor:'snow',name:'outside'}
};
const ch=(x,z)=>(x<0||z<0||x>=W||z>=H)?'#':MAP[z][x];
function roomOf(x,z){for(const k in ROOMS){const r=ROOMS[k];if(x>=r.x[0]&&x<=r.x[1]&&z>=r.z[0]&&z<=r.z[1])return k;}return null;}
const cellOf=v=>Math.floor(v/CELL);
const START={x:17.2,z:54.6,yaw:0.25};
const CAR={x:14.5,z:56,r:0.08};
const SKIP={x:40,z:53};
const STAIRS={x:29.1,top:24.4,bottom:30.4,landX:29,landZ:31.2,height:2.7}; // It's way up and down
const WALL={cx:12,cz:10,x:23.15,z:21,strikes:6};
const STORY={
  marks:{x:8.42,y:1.15,z:17,r:2,label:'Pencil marks on the doorframe'},
  calendar:{x:5.9,y:1.55,z:2.06,r:2.3,label:'Dad’s calendar'},
  poster:{x:7.75,y:1.55,z:2.06,r:2.3,label:'The poster'},
  machine:{x:46.3,y:.97,z:18.55,r:2.1,label:'The answering machine'},
  photo:{x:2.5,y:1.31,z:36.7,r:2.1,label:'A photo on the mantelpiece'},
  walkie:{x:13.25,y:.8,z:18.6,r:2.1,label:'My walkie-talkie'},
  toolbox:{x:10.6,y:.28,z:2.75,r:2.2,label:'Dad’s toolbox'}
};
// hiding places. wardrobes: front = (sin r, cos r). beds: you lie under, looking out along (lx,lz)
const HIDES=[
  {type:'ward',x:15.6,z:21,r:-Math.PI/2},{type:'ward',x:13.6,z:7,r:-Math.PI/2},{type:'ward',x:49.6,z:7.5,r:-Math.PI/2},
  {type:'ward',x:15.6,z:38.5,r:-Math.PI/2},{type:'ward',x:34.4,z:20,r:Math.PI/2},{type:'ward',x:47,z:39.6,r:Math.PI},
  {type:'bed',x:43.5,z:3.0,lx:0,lz:1,ex:43.5,ez:5.05},
  {type:'bed',x:2.95,z:25,lx:1,lz:0,ex:4.3,ez:25}
];
HIDES.forEach(h=>{if(h.type==='ward'){h.fx=Math.round(Math.sin(h.r));h.fz=Math.round(Math.cos(h.r));h.ex=h.x+h.fx*1.05;h.ez=h.z+h.fz*1.05;}else{h.fx=h.lx;h.fz=h.lz;}});
// floorboards that give you away
const CREAKS=[[6,6],[13,7],[18,6],[22,7],[10,14],[12,17],[14,16],[19,17],[19,11],[4,18],[3,11],[20,2]];
function bfs(sx,sz,gx,gz,pass){
  if(sx===gx&&sz===gz)return [[gx,gz]];
  const prev=new Int32Array(W*H).fill(-1),q=[sz*W+sx];prev[sz*W+sx]=sz*W+sx;
  for(let qi=0;qi<q.length;qi++){const c=q[qi],cx=c%W,cz=(c/W)|0;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const n=nz*W+nx;if(prev[n]!==-1||!pass(nx,nz))continue;
      prev[n]=c;if(nx===gx&&nz===gz){const path=[];let k=n;while(k!==sz*W+sx){path.push([k%W,(k/W)|0]);k=prev[k];}return path.reverse();}q.push(n);}}
  return null;
}
function distField(sx,sz,pass){const d=new Int16Array(W*H).fill(-1);if(sx<0||sz<0||sx>=W||sz>=H)return d;const q=[sz*W+sx];d[q[0]]=0;
  for(let qi=0;qi<q.length;qi++){const c=q[qi],cx=c%W,cz=(c/W)|0;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const n=nz*W+nx;if(d[n]!==-1||!pass(nx,nz))continue;d[n]=d[c]+1;q.push(n);}}return d;}
function los(ax,az,bx,bz,blocked){const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(len/.2));for(let i=1;i<n;i++){const t=i/n;if(blocked(ax+dx*t,az+dz*t))return false;}return true;}
const walk=(x,z,open,front)=>{const c=ch(x,z);return c==='.'||c==='D'||c==='o'||(c==='E'&&front)||((c==='S'||c==='h')&&open);};
return {CELL,WALL_H,MAP,W,H,ROOMS,ch,roomOf,cellOf,START,CAR,SKIP,STAIRS,WALL,STORY,HIDES,CREAKS,bfs,distField,los,walk};
})();
</script>
