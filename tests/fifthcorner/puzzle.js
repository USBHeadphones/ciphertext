const FC=require('./harness.js');
const DEG=180/Math.PI;
let fails=0; const ok=(c,msg)=>{console.log((c?'  ok   ':'  FAIL ')+msg); if(!c) fails++;};
const dk=(K,x,y)=>K*x[0]*y[0]+x[1]*y[1]+x[2]*y[2];
const wrapA=a=>{a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;};
function frameAt(p,toward){const G=FC.get(),K=G.K,P=G.P;P.p=p.slice();P.f=FC.tan(p,toward).slice(0,3);
  let r; if(K===0) r=[0,-P.f[2],P.f[1]]; else for(const s of [[0,0,1],[0,1,0],[1,0,0]]){let v=s.slice();const a=dk(K,v,P.p)/K;v=v.map((x,i)=>x-a*P.p[i]);const b=dk(K,v,P.f);v=v.map((x,i)=>x-b*P.f[i]);const n=Math.sqrt(dk(K,v,v));if(n>1e-6){r=v.map(x=>x/n);break;}}
  const det=(a,b,c)=>a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  // keep the frame right-handed, like the player's (the identity frame has det +1)
  if(K!==0&&det(P.p,P.f,r)<0) r=r.map(x=>-x);
  P.r=r;}
// walk through waypoints with real turning and boosting; return how far the gyro turned (holonomy) on a closed loop
function loopTurn(pts){
  const G=FC.get(),K=G.K,P=G.P; frameAt(pts[0],pts[1]); FC.setGyro(0);
  const g0=FC.gyroVec();
  for(let i=1;i<=pts.length;i++){const t=FC.tan(P.p,pts[i%pts.length]);FC.turnPlayer(FC.headingOf(t.slice(0,3)));FC.boost(P,t[3],'f');FC.reframe(P);}
  return wrapA(FC.get().gyro-Math.atan2(dk(K,g0,P.r),dk(K,g0,P.f)));
}
const mid=(cl,j)=>{const t=FC.tan(cl.V[j],cl.V[(j+1)%cl.V.length]);return FC.geoPt(cl.V[j],t[3]/2);};

/* ---------- Archive ---------- */
FC.enterWorld('archive');FC.hideLog();
let G=FC.get(); const cells=G.cells;
console.log(`\n== Archive: ${cells.length} rooms`);
const reach=new Set([0]),q=[0];
while(q.length){const i=q.pop();const cl=cells[i];for(let j=0;j<5;j++){const n=cl.nbr[j];if(n<0||reach.has(n))continue;
  if(!cl.wall[j]){reach.add(n);q.push(n);}}}
const stranded=cells.filter(c=>!reach.has(c.id)&&c.kind!=='vault');
ok(stranded.length===0,`every room is reachable through doors (${stranded.length} stranded of ${cells.length})`);
for(const v of G.AR.vaults){
  const V=cells[v.cell], open=V.wall.map((w,j)=>!w).filter(Boolean).length, locks=V.lock.filter(Boolean).length;
  ok(open===1&&locks===1,`vault at ${(FC.dist(V.c,cells[0].c)*7).toFixed(0)} m: one door, and it is a lock`);
  // find a 4-room loop around a corner of the approach room, all doors open
  const A=cells[v.lockCell]; let best=null;
  for(let j=0;j<5;j++){const jm=(j+4)%5;if(A.wall[j]||A.wall[jm])continue;
    const ring=FC.cornerRooms(A.id,j); if(!ring) continue; const {B,C,D,eB,eC}=ring;
    if(cells[B].wall[eB]||cells[C].wall[eC])continue;
    if([B,C,D].some(x=>cells[x].kind==='vault'))continue;
    best={j,jm,B,C,D,kb:eB,kc:eC};break;}
  ok(!!best,'  a walkable 4-room loop sits next to the lock');
  if(best){
    const pts=[A.c,mid(A,best.j),cells[best.B].c,mid(cells[best.B],best.kb),cells[best.D].c,mid(cells[best.C],best.kc),cells[best.C].c,mid(A,best.jm)];
    const h=loopTurn(pts), h2=loopTurn([...pts].reverse());
    console.log(`        loop around that corner turns the gyro ${(h*DEG).toFixed(1)}° one way, ${(h2*DEG).toFixed(1)}° the other`);
    // loop around the whole approach room through its ring of rooms is bigger; corner loops can be chained
    ok(Math.abs(h)>14/DEG*1.2&&Math.abs(h)<120/DEG,'  one corner loop moves the needle by more than the lock tolerance');
  }
}

/* ---------- Atrium ---------- */
FC.enterWorld('atrium');FC.hideLog();G=FC.get();
console.log('\n== Atrium');
{
  const N=G.AT.north, cl=G.cells[N.cell];
  // stand 1 m from the north door facing it, with the gyro as it was at the start (pointing north)
  const m=mid(cl,N.j); frameAt(cl.c,m); const t=FC.tan(cl.c,m); FC.get().P.p=FC.geoPt(cl.c,t[3]-1/7);
  FC.setCur(N.cell); FC.setGyro(0); FC.checkLocks(0);
  ok(cl.unl[N.j],'north lock opens with the gyro still pointing north');
  const Ea=G.AT.east, ce=G.cells[Ea.cell]; const me=mid(ce,Ea.j);
  frameAt(ce.c,me); const te=FC.tan(ce.c,me); FC.get().P.p=FC.geoPt(ce.c,te[3]-1/7); FC.setCur(Ea.cell);
  // gyro still points north: facing east means the gyro sits 90° to the left
  FC.setGyro(-Math.PI/2); FC.checkLocks(0);
  ok(!ce.unl[Ea.j],'east lock stays shut with the gyro pointing north');
  // and no loop in flat space can change that
  const ring=[[2,1],[3,1],[3,3],[1,3]].map(([i,j])=>G.cells.find(c=>c.g[0]===i&&c.g[1]===j).c);
  ok(Math.abs(loopTurn(ring))<1e-12,'a loop around the pillar turns the gyro 0°');
}

/* ---------- Hollow ---------- */
FC.enterWorld('hollow');FC.hideLog();G=FC.get();
console.log('\n== Hollow');
{
  const core=G.cells[G.HO.core];
  ok(Math.abs(dk(1,core.c,G.cells[0].c)+1)<1e-9,'the core is exactly antipodal to the arrival room');
  ok(core.lock.every(Boolean),'all five core doors are gyro locks');
  // loops around a corner where three rooms meet
  const A=G.cells[0]; const B=A.nbr[0], C=A.nbr[4];
  const h=loopTurn([A.c,mid(A,0),G.cells[B].c,G.cells[C].c,mid(A,4)].filter(Boolean));
  console.log(`        a loop through three rooms around a corner turns the gyro ${(h*DEG).toFixed(1)}°`);
}

/* ---------- Supertask ---------- */
FC.enterWorld('archive');FC.hideLog();G=FC.get();
console.log('\n== Supertask');
{
  const ghost=FC.buildGhost(), L=2*(G.INR+G.CIRC), a=FC.thE(0);
  // translate the tiling by L along the flight line: every room centre must land on a room centre
  const ax=[0,Math.cos(a),Math.sin(a)];
  const T=x=>{ // boost by L along ax, at the origin frame
    const c=Math.cosh(L),s=Math.sinh(L);
    // translation along unit tangent ax at origin: x' = x + (c-1)(x·e0... use matrix form
    const e0=[1,0,0];
    const M=(v)=>{ // Lorentz boost in the plane spanned by e0 and ax
      const ve0=-(-v[0]), vax=v[1]*ax[1]+v[2]*ax[2]; // components: time-like coordinate and along-axis
      const perp=[0,v[1]-vax*ax[1],v[2]-vax*ax[2]];
      const t2=v[0]*c+vax*s, a2=v[0]*s+vax*c;
      return [t2,perp[1]+a2*ax[1],perp[2]+a2*ax[2]];};
    return M(x);};
  let worst=0,n=0;
  for(const g of ghost){ if(FC.dist(g.c,[1,0,0])>2.2) continue; const y=T(g.c); let bd=1e9;
    for(const h of ghost){const d=FC.dist(h.c,y); if(d<bd)bd=d;} worst=Math.max(worst,bd); n++; }
  ok(worst<1e-5,`translating by 2(INR+CIRC) = ${(L*7).toFixed(2)} m along the flight line maps all ${n} nearby rooms onto rooms (err ${worst.toExponential(1)})`);
  // the clock: s(t) = −DD·log2(1 − t/T) inverts t(s) = T(1 − 2^(−s/DD))
  const DD=30,T0=FC.ST_T; let e=0;
  for(const s of [1,30,300,900]){const t=T0*(1-Math.pow(2,-s/DD)); e=Math.max(e,Math.abs(-DD*Math.log2(1-t/T0)-s)/s);}
  ok(e<1e-9,`clock and distance invert exactly (T = ${T0.toFixed(4)} s)`);
}
process.exitCode=fails?1:0; console.log(fails?`\n${fails} FAILED`:'\nall passed');
