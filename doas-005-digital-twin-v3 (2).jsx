import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// BLUE FRONTIER LD-DOAS DIGITAL TWIN v3.0
// DOAS-005 — Von's/Albertsons, Gardena CA
// Model: BFLDD1806SSB0SS | Serial: 2515AG2C2R2S2001 | 480V
//
// DUAL Sketchfab models: Closed (exterior) + Open (internal components)
// Real-time simulated sensor data overlay — ready for live API integration
// ============================================================================

const MODELS = {
  closed: { uid: "dc7bdeaef60d4c6d9f9e5370eaaaeaee", label: "Closed (Exterior)" },
  open:   { uid: "486fd8794ed84881a3fc23d87ab0d354", label: "Open (Internal)" },
};
const SF_API = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";

// --- SENSOR ENGINE ---
function useSensors() {
  const [d, setD] = useState(null);
  const b = useRef({
    SA_T:72, SA_DP:55, SA_RH:48, OA_T:88, OA_RH:62, OA_DP:72,
    SOD:38.2, TankLvl:72, BL:[78,76,79], FT:[680,665,690],
    P1:62, FM3:2.4, AD:[85,82,86], DCW:35, IECW:42,
    COMP:1, RBL:65, RP1:55, Dis:185, Suc:82, SH:12,
    CFM:2000, OAR:55, TgtConc:40, RegenTh:36,
    RegenSt:3, CondSt:5, kW:4.8, Water:18.2,
    CompH:14238, RunH:28456, Alm:0, Alt:0,
  });
  useEffect(() => {
    const j=(v,r)=>+(v+(Math.random()-.5)*r).toFixed(1);
    const ji=(v,r)=>Math.round(v+(Math.random()-.5)*r);
    const tick=()=>{const v=b.current; setD({
      ts:new Date().toISOString(), status:"Normal",
      c:{SA_T:j(v.SA_T,1.5),SA_DP:j(v.SA_DP,1),SA_RH:ji(v.SA_RH,3),OA_T:j(v.OA_T,2),OA_RH:ji(v.OA_RH,4),OA_DP:j(v.OA_DP,1.5),
        BL:v.BL.map(x=>ji(x,3)),FT:v.FT.map(x=>ji(x,15)),P1:ji(v.P1,4),FM3:j(v.FM3,.3),
        AD:v.AD.map(x=>ji(x,2)),DCW:ji(v.DCW,5),IECW:ji(v.IECW,5),st:v.CondSt},
      r:{comp:v.COMP,bl:ji(v.RBL,4),pump:ji(v.RP1,3),dis:ji(v.Dis,8),suc:ji(v.Suc,5),
        sh:j(v.SH,2),st:v.RegenSt,stL:["Idle","Startup","Warmup","Running","Cooldown","Shutdown"][v.RegenSt]||"?"},
      s:{sod:j(v.SOD,.4),lvl:ji(v.TankLvl,2),tgt:v.TgtConc,th:v.RegenTh},
      x:{cfm:v.CFM,oar:v.OAR,kw:j(v.kW,.6),water:j(v.Water,1.5),compH:v.CompH,runH:v.RunH,alm:v.Alm,alt:v.Alt},
      sp:Array.from({length:24},()=>({kw:j(v.kW,1.2),t:j(v.SA_T,2),sod:j(v.SOD,.8)})),
    });};
    tick(); const id=setInterval(tick,2500); return()=>clearInterval(id);
  },[]);
  return d;
}

// --- SPARKLINE ---
function Sp({data,color,w=108,h=22}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rg=mx-mn||1;
  return <svg width={w} height={h}><polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
    points={data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rg)*(h-4)-2}`).join(" ")} /></svg>;
}

// --- SENSOR DISPLAY ---
function V({label,value,unit,color}){
  return <div style={{background:"rgba(4,8,14,0.92)",borderLeft:`3px solid ${color}`,borderRadius:5,padding:"4px 7px",marginBottom:3}}>
    <div style={{fontSize:8,color:"#4a5a6a",textTransform:"uppercase",letterSpacing:.8,lineHeight:1}}>{label}</div>
    <div style={{fontSize:15,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.3}}>
      {value}<span style={{fontSize:9,color:"#3a4a5a",marginLeft:2}}>{unit}</span>
    </div>
  </div>;
}
function Tri({items,color}){
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginBottom:3}}>
    {items.map((t,i)=><div key={i} style={{textAlign:"center",background:`${color}0a`,borderRadius:4,padding:"2px 0"}}>
      <div style={{fontSize:7,color:"#4a5a6a"}}>{t.l}</div>
      <div style={{fontSize:12,fontWeight:700,color,fontFamily:"monospace"}}>{t.v}<span style={{fontSize:8,color:"#3a4a5a"}}>{t.u||""}</span></div>
    </div>)}
  </div>;
}

// --- SUBSYSTEM PANELS ---
function PanelCond({d,c}){return<>
  <V label="Supply Air Temp" value={d.SA_T} unit="°F" color={c}/>
  <V label="Supply Dewpoint" value={d.SA_DP} unit="°F" color={c}/>
  <V label="Outside Air Temp" value={d.OA_T} unit="°F" color={c}/>
  <V label="Outside Air RH" value={d.OA_RH} unit="%" color={c}/>
  <div style={{fontSize:8,color:"#3a4a5a",letterSpacing:1,margin:"5px 0 2px",borderTop:`1px solid ${c}12`,paddingTop:5}}>BLOWER SPEEDS</div>
  <Tri items={d.BL.map((v,i)=>({l:`CH${i+1}`,v:v,u:"%"}))} color={c}/>
  <div style={{fontSize:8,color:"#3a4a5a",letterSpacing:1,margin:"3px 0 2px"}}>AIRFLOW (CFM)</div>
  <Tri items={d.FT.map((v,i)=>({l:`CH${i+1}`,v}))} color={c}/>
  <div style={{fontSize:8,color:"#3a4a5a",letterSpacing:1,margin:"3px 0 2px"}}>DAMPER POSITION</div>
  <Tri items={d.AD.map((v,i)=>({l:`AD${i+1}`,v:v,u:"%"}))} color={c}/>
  <V label="LD Pump (C_P1)" value={d.P1} unit="%" color={c}/>
  <V label="LD Flow (C_FM3)" value={d.FM3} unit="GPM" color={c}/>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:3}}>
    <V label="DCW Duty" value={d.DCW} unit="%" color="#00ccee"/>
    <V label="IECW Duty" value={d.IECW} unit="%" color="#00ccee"/>
  </div>
  <V label="Cond. State" value={d.st} unit="" color={c}/>
</>;}

function PanelRegen({d,c}){return<>
  <div style={{textAlign:"center",padding:"6px 0",borderRadius:6,marginBottom:3,
    background:d.comp?"#00ff4410":"#ff444410",border:`1px solid ${d.comp?"#00ff44":"#ff4444"}22`}}>
    <div style={{fontSize:8,color:"#556"}}>COMPRESSOR</div>
    <div style={{fontSize:16,fontWeight:800,color:d.comp?"#00ff66":"#ff4444",fontFamily:"monospace"}}>{d.comp?"RUNNING":"OFF"}</div>
  </div>
  <V label="Regen State" value={d.stL} unit={`(${d.st})`} color={c}/>
  <V label="Regen Blower" value={d.bl} unit="%" color={c}/>
  <V label="Regen Pump" value={d.pump} unit="%" color={c}/>
  <V label="Discharge Press" value={d.dis} unit="PSI" color={c}/>
  <V label="Suction Press" value={d.suc} unit="PSI" color={c}/>
  <V label="Superheat" value={d.sh} unit="°F" color={c}/>
</>;}

function PanelStor({d,c}){return<>
  <V label="State of Desiccant" value={d.sod} unit="%" color={c}/>
  <V label="Tank Level" value={d.lvl} unit="%" color={c}/>
  <V label="Target Conc." value={d.tgt} unit="%" color="#00ccee"/>
  <V label="Regen Threshold" value={d.th} unit="%" color="#ffaa00"/>
  <div style={{marginTop:5,padding:5,background:`${c}0a`,borderRadius:5}}>
    <div style={{fontSize:8,color:"#4a5a6a",letterSpacing:1,marginBottom:3}}>SOD vs THRESHOLDS</div>
    <div style={{position:"relative",height:12,background:"#080c14",borderRadius:5,overflow:"hidden"}}>
      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(d.sod*2.5,100)}%`,
        background:`linear-gradient(90deg,${c}33,${c})`,borderRadius:5,transition:"width 1s"}}/>
      <div style={{position:"absolute",left:`${d.th*2.5}%`,top:0,height:"100%",width:2,background:"#ffaa00"}}/>
      <div style={{position:"absolute",left:`${d.tgt*2.5}%`,top:0,height:"100%",width:2,background:"#00ccee"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#3a4a5a",marginTop:1}}>
      <span>0%</span><span style={{color:"#ffaa00"}}>Regen↑</span><span style={{color:"#00ccee"}}>Target↑</span><span>100%</span>
    </div>
  </div>
</>;}

function PanelCtrl({d,c}){return<>
  <V label="Supply Air SP" value={d.cfm} unit="CFM" color={c}/>
  <V label="Outside Air Ratio" value={d.oar} unit="%" color={c}/>
  <V label="Power Draw" value={d.kw} unit="kW" color="#ffcc00"/>
  <V label="Water Usage" value={d.water} unit="GPD" color="#00bbff"/>
  <V label="Compressor Hours" value={d.compH.toLocaleString()} unit="hrs" color={c}/>
  <V label="System Runtime" value={d.runH.toLocaleString()} unit="hrs" color={c}/>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginTop:3}}>
    {[["ALARMS",d.alm,d.alm>0,"#ff4444"],["ALERTS",d.alt,d.alt>0,"#ffaa00"]].map(([l,v,bad,clr])=>
      <div key={l} style={{textAlign:"center",padding:"5px 0",borderRadius:5,
        background:bad?`${clr}10`:"#00ff4408",border:`1px solid ${bad?clr:"#00ff44"}18`}}>
        <div style={{fontSize:7,color:"#556"}}>{l}</div>
        <div style={{fontSize:16,fontWeight:800,color:bad?clr:"#00ff44",fontFamily:"monospace"}}>{v}</div>
      </div>
    )}
  </div>
</>;}

// --- MAIN APP ---
export default function DOASTwin(){
  const [view, setView] = useState("overview");
  const [modelKey, setModelKey] = useState("closed"); // "closed" or "open"
  const [sfReady, setSfReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const iframeRef = useRef(null);
  const clientRef = useRef(null);
  const sd = useSensors();

  // Load Sketchfab API script
  useEffect(()=>{
    if(window.Sketchfab){setSfReady(true);return;}
    const s=document.createElement("script");
    s.src=SF_API; s.onload=()=>setSfReady(true);
    document.head.appendChild(s);
  },[]);

  // Initialize / swap model
  const loadModel = useCallback((uid)=>{
    if(!sfReady||!iframeRef.current) return;
    setLoading(true);
    setTransitioning(true);
    // Small delay for transition effect
    setTimeout(()=>{
      const client = new window.Sketchfab(iframeRef.current);
      clientRef.current = client;
      client.init(uid, {
        success:(api)=>{
          api.start();
          api.addEventListener("viewerready",()=>{
            setLoading(false);
            setTimeout(()=>setTransitioning(false), 300);
            try{ api.setBackground({color:[0.024,0.035,0.055,1]}); }catch(e){}
          });
        },
        error:()=>{ setLoading(false); setTransitioning(false); },
        autostart:1, autospin:0.0,
        ui_stop:0, ui_infos:0, ui_inspector:0, ui_watermark:0,
        ui_hint:0, ui_help:0, ui_settings:0, ui_vr:0,
        ui_fullscreen:0, ui_annotations:0, transparent:0, camera:0,
        scrollwheel:1,
      });
    }, transitioning ? 0 : 50);
  },[sfReady, transitioning]);

  // Load initial model
  useEffect(()=>{
    if(sfReady) loadModel(MODELS[modelKey].uid);
  },[sfReady]); // eslint-disable-line

  // Toggle model when view changes
  useEffect(()=>{
    const shouldBeOpen = view !== "overview";
    const newKey = shouldBeOpen ? "open" : "closed";
    if(newKey !== modelKey){
      setModelKey(newKey);
      loadModel(MODELS[newKey].uid);
    }
  },[view]); // eslint-disable-line

  // Manual model toggle
  const toggleModel = useCallback(()=>{
    const newKey = modelKey === "closed" ? "open" : "closed";
    setModelKey(newKey);
    loadModel(MODELS[newKey].uid);
  },[modelKey, loadModel]);

  const COL = {conditioner:"#0099ff",regenerator:"#ff6622",storage:"#00cc77",controls:"#9955ee"};
  const ICO = {conditioner:"❄",regenerator:"🔥",storage:"🛢",controls:"⚡"};
  const TTL = {conditioner:"CONDITIONER CORE",regenerator:"REGENERATOR",storage:"STORAGE TANKS",controls:"ECY-600 CONTROLS"};

  const panel = sd && view!=="overview" && {
    conditioner:<PanelCond d={sd.c} c={COL.conditioner}/>,
    regenerator:<PanelRegen d={sd.r} c={COL.regenerator}/>,
    storage:<PanelStor d={sd.s} c={COL.storage}/>,
    controls:<PanelCtrl d={sd.x} c={COL.controls}/>,
  }[view];

  return(
  <div style={{width:"100vw",height:"100vh",background:"#060a12",position:"relative",
    fontFamily:"'Inter','Segoe UI',sans-serif",color:"#c8d8e8",overflow:"hidden",userSelect:"none"}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>

    {/* === SKETCHFAB IFRAME === */}
    <iframe ref={iframeRef} id="sf" title="DOAS-005"
      allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen
      mozallowfullscreen="true" webkitallowfullscreen="true"
      style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none",zIndex:1,
        opacity:transitioning?0:1, transition:"opacity 0.4s ease"}}/>

    {/* === LOADING OVERLAY === */}
    {loading && <div style={{position:"absolute",inset:0,zIndex:5,background:"#060a12",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      opacity:loading?1:0, transition:"opacity 0.5s"}}>
      <div style={{width:44,height:44,borderRadius:8,
        background:"linear-gradient(135deg,#0077cc,#00ddff)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:20,fontWeight:800,color:"#fff",marginBottom:14,animation:"lp 1.5s infinite"}}>BF</div>
      <div style={{fontSize:12,fontWeight:600,color:"#445566",letterSpacing:2}}>
        {modelKey==="closed"?"LOADING EXTERIOR VIEW...":"OPENING PANELS — LOADING INTERNALS..."}
      </div>
      <div style={{fontSize:9,color:"#2a3a4a",marginTop:5}}>DOAS-005 | Von's/Albertsons, Gardena CA</div>
      <div style={{marginTop:16,width:180,height:3,background:"#1a2a3a",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:"40%",height:"100%",background:"linear-gradient(90deg,#0077cc,#00ddff)",
          borderRadius:3,animation:"lb 1.5s ease-in-out infinite"}}/>
      </div>
    </div>}

    {/* === TOP BAR === */}
    <div style={{position:"absolute",top:0,left:0,right:0,height:50,
      background:"linear-gradient(180deg,rgba(4,8,14,0.96),rgba(4,8,14,0.55))",
      borderBottom:"1px solid #1a2a3a18",display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 12px",zIndex:30,
      backdropFilter:"blur(18px) saturate(1.5)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:28,height:28,borderRadius:5,flexShrink:0,
          background:"linear-gradient(135deg,#0077cc,#00ddff)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:800,color:"#fff"}}>BF</div>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1,lineHeight:1.2}}>DOAS-005 DIGITAL TWIN</div>
          <div style={{fontSize:8,color:"#3a4a5a"}}>Von's/Albertsons — Gardena, CA &nbsp;·&nbsp; BFLDD1806SSB0SS &nbsp;·&nbsp; 480V &nbsp;·&nbsp; 15 Ton</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {/* Model toggle button */}
        <button onClick={toggleModel} style={{
          padding:"4px 10px",borderRadius:5,cursor:"pointer",fontSize:9,fontWeight:600,
          letterSpacing:.5, transition:"all .25s",
          border:`1px solid ${modelKey==="open"?"#00ddff":"#1a2a3a"}44`,
          background:modelKey==="open"?"#00ddff10":"transparent",
          color:modelKey==="open"?"#00ddff":"#556677",
        }}>
          {modelKey==="closed"?"🔒 CLOSED":"🔓 OPEN"}
        </button>
        {sd&&<div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:6,height:6,borderRadius:"50%",
            background:sd.status==="Normal"?"#00ff66":"#ff4444",
            boxShadow:`0 0 6px ${sd.status==="Normal"?"#00ff6644":"#ff444444"}`,
            animation:"pu 2s infinite"}}/>
          <span style={{fontSize:9,color:"#5a6a7a",fontFamily:"monospace"}}>{sd.status}</span>
        </div>}
        <div style={{fontSize:8,color:"#2a3a4a",fontFamily:"monospace"}}>
          {sd?new Date(sd.ts).toLocaleTimeString():"--:--:--"}
        </div>
      </div>
    </div>

    {/* === LEFT — Overview Telemetry === */}
    {view==="overview"&&sd&&<div style={{position:"absolute",left:8,top:58,width:180,
      background:"rgba(4,8,14,0.9)",border:"1px solid #1a2a3a20",borderRadius:9,
      padding:"8px 8px 10px",zIndex:20,backdropFilter:"blur(16px) saturate(1.4)"}}>
      <div style={{fontSize:8,fontWeight:700,color:"#3a4a5a",letterSpacing:2,marginBottom:5}}>LIVE TELEMETRY</div>
      <V label="Supply Air" value={sd.c.SA_T} unit="°F" color="#0099ff"/>
      <V label="Supply Dewpoint" value={sd.c.SA_DP} unit="°F" color="#0099ff"/>
      <V label="Outside Air" value={sd.c.OA_T} unit="°F" color="#ff8844"/>
      <V label="Tank SOD" value={sd.s.sod} unit="%" color="#00cc77"/>
      <V label="Power" value={sd.x.kw} unit="kW" color="#ffcc00"/>
      <V label="Water" value={sd.x.water} unit="GPD" color="#00bbff"/>
      <div style={{marginTop:5}}>
        <div style={{fontSize:7,color:"#2a3a4a",letterSpacing:1,marginBottom:1}}>⚡ POWER</div>
        <Sp data={sd.sp.map(s=>s.kw)} color="#ffcc00"/>
      </div>
      <div style={{marginTop:3}}>
        <div style={{fontSize:7,color:"#2a3a4a",letterSpacing:1,marginBottom:1}}>🌡 SA TEMP</div>
        <Sp data={sd.sp.map(s=>s.t)} color="#0099ff"/>
      </div>
      <div style={{marginTop:3}}>
        <div style={{fontSize:7,color:"#2a3a4a",letterSpacing:1,marginBottom:1}}>💧 DESICCANT</div>
        <Sp data={sd.sp.map(s=>s.sod)} color="#00cc77"/>
      </div>
    </div>}

    {/* === RIGHT — Subsystem Detail === */}
    {panel&&<div style={{position:"absolute",right:8,top:58,width:228,
      maxHeight:"calc(100vh - 130px)",overflowY:"auto",
      background:"rgba(4,8,14,0.92)",border:`1px solid ${COL[view]}18`,
      borderRadius:9,backdropFilter:"blur(16px) saturate(1.4)",zIndex:20,
      scrollbarWidth:"thin",scrollbarColor:`${COL[view]}28 transparent`}}>
      <div style={{position:"sticky",top:0,background:"rgba(4,8,14,0.97)",
        padding:"8px 10px 5px",borderBottom:`1px solid ${COL[view]}14`,zIndex:1,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:9,fontWeight:800,color:COL[view],letterSpacing:2}}>
          {ICO[view]} {TTL[view]}
        </div>
        <button onClick={()=>setView("overview")} style={{
          background:"none",border:`1px solid ${COL[view]}28`,color:COL[view],
          borderRadius:3,padding:"1px 6px",fontSize:9,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"5px 8px 8px"}}>{panel}</div>
    </div>}

    {/* === BOTTOM NAV === */}
    <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",
      display:"flex",gap:3,zIndex:30,padding:"5px 8px",
      background:"rgba(4,8,14,0.9)",borderRadius:10,
      border:"1px solid #1a2a3a20",backdropFilter:"blur(16px) saturate(1.4)"}}>
      {[{k:"overview",l:"OVERVIEW",c:"#00ddff",i:"◉"},
        ...Object.keys(COL).map(k=>({k,l:k.toUpperCase().slice(0,6),c:COL[k],i:ICO[k]}))
      ].map(b=><button key={b.k} onClick={()=>setView(b.k)} style={{
        padding:"6px 10px",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap",
        border:`1px solid ${view===b.k?b.c:"#1a2a3a"}20`,
        background:view===b.k?`${b.c}12`:"transparent",
        color:view===b.k?b.c:"#3a4a5a",fontSize:8,fontWeight:700,letterSpacing:1,
        transition:"all .25s",
      }}>
        {b.i} {b.l}
      </button>)}
    </div>

    {/* === UNIT INFO === */}
    <div style={{position:"absolute",bottom:50,left:8,padding:"3px 7px",
      background:"rgba(4,8,14,0.8)",borderRadius:4,border:"1px solid #1a2a3a15",
      fontSize:7,color:"#2a3a4a",zIndex:20,fontFamily:"monospace",lineHeight:1.5,
      backdropFilter:"blur(8px)"}}>
      SN: 2515AG2C2R2S2001 · 15T · 17'×6'×6'<br/>
      3D: Blue Frontier / Dinier Quiros · Sketchfab<br/>
      View: {MODELS[modelKey].label}
    </div>

    {/* === INSTRUCTIONS === */}
    <div style={{position:"absolute",bottom:50,right:8,padding:"3px 7px",
      background:"rgba(4,8,14,0.8)",borderRadius:4,border:"1px solid #1a2a3a15",
      fontSize:7,color:"#2a3a4a",zIndex:20,lineHeight:1.5,backdropFilter:"blur(8px)"}}>
      🖱 Drag orbit · Scroll zoom · Right-click pan<br/>
      Select subsystem → auto-opens model internals<br/>
      🔒/🔓 button toggles closed/open view
    </div>

    <style>{`
      @keyframes pu{0%,100%{opacity:1}50%{opacity:.35}}
      @keyframes lp{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.65}}
      @keyframes lb{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
      ::-webkit-scrollbar{width:3px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#223;border-radius:3px}
      #sf{background:#060a12}
    `}</style>
  </div>);
}
