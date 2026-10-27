/* ================= SOUND DESIGN (all synthesized) ================= */
let ac=null; const S={};
function aInit(){
  if(ac){if(ac.state==='suspended')ac.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return; ac=new AC();
  S.master=ac.createGain();S.master.gain.value=settings.vol;
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=10;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.3;
  S.master.connect(comp);comp.connect(ac.destination);
  S.dry=ac.createGain();S.dry.connect(S.master);
  S.rev=ac.createConvolver();S.rev.buffer=impulse(3.6,2.4);S.revOut=ac.createGain();S.revOut.gain.value=.6;S.rev.connect(S.revOut);S.revOut.connect(S.master);
  S.white=noiseBuf(0);S.pink=noiseBuf(1);S.brown=noiseBuf(2);
  S.duck=ac.createGain();S.duck.connect(S.dry); // ambience bus that ducks during counting
  S.ambOn=false;
}
function noiseBuf(type){const len=ac.sampleRate*4,b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);let l=0,b0=0,b1=0,b2=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;if(type===0)d[i]=w;else if(type===1){b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;d[i]=(b0+b1+b2+w*.1848)*.16;}else{l=(l+.02*w)/1.02;d[i]=l*3.5;}}return b;}
function impulse(sec,dec){const len=ac.sampleRate*sec|0,b=ac.createBuffer(2,len,ac.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++){const t=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-t,dec)*(i<400?i/400:1)*(1+.4*Math.sin(i*.0007*(c+1)));}}return b;}
function route(node,send=.25,bus){node.connect(bus||S.dry);if(send>0){const g=ac.createGain();g.gain.value=send;node.connect(g);g.connect(S.rev);}return node;}
function setPos(p,x,y,z){if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z;}else p.setPosition(x,y,z);}
function spatial(x,y,z,{ref=1.6,roll=1.25,send=.3}={}){const p=ac.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=ref;p.rolloffFactor=roll;p.maxDistance=90;setPos(p,x,y,z);route(p,send);
  if(!HF.los(P.x,P.z,x,z,losBlocked)){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=520;const g=ac.createGain();g.gain.value=.75;f.connect(g);g.connect(p);const s2=ac.createGain();s2.gain.value=.25;g.connect(s2);s2.connect(S.rev);return f;}return p;}
function ear(pan=0,send=.15){const p=ac.createStereoPanner?ac.createStereoPanner():ac.createGain();if(p.pan)p.pan.value=pan;route(p,send);return p;}
function src(buf){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;return s;}
function nz(dest,t,dur,{buf,type='lowpass',f=800,fEnd,q=.7,g=.3,a=.005}={}){const s=src(buf||S.white);const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(fEnd)fl.frequency.exponentialRampToValueAtTime(fEnd,t+dur);fl.Q.value=q;const gn=ac.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+a);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(gn);gn.connect(dest);s.start(t,Math.random()*3);s.stop(t+dur+.05);return gn;}
function tone(dest,t,dur,{type='sine',f=100,fEnd,g=.3,a=.005,det=0,hold=0}={}){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t+dur);o.detune.value=det;const gn=ac.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+a);if(hold)gn.gain.setValueAtTime(g,t+a+hold);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn);gn.connect(dest);o.start(t);o.stop(t+dur+.05);return o;}
function shaper(amt){const ws=ac.createWaveShaper(),n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;c[i]=(1+amt)*x/(1+amt*Math.abs(x));}ws.curve=c;return ws;}
const midi=m=>440*Math.pow(2,(m-69)/12);
let voice=null;
function pickVoice(){if(!('speechSynthesis' in window))return;const vs=speechSynthesis.getVoices();voice=vs.find(v=>/Daniel|Fred|UK English Male|Alex|Ralph|David|Guy/i.test(v.name)&&/en/i.test(v.lang))||vs.find(v=>/en/i.test(v.lang))||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function say(text,pitch=.1,rate=.55,vol=1){if(!settings.voice||!('speechSynthesis' in window))return;try{const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;u.pitch=pitch;u.rate=rate;u.volume=vol*settings.vol;speechSynthesis.speak(u);}catch(e){}}

