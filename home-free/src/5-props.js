
/* ================= PROPS (origin on the floor, front faces +z) ================= */
const PR={
  chair(mat=MATS.pine,seat){const g=grp();rb(g,.42,.035,.42,mat,0,.45,0,.008);if(seat)rb(g,.38,.04,.38,seat,0,.485,.01,.015);
    for(const sx of[-1,1])for(const sz of[-1,1])lathe(g,turned(.43,.018),mat,sx*.18,0,sz*.18,10);
    for(const sx of[-1,1])lathe(g,[[0,0],[.016,0],[.014,.5],[.018,.52],[0,.53]],mat,sx*.18,.45,-.18,8);
    rb(g,.42,.08,.03,mat,0,.92,-.185,.01);for(let i=-1;i<=1;i++)lathe(g,[[0,0],[.008,0],[.012,.2],[.008,.38],[0,.38]],mat,i*.09,.5,-.185,6);return g;},
  table(w,d,h=.74,mat=MATS.pine){const g=grp();rb(g,w,.035,d,mat,0,h-.0175,0,.01);rb(g,w-.1,.08,d-.1,mat,0,h-.08,0,.006);
    for(const sx of[-1,1])for(const sz of[-1,1])lathe(g,turned(h-.04,.03),mat,sx*(w/2-.08),0,sz*(d/2-.08),12);return g;},
  wardrobe(w=1.2){const g=grp(),m=MATS.teak;rb(g,w,1.95,.6,m,0,1.03,0,.01);rb(g,w+.06,.07,.66,m,0,2.03,0,.015);rb(g,w-.02,.06,.58,m,0,.03,0,.01);
    const doors=[];for(const s of[-1,1]){const piv=grp();piv.position.set(s*(w/2-.005),0,.305);g.add(piv);const dw=w/2-.02;
      rb(piv,dw,1.84,.025,m,-s*dw/2,1.03,0,.006);rb(piv,dw-.12,.7,.012,m,-s*dw/2,1.45,.016,.004);rb(piv,dw-.12,.7,.012,m,-s*dw/2,.6,.016,.004);
      lathe(piv,[[0,0],[.012,0],[.012,.02],[.008,.025],[.008,.06],[.012,.065],[0,.07]],MATS.brass,-s*(dw-.05),1.0,.03,8,{rx:Math.PI/2});piv.side=s;doors.push(piv);}
    g.doors=doors;return g;},
  bed(w=1.4,l=2.0){const g=grp(),m=MATS.teak;rb(g,w,.16,l,m,0,.36,l/2,.015);for(const sx of[-1,1])for(const sz of[0,1])rb(g,.06,.32,.06,m,sx*(w/2-.03),.16,sz*(l-.06)+.03,.008);
    rb(g,w+.04,.95,.07,m,0,.65,.035,.02);rb(g,w-.2,.6,.03,MATS.sofa,0,.72,.075,.03);
    rb(g,w-.06,.18,l-.08,MATS.cream,0,.53,l/2+.02,.05);
    const duv=clothDrape(w+.35,l*.78,[[-w/2+.03,w/2-.03,.06-l*.62,l*.36,.62]],{n:24,steps:150});const d=clothMesh(duv,MATS.duvetP);d.position.set(0,0,l*.62);g.add(d);
    for(const sx of[-1,1])rb(g,w/2-.1,.12,.38,MATS.cream,sx*w/4,.68,.32,.06,{rx:-.25});return g;},
  bunk(){const g=grp(),m=MATS.pine,w=.95,l=2.0;for(const sx of[-1,1])for(const sz of[0,1])rb(g,.07,1.85,.07,m,sx*(w/2),.925,sz*l,.01);
    for(const y of[.4,1.42]){for(const sx of[-1,1])rb(g,.04,.14,l,m,sx*(w/2),y,l/2,.008);for(const sz of[0,1])rb(g,w,.14,.04,m,0,y,sz*l,.008);rb(g,w-.06,.14,l-.06,MATS.cream,0,y+.11,l/2,.04);}
    for(const sz of[0,1])rb(g,w,.05,.04,m,0,1.82,sz*l,.008);rb(g,.04,.05,l,m,w/2,1.82,l/2,.008);
    for(let i=0;i<4;i++)lathe(g,[[0,0],[.014,0],[.014,.5],[0,.5]],m,w/2+.04,.55+i*.26,.4+(i%2)*.0,6,{rz:Math.PI/2});
    const d1=clothMesh(clothDrape(w+.25,1.45,[[-w/2+.03,w/2-.03,-.7,.7,.62]],{n:20,steps:140}),MATS.duvetB);d1.position.set(0,0,1.25);g.add(d1);
    const d2=clothMesh(clothDrape(w+.25,1.45,[[-w/2+.03,w/2-.03,-.7,.7,.62]],{n:20,steps:140}),MATS.duvetB2);d2.position.set(0,1.02,1.2);g.add(d2);
    rb(g,w-.25,.1,.3,MATS.cream,0,1.6,.25,.05);return g;},
  nightstand(){const g=grp();rb(g,.46,.56,.4,MATS.teak,0,.28,0,.01);rb(g,.4,.17,.02,MATS.teak,0,.42,.2,.005);lathe(g,[[0,0],[.014,0],[.014,.01],[0,.02]],MATS.brass,0,.42,.21,8,{rx:Math.PI/2});
    lathe(g,[[0,0],[.07,0],[.07,.02],[.03,.04],[.03,.22],[.05,.26],[0,.26]],MATS.porcelain,-.1,.56,-.05,14);lathe(g,[[.09,0],[.14,0],[.08,.18],[.06,.18]],MATS.cream,-.1,.8,-.05,18,{cast:false});return g;},
  dresser(){const g=grp();rb(g,1.3,.85,.48,MATS.teak,0,.425,0,.012);for(let i=0;i<3;i++){rb(g,1.2,.22,.02,MATS.teak,0,.16+i*.26,.24,.006);for(const sx of[-1,1])rb(g,.12,.02,.02,MATS.brass,sx*.3,.17+i*.26,.26,.005);}
    rb(g,.9,.8,.03,MATS.teak,0,1.3,-.2,.015);const mi=new T.Mesh(new T.PlaneGeometry(.8,.7),MATS.glass);mi.position.set(0,1.3,-.183);g.add(mi);return g;},
  desk(){const g=grp(),m=MATS.oak;rb(g,1.5,.04,.72,m,0,.74,0,.008);rb(g,.45,.7,.68,m,-.5,.36,0,.008);for(let i=0;i<3;i++){rb(g,.41,.2,.02,m,-.5,.15+i*.23,.345,.005);rb(g,.1,.02,.02,MATS.brass,-.5,.2+i*.23,.36,.005);}for(const sz of[-1,1])rb(g,.04,.7,.04,m,.7,.36,sz*.32,.008);
    lathe(g,[[0,0],[.07,0],[.07,.015],[.012,.03],[.012,.3],[0,.3]],MATS.brass,.5,.76,-.2,12);lathe(g,[[.04,0],[.11,-.04],[.12,-.1],[.1,-.1]],plain(0x1e3a26,.4),.5,1.08,-.14,16,{rx:.5});
    for(let i=0;i<5;i++)rb(g,.21,.004,.297,plain(0xd8d0b8,.9),.1+rand(-.1,.1),.763+i*.004,.05,.001,{ry:rand(-.3,.3),cast:false});
    rb(g,.4,.14,.32,MATS.beigePlastic,-.1,.83,-.15,.02);for(let i=0;i<4;i++)rb(g,.06,.01,.02,MATS.blackPlastic,-.22+i*.08,.9,0,.003);return g;},
  officeChair(){const g=grp();for(let i=0;i<5;i++){const a=i/5*TAU;rb(g,.3,.03,.04,MATS.blackPlastic,Math.sin(a)*.15,.06,Math.cos(a)*.15,.01,{ry:a+Math.PI/2});}lathe(g,[[0,0],[.025,0],[.025,.42],[0,.42]],MATS.chrome,0,.06,0,10);
    rb(g,.48,.08,.46,MATS.armchair,0,.5,0,.03);rb(g,.44,.5,.07,MATS.armchair,0,.85,-.21,.03,{rx:-.12});return g;},
  bookshelf(w=.9,h=1.9){const g=grp(),m=MATS.teak;rb(g,w,h,.03,m,0,h/2,-.15,.004);for(const s of[-1,1])rb(g,.025,h,.32,m,s*(w/2-.012),h/2,0,.004);
    const cols=[0x6a1a12,0x1f3a2a,0x2a2a4a,0x7a5a2a,0x3a3a3a,0x8a7a5a,0x2a1610,0x5a6a8a];let shelfN=5;
    for(let k=0;k<=shelfN;k++){const y=.03+k*(h-.06)/shelfN;rb(g,w-.04,.022,.3,m,0,y,0,.003);if(k===shelfN)break;const empty=R()<.35;let x=-w/2+.04;
      while(x<w/2-.08){if(empty&&x>-w/2+.2)break;const bw=.025+R()*.04,bh=.18+R()*.1;const lean=R()<.07;rb(g,bw,bh,.2+R()*.04,plain(cols[R()*cols.length|0],.7),x+bw/2,y+bh/2+.012,.01,.003,{rz:lean?.3:0,cast:false});x+=bw+.003;}}
    return g;},
  filing(){const g=grp();rb(g,.46,1.3,.6,plain(0x6a706a,.45,{metal:.4}),0,.65,0,.01);for(let i=0;i<4;i++){rb(g,.42,.28,.02,plain(0x7a807a,.4,{metal:.4}),0,.18+i*.31,.3,.005);rb(g,.12,.02,.03,MATS.chrome,0,.25+i*.31,.32,.005);}return g;},
  toolbox(){const g=grp(),red=plain(0x8a1a12,.45,{metal:.5});rb(g,.5,.2,.24,red,0,.1,0,.01);const lid=grp();lid.position.set(0,.2,-.12);g.add(lid);rb(lid,.5,.05,.24,red,0,.02,.12,.01);rb(lid,.2,.02,.02,MATS.steel,0,.08,.12,.006);for(const s of[-1,1])rb(lid,.02,.05,.02,MATS.steel,s*.1,.05,.12,.004);
    g.lid=lid;const ham=PR.hammer();ham.position.set(0,.17,.0);ham.rotation.set(Math.PI/2,0,1.5);g.add(ham);g.hammer=ham;
    for(let i=0;i<3;i++)rb(g,.12,.02,.03,MATS.steel,rand(-.15,.15),.18,rand(-.06,.06),.005,{ry:rand(0,3)});return g;},
  hammer(){const g=grp();lathe(g,[[0,0],[.016,0],[.018,.05],[.015,.2],[.013,.3],[.012,.31],[0,.31]],MATS.oak,0,0,0,10);rb(g,.13,.035,.035,MATS.steel,.0,.32,0,.006);rb(g,.05,.03,.03,MATS.steel,-.075,.325,0,.004,{rz:.3});return g;},
  sofa(){const g=grp(),m=MATS.sofa,w=2.0;rb(g,w,.3,.85,m,0,.2,0,.05);for(let i=0;i<3;i++)rb(g,w/3-.03,.15,.66,m,(i-1)*w/3,.42,.08,.06);for(let i=0;i<3;i++)rb(g,w/3-.04,.5,.2,m,(i-1)*w/3,.7,-.3,.08,{rx:-.12});
    for(const s of[-1,1])rb(g,.18,.62,.85,m,s*(w/2-.09),.33,0,.07);rb(g,w,.06,.85,MATS.teak,0,.03,0,.01);return g;},
  armchair(sheet){const g=grp(),m=MATS.armchair;rb(g,.82,.3,.8,m,0,.2,0,.05);rb(g,.6,.14,.62,m,0,.42,.07,.06);rb(g,.62,.55,.2,m,0,.7,-.3,.08,{rx:-.1});for(const s of[-1,1])rb(g,.15,.6,.8,m,s*.34,.32,0,.06);
    if(sheet){const c=clothMesh(clothDrape(1.9,1.9,[[-.41,.41,-.4,.4,.62],[-.41,.41,-.4,-.2,.98]],{n:26,steps:180}),MATS.sheet);g.add(c);}return g;},
  pianoSheeted(){const g=grp();rb(g,1.45,1.2,.58,MATS.teak,0,.6,0,.02);rb(g,1.35,.08,.32,MATS.teak,0,.72,.42,.01);const c=clothMesh(clothDrape(2.3,1.8,[[-.73,.73,-.29,.29,1.2],[-.68,.68,.29,.58,.76]],{n:26,steps:190}),MATS.sheet);g.add(c);return g;},
  tvUnit(){const g=grp();rb(g,1.0,.5,.45,MATS.teak,0,.25,0,.01);rb(g,.42,.08,.32,MATS.blackPlastic,-.2,.54,.02,.008);const led=rb(g,.05,.012,.005,MATS.led,-.1,.55,.18,.002,{cast:false});
    rb(g,.66,.5,.5,plain(0x1e1c1a,.45),.1,.83,-.02,.06);const scr=new T.Mesh(new T.SphereGeometry(.9,24,16,-.28,.56,1.27,.6),MATS.glass);scr.position.set(.07,.84,-.66);scr.scale.set(1,.7,1);g.add(scr);
    rb(g,.04,.04,.02,MATS.chrome,.36,.66,.23,.008);return g;},
  fireplace(){const g=grp();rb(g,1.5,1.12,.3,MATS.tilesBrown,0,.56,0,.01);rb(g,1.7,.06,.38,MATS.teak,0,1.14,.03,.01);rb(g,1.6,.08,.55,MATS.tilesBrown,0,.04,.2,.01);
    const hole=rb(g,.62,.62,.32,plain(0x070605,1),0,.4,.02,.02,{cast:false});
    for(let i=0;i<6;i++)rb(g,.55,.012,.012,MATS.steel,0,.14,.1+i*.0,.004,{ry:0,cast:false});for(let i=0;i<7;i++)rb(g,.012,.12,.012,MATS.steel,-.24+i*.08,.18,.14,.003,{cast:false});
    const logs=[];for(let i=0;i<3;i++){const l=lathe(g,[[0,0],[.045,0],[.05,.4],[0,.4]],MATS.bark,rand(-.12,.12),.2+i*.04,.08,10,{rz:Math.PI/2});l.rotation.y=rand(-.3,.3);logs.push(l);}
    const emb=rb(g,.5,.03,.18,MATS.ember,0,.16,.08,.01,{cast:false});
    const fl=[];for(let i=0;i<3;i++){const p=new T.Mesh(new T.PlaneGeometry(.42,.55),MATS.flame);p.position.set(0,.45,.08);p.rotation.y=i*Math.PI/3;p.visible=false;g.add(p);fl.push(p);}
    g.flames=fl;g.ember=emb;return g;},
  logBasket(){const g=grp();lathe(g,[[0,0],[.22,0],[.24,.32],[.23,.33],[0,.33]],plain(0x5a4028,.95),0,0,0,18);for(let i=0;i<6;i++){const l=lathe(g,[[0,0],[.04,0],[.045,.36],[0,.36]],MATS.bark,rand(-.15,.15),.32+(i%2)*.06,rand(-.1,.1),8,{rz:Math.PI/2});l.rotation.y=rand(-.6,.6);}return g;},
  baseUnit(len){const g=grp();rb(g,len,.82,.58,MATS.cream,0,.45,0,.008);rb(g,len,.1,.5,plain(0x2a2620,.9),0,.05,-.02,.004);rb(g,len+.02,.035,.62,MATS.worktop,0,.875,.02,.006);
    for(let x=-len/2+.25;x<len/2-.1;x+=.5){rb(g,.48,.62,.02,MATS.whiteGloss,x,.48,.295,.008);rb(g,.12,.016,.02,MATS.chrome,x,.74,.31,.006);}
    g.splash=true;return g;},
  wallUnit(len){const g=grp();rb(g,len,.7,.32,MATS.cream,0,1.85,-.12,.008);for(let x=-len/2+.25;x<len/2-.1;x+=.5){rb(g,.48,.66,.02,MATS.whiteGloss,x,1.85,.045,.008);rb(g,.016,.12,.02,MATS.chrome,x+.18,1.62,.06,.006);}return g;},
  sink(){const g=grp();rb(g,.8,.04,.5,MATS.steel,0,.88,0,.01);rb(g,.45,.18,.38,plain(0x4a4e52,.25,{metal:.8}),-.12,.8,0,.03);lathe(g,[[0,0],[.025,0],[.02,.18],[0,.2]],MATS.chrome,-.12,.9,-.2,10);rb(g,.02,.02,.16,MATS.chrome,-.12,1.08,-.13,.006);return g;},
  cooker(){const g=grp();rb(g,.6,.88,.6,plain(0xd8d2c0,.4),0,.44,0,.01);rb(g,.58,.02,.58,plain(0x1a1916,.35),0,.89,0,.004);for(const sx of[-1,1])for(const sz of[-1,1]){lathe(g,[[0,0],[.08,0],[.08,.012],[.04,.02],[0,.02]],plain(0x222,.4,{metal:.6}),sx*.14,.9,sz*.14,14);}
    rb(g,.5,.32,.02,MATS.glass,0,.38,.3,.01);rb(g,.4,.02,.03,MATS.chrome,0,.6,.31,.006);for(let i=0;i<4;i++)lathe(g,[[0,0],[.02,0],[.02,.025],[0,.03]],MATS.blackPlastic,-.2+i*.13,.78,.3,10,{rx:Math.PI/2});
    rb(g,.6,.15,.05,plain(0xd8d2c0,.4),0,.98,-.28,.01);const ring=new T.Mesh(new T.TorusGeometry(.06,.006,6,20),std(null,{color:0x111,emissive:0x4a7cff,ei:0}));ring.rotation.x=Math.PI/2;ring.position.set(.14,.925,.14);g.add(ring);g.ring=ring;return g;},
  fridge(){const g=grp();rb(g,.6,1.45,.62,plain(0xe0dccc,.35),0,.725,0,.04);rb(g,.58,.02,.01,plain(0x999,.5),0,1.0,.31,.004);rb(g,.03,.3,.04,MATS.blackPlastic,-.24,1.2,.33,.01);rb(g,.03,.3,.04,MATS.blackPlastic,-.24,.7,.33,.01);
    for(let i=0;i<5;i++)rb(g,.06,.06,.012,plain([0xc83a2a,0x3a6ac8,0xe0b030][i%3],.5),rand(-.15,.2),rand(.9,1.35),.315,.02,{cast:false});
    const dr=new T.Mesh(new T.PlaneGeometry(.2,.26),std(photoTex('xmas'),{bump:0}));dr.position.set(.05,1.2,.316);g.add(dr);return g;},
  kettle(){const g=grp();lathe(g,[[0,0],[.09,0],[.1,.04],[.095,.14],[.06,.19],[.03,.2],[0,.21]],MATS.chrome,0,0,0,18);const h=new T.Mesh(new T.TorusGeometry(.07,.01,8,14,Math.PI),MATS.blackPlastic);h.position.set(0,.2,0);h.rotation.y=Math.PI/2;g.add(h);
    lathe(g,[[0,0],[.018,0],[.01,.12],[0,.12]],MATS.chrome,.09,.06,0,8,{rz:-1.0});return g;},
  phoneMachine(){const g=grp();rb(g,.2,.05,.16,MATS.blackPlastic,0,.025,0,.01);rb(g,.06,.03,.05,plain(0x222,.3),-.03,.06,0,.006);const led=rb(g,.012,.006,.012,MATS.led,.07,.055,.05,.003,{cast:false});
    rb(g,.18,.06,.2,MATS.beigePlastic,.26,.03,0,.02);rb(g,.2,.045,.06,MATS.beigePlastic,.26,.08,-.02,.02);const cord=new T.Mesh(new T.TorusGeometry(.04,.004,4,40,Math.PI*3),MATS.beigePlastic);cord.position.set(.38,.03,.03);cord.scale.set(1,.4,1);g.add(cord);g.led=led;return g;},
  wallClock(){const g=grp();lathe(g,[[0,0],[.15,0],[.16,.03],[.15,.04],[0,.04]],MATS.teak,0,0,0,24,{rx:Math.PI/2});const face=new T.Mesh(new T.CircleGeometry(.13,24),plain(0xe8e4d8,.6));face.position.z=.042;g.add(face);
    for(let i=0;i<12;i++){const a=i/12*TAU;rb(g,.006,.02,.003,MATS.blackPlastic,Math.sin(a)*.11,Math.cos(a)*.11,.045,.001,{rz:-a,cast:false});}
    const hh=grp();hh.position.z=.046;g.add(hh);rb(hh,.008,.07,.003,MATS.blackPlastic,0,.03,0,.001,{cast:false});const mh=grp();mh.position.z=.048;g.add(mh);rb(mh,.006,.1,.003,MATS.blackPlastic,0,.045,0,.001,{cast:false});const sh=grp();sh.position.z=.05;g.add(sh);rb(sh,.003,.11,.002,plain(0xa02020,.5),0,.04,0,.001,{cast:false});
    g.hands=[hh,mh,sh];return g;},
  chinaCabinet(){const g=PR.wardrobe(1.1);g.doors.forEach(d=>d.children.forEach(c=>{if(c.geometry&&c.geometry.parameters===undefined){}}));for(let i=0;i<3;i++)for(let k=0;k<4;k++)lathe(g,[[0,0],[.1,0],[.11,.01],[0,.012]],MATS.porcelain,-.35+k*.23,.45+i*.5,-.1,16,{rx:-1.3});return g;},
  tub(){const g=grp();rb(g,1.7,.55,.75,MATS.porcelain,0,.275,0,.06);rb(g,1.5,.1,.58,plain(0x8a8a82,.2),0,.52,0,.06,{cast:false});lathe(g,[[0,0],[.02,0],[.02,.1],[0,.12]],MATS.chrome,-.75,.55,0,8);rb(g,.02,.02,.1,MATS.chrome,-.75,.66,.05,.006);
    const cur=new T.Mesh(hangGeo(.9,1.5,4,.05,.05),plain(0x8a9a8a,.9,{side:T.DoubleSide}));cur.position.set(-.35,1.95,.38);cur.castShadow=true;g.add(cur);lathe(g,[[0,0],[.008,0],[.008,1.7],[0,1.7]],MATS.chrome,-.85,1.96,.4,6,{rz:-Math.PI/2});return g;},
  basin(){const g=grp();lathe(g,[[0,0],[.12,0],[.09,.06],[.07,.7],[0,.7]],MATS.porcelain,0,0,0,16);lathe(g,[[0,0],[.25,0],[.27,.12],[.25,.14],[.2,.14],[.18,.06],[0,.06]],MATS.porcelain,0,.72,0,22);for(const s of[-1,1])lathe(g,[[0,0],[.018,0],[.018,.06],[.025,.07],[0,.08]],MATS.chrome,s*.08,.86,-.15,8);return g;},
  toilet(){const g=grp();lathe(g,[[0,0],[.14,0],[.12,.1],[.15,.32],[.2,.4],[0,.4]],MATS.porcelain,0,0,.08,16);rb(g,.38,.04,.44,MATS.porcelain,0,.42,.1,.02);rb(g,.4,.36,.18,MATS.porcelain,0,.62,-.2,.03);rb(g,.06,.02,.02,MATS.chrome,-.14,.76,-.11,.005);return g;},
  radiator(w=.9){const g=grp();for(let x=-w/2;x<=w/2;x+=.05)rb(g,.04,.55,.07,MATS.whiteGloss,x,.4,0,.015);rb(g,w+.06,.04,.05,MATS.whiteGloss,0,.66,0,.015);rb(g,w+.06,.04,.05,MATS.whiteGloss,0,.14,0,.015);lathe(g,[[0,0],[.016,0],[.016,.05],[.022,.06],[0,.08]],MATS.chrome,-w/2-.04,.04,0,8);return g;},
  coatHooks(){const g=grp();rb(g,1.0,.08,.025,MATS.teak,0,1.7,0,.006);const coats=[];for(let i=0;i<4;i++){lathe(g,[[0,0],[.008,0],[.008,.06],[.014,.07],[0,.075]],MATS.brass,-.36+i*.24,1.68,.02,6,{rx:Math.PI/2-.4});
      if(i!==2){const c=new T.Mesh(hangGeo(.36,rand(.7,1.0),3,.04,.35),i===1?MATS.coatR:MATS.coat);c.position.set(-.36+i*.24,1.69,.08);c.castShadow=true;g.add(c);coats.push(c);}}g.coats=coats;return g;},
  shoeRack(){const g=grp();for(const y of[.05,.25])rb(g,.8,.02,.3,MATS.pine,0,y,0,.004);for(const s of[-1,1])rb(g,.02,.3,.3,MATS.pine,s*.4,.15,0,.004);for(let i=0;i<4;i++){const s=PR.shoe(i<2?.3:.24,[0x3a2a1a,0x1a1a1a,0x8a3a2a,0xd8d8d8][i]);s.position.set(-.27+i*.18,i%2?.26:.06,0);g.add(s);}return g;},
  shoe(len=.28,col=0x222222){const g=grp(),m=plain(col,.55);rb(g,len*.36,len*.18,len,m,0,len*.09,0,len*.08);rb(g,len*.34,len*.14,len*.45,m,0,len*.22,-len*.22,len*.07);rb(g,len*.37,len*.04,len*1.02,plain(0xd8d0c0,.8),0,len*.02,0,len*.015);return g;},
  hallTable(){const g=PR.table(.9,.35,.8,MATS.teak);lathe(g,[[0,0],[.08,0],[.09,.03],[.06,.06],[0,.06]],MATS.porcelain,.25,.8,0,16);return g;},
  box(label='',w=.5,h=.4,d=.38,taped=true){const g=grp();rb(g,w,h,d,MATS.box[label]||MATS.box[''],0,h/2,0,.006);if(taped){rb(g,.07,.004,d+.004,MATS.tape,0,h+.001,0,.001,{cast:false});}else{for(const s of[-1,1]){const f=rb(g,w,.004,d/2,MATS.box[''],0,h,s*d/4,.001);f.rotation.x=s*-1.9;f.position.set(0,h+Math.sin(1.9)*d/4*.0,s*(d/2+.05));}}return g;},
  boxStack(labels){const g=grp();let y=0;labels.forEach((l,i)=>{const w=rand(.42,.55),h=rand(.3,.42),d=rand(.34,.42);const b=PR.box(l,w,h,d);b.position.set(rand(-.04,.04),y,rand(-.04,.04));b.rotation.y=rand(-.15,.15);g.add(b);y+=h;});return g;},
  frame(w,h,texm,mat=MATS.teak){const g=grp();rb(g,w+.05,h+.05,.025,mat,0,0,0,.006);const p=new T.Mesh(new T.PlaneGeometry(w,h),std(texm,{rough:.3,bump:0}));p.position.z=.0135;g.add(p);return g;},
  windowUnit(w=1.1,h=1.2,curtainMat){const g=grp();const gl=new T.Mesh(new T.PlaneGeometry(w,h),MATS.window);gl.position.set(0,1.5,0);g.add(gl);const m=MATS.whiteGloss;
    rb(g,w+.12,.06,.1,m,0,.9-.03,.04,.008);rb(g,w+.2,.04,.22,m,0,.86,.1,.008);rb(g,w+.12,.06,.08,m,0,2.1+.03,.03,.008);for(const s of[-1,1])rb(g,.06,h+.12,.08,m,s*(w/2+.03),1.5,.03,.008);rb(g,.05,h,.06,m,0,1.5,.025,.006);rb(g,w,.05,.06,m,0,1.75,.025,.006);
    for(const s of[-1,1]){const c=new T.Mesh(hangGeo(.55,2.15,5,.05,.2),curtainMat||MATS.curtain);c.position.set(s*(w/2+.2),2.35,.16);c.castShadow=true;g.add(c);}
    lathe(g,[[0,0],[.012,0],[.012,w+.9],[0,w+.9]],MATS.brass,-(w+.9)/2,2.36,.17,6,{rz:-Math.PI/2});return g;},
  pendant(){const g=grp();lathe(g,[[0,0],[.004,0],[.004,.45],[0,.45]],plain(0xeeeeee,.5),0,-.45,0,4);lathe(g,[[.03,0],[.18,-.16],[.19,-.17],[.035,-.01]],plain(0xd8c8a8,.8,{side:T.DoubleSide}),0,-.45,0,20,{cast:false});return g;},
  walkie(col=0x2a2a2a,label){const g=grp();rb(g,.065,.16,.035,plain(col,.5),0,.08,0,.01);rb(g,.05,.05,.004,plain(0x111,.6),0,.11,.018,.002);lathe(g,[[0,0],[.005,0],[.004,.16],[0,.16]],MATS.blackPlastic,.022,.16,0,6);
    if(label){const t=new T.Mesh(new T.PlaneGeometry(.04,.012),new T.MeshBasicMaterial({map:tex(64,20,(gg)=>{gg.fillStyle='#e8e0c0';gg.fillRect(0,0,64,20);gg.font='700 16px "Courier Prime", monospace';gg.fillStyle='#111';gg.fillText(label,6,16);},{repeat:false})}));t.position.set(0,.05,.0185);g.add(t);}
    const led=rb(g,.008,.008,.004,MATS.led,-.02,.15,.018,.002,{cast:false});g.led=led;return g;},
  torch(){const g=grp();lathe(g,[[0,0],[.018,0],[.018,.15],[.026,.18],[.028,.21],[0,.21]],plain(0x2a4a8a,.45),0,0,0,12,{rz:Math.PI/2});return g;},
  comic(){const g=grp();const m=new T.Mesh(new T.PlaneGeometry(.18,.26),std(tex(128,180,(gg,w,h)=>{gg.fillStyle='#e8d040';gg.fillRect(0,0,w,h);gg.fillStyle='#c02020';gg.fillRect(0,0,w,36);gg.font='700 26px "Courier Prime", monospace';gg.fillStyle='#fff';gg.fillText('BEANO',14,28);gg.fillStyle='#222';gg.fillRect(14,50,100,110);age(gg,w,h,1.4);},{repeat:false}),{bump:0}));m.rotation.x=-Math.PI/2;m.position.y=.003;g.add(m);return g;},
  car(){const g=grp(),p=MATS.carPaint;rb(g,1.75,.5,4.3,p,0,.62,0,.16);rb(g,1.6,.5,2.3,p,0,1.05,-.2,.18);rb(g,1.55,.42,2.0,MATS.glass,0,1.07,-.2,.14);
    for(const sx of[-1,1])for(const sz of[-1,1]){const w=lathe(g,[[0,-.1],[.33,-.1],[.34,-.06],[.34,.06],[.33,.1],[0,.1]],MATS.tyre,sx*.82,.34,sz*1.35,18,{rz:Math.PI/2});}
    for(const s of[-1,1]){rb(g,.32,.12,.04,MATS.headlight,s*.6,.68,2.15,.03,{cast:false});rb(g,.3,.1,.04,MATS.taillight,s*.6,.72,-2.15,.03,{cast:false});}
    const sn=clothMesh(clothDrape(1.9,4.4,[[-.85,.85,-2.1,2.1,.87],[-.78,.78,-1.35,.95,1.3]],{n:22,steps:120}),MATS.snowCap);sn.scale.y=1;g.add(sn);return g;},
  skip(){const g=grp(),m=MATS.yellowSkip;const sh=new T.CylinderGeometry(1,1,1,4,1,true);rb(g,3.6,.1,1.6,m,0,.1,0,.02);for(const s of[-1,1]){rb(g,3.6,1.1,.06,m,0,.65,s*.9,.02,{rx:s*.2});rb(g,.06,1.1,1.9,m,s*1.9,.65,0,.02,{rz:-s*.35});}
    const sn=clothMesh(clothDrape(4.3,2.4,[[-1.75,1.75,-.75,.75,.95],[-2.2,2.2,-1.1,-.85,1.2],[-2.2,2.2,.85,1.1,1.2]],{n:20,steps:100}),MATS.snowCap);g.add(sn);
    for(let i=0;i<6;i++)rb(g,rand(.3,.8),rand(.1,.4),rand(.2,.6),plain([0x3a2a1a,0x6a6a6a,0x8a6a4a][i%3],.8),rand(-1.3,1.3),.5,rand(-.5,.5),.02,{ry:rand(0,3)});return g;},
  tree(h){const g=grp();lathe(g,[[0,0],[.18,0],[.14,h*.4],[0,h*.4]],MATS.bark,0,0,0,8);for(let i=0;i<5;i++){const y=h*.25+i*h*.15,r=(5-i)*.5*h/8;const c=new T.Mesh(new T.ConeGeometry(r,h*.3,9),MATS.pineNeedles);c.position.y=y+h*.15;c.castShadow=false;g.add(c);const s=new T.Mesh(new T.ConeGeometry(r*.92,h*.12,9),MATS.snowCap);s.position.y=y+h*.24;g.add(s);}return g;},
  streetLamp(){const g=grp();lathe(g,[[0,0],[.12,0],[.1,.4],[.06,.5],[.05,5],[0,5]],plain(0x2a2c2e,.6,{metal:.5}),0,0,0,10);rb(g,.8,.06,.06,plain(0x2a2c2e,.6),.35,5,0,.02);rb(g,.4,.12,.22,plain(0x222,.5),.7,4.95,0,.04);rb(g,.36,.03,.2,std(null,{color:0x332200,emissive:0xffa040,ei:2.2}),.7,4.88,0,.01,{cast:false});return g;},
  fence(len){const g=grp();for(let x=0;x<len;x+=.14)rb(g,.1,1.1+Math.sin(x*3)*.02,.02,MATS.pine,x,.55,0,.01,{cast:false});rb(g,len,.08,.04,MATS.pine,len/2,.85,-.03,.01);rb(g,len,.08,.04,MATS.pine,len/2,.3,-.03,.01);const sn=rb(g,len,.05,.08,MATS.snowCap,len/2,1.13,0,.02);return g;}
};
