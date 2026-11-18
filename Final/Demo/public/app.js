const concepts=['Freedom','Love','Curiosity','Home','Conflict'];
const el=id=>document.getElementById(id);
let selected='Freedom',mode='demo',liveAvailable=false,lastResult=null;
const options=el('options');

concepts.forEach(name=>{
  const b=document.createElement('button');b.type='button';b.className='concept';b.textContent=name;
  b.setAttribute('aria-pressed',String(name===selected));
  if(name===selected)b.classList.add('selected');
  b.addEventListener('click',()=>{selected=name;for(const btn of options.children){const active=btn.textContent===name;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));}});
  options.appendChild(b);
});
const demoBtn=el('demoMode'),liveBtn=el('liveMode');
function setMode(next){mode=next;demoBtn.classList.toggle('active',mode==='demo');liveBtn.classList.toggle('active',mode==='live');el('modeHint').textContent=mode==='demo'?'No API key needed; sample text is handwritten':'Two real AI calls; requires server API key';}
demoBtn.addEventListener('click',()=>setMode('demo'));
liveBtn.addEventListener('click',()=>setMode('live'));
fetch('/api/status').then(r=>r.json()).then(data=>{liveAvailable=data.live;el('modeStatus').textContent=data.live?'LIVE AI READY':'OFFLINE DEMO AVAILABLE';el('liveMode').disabled=!data.live;el('liveMode').title=data.live?'':'Set GEMINI_API_KEY and restart the server to enable live AI';}).catch(()=>{el('modeStatus').textContent='CONNECTION ERROR'});

function waveform(seed=1){let state=seed;const rand=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};let points=[];for(let i=0;i<=84;i++){const x=(640*i/84).toFixed(1),s=Math.sin(i*.46)*Math.sin(i*.11),a=(rand()-.5)*22;points.push(`${i?'L':'M'}${x} ${(45-(s*26+a)).toFixed(1)}`);}el('wavePath').setAttribute('d',points.join(' '));}
waveform(23);
function setText(id,text){el(id).textContent=text;}
let busy=false;
el('transmitBtn').addEventListener('click',async()=>{
 if(busy)return;busy=true;el('transmitBtn').disabled=true;setText('signalState','ENCRYPTING...');setText('signalMeta','PROCESSING');setText('decoderMeta','WAITING');
 setText('signalText','Preparing the transmission…');setText('primary','—');setText('evidence','—');setText('alternate','—');el('reveal').hidden=true;
 const clickedConcept=selected;
 try {
  const response=await fetch('/api/transmit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({concept:clickedConcept,mode})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||`Request failed: ${response.status}`);
  lastResult=data;
  setText('signalText',data.signal);setText('primary',data.interpretation);setText('evidence',data.evidence);setText('alternate',data.alternate);setText('original',clickedConcept);
  setText('signalMeta',data.mode==='demo'?'HANDWRITTEN EXAMPLE':'LIVE GEMINI RESULT');
  setText('decoderMeta',data.mode==='demo'?'SIMULATED INTERPRETATION':'INDEPENDENT AI CALL');
  setText('signalState',data.mode==='demo'?'SAMPLE RECEIVED':'TRANSMISSION DECODED');
  el('reveal').hidden=false;
  let seed=0;for(const c of data.signal)seed=((seed*31)+c.charCodeAt(0))>>>0;waveform(seed||1);
 }catch(e){setText('signalState','TRANSMISSION FAILED');setText('signalText',`Error: ${e.message}`);setText('signalMeta','ERROR');}
 finally{busy=false;el('transmitBtn').disabled=false;}
});
el('copyBtn').addEventListener('click',async()=>{
 if(!lastResult)return;
 const d=lastResult;const text=`THE LAST SIGNAL — PROTOTYPE 1\nMode: ${d.mode} (${d.model})\nIntended concept: ${d.concept}\n\nTransmission:\n${d.signal}\n\nInterpretation:\n${d.interpretation}\n\nEvidence:\n${d.evidence}\n\nAlternative:\n${d.alternate}\n\nResearch note: This is a simulated unknown recipient, not a real extraterrestrial intelligence.`;
 try{await navigator.clipboard.writeText(text);el('copyBtn').textContent='Copied to clipboard ✓';setTimeout(()=>{el('copyBtn').textContent='Copy this experiment ↗'},2000)}catch{el('copyBtn').textContent='Copy failed; select the text manually.'}
});
