const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORAGE_KEY = "mundoMamiferosProgressV1";
const achievementDefs = [
  { id:"starter", icon:"🧭", name:"Explorador iniciante", desc:"Inicie sua primeira aventura." },
  { id:"friend", icon:"🐾", name:"Amigo dos mamíferos", desc:"Descubra informações sobre três mamíferos diferentes." },
  { id:"master", icon:"🌳", name:"Mestre da floresta", desc:"Complete um desafio de exploração." },
  { id:"driver", icon:"🏁", name:"Piloto selvagem", desc:"Faça 100 pontos no minigame Fuga Selvagem." }
];
const defaultProgress = { achievements:[], discoveries:[], bestScore:0, challengeDone:false };
let progress = loadProgress();
let currentAnimal = "onca";
function loadProgress(){ try { return {...defaultProgress,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}; } catch { return {...defaultProgress}; } }
function saveProgress(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {} updateAchievements(); }
function unlock(id){ if(!progress.achievements.includes(id)){ progress.achievements.push(id); saveProgress(); } }
function updateAchievements(){
  if(progress.discoveries.length>=3 && !progress.achievements.includes("friend")) progress.achievements.push("friend");
  if(progress.challengeDone && !progress.achievements.includes("master")) progress.achievements.push("master");
  if(progress.bestScore>=100 && !progress.achievements.includes("driver")) progress.achievements.push("driver");
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); } catch {}
  const count=progress.achievements.length;
  $("#achievementCount").textContent=`${count}/4`;
  $("#progressText").textContent=`${count} de 4 conquistas`;
  $("#progressBar").style.width=(count/4*100)+"%";
  $("#achievementList").innerHTML="";
  achievementDefs.forEach(a=>{
    const done=progress.achievements.includes(a.id);
    const article=document.createElement("article");
    article.className="achievement "+(done?"unlocked":"locked");
    const icon=document.createElement("div"); icon.className="achievement-icon"; icon.textContent=a.icon;
    const copy=document.createElement("div");
    const title=document.createElement("h3"); title.textContent=a.name;
    const desc=document.createElement("p"); desc.textContent=a.desc;
    const state=document.createElement("span"); state.className="state"; state.textContent=done?"✓ Desbloqueada":"🔒 Bloqueada";
    copy.append(title,desc,state); article.append(icon,copy); $("#achievementList").append(article);
  });
}
function showView(name){
  $$(".view").forEach(v=>v.classList.add("hidden"));
  const target=$("#view-"+name); if(target) target.classList.remove("hidden");
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("#animalModal").classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
  if(name==="game") drawGame();
}
$("#startAdventure").addEventListener("click",()=>{
  $("#welcome").classList.add("hidden"); $("#mainMenu").classList.remove("hidden");
  unlock("starter"); showView("habitat");
});
$("#brandHome").addEventListener("click",e=>{e.preventDefault();showView("habitat")});
$$(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$$("[data-view]").filter(b=>!b.classList.contains("tab")).forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
const animalInfo={
  onca:{emoji:"🐆",title:"Onça-pintada",text:"A onça-pintada é o maior felino das Américas. Ela tem mandíbulas fortes, nada muito bem e ajuda a manter o equilíbrio da floresta. Se encontrar uma na natureza, admire de longe e nunca tente se aproximar."},
  tigre:{emoji:"🐅",title:"Tigre",text:"O tigre vive na Ásia e suas listras são diferentes das de qualquer outro tigre. Ele é um ótimo nadador e precisa de grandes áreas naturais para viver. A onça-pintada vive nas Américas; o tigre não é nativo da Amazônia."}
};
$$(".animal-panel").forEach(btn=>btn.addEventListener("click",()=>{
  currentAnimal=btn.dataset.animal; const a=animalInfo[currentAnimal];
  $("#animalModalEmoji").textContent=a.emoji; $("#animalModalTitle").textContent=a.title; $("#animalModalText").textContent=a.text;
  $("#animalModal").classList.remove("hidden");
}));
$("#closeAnimalModal").addEventListener("click",()=>$("#animalModal").classList.add("hidden"));
$("#animalModal").addEventListener("click",e=>{if(e.target.id==="animalModal") e.currentTarget.classList.add("hidden")});
$("#animalChallenge").addEventListener("click",()=>{progress.challengeDone=true;saveProgress();$("#animalModal").classList.add("hidden");showView("achievements")});

const mapPoints={
 camp:{icon:"🏕️",title:"Acampamento base",text:"Sua expedição começa aqui. Revise o guia, veja as conquistas e escolha a próxima trilha.",open:true,action:"habitat",label:"Voltar ao início"},
 jaguar:{icon:"🐆",title:"Trilha da onça",text:"Aprenda sobre a onça-pintada e outros felinos. Observe sem perturbar os animais.",open:true,action:"habitat",label:"Explorar felinos"},
 river:{icon:"🦫",title:"Rio tranquilo",text:"Os rios são importantes para muitos mamíferos, como capivaras e botos. Descubra mais usando a identificação por foto.",open:true,action:"identify",label:"Identificar mamíferos"},
 canopy:{icon:"🌳",title:"Mirante das copas",text:"Muitas espécies usam as árvores para encontrar alimento, abrigo e caminhos pela floresta.",open:true,action:"identify",label:"Começar descoberta"},
 deep:{icon:"🔒",title:"Mata profunda",text:"Esta área fica disponível depois de completar um desafio de exploração.",open:false,action:"game",label:"Completar desafio"}
};
$$(".map-point").forEach(btn=>btn.addEventListener("click",()=>{
 const p=mapPoints[btn.dataset.point], open=p.open || progress.challengeDone;
 $("#mapDetail").replaceChildren();
 const icon=document.createElement("div");icon.className="detail-icon";icon.textContent=open?p.icon:"🔒";
 const h=document.createElement("h3");h.textContent=open?p.title:"Área bloqueada";
 const text=document.createElement("p");text.textContent=open?p.text:"Complete um desafio de exploração para abrir esta trilha.";
 $("#mapDetail").append(icon,h,text);
 if(open){const action=document.createElement("button");action.className="btn btn-gold";action.textContent=p.label;action.addEventListener("click",()=>showView(p.action));$("#mapDetail").append(action);}
}));

const audio=$("#jaguarAudio"), roarBtn=$("#roarButton");
roarBtn.addEventListener("click",async()=>{
 if(!audio.paused){audio.pause();audio.currentTime=0;roarBtn.classList.remove("is-playing");roarBtn.textContent="🔊 Ouvir rugido da onça";return;}
 try{
   audio.currentTime=0; await audio.play(); roarBtn.classList.add("is-playing");roarBtn.textContent="🔊 Parar áudio";
 }catch{
   const message=document.createElement("p");message.className="message";message.textContent="Não consegui carregar o áudio agora. Confira a conexão e tente novamente.";
   const old=$(".audio-message");if(old)old.remove();message.classList.add("audio-message");roarBtn.insertAdjacentElement("afterend",message);
 }
});
audio.addEventListener("ended",()=>{roarBtn.classList.remove("is-playing");roarBtn.textContent="🔊 Ouvir rugido da onça"});
audio.addEventListener("error",()=>{roarBtn.classList.remove("is-playing");roarBtn.textContent="🔊 Ouvir rugido da onça"});

// Identificação de mamíferos — mantém a rota e o formato do backend existentes.
const photoInput=$("#photoInput"), photoPreview=$("#photoPreview");
let selectedPhoto=null;
photoInput.addEventListener("change",()=>{
 selectedPhoto=photoInput.files?.[0]||null;
 $("#identifyResult").classList.add("hidden");$("#identifyMessage").classList.add("hidden");
 if(!selectedPhoto)return;
 if(!selectedPhoto.type.startsWith("image/")){showIdentifyMessage("Escolha um arquivo de imagem.");selectedPhoto=null;return;}
 photoPreview.src=URL.createObjectURL(selectedPhoto);photoPreview.classList.remove("hidden");
});
function showIdentifyMessage(text,loading=false){const el=$("#identifyMessage");el.textContent=text;el.classList.remove("hidden");el.classList.toggle("loading",loading);}
function fileAsJpeg(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const canvas=document.createElement("canvas");const scale=Math.min(1,1280/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL("image/jpeg",.88).split(",")[1]);};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Não consegui abrir essa foto."));};img.src=url;
 });
}
$("#identifyButton").addEventListener("click",async()=>{
 if(!selectedPhoto){showIdentifyMessage("📸 Escolha uma foto primeiro!");return;}
 $("#identifyResult").classList.add("hidden");showIdentifyMessage("🔎 O explorador está observando a foto...",true);
 try{
  const base64=await fileAsJpeg(selectedPhoto);
  const pedido={modelo:"gemini-3.6-flash",body:{contents:[{parts:[{text:"Você é um especialista em mamíferos. Observe a foto e identifique o mamífero somente se houver evidências suficientes. Não chute. Se não tiver certeza ou não for mamífero, identificado deve ser false e confiança menor que 80. Retorne nome, curiosidades curtas em português e se pode ser perigoso."},{inline_data:{mime_type:"image/jpeg",data:base64}}]}],generationConfig:{temperature:.2,responseMimeType:"application/json",responseSchema:{type:"object",properties:{identificado:{type:"boolean"},confianca:{type:"integer"},nome:{type:"string"},curiosidades:{type:"string"},perigoso:{type:"boolean"}},required:["identificado","confianca"]}}}};
  const response=await fetch("/api/identificar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pedido)});
  if(!response.ok)throw new Error("Servidor indisponível");
  const responseData=await response.json();
  const raw=responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!raw)throw new Error("Resposta vazia");
  const data=JSON.parse(raw);
  if(data.identificado!==true || !Number.isFinite(Number(data.confianca)) || Number(data.confianca)<80){showIdentifyMessage("🐾 Hmm, não consegui ter certeza. Tente outra foto mais nítida!");return;}
  $("#resultName").textContent="🐾 "+(data.nome||"Mamífero");
  $("#resultConfidence").textContent=String(Number(data.confianca));
  $("#resultFacts").textContent=data.curiosidades||"Ainda não temos curiosidades sobre este animal.";
  $("#resultSafety").classList.toggle("hidden",data.perigoso!==true);
  $("#identifyMessage").classList.add("hidden");$("#identifyResult").classList.remove("hidden");
  const normalized=(data.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(normalized && !progress.discoveries.includes(normalized)){progress.discoveries.push(normalized);saveProgress();}
 }catch(err){showIdentifyMessage("😕 Não consegui analisar a foto agora. Confira a conexão e tente novamente.");}
});

// Minigame canvas
const canvas=$("#gameCanvas"),ctx=canvas.getContext("2d");
const W=canvas.width,H=canvas.height;
let game={running:false,paused:false,over:false,lane:1,score:0,speed:3,obstacles:[],ticks:0,last:0,raf:0,keys:{}};
$("#bestScore").textContent=progress.bestScore;
function drawRoad(){
 ctx.fillStyle="#183b26";ctx.fillRect(0,0,W,H);
 // forest silhouettes
 for(let i=0;i<18;i++){let x=(i*97+game.ticks*.12)%W,y=(i*67)%H;ctx.fillStyle=i%2?"#245331":"#0d2819";ctx.beginPath();ctx.arc(x,y,34+(i%3)*10,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle="#4b4b3b";ctx.beginPath();ctx.moveTo(145,0);ctx.lineTo(575,0);ctx.lineTo(690,H);ctx.lineTo(30,H);ctx.closePath();ctx.fill();
 ctx.fillStyle="#68614a";ctx.beginPath();ctx.moveTo(175,0);ctx.lineTo(545,0);ctx.lineTo(630,H);ctx.lineTo(90,H);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#e6d5a3a8";ctx.lineWidth=5;ctx.setLineDash([34,28]);
 for(let x of [315,405]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(x-360)*.85,H);ctx.stroke();}
 ctx.setLineDash([]);
 // roadside plants
 for(let i=0;i<12;i++){const y=(i*95+game.ticks*2.2)%H;ctx.font="30px serif";ctx.fillText(i%2?"🌿":"🌱",45+(i%3)*18,y);ctx.fillText(i%2?"🌱":"🌿",W-80-(i%3)*15,y+20);}
}
function drawCar(x,y){
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle="#101712";ctx.beginPath();ctx.roundRect(-36,-47,72,95,15);ctx.fill();
 ctx.fillStyle="#c88c36";ctx.beginPath();ctx.roundRect(-29,-54,58,95,14);ctx.fill();
 ctx.fillStyle="#7fc1c4";ctx.beginPath();ctx.roundRect(-21,-32,42,25,7);ctx.fill();
 ctx.fillStyle="#f0d3a1";ctx.fillRect(-25,27,12,5);ctx.fillRect(13,27,12,5);
 ctx.font="32px serif";ctx.textAlign="center";ctx.fillText("🐆",0,10);
 ctx.restore();
}
function drawObstacle(o){
 const x=laneX(o.lane),y=o.y;
 ctx.save();ctx.translate(x,y);ctx.rotate(o.rot||0);
 if(o.type==="log"){ctx.fillStyle="#795332";ctx.beginPath();ctx.roundRect(-36,-15,72,30,12);ctx.fill();ctx.strokeStyle="#c59a62";ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.moveTo(-20,-8);ctx.lineTo(18,8);ctx.stroke();}
 else{ctx.fillStyle="#81847a";ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(29,15);ctx.lineTo(-27,18);ctx.closePath();ctx.fill();ctx.strokeStyle="#b7b7a5";ctx.lineWidth=3;ctx.stroke();}
 ctx.restore();
}
function laneX(lane){return [255,360,465][lane];}
function drawGame(){
 drawRoad();game.obstacles.forEach(drawObstacle);drawCar(laneX(game.lane),H-120);
}
function startGame(){
 cancelAnimationFrame(game.raf);game={...game,running:true,paused:false,over:false,lane:1,score:0,speed:3,obstacles:[],ticks:0,last:0,keys:{}};
 $("#score").textContent="0";$("#speedLabel").textContent="1×";$("#gameOverlay").classList.add("hidden");$("#crashOverlay").classList.add("hidden");$("#pauseButton").textContent="Ⅱ Pausar";drawGame();game.raf=requestAnimationFrame(loop);
}
function loop(timestamp){
 if(!game.running||game.paused)return;
 const dt=Math.min(32,timestamp-(game.last||timestamp));game.last=timestamp;game.ticks+=dt;
 game.speed=3+Math.min(5,game.score/80);game.score+=dt*.018;
 if(Math.random()<.018+game.speed*.0008)game.obstacles.push({lane:Math.floor(Math.random()*3),y:-30,type:Math.random()<.55?"log":"rock",rot:(Math.random()-.5)*.2});
 game.obstacles.forEach(o=>o.y+=game.speed*dt*.09);
 game.obstacles=game.obstacles.filter(o=>o.y<H+50);
 const carY=H-120;
 for(const o of game.obstacles){if(o.lane===game.lane&&Math.abs(o.y-carY)<52){endGame();return;}}
 $("#score").textContent=Math.floor(game.score);$("#speedLabel").textContent=(game.speed/3).toFixed(1)+"×";
 drawGame();game.raf=requestAnimationFrame(loop);
}
function endGame(){
 game.running=false;game.over=true;cancelAnimationFrame(game.raf);
 const score=Math.floor(game.score);$("#finalScore").textContent=score;$("#crashOverlay").classList.remove("hidden");
 if(score>progress.bestScore){progress.bestScore=score;saveProgress();$("#bestScore").textContent=score;}
 updateAchievements();
}
function moveLane(delta){if(!game.running||game.paused)return;game.lane=Math.max(0,Math.min(2,game.lane+delta));drawGame();}
$("#playButton").addEventListener("click",startGame);$("#againButton").addEventListener("click",startGame);
$("#pauseButton").addEventListener("click",()=>{
 if(!game.running&&!game.paused)return;
 game.paused=!game.paused;
 if(game.paused){cancelAnimationFrame(game.raf);$("#pauseButton").textContent="▶ Continuar";ctx.fillStyle="#06120b99";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 42px Arial";ctx.fillText("PAUSADO",W/2,H/2);}
 else{$("#pauseButton").textContent="Ⅱ Pausar";game.last=0;game.raf=requestAnimationFrame(loop);}
});
$("#leftControl").addEventListener("click",()=>moveLane(-1));$("#rightControl").addEventListener("click",()=>moveLane(1));
document.addEventListener("keydown",e=>{
 if(["ArrowLeft","ArrowRight","a","A","d","D"].includes(e.key)&&!$("#view-game").classList.contains("hidden"))e.preventDefault();
 if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A")moveLane(-1);
 if(e.key==="ArrowRight"||e.key==="d"||e.key==="D")moveLane(1);
 if(e.key==="Escape")$("#animalModal").classList.add("hidden");
});
let touchStartX=null;
canvas.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
canvas.addEventListener("touchend",e=>{if(touchStartX===null)return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>20)moveLane(dx<0?-1:1);touchStartX=null;},{passive:true});
window.addEventListener("resize",()=>{if(!$("#view-game").classList.contains("hidden")&&!game.running)drawGame();});
updateAchievements();drawGame();
