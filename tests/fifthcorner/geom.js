const FC=require('./harness.js');
const DEG=180/Math.PI;
let fails=0; const ok=(c,msg)=>{console.log((c?'  ok   ':'  FAIL ')+msg); if(!c) fails++;};
const dk=(K,x,y)=>K*x[0]*y[0]+x[1]*y[1]+x[2]*y[2];
/* Walk a closed polygon the way a player does: turn to face the next corner, walk
   straight there. Only turning moves the gyro, so the change in its world direction
   after closing the loop is the holonomy. */
function walkLoop(pts){
  const G=FC.get(), P=G.P;
  P.p=pts[0].slice(); const t0=FC.tan(pts[0],pts[1]); P.f=t0.slice(0,3);
  // a right-hand vector orthogonal to f at p
  const K=G.K;
  let r;
  if(K===0) r=[0,-P.f[2],P.f[1]]; else { // r = p × f in the appropriate metric, built by Gram–Schmidt from a seed
    const seeds=[[0,0,1],[0,1,0],[1,0,0]];
    for(const s of seeds){let v=s.slice();const a=dk(K,v,P.p)/K;v=v.map((x,i)=>x-a*P.p[i]);const b=dk(K,v,P.f);v=v.map((x,i)=>x-b*P.f[i]);
      const n=Math.sqrt(dk(K,v,v)); if(n>1e-6){r=v.map(x=>x/n);break;}}
  }
  P.r=r; FC.setGyro(0.3);
  const g0=FC.gyroVec();
  for(let i=1;i<=pts.length;i++){
    const tgt=pts[i%pts.length];
    const t=FC.tan(P.p,tgt); const h=FC.headingOf(t.slice(0,3));
    FC.turnPlayer(h); FC.boost(P,t[3],'f'); FC.reframe(P);
  }
  // compare the gyro's world direction with where it started (same point)
  return Math.atan2(dk(K,g0,P.r),dk(K,g0,P.f)) ;
}
function walkLoopRef(pts){
  const G=FC.get();
  const K=G.K; const P=G.P;
  const turned=(()=>{ const a=walkLoop(pts); return a; })();
  // walkLoop returned the old gyro direction's angle from heading; gyro now sits at FC.get().gyro
  return wrapA(FC.get().gyro-turned);
}
const wrapA=a=>{a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;};

for(const w of ['atrium','archive','hollow']){
  FC.enterWorld(w); FC.hideLog();
  const G=FC.get(), cells=G.cells, K=G.K;
  console.log(`\n== ${w}  K=${K}  rooms generated=${cells.length}  inradius ${(G.INR*7).toFixed(2)} m  area ${(G.AREA*DEG).toFixed(2)}°`);
  if(w==='atrium') ok(cells.length===25,'25 rooms');
  if(w==='hollow') ok(cells.length===12,'12 rooms: the dodecahedron closes up');
  let worst=0; for(const M of FC.REFL()){for(let i=0;i<3;i++)for(let j=0;j<3;j++){let s=0;for(let k=0;k<3;k++)s+=M[i*3+k]*M[k*3+j];worst=Math.max(worst,Math.abs(s-(i===j?1:0)));}}
  ok(worst<1e-12,`edge reflections are involutions (err ${worst.toExponential(1)})`);
  let asym=0,spacing=0;
  for(const cl of cells) for(let j=0;j<G.Pp;j++){const n=cl.nbr[j]; if(n<0) continue;
    if(cells[n].nbr[cl.be[j]]!==cl.id||cells[n].be[cl.be[j]]!==j) asym++;
    if(FC.dist(cl.c,cells[0].c)<3) spacing=Math.max(spacing,Math.abs(FC.dist(cl.c,cells[n].c)-2*G.INR));}
  ok(asym===0,`every door links back to the same door`);
  ok(spacing<1e-9,`adjacent rooms are exactly 2·INR apart (err ${spacing.toExponential(1)})`);
  const V=cells[0].V, ang=[];
  for(let j=0;j<G.Pp;j++){const a=FC.tan(V[j],V[(j+G.Pp-1)%G.Pp]).slice(0,3), b=FC.tan(V[j],V[(j+1)%G.Pp]).slice(0,3);
    ang.push(Math.acos(Math.max(-1,Math.min(1,dk(K,a,b))))*DEG);}
  const sum=ang.reduce((x,y)=>x+y), expect={atrium:360,archive:450,hollow:600}[w];
  ok(Math.abs(sum-expect)<1e-6,`corners ${ang[0].toFixed(4)}° each, sum ${sum.toFixed(6)}° (expect ${expect})`);
  // holonomy: walk the room's own boundary
  const h=walkLoopRef(V);
  ok(Math.abs(Math.abs(h)-G.AREA)<1e-6,`walking once around a room turns the gyro ${(h*DEG).toFixed(4)}° (room area ${(G.AREA*DEG).toFixed(4)}°)`);
  const h2=walkLoopRef(V.slice().reverse());
  ok(Math.abs(h+h2)<1e-6,`the opposite direction turns it ${(h2*DEG).toFixed(4)}°`);
}
// the sign flips between the Archive and the Hollow for the same walking direction
FC.enterWorld('archive');FC.hideLog();let A=FC.get();const ha=walkLoopRef(A.cells[0].V);
FC.enterWorld('hollow');FC.hideLog();let Ho=FC.get();const hh=walkLoopRef(Ho.cells[0].V);
ok(Math.sign(ha)===-Math.sign(hh),`same walking direction: Archive ${(ha*DEG).toFixed(2)}°, Hollow ${(hh*DEG).toFixed(2)}°: opposite signs`);
process.exitCode=fails?1:0;
console.log(fails?`\n${fails} FAILED`:'\nall passed');
