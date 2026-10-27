
/* ================= SOUNDS ================= */
// a speaking voice without words: glottal buzz through moving vowel formants, phrased into syllables
function babble(dest,t,dur,{f0=180,g=.3,phone=true}={}){
  const o=ac.createOscillator();o.type='sawtooth';const n=src(S.pink),ng=ac.createGain();ng.gain.value=.25;n.connect(ng);
  const mix=ac.createGain();o.connect(mix);ng.connect(mix);const out=ac.createGain();out.gain.value=0;
  const V=[[730,1090,2440],[270,2290,3010],[530,1840,2480],[570,840,2410],[440,1020,2240],[300,870,2240],[660,1720,2410]];
  const F=[0,1,2].map(i=>{const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=[6,9,12][i];mix.connect(f);const fg=ac.createGain();fg.gain.value=[1,.55,.25][i];f.connect(fg);fg.connect(out);return f;});
  let tt=t,phrase=0;while(tt<t+dur){const v=V[Math.random()*V.length|0];F.forEach((f,i)=>f.frequency.setTargetAtTime(v[i]*rand(.92,1.08)*(f0>150?1.15:1),tt,.025));
    const syl=rand(.09,.2);phrase+=syl;const gap=phrase>rand(1.2,2.4);out.gain.setTargetAtTime(gap?0:g*rand(.5,1),tt,.02);o.frequency.setTargetAtTime(f0*rand(.85,1.2)*(1-Math.min(.25,phrase*.05)),tt,.04);
    if(gap){phrase=0;tt+=rand(.25,.5);}else tt+=syl;}
  out.gain.setTargetAtTime(0,t+dur,.05);
  let last=out;if(phone){const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=320;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;const ws=shaper(2);out.connect(hp);hp.connect(lp);lp.connect(ws);last=ws;}
  last.connect(dest);o.start(t);n.start(t);o.stop(t+dur+.3);n.stop(t+dur+.3);}
const snd={
  step(run,surface,crouch){if(!ac)return;const t=ac.currentTime,d=ac.createGain();d.gain.value=crouch?.45:1;route(d,.08);
    if(surface==='snow'){nz(d,t,.22,{type:'bandpass',f:rand(900,1500),q:.6,g:run?.32:.2,a:.03});nz(d,t+.05,.16,{buf:S.brown,f:400,g:.25});}
    else if(surface==='lino'){nz(d,t,.08,{type:'bandpass',f:rand(1800,2600),q:1.4,g:run?.18:.1});tone(d,t,.06,{f:120,fEnd:70,g:.08});}
    else if(surface==='carpet'){nz(d,t,.12,{buf:S.pink,f:350,fEnd:150,g:run?.22:.12});}
    else{nz(d,t,run?.13:.11,{buf:S.pink,f:rand(500,800),fEnd:200,g:run?.34:.2});tone(d,t,.1,{f:run?80:68,fEnd:42,g:run?.28:.16});}},
  creakAt(x,y,z,g=.45,dur=1){if(!ac)return;const t=ac.currentTime,dst=spatial(x,y,z,{ref:2});const o=ac.createOscillator();o.type='sawtooth';const base=rand(14,45);o.frequency.setValueAtTime(base,t);o.frequency.linearRampToValueAtTime(base*rand(.5,1.8),t+dur);
    const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=rand(5,9);const fc=rand(450,1500);bp.frequency.setValueAtTime(fc,t);bp.frequency.linearRampToValueAtTime(fc*rand(.6,1.5),t+dur);
    const gn=ac.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+dur*.25);gn.gain.linearRampToValueAtTime(g*.5,t+dur*.75);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(bp);bp.connect(gn);gn.connect(dst);o.start(t);o.stop(t+dur+.05);},
  board(x,z,g=.7){snd.creakAt(x,.05,z,g,rand(.35,.6));},
  doorCreak(x,y,z,speed=1){if(!ac)return;snd.creakAt(x,y,z,.5,1.3/speed);},
  thud(x,y,z,g=.6){if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z,{send:.45});nz(d,t,.4,{buf:S.brown,f:500,fEnd:120,g});tone(d,t,.35,{f:70,fEnd:38,g:g*.9});},
  slam(x,y,z){snd.thud(x,y,z,1.2);if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z,{send:.6});nz(d,t+.03,.5,{type:'bandpass',f:900,q:1,g:.25});},
  knock(x,y,z,n=3,g=.7,soft){if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z,{send:.5});for(let i=0;i<n;i++){const tt=t+i*.32;tone(d,tt,.12,{f:soft?160:120,fEnd:soft?110:62,g});nz(d,tt,.05,{buf:S.pink,f:soft?1600:1000,fEnd:300,g:g*.6});}},
  tick(x,y,z,tock){if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z,{ref:.6,roll:1.8,send:.15});nz(d,t,.025,{type:'bandpass',f:tock?1900:2700,q:6,g:.16});},
  heart(g=.5){if(!ac)return;const t=ac.currentTime,d=ear(0,0);tone(d,t,.18,{f:58,fEnd:38,g});tone(d,t+.22,.16,{f:52,fEnd:35,g:g*.7});},
  boom(g=.8){if(!ac)return;const t=ac.currentTime,d=ear(0,.6);tone(d,t,2.2,{f:42,fEnd:24,g});nz(d,t,1.8,{buf:S.brown,f:150,fEnd:50,g:g*.7});},
  sting(level=1){if(!ac)return;const t=ac.currentTime,d=ac.createGain();d.gain.value=level;route(d,.7);const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=240;hp.connect(d);
    [0,1,6,13,18].forEach(s=>{const f=midi(57+s+rand(-.2,.2));const o=tone(hp,t,3,{type:'sawtooth',f,fEnd:f*.95,g:.045,a:.02});const v=ac.createOscillator();v.frequency.value=rand(4,7);const vg=ac.createGain();vg.gain.value=f*.01;v.connect(vg);vg.connect(o.frequency);v.start(t);v.stop(t+3.1);});
    tone(d,t,3,{f:40,fEnd:26,g:.6,a:.01});nz(d,t,1.4,{buf:S.brown,f:180,g:.4,a:.01});},
  scare(){if(!ac)return;const t=ac.currentTime,d=ac.createGain();d.gain.value=1.4;const ws=shaper(14);ws.connect(d);route(d,.4);
    for(let i=0;i<5;i++){const f=rand(220,520);const o=tone(ws,t,1.7,{type:'sawtooth',f,fEnd:f*rand(2.6,4),g:.17,a:.01,hold:.7});const v=ac.createOscillator();v.frequency.value=rand(18,32);const vg=ac.createGain();vg.gain.value=f*.09;v.connect(vg);vg.connect(o.frequency);v.start(t);v.stop(t+1.8);}
    nz(d,t,1.4,{type:'bandpass',f:1700,fEnd:800,q:.6,g:.7,a:.005});tone(d,t,1.6,{f:58,fEnd:24,g:.9,a:.005});snd.voiceIt(null,.9,1.5);},
  // its voice: a throat that has not spoken for a long time
  voiceIt(pos,g=.5,dur=2.2){if(!ac)return;const t=ac.currentTime,d=pos?spatial(pos[0],pos[1],pos[2],{ref:2.2,send:.5}):ear(rand(-.3,.3));
    const o=ac.createOscillator();o.type='sawtooth';const f0=rand(48,70);o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*rand(.6,.85),t+dur);
    const jit=ac.createOscillator();jit.frequency.value=rand(9,15);const jg=ac.createGain();jg.gain.value=f0*.3;jit.connect(jg);jg.connect(o.frequency);
    const n=src(S.pink),ng=ac.createGain();ng.gain.value=.55;n.connect(ng);const mix=ac.createGain();o.connect(mix);ng.connect(mix);
    const out=ac.createGain();out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(g,t+.25);out.gain.setValueAtTime(g,t+dur*.6);out.gain.exponentialRampToValueAtTime(.0001,t+dur);
    [[300,700,8],[900,1300,10],[2400,2800,12]].forEach(([a,b,q],i)=>{const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(a,t);f.frequency.linearRampToValueAtTime(b,t+dur*.5);f.frequency.linearRampToValueAtTime(a*.8,t+dur);const fg=ac.createGain();fg.gain.value=[1,.6,.25][i];mix.connect(f);f.connect(fg);fg.connect(out);});
    const ws=shaper(4);out.connect(ws);ws.connect(d);[o,jit,n].forEach(s=>{s.start(t);s.stop(t+dur+.1);});},
  click(pos,g=.4,dur=1.4){if(!ac)return;const t=ac.currentTime,d=spatial(pos[0],pos[1],pos[2],{ref:1.8,send:.4});
    const o=ac.createOscillator();o.type='square';o.frequency.setValueAtTime(rand(8,12),t);o.frequency.linearRampToValueAtTime(rand(16,26),t+dur);
    const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=rand(350,520);bp.Q.value=4;const bp2=ac.createBiquadFilter();bp2.type='bandpass';bp2.frequency.value=1400;bp2.Q.value=6;
    const gn=ac.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+.15);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(bp);o.connect(bp2);bp.connect(gn);bp2.connect(gn);gn.connect(d);o.start(t);o.stop(t+dur+.05);},
  itStep(x,y,z,run){if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z,{ref:2.4,roll:1.1,send:.45});nz(d,t,.16,{buf:S.pink,f:900,fEnd:300,g:run?.6:.4,a:.003});tone(d,t,.14,{f:60,fEnd:32,g:run?.6:.4});if(Math.random()<.5)nz(d,t+rand(.02,.08),.03,{type:'highpass',f:3500,g:.22});if(Math.random()<.35)snd.creakAt(x,y,z,.3,rand(.3,.6));},
  overhead(x,z,g=.6){if(!ac)return;const t=ac.currentTime,d=spatial(x,3.6,z,{ref:3,send:.6});nz(d,t,.25,{buf:S.brown,f:220,g});tone(d,t,.22,{f:46,fEnd:30,g:g*.9});if(Math.random()<.4)snd.creakAt(x,3,z,g*.6,rand(.5,1.1));},
  stair(i,g=.7){if(!ac)return;const y=HF.STAIRS.height*(1-i/12),z=HF.STAIRS.top+(i/12)*(HF.STAIRS.bottom-HF.STAIRS.top);snd.creakAt(HF.STAIRS.x,y,z,g*.8,rand(.4,.8));snd.itStep(HF.STAIRS.x,y,z,false);},
  whisper(pan,dur=1.8,g=.3){if(!ac)return;const t=ac.currentTime,d=ear(pan,.3);const s=src(S.white);const out=ac.createGain();out.gain.value=0;
    const fs=[ac.createBiquadFilter(),ac.createBiquadFilter(),ac.createBiquadFilter()];fs.forEach((f,i)=>{f.type='bandpass';f.Q.value=[9,12,6][i];s.connect(f);f.connect(out);});
    const V=[[700,1200,2600],[300,2300,3000],[600,1000,2400],[400,800,2600]];let tt=t;while(tt<t+dur){const v=V[Math.random()*V.length|0];fs.forEach((f,i)=>f.frequency.setTargetAtTime(v[i]*rand(.9,1.1),tt,.02));out.gain.setTargetAtTime(Math.random()<.2?0:g*rand(.4,1),tt,.02);tt+=rand(.08,.18);}
    out.gain.setTargetAtTime(0,t+dur,.05);out.connect(d);s.start(t);s.stop(t+dur+.4);},
  ring(x,y,z){if(!ac)return 0;const t=ac.currentTime,d=spatial(x,y,z,{ref:1.6,send:.4});for(const off of[0,.6]){[400,450].forEach(f=>tone(d,t+off,.4,{f,g:.12,a:.01,hold:.35,type:'triangle'}));}return 3;},
  pickup(){if(!ac)return;const t=ac.currentTime,d=ear(.1,.1);nz(d,t,.08,{type:'bandpass',f:1200,q:2,g:.3});tone(d,t+.05,.06,{f:300,g:.1});},
  beep(){if(!ac)return;const t=ac.currentTime,d=spatial(46.2,1,18.5,{ref:1});tone(d,t,.5,{f:1000,g:.12,hold:.35,a:.005});},
  tape(dur){if(!ac)return;const t=ac.currentTime,d=spatial(46.2,1,18.5,{ref:1,send:.2});nz(d,t,dur,{type:'bandpass',f:4000,q:.4,g:.03,a:.2});nz(d,t,dur,{buf:S.brown,f:120,g:.04,a:.2});},
  message(dur,f0,start=0){if(!ac)return;const d=spatial(46.2,1,18.5,{ref:1.2,send:.25});babble(d,ac.currentTime+start,dur,{f0,g:.28});},
  phoneVoice(dur,f0){if(!ac)return;babble(ear(.55,.05),ac.currentTime,dur,{f0,g:.22});},
  match(){if(!ac)return;const t=ac.currentTime,d=ear(.2,.1);nz(d,t,.25,{type:'bandpass',f:2500,fEnd:900,q:.8,g:.35,a:.002});nz(d,t+.1,1,{buf:S.pink,f:500,g:.08,a:.1});},
  ignite(x,y,z){if(!ac)return;const t=ac.currentTime,d=spatial(x,y,z);for(let i=0;i<4;i++)nz(d,t+i*.12,.02,{type:'highpass',f:3000,g:.3});nz(d,t+.45,.9,{buf:S.pink,type:'lowpass',f:900,g:.25,a:.04});},
  plaster(i){if(!ac)return;const t=ac.currentTime,d=spatial(24,1.2,21,{ref:2,send:.65});nz(d,t,.35,{buf:S.brown,f:700,fEnd:150,g:1.1,a:.002});tone(d,t,.25,{f:90,fEnd:45,g:.9});
    for(let k=0;k<6+i*3;k++)nz(d,t+.05+Math.random()*.6,.05,{type:'bandpass',f:rand(1500,4000),q:3,g:rand(.05,.2)});if(i>3)nz(d,t+.1,1.2,{buf:S.pink,f:1600,fEnd:400,g:.25,a:.05});},
  swing(){if(!ac)return;const t=ac.currentTime,d=ear(0,.05);nz(d,t,.18,{type:'bandpass',f:800,fEnd:2400,q:1.5,g:.12,a:.08});},
  carDoor(){if(!ac)return;const t=ac.currentTime,d=spatial(HF.CAR.x+1,1,HF.CAR.z,{send:.2});nz(d,t,.2,{buf:S.brown,f:500,g:.6});tone(d,t,.15,{f:90,fEnd:50,g:.5});nz(d,t+.02,.05,{type:'highpass',f:2500,g:.15});},
  starter(){if(!ac)return;const t=ac.currentTime,d=spatial(HF.CAR.x,.8,HF.CAR.z-1.5,{send:.2});for(let i=0;i<3;i++){const o=tone(d,t+i*.9,.7,{type:'sawtooth',f:38,fEnd:30,g:.25,a:.05});}},
  gasp(){if(!ac)return;const t=ac.currentTime,d=ear(0,.1);nz(d,t,.55,{type:'bandpass',f:1300,fEnd:2200,q:1.5,g:.28,a:.04});},
  exhale(){if(!ac)return;const t=ac.currentTime,d=ear(0,.05);nz(d,t,.9,{type:'bandpass',f:900,fEnd:600,q:1,g:.1,a:.15});},
  wardrobe(open){if(!ac)return;const t=ac.currentTime,d=ear(0,.15);snd.creakAt(P.x,1.2,P.z,.28,.5);if(!open){tone(d,t+.35,.12,{f:110,fEnd:60,g:.22});nz(d,t+.35,.08,{buf:S.pink,f:1200,g:.18});}},
  rip(){if(!ac)return;const t=ac.currentTime,d=ear(0,.3);snd.creakAt(P.x,1,P.z,.8,.3);nz(d,t,.3,{buf:S.brown,f:600,g:1});tone(d,t,.3,{f:90,fEnd:40,g:.9});},
  gritter(){if(!ac)return 0;const t=ac.currentTime,dur=14;const p=ac.createPanner();p.panningModel='HRTF';p.refDistance=6;p.rolloffFactor=1;route(p,.2);
    if(p.positionX){p.positionX.setValueAtTime(-30,t);p.positionX.linearRampToValueAtTime(80,t+dur);p.positionZ.value=66;p.positionY.value=1.5;}
    const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=34;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;const g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+3);g.gain.setValueAtTime(.5,t+dur-3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(g);g.connect(p);o.start(t);o.stop(t+dur);
    const n=src(S.white),bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3000;const ng=ac.createGain();ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.1,t+3);ng.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(bp);bp.connect(ng);ng.connect(p);n.start(t);n.stop(t+dur);return dur;}
};
/* ---------- continuous layers and the score ---------- */
function ambience(){if(S.ambOn)return;S.ambOn=true;
  // wind around the house: two bands of noise with slow gusts
  S.windG=ac.createGain();S.windG.gain.value=.12;[[380,.9],[900,1.4]].forEach(([f,q],i)=>{const n=src(S.pink),bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=ac.createGain();g.gain.value=.6;const lfo=ac.createOscillator();lfo.frequency.value=.07+i*.05;const lg=ac.createGain();lg.gain.value=.45;lfo.connect(lg);lg.connect(g.gain);const fl=ac.createOscillator();fl.frequency.value=.11+i*.03;const flg=ac.createGain();flg.gain.value=f*.35;fl.connect(flg);flg.connect(bp.frequency);n.connect(bp);bp.connect(g);g.connect(S.windG);n.start();lfo.start();fl.start();});
  S.windLP=ac.createBiquadFilter();S.windLP.type='lowpass';S.windLP.frequency.value=900;S.windG.connect(S.windLP);route(S.windLP,.1);
  // the house's own low hum: cold, almost nothing
  S.droneG=ac.createGain();S.droneG.gain.value=.05;const dl=ac.createBiquadFilter();dl.type='lowpass';dl.frequency.value=160;dl.Q.value=2;
  [[49,'sawtooth',.2],[49.3,'sawtooth',.2],[32.7,'sine',.6]].forEach(([f,ty,gg])=>{const o=ac.createOscillator();o.type=ty;o.frequency.value=f;const g=ac.createGain();g.gain.value=gg;o.connect(g);g.connect(dl);o.start();});
  const lfo=ac.createOscillator();lfo.frequency.value=.04;const lg=ac.createGain();lg.gain.value=60;lfo.connect(lg);lg.connect(dl.frequency);lfo.start();dl.connect(S.droneG);route(S.droneG,.3);
  // dread: a slow bowed cluster that swells with the director's tension
  S.tensG=ac.createGain();S.tensG.gain.value=0;const tb=ac.createBiquadFilter();tb.type='bandpass';tb.frequency.value=900;tb.Q.value=.6;
  [196,207.65,293.66,311.13,415.3].forEach((f,i)=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=rand(-10,10);const v=ac.createOscillator();v.frequency.value=rand(4.5,6);const vg=ac.createGain();vg.gain.value=f*.006;v.connect(vg);vg.connect(o.frequency);v.start();const g=ac.createGain();g.gain.value=.045;const sw=ac.createOscillator();sw.frequency.value=rand(.03,.08);const swg=ac.createGain();swg.gain.value=.03;sw.connect(swg);swg.connect(g.gain);sw.start();o.connect(g);g.connect(tb);o.start();});
  tb.connect(S.tensG);route(S.tensG,.6);
  // the hunt: a low pulse that only plays when it is downstairs and close
  S.huntG=ac.createGain();S.huntG.gain.value=0;const co=ac.createOscillator();co.type='sawtooth';co.frequency.value=36.7;const cl=ac.createBiquadFilter();cl.type='lowpass';cl.frequency.value=240;const gate=ac.createGain();gate.gain.value=0;const sq=ac.createOscillator();sq.type='square';sq.frequency.value=1.4;const sqg=ac.createGain();sqg.gain.value=.5;sq.connect(sqg);sqg.connect(gate.gain);co.connect(cl);cl.connect(gate);gate.connect(S.huntG);co.start();sq.start();route(S.huntG,.3);
  S.chaseG=ac.createGain();S.chaseG.gain.value=0;const c2=ac.createOscillator();c2.type='sawtooth';c2.frequency.value=55;const cl2=ac.createBiquadFilter();cl2.type='lowpass';cl2.frequency.value=380;const gate2=ac.createGain();gate2.gain.value=0;const sq2=ac.createOscillator();sq2.type='square';sq2.frequency.value=4.2;const sqg2=ac.createGain();sqg2.gain.value=.5;sq2.connect(sqg2);sqg2.connect(gate2.gain);c2.connect(cl2);cl2.connect(gate2);gate2.connect(S.chaseG);c2.start();sq2.start();
  const hi=ac.createOscillator();hi.type='sawtooth';hi.frequency.value=1174;const hl=ac.createOscillator();hl.frequency.value=.3;const hlg=ac.createGain();hlg.gain.value=50;hl.connect(hlg);hlg.connect(hi.frequency);hl.start();const hig=ac.createGain();hig.gain.value=.012;hi.connect(hig);hig.connect(S.chaseG);hi.start();route(S.chaseG,.3);
  // its breath and throat, carried on a panner that follows it
  S.iPan=ac.createPanner();S.iPan.panningModel='HRTF';S.iPan.distanceModel='inverse';S.iPan.refDistance=1.6;S.iPan.rolloffFactor=1.4;route(S.iPan,.45);
  S.iOcc=ac.createBiquadFilter();S.iOcc.type='lowpass';S.iOcc.frequency.value=8000;S.iOcc.connect(S.iPan);
  const b=src(S.white),bb=ac.createBiquadFilter();bb.type='bandpass';bb.frequency.value=600;bb.Q.value=1.8;const bb2=ac.createBiquadFilter();bb2.type='peaking';bb2.frequency.value=180;bb2.gain.value=12;S.iBreath=ac.createGain();S.iBreath.gain.value=0;b.connect(bb);bb.connect(bb2);bb2.connect(S.iBreath);S.iBreath.connect(S.iOcc);b.start();
  // your breath, your heart
  const pb=src(S.white),pbf=ac.createBiquadFilter();pbf.type='bandpass';pbf.frequency.value=1100;pbf.Q.value=1.1;S.pBreath=ac.createGain();S.pBreath.gain.value=0;pb.connect(pbf);pbf.connect(S.pBreath);route(S.pBreath,.04);pb.start();
  // walkie static
  const ws=src(S.white),wbp=ac.createBiquadFilter();wbp.type='bandpass';wbp.frequency.value=2200;wbp.Q.value=.7;S.walkieG=ac.createGain();S.walkieG.gain.value=0;ws.connect(wbp);wbp.connect(S.walkieG);route(S.walkieG,0,ear(-.35,0));ws.start();
  // fire
  const fi=src(S.brown),fif=ac.createBiquadFilter();fif.type='lowpass';fif.frequency.value=600;S.fireG=ac.createGain();S.fireG.gain.value=0;fi.connect(fif);fif.connect(S.fireG);S.firePan=ac.createPanner();S.firePan.panningModel='HRTF';S.firePan.refDistance=1.2;S.firePan.rolloffFactor=1.6;setPos(S.firePan,2.7,.5,36);S.fireG.connect(S.firePan);route(S.firePan,.2);fi.start();
  // gas ring and kettle
  const gh=src(S.pink),ghf=ac.createBiquadFilter();ghf.type='bandpass';ghf.frequency.value=700;ghf.Q.value=.6;S.hobG=ac.createGain();S.hobG.gain.value=0;gh.connect(ghf);ghf.connect(S.hobG);const hp_=ac.createPanner();hp_.panningModel='HRTF';hp_.refDistance=1;hp_.rolloffFactor=1.6;setPos(hp_,49.5,1,27.5);S.hobG.connect(hp_);route(hp_,.2);gh.start();
  const kw=ac.createOscillator();kw.type='sine';kw.frequency.value=2100;const kvib=ac.createOscillator();kvib.frequency.value=7;const kvg=ac.createGain();kvg.gain.value=40;kvib.connect(kvg);kvg.connect(kw.frequency);kvib.start();S.kettleG=ac.createGain();S.kettleG.gain.value=0;kw.connect(S.kettleG);S.kettleG.connect(hp_);kw.start();
}
function listener(){if(!ac)return;const l=ac.listener,f=new T.Vector3(0,0,-1).applyQuaternion(camera.quaternion),p=camera.position;
  if(l.positionX){l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=f.x;l.forwardY.value=f.y;l.forwardZ.value=f.z;l.upX.value=0;l.upY.value=1;l.upZ.value=0;}else{l.setPosition(p.x,p.y,p.z);l.setOrientation(f.x,f.y,f.z,0,1,0);}}
