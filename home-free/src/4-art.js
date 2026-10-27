
/* ================= TEXTURES: a semi in 1994, emptied in 2020 ================= */
function txt(g,s,x,y,font,col,rot=0){g.save();g.translate(x,y);g.rotate(rot);g.font=font;g.fillStyle=col;g.fillText(s,0,0);g.restore();}
function sprig(g,x,y,s,c1,c2){g.save();g.translate(x,y);g.strokeStyle=c1;g.lineWidth=1.4*s;g.beginPath();g.moveTo(0,10*s);g.quadraticCurveTo(-3*s,0,0,-10*s);g.stroke();for(const [a,b] of [[-1,-4],[1,0],[-1,4]]){g.fillStyle=c1;g.beginPath();g.ellipse(a*4*s,b*s,3.2*s,1.6*s,a*.6,0,TAU);g.fill();}g.fillStyle=c2;for(let i=0;i<5;i++){g.beginPath();g.arc(Math.cos(i*1.26)*2.4*s,-11*s+Math.sin(i*1.26)*2.4*s,1.7*s,0,TAU);g.fill();}g.restore();}
function wall90(o){return tex(512,692,(g,w,h)=>{
  const b=hex(o.base),f=hex(o.fg||o.base),px=w/2; // 256 px per metre
  g.fillStyle=rgba(b);g.fillRect(0,0,w,h);
  speckle(g,w,h,w*h/30,.035);
  if(o.pattern==='stripe'){for(let x=0;x<w;x+=48){g.fillStyle=rgba(f,1,.55);g.fillRect(x,0,18,h);g.fillStyle=rgba(f,.8,.4);g.fillRect(x+22,0,2,h);}}
  if(o.pattern==='sprig'){for(let y=0;y<h;y+=58)for(let x=(y/58%2)*32;x<w;x+=64)sprig(g,x+16,y+20,1.1,rgba(f,1,.8),rgba(hex(o.fg2||'#a04a50'),1,.75));}
  if(o.pattern==='rocket'){for(let y=0;y<h;y+=70)for(let x=(y/70%2)*40;x<w;x+=80){star(g,x+12,y+14,6,rgba(f,1,.7));g.save();g.translate(x+50,y+40);g.rotate(-.6);g.fillStyle=rgba(hex('#c8524a'),1,.7);g.fillRect(-4,-12,8,22);g.beginPath();g.moveTo(-4,-12);g.lineTo(0,-20);g.lineTo(4,-12);g.fill();g.fillStyle=rgba(hex('#e0b040'),1,.7);g.fillRect(-3,10,6,5);g.restore();}}
  if(o.pattern==='diamond'){g.strokeStyle=rgba(f,1,.5);g.lineWidth=2;for(let x=-h;x<w+h;x+=56){g.beginPath();g.moveTo(x,0);g.lineTo(x+h,h);g.stroke();g.beginPath();g.moveTo(x+h,0);g.lineTo(x,h);g.stroke();}}
  for(let x=0;x<w;x+=137){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x,0,1,h);g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x+1,0,1,h);} // paper seams
  if(o.border){const y=h-px*(o.dado?1.12:1.5);g.fillStyle=rgba(hex(o.border));g.fillRect(0,y,w,26);for(let x=8;x<w;x+=34)sprig(g,x,y+13,.8,rgba(hex('#ece2c8'),1,.8),rgba(hex('#e0a050'),1,.8));g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,y+26,w,2);}
  if(o.dado){const y=h-px*1.0;g.fillStyle=rgba(hex(o.dado));g.fillRect(0,y,w,h-y);for(let i=0;i<5000;i++){g.fillStyle=`rgba(${R()<.5?255:0},${R()<.5?255:0},${R()<.5?255:0},${R()*.05})`;g.beginPath();g.arc(R()*w,y+R()*(h-y),1+R()*2.2,0,TAU);g.fill();}
    g.fillStyle=rgba(hex(o.rail||'#e8e2d4'));g.fillRect(0,y-10,w,14);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y+4,w,3);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,y-10,w,2);}
  // where the pictures hung: cleaner, paler rectangles
  for(let i=0;i<(o.ghosts||0);i++){const pw=60+R()*110,ph=70+R()*120,x=R()*(w-pw),y=h*.2+R()*h*.25;g.fillStyle=rgba(b,1.12,.55);g.fillRect(x,y,pw,ph);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+pw/2-1,y-20,2,3);}
  age(g,w,h,o.age||.8);
  // skirting
  const sk=31;g.fillStyle=rgba(hex(o.skirt||'#e6e0d2'));g.fillRect(0,h-sk,w,sk);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,h-sk,w,3);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,h-sk-2,w,2);
  for(let i=0;i<14;i++){g.fillStyle=`rgba(40,30,20,${R()*.25})`;g.fillRect(R()*w,h-sk+4+R()*20,6+R()*30,1+R()*2);} // scuffs
  grime(g,w,h,.22,.3);
});}
function carpet(base,kind){return tex(512,512,(g,w,h)=>{const c=hex(base);g.fillStyle=rgba(c);g.fillRect(0,0,w,h);
  if(kind==='swirl'){for(let i=0;i<46;i++){const x=R()*w,y=R()*h,r=20+R()*50;g.strokeStyle=rgba(c,R()<.5?1.35:.7,.6);g.lineWidth=5+R()*7;g.beginPath();g.arc(x,y,r,R()*6,R()*6+3.5);g.stroke();}}
  if(kind==='fleck'){for(let i=0;i<3000;i++){g.fillStyle=rgba(c,R()<.5?1.5:.6,.5);g.fillRect(R()*w,R()*h,2,2);}}
  const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*44;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);
  const wear=g.createRadialGradient(w*.5,h*.5,20,w*.5,h*.5,w*.6);wear.addColorStop(0,'rgba(255,240,220,.08)');wear.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=wear;g.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){const x=R()*w,y=R()*h,r=8+R()*26,gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(30,20,10,.35)');gr.addColorStop(1,'rgba(30,20,10,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
});}
function lino(){return tex(512,512,(g,w,h)=>{const s=64;for(let j=0;j<h/s;j++)for(let i=-1;i<w/s+1;i++){const x=i*s+(j%2?s/2:0);g.fillStyle=rgba(hex((i+j)%3?'#b9ab86':'#8f8a74'),.9+R()*.15);g.fillRect(x,j*s,s,s);g.strokeStyle='rgba(60,50,30,.5)';g.lineWidth=2;g.strokeRect(x,j*s,s,s);}
  for(let i=0;i<120;i++){g.strokeStyle=`rgba(40,30,20,${R()*.2})`;g.lineWidth=.8;g.beginPath();const x=R()*w,y=R()*h;g.moveTo(x,y);g.lineTo(x+rand(-30,30),y+rand(-30,30));g.stroke();}age(g,w,h,1.3);});}
function artex(){return tex(512,512,(g,w,h)=>{g.fillStyle='#d7d0bf';g.fillRect(0,0,w,h);
  for(let j=0;j<10;j++)for(let i=0;i<10;i++){const x=i*56+(j%2)*28,y=j*56;for(let k=0;k<9;k++){g.strokeStyle=`rgba(${k%2?255:60},${k%2?250:55},${k%2?240:45},${.14+R()*.08})`;g.lineWidth=2.4;g.beginPath();g.arc(x,y,6+k*4.2,.2+R()*.2,Math.PI-.2);g.stroke();}}
  speckle(g,w,h,8000,.06);const gr=g.createRadialGradient(w*.7,h*.3,10,w*.7,h*.3,160);gr.addColorStop(0,'rgba(140,100,40,.25)');gr.addColorStop(.6,'rgba(140,100,40,.08)');gr.addColorStop(.62,'rgba(120,80,30,.2)');gr.addColorStop(.66,'rgba(140,100,40,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(150,120,60,.12)';g.fillRect(0,0,w,h);});}
function brick(){return tex(512,512,(g,w,h)=>{g.fillStyle='#4a4038';g.fillRect(0,0,w,h);const bh=21,bw=64;for(let j=0;j<h/bh;j++)for(let i=-1;i<w/bw+1;i++){const x=i*bw+(j%2?bw/2:0);const k=.75+R()*.4;g.fillStyle=rgba(hex(R()<.15?'#5a3a2a':'#7a4a36'),k);g.fillRect(x+2,j*bh+2,bw-4,bh-4);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x+2,j*bh+bh-6,bw-4,4);}
  speckle(g,w,h,9000,.1);age(g,w,h,1.5);});}
function snowTex(){return tex(512,512,(g,w,h)=>{g.fillStyle='#c9d0dc';g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*18;d[i]+=n;d[i+1]+=n;d[i+2]+=n+2;}g.putImageData(id,0,0);
  for(let i=0;i<40;i++){const x=R()*w,y=R()*h,r=20+R()*80,gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}});}
function render(){return tex(512,512,(g,w,h)=>{g.fillStyle='#8f8e88';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){g.fillStyle=`rgba(${R()<.5?40:220},${R()<.5?40:215},${R()<.5?40:205},${R()*.25})`;g.beginPath();g.arc(R()*w,R()*h,.8+R()*1.6,0,TAU);g.fill();}age(g,w,h,2.2);});}
function slate(){return tex(512,512,(g,w,h)=>{g.fillStyle='#d5dbe4';g.fillRect(0,0,w,h);for(let j=0;j<16;j++)for(let i=0;i<9;i++){if(R()<.18){g.fillStyle=rgba(hex('#2a2c30'),.8+R()*.3);g.fillRect(i*58+(j%2)*29,j*32,54,28);}}speckle(g,w,h,6000,.08);});}
function cardboard(label){return tex(512,512,(g,w,h)=>{g.fillStyle='#a9824f';g.fillRect(0,0,w,h);for(let i=0;i<w;i+=7){g.fillStyle=`rgba(0,0,0,${.04+R()*.03})`;g.fillRect(i,0,2,h);}speckle(g,w,h,8000,.08);
  g.fillStyle='rgba(205,190,150,.55)';g.fillRect(w*.42,0,w*.16,h);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(w*.42,0,4,h);
  if(label){g.save();g.translate(w*.5,h*.62);g.rotate(rand(-.08,.08));g.font=`700 ${label.length>6?64:84}px "Kalam", cursive`;g.textAlign='center';g.fillStyle='rgba(20,20,26,.85)';g.fillText(label,0,0);g.restore();}
  g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=3;g.strokeRect(6,6,w-12,h-12);age(g,w,h,.6);});}
function fabric(base,kind,c2){return tex(256,256,(g,w,h)=>{const c=hex(base);g.fillStyle=rgba(c);g.fillRect(0,0,w,h);
  if(kind==='floral')for(let i=0;i<30;i++)flower(g,R()*w,R()*h,.5+R()*.3,rgba(hex(c2||'#c8a070'),1,.55),rgba(hex(c2||'#c8a070'),.7,.6));
  if(kind==='stripe')for(let x=0;x<w;x+=24){g.fillStyle=rgba(hex(c2),1,.6);g.fillRect(x,0,8,h);}
  if(kind==='check')for(let x=0;x<w;x+=32){g.fillStyle=rgba(hex(c2),1,.35);g.fillRect(x,0,12,h);g.fillRect(0,x,w,12);}
  for(let y=0;y<h;y+=2){g.fillStyle=`rgba(0,0,0,${R()*.06})`;g.fillRect(0,y,w,1);}for(let x=0;x<w;x+=2){g.fillStyle=`rgba(255,255,255,${R()*.04})`;g.fillRect(x,0,1,h);}age(g,w,h,.4);});}
function photoTex(kind){return tex(256,192,(g,w,h)=>{
  const sky=g.createLinearGradient(0,0,0,h);
  if(kind==='beach'){sky.addColorStop(0,'#8fb6d8');sky.addColorStop(.5,'#b7d0e0');sky.addColorStop(.52,'#4a7a9a');sky.addColorStop(.7,'#d8c49a');sky.addColorStop(1,'#c8b088');}
  else if(kind==='xmas'){sky.addColorStop(0,'#5a3a2a');sky.addColorStop(1,'#2a1a14');}
  else if(kind==='garden'){sky.addColorStop(0,'#a8c8e0');sky.addColorStop(.55,'#c0d8e8');sky.addColorStop(.56,'#5a8a3a');sky.addColorStop(1,'#3a6a2a');}
  else{sky.addColorStop(0,'#6a7a8a');sky.addColorStop(1,'#3a4450');}
  g.fillStyle=sky;g.fillRect(0,0,w,h);
  if(kind==='xmas'){g.fillStyle='#1f4a2a';g.beginPath();g.moveTo(200,20);g.lineTo(240,150);g.lineTo(160,150);g.fill();for(let i=0;i<14;i++){g.fillStyle=['#ffd060','#ff6040','#60a0ff'][i%3];g.beginPath();g.arc(rand(170,230),rand(50,140),3,0,TAU);g.fill();}}
  const kid=(x,y,s,top)=>{g.fillStyle=top;g.beginPath();g.ellipse(x,y+26*s,16*s,26*s,0,0,TAU);g.fill();g.fillStyle='#e2b89a';g.beginPath();g.arc(x,y,11*s,0,TAU);g.fill();g.fillStyle='#4a2e1a';g.beginPath();g.arc(x,y-4*s,11*s,Math.PI,0);g.fill();g.fillStyle='#2a1a10';g.fillRect(x-5*s,y-1*s,2*s,2*s);g.fillRect(x+3*s,y-1*s,2*s,2*s);g.strokeStyle='#8a4a3a';g.lineWidth=1.5*s;g.beginPath();g.arc(x,y+3*s,4*s,.2,Math.PI-.2);g.stroke();};
  if(kind==='school'){kid(w/2,h*.42,2.6,'#5a6a8a');}
  else{kid(w*.38,h*.5,1.6,kind==='xmas'?'#b02a20':'#3a5a9a');kid(w*.6,h*.58,1.15,'#b02a20');if(kind!=='xmas'){g.fillStyle='#e2b89a';}}
  const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*20;d[i]=d[i]*.92+30+n;d[i+1]=d[i+1]*.9+18+n;d[i+2]=d[i+2]*.82+8+n;}g.putImageData(id,0,0);
  const v=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,20,0,.45)');g.fillStyle=v;g.fillRect(0,0,w,h);},{repeat:false});}
function posterTex(kind){return tex(256,360,(g,w,h)=>{
  if(kind==='space'){g.fillStyle='#070a18';g.fillRect(0,0,w,h);for(let i=0;i<200;i++){g.fillStyle=`rgba(255,255,255,${R()})`;g.fillRect(R()*w,R()*h,1,1);}g.fillStyle='#e8e8ec';g.beginPath();g.moveTo(128,40);g.quadraticCurveTo(152,90,148,250);g.lineTo(108,250);g.quadraticCurveTo(104,90,128,40);g.fill();g.fillStyle='#d06a20';g.beginPath();g.ellipse(128,170,22,70,0,0,TAU);g.fill();g.fillStyle='#ffb040';g.beginPath();g.moveTo(108,250);g.lineTo(128,330);g.lineTo(148,250);g.fill();txt(g,'DISCOVERY',40,350,'700 30px "Courier Prime", monospace','#e0e0e8');}
  else if(kind==='football'){g.fillStyle='#1a3a8a';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,0,w,40);txt(g,'SEASON 94/95',22,30,'700 26px "Courier Prime", monospace','#1a3a8a');for(let r=0;r<2;r++)for(let i=0;i<6;i++){const x=24+i*40,y=150+r*90;g.fillStyle=r?'#f0f0f0':'#c82020';g.fillRect(x-14,y,28,46);g.fillStyle='#e2b89a';g.beginPath();g.arc(x,y-8,10,0,TAU);g.fill();}}
  else{g.fillStyle='#2a4a2a';g.fillRect(0,0,w,h);g.fillStyle='#6a8a3a';g.beginPath();g.ellipse(130,220,80,40,0,0,TAU);g.fill();g.fillRect(70,180,22,120);g.fillRect(160,190,22,110);g.beginPath();g.moveTo(60,200);g.quadraticCurveTo(20,80,60,60);g.lineTo(80,70);g.quadraticCurveTo(60,120,90,190);g.fill();txt(g,'DINOSAURS',30,340,'700 34px "Courier Prime", monospace','#f0e0a0');}
  age(g,w,h,.6);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(0,0,14,14);g.fillRect(w-14,0,14,14);},{repeat:false});}
function windowTex(){return tex(256,320,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1c2436');gr.addColorStop(.62,'#2a3346');gr.addColorStop(.64,'#8a94a8');gr.addColorStop(1,'#a6aebe');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#0b0e16';for(let i=0;i<5;i++){const x=R()*w,s=40+R()*60;g.beginPath();g.moveTo(x,h*.64-s*1.8);g.lineTo(x+s*.5,h*.64);g.lineTo(x-s*.5,h*.64);g.fill();g.fillStyle='rgba(200,210,225,.5)';for(let k=0;k<4;k++){g.beginPath();g.ellipse(x+rand(-s*.3,s*.3),h*.64-rand(10,s*1.4),rand(6,14),3,0,0,TAU);g.fill();}g.fillStyle='#0b0e16';}
  for(let i=0;i<500;i++){g.fillStyle=`rgba(230,236,245,${R()*.6})`;g.beginPath();g.arc(R()*w,R()*h,R()*1.6+.3,0,TAU);g.fill();}
  for(let s=0;s<4;s++){const cx=s%2?w:0,cy=s>1?h:0;const fr=g.createRadialGradient(cx,cy,10,cx,cy,140);fr.addColorStop(0,'rgba(215,225,240,.75)');fr.addColorStop(.5,'rgba(215,225,240,.25)');fr.addColorStop(1,'rgba(215,225,240,0)');g.fillStyle=fr;g.fillRect(0,0,w,h);}
  for(let i=0;i<90;i++){g.strokeStyle=`rgba(230,238,248,${R()*.3})`;g.lineWidth=.8;const cx=R()<.5?R()*40:w-R()*40,cy=R()*h;g.beginPath();g.moveTo(cx,cy);for(let k=0;k<4;k++)g.lineTo(cx+rand(-18,18),cy+rand(-18,18));g.stroke();}});}
function tileTex(base,line){return tex(256,256,(g,w,h)=>{const s=32;for(let j=0;j<8;j++)for(let i=0;i<8;i++){g.fillStyle=rgba(hex(base),.92+R()*.12);g.fillRect(i*s,j*s,s,s);const gl=g.createLinearGradient(i*s,j*s,i*s+s,j*s+s);gl.addColorStop(0,'rgba(255,255,255,.18)');gl.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=gl;g.fillRect(i*s,j*s,s,s);}
  g.strokeStyle=line;g.lineWidth=2;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*s,0);g.lineTo(i*s,h);g.stroke();g.beginPath();g.moveTo(0,i*s);g.lineTo(w,i*s);g.stroke();}age(g,w,h,.8);});}
function bark(){return tex(128,256,(g,w,h)=>{g.fillStyle='#2a2018';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(${R()<.5?10:90},${R()<.5?8:70},6,.5)`;g.lineWidth=1+R()*3;const x=R()*w;g.beginPath();g.moveTo(x,0);for(let y=0;y<h;y+=16)g.lineTo(x+rand(-3,3),y);g.stroke();}});}

/* ---------- documents you can pick up (drawn once, shown full-screen) ---------- */
function calendarCanvas(){const c=cvs(760,980),g=c.getContext('2d');
  g.fillStyle='#ece6d6';g.fillRect(0,0,760,980);const im=g.createLinearGradient(0,0,0,430);im.addColorStop(0,'#4a6a8a');im.addColorStop(1,'#c8d4dc');g.fillStyle=im;g.fillRect(40,40,680,380);
  g.fillStyle='#f4f6f8';g.beginPath();g.moveTo(40,420);for(let x=40;x<=720;x+=20)g.lineTo(x,340+Math.sin(x*.02)*30+R()*10);g.lineTo(720,420);g.fill();g.fillStyle='#1a2a1a';for(let i=0;i<8;i++){const x=80+i*85,s=40+R()*40;g.beginPath();g.moveTo(x,360-s*2);g.lineTo(x+s*.5,370);g.lineTo(x-s*.5,370);g.fill();}
  txt(g,'Snowdonia, Wales',52,410,'italic 18px "Fraunces", serif','#fff');
  txt(g,'DECEMBER 1994',220,480,'500 38px "Fraunces", serif','#2a2a2a');
  const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];days.forEach((d,i)=>txt(g,d,52+i*96,520,'14px "Courier Prime", monospace','#6a6a6a'));
  g.strokeStyle='#b8b0a0';g.lineWidth=1;for(let r=0;r<=5;r++){g.beginPath();g.moveTo(40,530+r*84);g.lineTo(712,530+r*84);g.stroke();}for(let i=0;i<=7;i++){g.beginPath();g.moveTo(40+i*96,530);g.lineTo(40+i*96,950);g.stroke();}
  let d=1;for(let r=0;r<5;r++)for(let i=0;i<7;i++){if(r===0&&i<3)continue;if(d>31)break;const x=40+i*96,y=530+r*84;txt(g,String(d),x+8,y+22,'500 18px "Fraunces", serif',i>4?'#a03020':'#2a2a2a');
    const pen=(s,dy,col='#1f2a66',sz=19,rot=-.03)=>txt(g,s,x+8,y+44+dy,`${sz}px "Kalam", cursive`,col,rot);
    if(d===3)pen('bins',0);if(d===9)pen('O — nativity',0);if(d===10)pen('Gran 2pm',0);if(d===17)pen('J school',0);if(d===17)pen('trip',18);
    if(d===21){g.strokeStyle='#b0201a';g.lineWidth=3;g.beginPath();g.ellipse(x+48,y+42,44,36,-.1,0,TAU);g.stroke();txt(g,'POLICE 4pm',x+6,y+50,'700 17px "Kalam", cursive','#b0201a',-.05);txt(g,'Sgt Fenwick',x+8,y+70,'15px "Kalam", cursive','#b0201a',-.04);}
    if(d===22){pen('plasterboard',0,'#1f2a66',16);pen('+ skim — under',16,'#1f2a66',16);pen('stairs (finally!)',32,'#1f2a66',16);}
    if(d===24){pen('woods search',0,'#555',15);pen('9am',16,'#555',15);}
    d++;}
  for(let i=0;i<5000;i++){g.fillStyle=`rgba(120,100,60,${Math.random()*.05})`;g.fillRect(Math.random()*760,Math.random()*980,2,2);}
  g.fillStyle='#c8c8c8';g.beginPath();g.arc(380,14,8,0,TAU);g.fill();return c;}
function posterCanvas(){const c=cvs(700,990),g=c.getContext('2d');g.fillStyle='#f2efe6';g.fillRect(0,0,700,990);
  txt(g,'MISSING',150,120,'700 110px "Courier Prime", monospace','#111');g.fillStyle='#111';g.fillRect(40,150,620,6);
  const ph=photoTex('school').canvas;g.filter='grayscale(1) contrast(1.3)';g.drawImage(ph,170,190,360,270);g.filter='none';g.strokeStyle='#111';g.lineWidth=3;g.strokeRect(170,190,360,270);
  txt(g,'OWEN HALE',190,540,'700 54px "Courier Prime", monospace','#111');txt(g,'Age 6',300,590,'34px "Courier Prime", monospace','#111');
  ['Last seen Wednesday 21 December 1994','at his home on Coldharbour Lane.','Wearing a red jumper, blue cords','and one white trainer.','','Owen is shy and may hide if he is frightened.','','If you have seen Owen please call','Northfield Police 01632 960 412'].forEach((l,i)=>txt(g,l,70,660+i*34,'23px "Courier Prime", monospace','#1a1a1a'));
  const id=g.getImageData(0,0,700,990),dd=id.data;for(let i=0;i<dd.length;i+=4){const n=(Math.random()-.5)*26;dd[i]+=n;dd[i+1]+=n;dd[i+2]+=n-4;}g.putImageData(id,0,0);
  g.fillStyle='rgba(200,170,90,.18)';g.fillRect(0,0,700,990);g.fillStyle='#b8b8b8';g.beginPath();g.arc(350,24,8,0,TAU);g.fill();return c;}
function polaroidCanvas(){const c=cvs(560,660),g=c.getContext('2d');g.fillStyle='#ebe7dc';g.fillRect(0,0,560,660);
  const p=g.createLinearGradient(0,0,0,480);p.addColorStop(0,'#1a1410');p.addColorStop(1,'#3a2a1c');g.fillStyle=p;g.fillRect(40,40,480,480);
  g.fillStyle='#5a4a38';g.beginPath();g.moveTo(40,40);g.lineTo(520,40);g.lineTo(520,160);g.lineTo(40,520);g.fill(); // the slope of the stairs
  const beam=g.createRadialGradient(300,360,10,300,360,200);beam.addColorStop(0,'rgba(255,230,170,.75)');beam.addColorStop(1,'rgba(255,230,170,0)');g.fillStyle=beam;g.fillRect(40,40,480,480);
  const kid=(x,y,s,top)=>{g.fillStyle=top;g.beginPath();g.ellipse(x,y+40*s,24*s,34*s,0,0,TAU);g.fill();g.fillStyle='#e8c2a0';g.beginPath();g.arc(x,y,17*s,0,TAU);g.fill();g.fillStyle='#4a2e1a';g.beginPath();g.arc(x,y-6*s,17*s,Math.PI,0);g.fill();g.fillStyle='#1a1008';g.fillRect(x-7*s,y-2*s,3*s,3*s);g.fillRect(x+4*s,y-2*s,3*s,3*s);g.strokeStyle='#7a3a2a';g.lineWidth=2;g.beginPath();g.arc(x,y+5*s,6*s,.2,Math.PI-.2);g.stroke();};
  kid(220,350,1.5,'#3a5a9a');kid(360,390,1.1,'#b02a20');g.fillStyle='#d0d0d0';g.fillRect(330,430,40,14);g.fillStyle='#e8e0b0';g.fillRect(364,432,10,10);
  g.fillStyle='#8a2a2a';g.fillRect(90,470,90,40);g.fillStyle='#c8b040';g.fillRect(410,300,60,90);txt(g,'BEANO',414,320,'700 14px "Courier Prime", monospace','#a02020');
  const id=g.getImageData(40,40,480,480),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*30;d[i]=d[i]*.9+25+n;d[i+1]=d[i+1]*.86+16+n;d[i+2]=d[i+2]*.7+4+n;}g.putImageData(id,40,40);
  txt(g,'the den — summer 94',120,590,'34px "Kalam", cursive','#2a3a7a',-.02);return c;}
function marksTex(){return tex(128,512,(g,w,h)=>{g.clearRect(0,0,w,h);
  const mark=(hgt,label,col)=>{const y=h-hgt/1.9*h;g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.moveTo(8,y+rand(-1,1));g.lineTo(60,y+rand(-1,1));g.stroke();txt(g,label,64,y+6,'18px "Kalam", cursive',col,rand(-.05,.05));};
  [[.98,'O 3'],[1.05,'O 4'],[1.12,'O 5'],[1.19,'O 6']].forEach(([h0,l])=>mark(h0,l,'rgba(40,40,60,.8)'));
  [[1.27,'J 9'],[1.33,'J 10'],[1.39,'J 11'],[1.47,'J 12'],[1.53,'J 13'],[1.6,'J 14'],[1.66,'J 15']].forEach(([h0,l])=>mark(h0,l,'rgba(40,40,60,.7)'));},{repeat:false,srgb:true});}
function flameTex(){const t=tex(64,128,()=>{},{repeat:false});return t;}
function drawFlame(t,time,k){const g=t.canvas.getContext('2d'),w=64,h=128;g.clearRect(0,0,w,h);if(k<=0){t.needsUpdate=true;return;}
  for(let i=0;i<7;i++){const x=w/2+Math.sin(time*7+i*2)*6+(i-3)*5,top=h*(.2+.3*Math.abs(Math.sin(time*5+i*1.7)));const gr=g.createLinearGradient(0,h,0,top);gr.addColorStop(0,`rgba(255,200,120,${.9*k})`);gr.addColorStop(.4,`rgba(255,120,30,${.7*k})`);gr.addColorStop(1,'rgba(200,40,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x-10,h);g.quadraticCurveTo(x-8,(h+top)/2,x+Math.sin(time*9+i)*4,top);g.quadraticCurveTo(x+8,(h+top)/2,x+10,h);g.fill();}t.needsUpdate=true;}

/* ---------- materials ---------- */
// a printed pattern (canvas) over the measured micro-surface of a real fabric/paint scan
function overlay(map,setId,{tile=.25,rough=.95,normal=.8,color=0xffffff}={}){const S_=TEXSET[setId];const m=new T.MeshStandardMaterial({map,color,roughness:rough,metalness:0});
  if(S_&&S_.n){const n=S_.n.clone();n.needsUpdate=true;n.repeat.set(1/tile,1/tile);m.normalMap=n;m.normalScale.set(normal,-normal);}return m;}
function buildMaterials(){
  MATS.walls={
    hall:pbr('decrepit_wallpaper',{tile:1.6}),
    study:pbr('worn_plaster_wall',{tile:2.2,color:0xa8b4a0}),
    parents:pbr('painted_plaster_wall',{tile:2,color:0xe8c8c0}),
    boys:pbr('painted_plaster_wall',{tile:2,color:0xa8c0dc,key:'boys'}),
    kitchen:pbr('peeling_painted_wall',{tile:2.2,color:0xf0e6c0}),
    bath:pbr('square_tiled_wall',{tile:1.2,color:0xe8eee8}),
    living:pbr('beige_wall_001',{tile:2}),
    dining:pbr('decrepit_wallpaper',{tile:1.6,color:0xc89088,key:'dining'}),
    den:pbr('rough_plaster_broken',{tile:1.6}),
    brick:pbr('red_brick_03',{tile:1.6}),
    jamb:pbr('painted_plaster_wall',{tile:1.5,color:0xece6da,key:'jamb'})
  };
  MATS.floors={carpetBrown:pbr('dirty_carpet',{tile:1.5,color:0x9a7a5a}),carpetRose:pbr('dirty_carpet',{tile:1.5,color:0xc09090,key:'r'}),carpetBlue:pbr('dirty_carpet',{tile:1.5,color:0x7080a8,key:'b'}),
    lino:pbr('old_linoleum_flooring_01',{tile:1.6}),boards:pbr('old_wood_floor',{tile:2}),bare:pbr('worn_planks',{tile:1.6}),snow:pbr('snow_02',{tile:2.5})};
  MATS.ceil=pbr('white_plaster_rough_01',{tile:2,color:0xd8d4cc});
  MATS.oak=pbr('wood_cabinet_worn_long',{tile:1.2,color:0xd0a070,metal:0});
  MATS.pine=pbr('kitchen_wood',{tile:1,color:0xe8c8a0,metal:0});
  MATS.teak=pbr('wood_cabinet_worn_long',{tile:1.2,metal:0,key:'teak'});
  MATS.whiteGloss=pbr('painted_concrete',{tile:.8,color:0xf2eee4,rough:.55,metal:0,normal:.35});
  MATS.door=pbr('painted_concrete',{tile:.9,color:0xeae4d6,rough:.6,metal:0,normal:.4,key:'door'});
  MATS.cream=pbr('painted_concrete',{tile:.8,color:0xe8dfc8,rough:.6,metal:0,normal:.3,key:'cream'});
  MATS.chrome=plain(0xc8ccd0,.16,{metal:1});
  MATS.steel=plain(0x8a8e92,.32,{metal:.9});
  MATS.brass=plain(0xa88440,.28,{metal:1});
  MATS.blackPlastic=plain(0x141414,.42);
  MATS.beigePlastic=plain(0xc8bea6,.48);
  MATS.porcelain=plain(0xe6e4dc,.12);
  MATS.glass=std(null,{color:0x0c1016,rough:.04,metal:.5});
  MATS.sofa=overlay(fabric('#7a5a3a','floral','#c8a070'),'quatrefoil_jacquard_fabric',{tile:.3});
  MATS.armchair=pbr('quatrefoil_jacquard_fabric',{tile:.45,color:0x9aa080,metal:0});
  MATS.duvetP=overlay(fabric('#c8b0a8','floral','#8a5a6a'),'terry_cloth',{tile:.2,normal:.5});
  MATS.duvetB=overlay(fabric('#3a5a8a','check','#c8c8d8'),'terry_cloth',{tile:.2,normal:.5});
  MATS.duvetB2=overlay(fabric('#8a3a3a','stripe','#e0d0b0'),'terry_cloth',{tile:.2,normal:.5});
  MATS.sheet=pbr('terry_cloth',{tile:.5,color:0xd8d2c4,normal:.4,metal:0,key:'sheet'});
  MATS.curtain=pbr('quatrefoil_jacquard_fabric',{tile:.5,color:0x9a7a5a,metal:0,key:'curt'});
  MATS.curtainB=pbr('quatrefoil_jacquard_fabric',{tile:.5,color:0x50608a,metal:0,key:'curtB'});
  MATS.coat=pbr('terry_cloth',{tile:.3,color:0x3a3a40,normal:.6,metal:0,key:'coat'});
  MATS.coatR=pbr('terry_cloth',{tile:.3,color:0x8a3a30,normal:.6,metal:0,key:'coatR'});
  MATS.box={};['KITCHEN','BOOKS','CHARITY','TIP','DAD','OWEN','KEEP','LOFT',''].forEach(l=>MATS.box[l]=overlay(cardboard(l),'painted_concrete',{tile:1,normal:.3,rough:.9}));
  MATS.tape=plain(0xc8b480,.4,{transparent:true});
  MATS.tilesBrown=pbr('square_tiled_wall',{tile:.9,color:0x8a5a34,rough:.6,key:'tb'});
  MATS.tilesKitchen=pbr('square_tiled_wall',{tile:.9,color:0xf0ecdc,key:'tk'});
  MATS.worktop=overlay(tex(256,256,(g,w,h)=>{g.fillStyle='#bfb69e';g.fillRect(0,0,w,h);speckle(g,w,h,9000,.2);age(g,w,h,.5);}),'painted_concrete',{tile:.6,rough:.35,normal:.25});
  MATS.cork=overlay(tex(256,256,(g,w,h)=>{g.fillStyle='#a07a4a';g.fillRect(0,0,w,h);for(let i=0;i<6000;i++){g.fillStyle=`rgba(${R()<.5?60:200},${R()<.5?40:150},20,${R()*.5})`;g.fillRect(R()*w,R()*h,2,2);}}),'rough_plaster_broken',{tile:.4,normal:.6});
  MATS.window=std(windowTex(),{emissive:0xffffff,ei:.5,rough:.05,bump:0});MATS.window.emissiveMap=MATS.window.map;
  MATS.render=pbr('painted_concrete',{tile:2.5,color:0xd6d2c8,metal:0,key:'render'});
  MATS.roof=pbr('roof_slates_02',{tile:2});
  MATS.bark=pbr('bark',{tile:1.2,metal:0});
  MATS.snowCap=pbr('snow_02',{tile:1.2,key:'cap'});
  MATS.ember=std(null,{color:0x100300,emissive:0xff4010,ei:0});
  MATS.flameT=flameTex();
  MATS.flame=new T.MeshBasicMaterial({map:MATS.flameT,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  MATS.led=new T.MeshBasicMaterial({color:0x3a0a06});
  MATS.yellowSkip=pbr('painted_concrete',{tile:1.5,color:0xc8a020,rough:.7,metal:0,key:'skip'});
  MATS.lane=pbr('asphalt_snow',{tile:3});
  MATS.plank=pbr('worn_planks',{tile:1.4,metal:0,key:'plank'});
  MATS.leather=pbr('leather_white',{tile:.3,color:0xe8e4dc,metal:0});
}

/* ================= MODELLING HELPERS ================= */
function sculpt(geo,fn){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const v=fn(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,v[0],v[1],v[2]);}geo.computeVertexNormals();return geo;}
const rbCache=new Map();
function rboxGeo(w,h,d,r){r=Math.max(.001,Math.min(r,w/2-.002,h/2-.002,d/2-.002));const key=w.toFixed(3)+h.toFixed(3)+d.toFixed(3)+r.toFixed(3);if(rbCache.has(key))return rbCache.get(key);
  const s=new T.Shape(),hw=w/2-r,hh=h/2-r;s.moveTo(-hw,-hh);s.lineTo(hw,-hh);s.lineTo(hw,hh);s.lineTo(-hw,hh);s.lineTo(-hw,-hh);
  const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:2});g.translate(0,0,-(d-2*r)/2);g.computeVertexNormals();rbCache.set(key,g);return g;}
function rb(p,w,h,d,mat,x,y,z,r=.012,o={}){const m=new T.Mesh(rboxGeo(w,h,d,r),mat);m.position.set(x,y,z);if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;m.castShadow=o.cast!==false;m.receiveShadow=true;p.add(m);return m;}
function lathe(p,prof,mat,x,y,z,seg=16,o={}){const m=new T.Mesh(new T.LatheGeometry(prof.map(([r,yy])=>new T.Vector2(Math.max(.0005,r),yy)),seg),mat);m.position.set(x,y,z);if(o.rx)m.rotation.x=o.rx;if(o.rz)m.rotation.z=o.rz;m.castShadow=o.cast!==false;m.receiveShadow=true;p.add(m);return m;}
// a turned leg/spindle of height h and base radius r
function turned(h,r){return [[0,0],[r*.8,0],[r*.85,h*.04],[r*.7,h*.08],[r*.6,h*.3],[r*.9,h*.36],[r*.6,h*.42],[r*.65,h*.62],[r,h*.68],[r,h*.92],[r*.85,h*.96],[r*.85,h],[0,h]];}
// verlet cloth dropped over a set of boxes; returns a mesh geometry with real folds
function clothDrape(sw,sd,boxes,{n=26,steps=170,y0,stiff=4,slip=.9}={}){
  const N=n*n,P=new Float32Array(N*3),O=new Float32Array(N*3);const top=Math.max(...boxes.map(b=>b[4]));
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=(j*n+i)*3;P[k]=(i/(n-1)-.5)*sw;P[k+1]=(y0!==undefined?y0:top+.03)+R()*.004;P[k+2]=(j/(n-1)-.5)*sd;O[k]=P[k];O[k+1]=P[k+1];O[k+2]=P[k+2];}
  const C=[];const add=(a,b)=>{const dx=P[a*3]-P[b*3],dy=P[a*3+1]-P[b*3+1],dz=P[a*3+2]-P[b*3+2];C.push(a,b,Math.hypot(dx,dy,dz));};
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i;if(i<n-1)add(k,k+1);if(j<n-1)add(k,k+n);if(i<n-1&&j<n-1){add(k,k+n+1);add(k+1,k+n);}if(i<n-2)add(k,k+2);if(j<n-2)add(k,k+2*n);}
  const g=-9.8*(1/60)*(1/60);
  for(let s=0;s<steps;s++){
    for(let k=0;k<N*3;k+=3){const vx=(P[k]-O[k])*.985,vy=(P[k+1]-O[k+1])*.985,vz=(P[k+2]-O[k+2])*.985;O[k]=P[k];O[k+1]=P[k+1];O[k+2]=P[k+2];P[k]+=vx;P[k+1]+=vy+g;P[k+2]+=vz;}
    for(let it=0;it<stiff;it++)for(let c=0;c<C.length;c+=3){const a=C[c]*3,b=C[c+1]*3,rest=C[c+2];const dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2],d=Math.hypot(dx,dy,dz)||1e-6,f=(d-rest)/d*.5;P[a]+=dx*f;P[a+1]+=dy*f;P[a+2]+=dz*f;P[b]-=dx*f;P[b+1]-=dy*f;P[b+2]-=dz*f;}
    for(let k=0;k<N*3;k+=3){
      for(const [x0,x1,z0,z1,y1] of boxes){const px=P[k],py=P[k+1],pz=P[k+2],e=.012;if(px>x0-e&&px<x1+e&&pz>z0-e&&pz<z1+e&&py<y1+e){const dt=y1+e-py,dl=px-(x0-e),dr=(x1+e)-px,df=pz-(z0-e),db=(z1+e)-pz,m=Math.min(dt,dl,dr,df,db);
        if(m===dt){P[k+1]=y1+e;O[k]=P[k]-(P[k]-O[k])*(1-slip);O[k+2]=P[k+2]-(P[k+2]-O[k+2])*(1-slip);}else if(m===dl)P[k]=x0-e;else if(m===dr)P[k]=x1+e;else if(m===df)P[k+2]=z0-e;else P[k+2]=z1+e;}}
      if(P[k+1]<.006){P[k+1]=.006;O[k]=P[k];O[k+2]=P[k+2];}}
  }
  const geo=new T.PlaneGeometry(1,1,n-1,n-1);const pa=geo.attributes.position;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i;pa.setXYZ(k,P[k*3],P[k*3+1],P[k*3+2]);}geo.computeVertexNormals();
  // plane's default winding faces +z; after draping the top surface must face up
  const nr=geo.attributes.normal;let up=0;for(let k=0;k<nr.count;k++)up+=nr.getY(k);if(up<0){const idx=geo.index.array;for(let t=0;t<idx.length;t+=3){const a=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=a;}geo.computeVertexNormals();}
  return geo;}
function clothMesh(geo,mat){const m=new T.Mesh(geo,mat);m.material=mat;mat.side=T.DoubleSide;m.castShadow=true;m.receiveShadow=true;return m;}
// hanging fabric (curtains, coats, towels): a plane with gathered folds
function hangGeo(w,h,folds,depth=.05,flare=.15){const g=new T.PlaneGeometry(w,h,Math.max(8,folds*6),8);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),t=(h/2-y)/h;p.setXYZ(i,x*(1+t*flare),y,Math.sin(x/w*folds*TAU)*depth*(.6+t*.6)+rand(-.004,.004));}g.translate(0,-h/2,0);g.computeVertexNormals();return g;}
