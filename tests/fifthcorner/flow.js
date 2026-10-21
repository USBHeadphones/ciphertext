const FC=require('./harness.js');
let fails=0; const ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m); if(!c) fails++;};
const at=(id)=>{const G=FC.get();FC.placeAt(id,0);FC.setCur(id);FC.update(0.016,0);};
FC.enterWorld('atrium');FC.hideLog();FC.setPhase('play');
let G=FC.get();
// walk the ring: visit every ring room, then stand on the plinth
for(const id of G.AT.ring) at(id);
at(G.AT.plinth);
ok(G.AT.loopDone,'Atrium: loop around the pillar registers on the plinth');
const N=G.AT.north; G.cells[N.cell].unl[N.j]=true; G.cells[G.cells[N.cell].nbr[N.j]].unl[G.cells[N.cell].be[N.j]]=true;
at(G.AT.seam);
ok(FC.get().world==='archive','Atrium: stepping into the Seam opens the Archive');
FC.hideLog(); G=FC.get();
for(const v of G.AR.vaults){ at(v.cell); FC.hideLog(); }
ok(G.AR.vaults.every(v=>v.got),'Archive: standing in each vault collects its shard');
at(0); FC.engage(0);
ok(FC.get().phase==='super','Archive: E on the entrance ring starts the supertask');
for(let i=0;i<Math.ceil(FC.ST_T/0.05)+2;i++) FC.update(0.05,i*50);
ok(FC.get().phase==='rim','Supertask: the clock reaches T and you hit the rim');
for(let i=0;i<40;i++) FC.update(0.05,(i+200)*50);
ok(FC.get().world==='hollow','Rim: you come out in the Hollow');
FC.hideLog(); G=FC.get();
at(G.HO.core);
ok(FC.get().phase==='end','Hollow: reaching the core ends the game');
process.exitCode=fails?1:0; console.log(fails?fails+' FAILED':'all passed');
