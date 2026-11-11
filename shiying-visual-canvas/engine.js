// Deterministic interaction prototype. All rankings use curated descriptors.
// No target-id checks or target-specific rank boosts are used here.
const U=a=>[...new Set(a)],P=id=>LIBRARY.find(p=>p.id===id);
LIBRARY.forEach(p=>{const t=p.tags;t.scene=t.scene||[];if(t.scene.some(x=>['室内','影棚','桌面','工作室','图书馆','咖啡馆','酒吧','攀岩馆'].includes(x)))t.scene=U([...t.scene,'室内']);else if(t.scene.some(x=>['自然','城市','街头','海边','森林','户外','山地','草地','湖边'].includes(x)))t.scene=U([...t.scene,'户外']);if(t.color.includes('多彩'))t.element=U([...t.element,'彩色形状']);if(t.background.some(x=>x.includes('木'))||t.texture.includes('木质'))t.texture=U([...t.texture,'木质']);if(t.subject.includes('攀岩'))t.action=U([...t.action,'运动','攀爬']);});
const FEATURES=[
['indoor','室内',['scene'],['室内'],/室内|屋里|房间里|馆里|在里面|健身房/],
['outdoor','户外',['scene'],['户外'],/户外|室外|外面|露天/],
['wall','墙面',['background','subject'],['墙面'],/墙面|一面墙|墙上|墙壁|背景是墙/],
['wood','木质背景',['background','texture'],['木墙','木质'],/木头|木墙|木板|木质|浅木|木色/],
['colourful','彩色形状',['element','color'],['彩色形状','多彩'],/彩色|五颜六色|很多颜色|好多颜色|色彩很多|颜色很多/],
['dots','岩点／彩色抓点',['background','element'],['彩色岩点','岩点'],/岩点|抓点|攀岩点|攀岩块|石头块|凸起的点|凸起的东西/],
['climbing','攀爬动作',['subject','action'],['攀岩','攀爬'],/攀岩|攀爬|在爬|往上爬|爬墙|爬的/],
['sport','运动',['style','action','subject'],['运动','运动员'],/运动|锻炼|健身/],
['person','人物',['subject'],['人','人物'],/有人|个人|一个人|人物|人像|人正在/],
['single','单人',['count'],['单人'],/一个人|单人|只有一人|就一个|只有一个/],
['crowd','多人',['count'],['多人'],/很多人|人群|多人|好几个人|两个人/],
['blackclothes','深色衣服',['clothes'],['深色衣服','黑色衣服'],/黑衣|深色衣|黑色衣|穿黑|衣服.{0,3}(黑|深)|黑色背心|黑色上衣|深色上衣/],
['redclothes','红色衣服',['clothes'],['红色衣服'],/红衣|红色衣|穿红|红色上衣/],
['whiteclothes','白色衣服',['clothes'],['白色衣服'],/白衣|白色衣|穿白/],
['blueclothes','蓝色衣服',['clothes'],['蓝色衣服'],/蓝衣|蓝色衣|穿蓝/],
['trousers','长裤',['clothes'],['长裤','黑色长裤','深色长裤','蓝色长裤','粉色长裤'],/长裤|长的裤子/],
['sleeveless','无袖上衣',['clothes'],['无袖'],/无袖|背心|没袖子|没有袖子/],
['rope','绳索',['element','background'],['绳索'],/绳子|绳索|一根绳|有根绳|吊绳/],
['harness','安全带',['element','clothes'],['安全带','黄色安全带'],/安全带|腰带|吊带/],
['yellowharness','黄色安全带',['element','clothes'],['黄色安全带'],/黄色.{0,3}(安全带|腰带)|腰.{0,3}黄色/],
['lowangle','从下往上拍',['angle','composition'],['仰拍','仰视'],/仰拍|仰视|从下往上|下面拍|低角度|往上拍/],
['topangle','从上往下拍',['angle','composition'],['俯拍','俯视'],/俯拍|俯视|上面拍|从上往下/],
['right','人物偏右',['layout','composition'],['人物偏右'],/右边|右侧|偏右/],
['left','人物偏左',['layout','composition'],['人物偏左'],/左边|左侧|偏左/],
['sparse','画面较疏朗',['layout','composition'],['留白较多','岩点较疏','留白'],/疏朗|没那么挤|不太挤|留白|空一点|空白多|点没那么多|点比较少|稀疏/],
['dense','画面密集',['layout','composition'],['岩点密集','画面较满','重复'],/密集|拥挤|太挤|密密麻麻|好多点|很多点/],
['full','全身／较远',['shot','composition'],['全身','远景','中景'],/全身|远一点|离得远|整个人|头到脚/],
['portrait','肖像近景',['style','layout'],['肖像','肖像近景'],/肖像|大头照|脸部特写|只有脸/],
['vertical','竖构图',['composition'],['竖构图'],/竖构图|竖着拍|竖版|竖图/],
['lightbg','浅色背景',['background','color'],['浅色背景','浅色','米色','浅棕色'],/浅色背景|浅色的墙|米色|浅棕色|米黄色|浅色墙/],
['dark','暗背景',['background','color'],['深色背景','深色','黑色'],/暗背景|黑背景|背景很暗/],
['blue','蓝色',['color'],['蓝色','青色'],/蓝色|蓝的|兰色/],
['red','红色',['color'],['红色'],/红色|红的/],
['green','绿色',['color'],['绿色'],/绿色|绿的/],
['yellow','黄色',['color'],['黄色'],/黄色|黄的/],
['warm','暖色调',['color','light'],['暖色','金色光'],/暖色|暖暖|暖光|偏暖/],
['cool','冷色调',['color'],['冷色'],/冷色|偏冷|冷光/],
['nature','自然风景',['scene','style'],['自然','风光'],/风景|自然景|山水|森林/],
['abstract','抽象影像',['style','composition'],['抽象','实验'],/抽象|不像真的|实验影像|颜料/],
['night','夜晚',['scene','time'],['夜晚','雨夜'],/夜晚|晚上|夜景/],
['animal','动物',['subject'],['动物'],/动物|猫|狗|水母/],
['shadow','影子',['element','background'],['影子'],/影子|阴影/]
].map(([id,label,keys,values,re])=>({id,label,keys,values,re}));
function featureMatch(p,f){return f.keys.some(k=>(p.tags[k]||[]).some(t=>f.values.includes(t)))}
function parseMemory(text){const result=[];const chunks=text.split(/[，。；,;！!？?\n]|但是|但|不过/).map(s=>s.trim()).filter(Boolean);for(const chunk of chunks){const negative=/不要|不是|不在|排除|并非|没有人|不要这么/.test(chunk)&&!/没那么挤|不太挤|没有袖子/.test(chunk);let hits=FEATURES.filter(f=>f.re.test(chunk));if(hits.some(f=>f.id.endsWith('clothes')))hits=hits.filter(f=>!['red','blue','yellow'].includes(f.id));if(hits.some(f=>f.id==='yellowharness'))hits=hits.filter(f=>!['yellow','harness'].includes(f.id));if(/人没那么多|不是人群|不是很多人/.test(chunk))hits=[FEATURES.find(f=>f.id==='crowd')];hits.forEach(f=>{let mode=negative?'exclude':/必须|一定|确定|只要|肯定/.test(chunk)?'must':'prefer';if(/人没那么多/.test(chunk)&&f.id==='crowd')mode='exclude';result.push({...f,mode,raw:chunk})})}return result.filter((f,i,a)=>a.findIndex(x=>x.id===f.id&&x.mode===f.mode)===i)}
const ASPECTS={color:{label:'颜色',keys:['color'],weight:5},background:{label:'背景',keys:['background','texture','scene','element'],weight:7},subject:{label:'主体与动作',keys:['subject','action','count','clothes'],weight:7},layout:{label:'构图',keys:['composition','angle','shot','layout'],weight:5}};
function referenceScore(p,r){const a=ASPECTS[r.aspect],ref=P(r.id);if(!a||!ref)return 0;let sum=0,n=0;for(const key of a.keys){const av=ref.tags[key]||[],bv=p.tags[key]||[];if(!av.length)continue;sum+=av.filter(x=>bv.includes(x)).length/Math.max(av.length,bv.length,1);n++}return n?sum/n*a.weight:0}
function rankLibrary(state){const all=LIBRARY.filter(p=>!state.dismissed.includes(p.id));const hard=state.clues.filter(c=>c.mode==='must'),neg=state.clues.filter(c=>c.mode==='exclude'),soft=state.clues.filter(c=>c.mode==='prefer');const score=p=>{let s=0,reasons=[];for(const f of state.clues){const yes=featureMatch(p,f);if(f.mode==='exclude'){if(yes)s-=13;else s+=1}else if(yes){s+=f.mode==='must'?14:6;reasons.push(f.label)}}for(const r of state.refs){const v=referenceScore(p,r);s+=v;if(v>1.5)reasons.push('参考图的'+ASPECTS[r.aspect].label)}return{p,score:s,reasons:[...new Set(reasons)].slice(0,4)}};const exact=all.filter(p=>hard.every(f=>featureMatch(p,f))&&neg.every(f=>!featureMatch(p,f)));const relaxed=!exact.length&&all.length>0;const pool=relaxed?all:exact;const ranked=pool.map(score).sort((a,b)=>b.score-a.score||((a.p.id*53+17)%127)-((b.p.id*53+17)%127));const allSoft=pool.filter(p=>soft.every(f=>featureMatch(p,f)));return{items:ranked,eligible:exact.length,allSoft:allSoft.length,total:LIBRARY.length,relaxed}}
const RecallEngine={parseMemory,rankLibrary,featureMatch};
