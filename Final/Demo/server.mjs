import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);
const KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const VALID = new Set(['Freedom', 'Love', 'Curiosity', 'Home', 'Conflict']);
const files = {'/': ['index.html','text/html; charset=utf-8'], '/style.css':['style.css','text/css; charset=utf-8'], '/app.js':['app.js','text/javascript; charset=utf-8']};
const recent = [];

const examples = {
  Freedom: [
    {signal: 'A circle of small stones surrounds one moving spark. Every stone holds its place, but there is no wall between them. The spark crosses the circle, travels toward an unmarked horizon, and returns by a different path. No stone follows it. None prevents its departure. The circle remains, open to the sky.', interpretation: 'A journey beyond a community’s boundaries, perhaps exploration or separation.', evidence: 'The moving spark leaves a group without resistance and chooses its own path.', alternate: 'The message may describe exile or the loss of a member.'},
    {signal:'A thousand identical lights move in perfect rows. One light slows, rotates, and follows a curve into an empty field. No collision occurs. Gradually three others choose distinct trajectories. The rows continue, but the sky now contains paths that do not repeat.', interpretation:'Independent movement emerging from a highly ordered system.', evidence:'Individual lights break formation and move in different directions.', alternate:'It could illustrate the breakdown of a coordinated machine.'}
  ],
  Love: [
    {signal:'Two dim points drift through an immense dark. When their paths cross, each carries away a little of the other’s light. They separate and travel in different directions. Neither fades. At each later crossing, the shared light grows, illuminating the empty space between them.', interpretation:'A lasting connection formed through repeated encounters.', evidence:'The points retain each other’s light even when separated.', alternate:'It could describe energy exchange between stars.'}
  ],
  Curiosity:[
    {signal:'Before the first mark, a flat surface stretches without interruption. A tiny object approaches a closed shape, circles it, and touches its edge. The shape opens to reveal another shape inside. The object moves closer. At every new boundary, it pauses, examines, and continues.', interpretation:'Exploration or a search for hidden structures.', evidence:'The object repeatedly approaches unfamiliar boundaries to discover what lies within.', alternate:'It may represent an automated inspection system.'}
  ],
  Home:[
    {signal:'Across a wide, changing field, many lights scatter in different directions. One small pattern remains fixed at the center. As the scattered lights grow faint, they turn toward the familiar pattern and gather nearby. The pattern does not capture them. It simply waits, visible through the distance.', interpretation:'Return to a familiar center or a shared origin.', evidence:'Separated lights orient toward a stable pattern.', alternate:'It could represent navigation by a beacon.'}
  ],
  Conflict:[
    {signal:'Two expanding rings travel across the same surface. Where they touch, their edges fold and distort. The ripples become jagged, and smaller rings scatter outward. Eventually both circles lose their shape. The surface settles, but a new fracture remains where the first contact occurred.', interpretation:'Opposing forces causing damage to one another and their surroundings.', evidence:'The two patterns deform each other at contact and leave a permanent fracture.', alternate:'It could simply depict wave interference or a natural collision.'}
  ]
};

function send(res, code, obj) {
  res.writeHead(code, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff' });
  res.end(JSON.stringify(obj));
}
function extractJson(s) {
  const raw = String(s || '').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try { return JSON.parse(raw); } catch {
    const start=raw.indexOf('{'), end=raw.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(raw.slice(start,end+1));
    throw new Error('The model returned an unexpected format. Please retry.');
  }
}
async function gemini(system, prompt, schema) {
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method:'POST', signal: controller.signal,
      headers: {'content-type':'application/json','x-goog-api-key':KEY},
      body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.85,maxOutputTokens:1000,responseMimeType:'application/json',responseSchema:schema}})
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error?.message || `API status ${response.status}`;
      throw new Error(`Gemini API ${response.status}: ${String(message).slice(0,240)}. Check your key, quota, and GEMINI_MODEL.`);
    }
    const text = (payload.candidates?.[0]?.content?.parts || []).map(p=>p.text || '').join('');
    if (!text) throw new Error('The model produced no text. Please retry.');
    return extractJson(text);
  } finally { clearTimeout(deadline); }
}
const encoderSchema = {type:'OBJECT',properties:{signal:{type:'STRING'}},required:['signal']};
const decoderSchema = {type:'OBJECT',properties:{interpretation:{type:'STRING'},evidence:{type:'STRING'},alternate:{type:'STRING'}},required:['interpretation','evidence','alternate']};
async function transmit(concept) {
  const encoderSystem = `You are a writer of speculative symbolic interstellar messages. Express the user's abstract concept as a 50–85 word concrete physical scene: shapes, positions, light, motion, and relationships. No people, no human names, no textual labels, no direct synonym or definition of the target idea. The output must be evocative yet interpretable. Respond only as JSON with a signal string.`;
  const encoded = await gemini(encoderSystem, `Target concept: ${concept}. Create the visual-symbolic message.`, encoderSchema);
  const signal = String(encoded.signal || '').trim().slice(0,1800);
  if (signal.length < 30) throw new Error('Encoder response was too short. Please retry.');
  // Experimental isolation: the second model call receives only the signal and a generic instruction.
  // Neither the original concept nor prior chat history is included.
  const decoderSystem = `You are a hypothetical receiver interpreting a symbolic transmission from an unknown sender. You do not know the sender's intent. Infer its meaning cautiously. Return three short strings in JSON: interpretation (one primary reading), evidence (one specific visual clue), alternate (one different plausible reading). Do not claim you are a real extraterrestrial intelligence.`;
  const decoded = await gemini(decoderSystem, `Interpret the following unknown transmission using only what it says:\n\n${signal}`, decoderSchema);
  return {signal,interpretation:String(decoded.interpretation || ''), evidence:String(decoded.evidence || ''),alternate:String(decoded.alternate || ''),mode:'live',model:MODEL};
}

const server = http.createServer(async (req,res) => {
  try {
    const host = req.headers.host || '';
    if (!/^((127\.0\.0\.1)|(localhost))(\:\d+)?$/i.test(host)) return send(res,403,{error:'Localhost only.'});
    const pathname = new URL(req.url,'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/api/status') return send(res,200,{live:!!KEY,model:MODEL});
    if (req.method === 'POST' && pathname === '/api/transmit') {
      if (req.headers.origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)) return send(res,403,{error:'Origin not permitted.'});
      if (!String(req.headers['content-type']||'').startsWith('application/json')) return send(res,415,{error:'JSON required.'});
      let body='';
      for await (const chunk of req) {body += chunk; if(body.length>8192) return send(res,413,{error:'Payload too large.'});}
      let args; try{args=JSON.parse(body)}catch{return send(res,400,{error:'Invalid JSON.'})}
      const concept=args.concept;
      if(!VALID.has(concept)) return send(res,400,{error:'Choose one of the five concepts.'});
      const mode=args.mode==='live'?'live':'demo';
      if(mode==='live' && !KEY) return send(res,400,{error:'Live mode requires GEMINI_API_KEY. Read README.md.'});
      const now=Date.now(); while(recent.length && recent[0]<now-60000) recent.shift();
      if(mode==='live' && recent.length>=6) return send(res,429,{error:'Limit: six live transmissions per minute.'});
      if(mode==='live') recent.push(now);
      const result=mode==='live'? await transmit(concept): {...examples[concept][Math.floor(Math.random()*examples[concept].length)],mode:'demo',model:'Handwritten example — no AI call'};
      return send(res,200,{concept,...result});
    }
    if(req.method!=='GET' || !files[pathname]) return send(res,404,{error:'Not found'});
    const [file,mime]=files[pathname];
    const data=await readFile(path.join(PUBLIC,file));
    res.writeHead(200,{'content-type':mime,'cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(data);
  } catch(e) { const message=e.name==='AbortError'?'The AI request timed out. Try again.':e.message; send(res,502,{error:message}); }
});
server.listen(PORT,'127.0.0.1',()=>console.log(`The Last Signal listening at http://127.0.0.1:${PORT}\nMode: ${KEY?'Live Gemini available':'Offline demo only'} | Model: ${MODEL}`));
