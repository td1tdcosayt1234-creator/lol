// FROSTPINE — canvas snow + leaves, theme, explorer, counters
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let W,H,parts=[],storm=0;
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
addEventListener('resize',resize);resize();
function theme(){return document.documentElement.dataset.theme||'aurora'}
function spawn(n){
  for(let i=0;i<n;i++){
    const t=theme();
    parts.push({
      x:Math.random()*W, y:Math.random()*-H,
      r:Math.random()*3+1, s:Math.random()*1.6+.4,
      o:Math.random()*.8+.2, ph:Math.random()*6.28,
      leaf: t==='forest' ? Math.random()<.45 : Math.random()<.12,
      col: t==='forest' ? (Math.random()<.5?'#4ade80':'#fef9c3') : (Math.random()<.5?'#fff':'#7ef0ff')
    });
  }
}
spawn(160);
let mx=0; addEventListener('mousemove',e=>{mx=(e.clientX/W-.5)*20;
  const g=document.getElementById('cursorGlow'); g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px';
});
(function loop(t){
  ctx.clearRect(0,0,W,H);
  const th=theme();
  // aurora glow
  if(th!=='forest'){
    const gr=ctx.createLinearGradient(0,0,W,0);
    gr.addColorStop(0,'rgba(56,189,248,.10)');gr.addColorStop(.5,'rgba(192,132,252,.14)');gr.addColorStop(1,'rgba(74,222,128,.10)');
    ctx.fillStyle=gr; ctx.fillRect(0,0,W,220+Math.sin(t/900)*30);
  }
  const wind = mx + Math.sin(t/2000)*.6 + storm*3;
  parts.forEach(p=>{
    p.y+=p.s+storm*4; p.x+=Math.sin(t/1000+p.ph)*.5+wind*.3;
    if(p.y>H){p.y=-10;p.x=Math.random()*W}
    ctx.globalAlpha=p.o;
    ctx.fillStyle=p.col;
    ctx.beginPath();
    if(p.leaf){ctx.ellipse(p.x,p.y,p.r+1.5,p.r, p.ph+t/2000,0,6.28)}
    else{ctx.arc(p.x,p.y,p.r,0,6.28)}
    ctx.fill();
  });
  ctx.globalAlpha=1;
  if(storm>0)storm-=.005;
  requestAnimationFrame(loop);
})(0);

// theme
function setTheme(v){
  document.documentElement.dataset.theme=v;
  document.querySelectorAll('.theme-switch button').forEach(b=>b.classList.toggle('active',b.dataset.setTheme===v));
  parts=[];spawn(160);
}
window.setTheme=setTheme;
document.querySelectorAll('[data-set-theme]').forEach(b=>b.onclick=()=>setTheme(b.dataset.setTheme));
addEventListener('keydown',e=>{
  if(e.key==='f'||e.key==='F')setTheme('forest');
  if(e.key==='i'||e.key==='I')setTheme('ice');
  if(e.key==='a'||e.key==='A')setTheme('aurora');
});

// counters
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');
  e.target.querySelectorAll('[data-count]').forEach(el=>{
    if(el.dataset.done)return;el.dataset.done=1;
    const end=parseInt((el.dataset.count||'').replace(/[^0-9]/g,''))||0;
    let s=0;const step=Math.max(1,Math.floor(end/60));
    const iv=setInterval(()=>{s+=step;if(s>=end){s=end;clearInterval(iv)} el.textContent=s.toLocaleString()},30);
  });
}}),{threshold:.2});
document.querySelectorAll('.reveal,.hero-stats').forEach(el=>io.observe(el));
setTimeout(()=>document.querySelectorAll('#realms .reveal,#creatures .reveal,#seasons .reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('vis'),i*120)),400);

// tilt
document.querySelectorAll('.tilt').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

// explorer slider
const slider=document.getElementById('tempSlider'), scene=document.getElementById('scene'),
sceneTemp=document.getElementById('sceneTemp'), sceneLabel=document.getElementById('sceneLabel'),
tempVal=document.getElementById('tempVal'), windVal=document.getElementById('windVal'),
snowVal=document.getElementById('snowVal'), auroraVal=document.getElementById('auroraVal'),
ground=document.getElementById('sceneGround'), trees=document.getElementById('sceneTrees'),
sun=document.getElementById('sceneSun');
function fmt(v){return (v>0?'+':'')+v+'°C'}
function updateScene(){
  const v=parseInt(slider.value);
  tempVal.textContent=fmt(v); sceneTemp.textContent=fmt(v);
  let label,bg,gh;
  if(v<=-12){label='❄ Blizzard Night';bg='linear-gradient(180deg,#020617,#1e1b4b 55%,#e0f2fe)';gh='linear-gradient(180deg,#fff,#bae6fd)';trees.textContent='🌲❄️🌲❄️🌲❄️🌲';sun.textContent='🌙';setTheme('ice')}
  else if(v<0){label='🧊 Frozen Valley';bg='linear-gradient(180deg,#0b1e3a,#1e40af 55%,#e0f2fe)';gh='linear-gradient(180deg,#fff,#bae6fd)';trees.textContent='🌲🌲❄️🌲🌲❄️🌲';sun.textContent='⛅';}
  else if(v<=10){label='🌲 Melting Spring';bg='linear-gradient(180deg,#0b1e3a,#155e75 55%,#a7f3d0)';gh='linear-gradient(180deg,#d1fae5,#86efac)';trees.textContent='🌲🌲🌲🌲🌲🌲🌲';sun.textContent='☀️';}
  else{label='☀️ Green Summer';bg='linear-gradient(180deg,#0ea5e9,#16a34a 60%,#fef9c3)';gh='linear-gradient(180deg,#4ade80,#166534)';trees.textContent='🌳🌲🌳🌲🌳🌲🌳';sun.textContent='☀️';setTheme('forest')}
  scene.style.background=bg; ground.style.background=gh; sceneLabel.textContent=label;
  windVal.textContent=Math.max(4,Math.round(30-Math.abs(v)*1.1))+' km/h';
  snowVal.textContent=Math.max(0,Math.round(60-v*3))+' cm';
  auroraVal.textContent=v<2?(v<-10?'Extreme 🌌':'Strong 🌌'):(v<10?'Faint ✨':'None ☀️');
}
slider.addEventListener('input',updateScene);updateScene();
document.getElementById('snowBurst').onclick=()=>{storm=1.6;spawn(120);
  const b=document.getElementById('snowBurst');b.textContent='❄ Snowstorm incoming...';setTimeout(()=>b.textContent='Trigger Snowstorm ❄',1800);
};

// clock
function clock(){const d=new Date();document.getElementById('clock').textContent=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}clock();setInterval(clock,10000);
