const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'../../fifthcorner.html'),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const noop=()=>{};
const ctxStub=new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop:noop}):k==='measureText'?()=>({width:10}):noop,set:()=>true});
const el=()=>({textContent:'',innerHTML:'',style:{},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,
  getContext:()=>ctxStub,width:0,height:0,requestPointerLock:noop});
const els={};
global.document={getElementById:id=>els[id]||(els[id]=el()),createElement:()=>el(),addEventListener:noop,pointerLockElement:null,exitPointerLock:noop};
global.window=global; global.innerWidth=1280; global.innerHeight=800; global.devicePixelRatio=1;
global.addEventListener=noop; global.requestAnimationFrame=noop;
new Function(code)();
module.exports=global.__FC;
