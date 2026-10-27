
/* ================= REAL ASSETS (Poly Haven, CC0) ================= */
// Scanned PBR texture sets drive the architecture and every custom-built prop, so the things we
// had to make ourselves are built from the same measured surfaces as the professional models.
const ASSET_ROOT='assets/';
const LM=new T.LoadingManager();
const texLoader=new T.TextureLoader(LM);
const gltfLoader=new T.GLTFLoader(LM);
const TEXSET={},MODELS={};
LM.onProgress=(url,done,total)=>{const k=done/total;const b=$('loadbar');if(b)b.firstChild.style.width=(k*100).toFixed(1)+'%';$('loadmsg').textContent=k<1?'Unpacking the house  '+Math.round(k*100)+'%':'';};
function loadTex(url,srgb){return new Promise(res=>{texLoader.load(url,t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,maxAniso);if(srgb)t.encoding=T.sRGBEncoding;res(t);},undefined,()=>{console.warn('missing texture',url);res(null);});});}
async function loadTexSet(id){const [d,n,a]=await Promise.all([loadTex(`${ASSET_ROOT}tex/${id}_diff.jpg`,true),loadTex(`${ASSET_ROOT}tex/${id}_nor.jpg`),loadTex(`${ASSET_ROOT}tex/${id}_arm.jpg`)]);TEXSET[id]={d,n,a};}
async function loadTreeTex(){const p=`${ASSET_ROOT}models/fir_tree_01/textures/fir_tree_01_`;const [d,n,a]=await Promise.all([loadTex(p+'bark_diff_1k.jpg',true),loadTex(p+'bark_nor_gl_1k.jpg'),loadTex(p+'bark_arm_1k.jpg')]);TEXSET.bark={d,n,a};
  TEXSET.twigRef=await loadTex(p+'twig_diff_1k.jpg',true);}
function loadModel(id){return new Promise(res=>{gltfLoader.load(`${ASSET_ROOT}models/${id}/${id}.gltf`,g=>{const s=g.scene;s.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const m=o.material;if(m&&m.map)m.map.anisotropy=Math.min(8,maxAniso);if(m&&/glass/i.test(m.name)){m.transparent=true;m.opacity=.25;m.roughness=.05;m.depthWrite=false;}}});MODELS[id]=s;res(s);},undefined,e=>{console.warn('missing model',id,e);res(null);});});}
// a scanned surface; rep is metres per texture tile, so different shapes keep the real scale
const pbrCache=new Map();
function pbr(id,{tile=2,color=0xffffff,rough=1,metal=null,normal=1,side,key=''}={}){
  const ck=id+tile+color+rough+metal+normal+(side||'')+key;if(pbrCache.has(ck))return pbrCache.get(ck);
  const S_=TEXSET[id];if(!S_){const m=plain(color,.8);pbrCache.set(ck,m);return m;}
  const clone=t=>{if(!t)return null;const c=t.clone();c.needsUpdate=true;c.repeat.set(1/tile,1/tile);return c;};
  const m=new T.MeshStandardMaterial({map:clone(S_.d),normalMap:clone(S_.n),roughnessMap:clone(S_.a),metalnessMap:metal===null?clone(S_.a):null,color,roughness:rough,metalness:metal===null?1:metal});
  m.normalScale.set(normal,-normal);if(side)m.side=side;pbrCache.set(ck,m);return m;}
// an instance of a loaded model, with an optional size check (real-world metres along y)
function model(id,{h,scale=1,tint}={}){const src=MODELS[id];if(!src)return grp();const o=src.clone(true);
  if(h){const b=new T.Box3().setFromObject(o);const k=h/(b.max.y-b.min.y);o.scale.setScalar(k);}else if(scale!==1)o.scale.setScalar(scale);
  if(tint)o.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.multiply(new T.Color(tint));}});
  const g=grp();g.add(o);return g;}
// set a model on the floor at (x,z): finds its footprint, adds a collider and blocks AI cells
function putModel(id,x,z,r=0,opt={}){const g=model(id,opt);if(opt.y)g.children[0].position.y+=opt.y;if(opt.lift!==false){g.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g);g.children[0].position.y-=b.min.y-(opt.y||0);}
  return place(g,x,z,r,{col:opt.col!==false,block:opt.block!==false,pad:opt.pad||0});}
// put a small model on a surface at height y
function setModel(id,x,y,z,r=0,opt={}){const g=model(id,opt);g.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g);g.children[0].position.y-=b.min.y;g.position.set(x,y,z);g.rotation.y=r;scene.add(g);return g;}
const ASSET_LIST=()=>fetch(`${ASSET_ROOT}manifest.json`).then(r=>r.json());
async function loadAssets(){
  let man;try{man=await ASSET_LIST();}catch(e){throw new Error('The asset bundle is missing. Run tools/fetch_assets.py.');}
  await Promise.all([...man.textures.map(loadTexSet),loadTreeTex(),...man.models.map(loadModel)]);
}
