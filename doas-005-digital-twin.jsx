import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================================
// BLUE FRONTIER LD-DOAS DIGITAL TWIN — DOAS-005 (Von's/Albertsons, Gardena CA)
// Model: BFLDD1806SSB0SS | Serial: 2515AG2C2R2S2001 | 480V
// Interactive 360° 3D Visualization with Simulated Real-Time Sensor Data
// ============================================================================

// --- SIMULATED SENSOR DATA ENGINE ---
function useSensorData() {
  const [data, setData] = useState(null);
  const baseRef = useRef({
    SA_Temp: 72, SA_Dewpoint: 55, SA_RH: 48,
    OA_Temp: 88, OA_RH: 62, OA_Dewpoint: 72,
    RA_Temp: 75, RA_RH: 50,
    Tank_SOD: 38.2, Tank_Level: 72,
    C_BL1_Speed: 78, C_BL2_Speed: 76, C_BL3_Speed: 79,
    C_FT1: 680, C_FT2: 665, C_FT3: 690,
    C_P1_Speed: 62, C_FM3: 2.4,
    C_AD1_Pos: 85, C_AD2_Pos: 82, C_AD3_Pos: 86,
    R_COMP: 1, R_BL1_Speed: 65, R_P1_Speed: 55,
    R_PT1: 185, R_PT2: 82, R_SC1_SH: 12,
    SP_SA_CFM: 2000, SP_OAR: 55, SP_Target_Conc: 40,
    SOD_Regen_Thresh: 36, Regen_State: 3,
    ConditionerState: 5, DCW_Duty: 35, IECW_Duty: 42,
    Compressor_Hours: 14238, System_Runtime: 28456,
    kW_Total: 4.8, Water_GPD: 18.2,
    Alarm_Count: 0, Alert_Count: 0,
  });

  useEffect(() => {
    const jitter = (base, range) => base + (Math.random() - 0.5) * range;
    const tick = () => {
      const b = baseRef.current;
      const t = Date.now() / 1000;
      setData({
        timestamp: new Date().toISOString(),
        unitId: "DOAS-005",
        site: "Von's/Albertsons — Gardena, CA",
        model: "BFLDD1806SSB0SS",
        serial: "2515AG2C2R2S2001",
        voltage: "480V",
        status: "Normal",
        connectivity: "Online",
        conditioner: {
          SA_Temp: +jitter(b.SA_Temp, 1.5).toFixed(1),
          SA_Dewpoint: +jitter(b.SA_Dewpoint, 1).toFixed(1),
          SA_RH: +jitter(b.SA_RH, 3).toFixed(0),
          OA_Temp: +jitter(b.OA_Temp, 2).toFixed(1),
          OA_RH: +jitter(b.OA_RH, 4).toFixed(0),
          OA_Dewpoint: +jitter(b.OA_Dewpoint, 1.5).toFixed(1),
          BL1_Speed: +jitter(b.C_BL1_Speed, 3).toFixed(0),
          BL2_Speed: +jitter(b.C_BL2_Speed, 3).toFixed(0),
          BL3_Speed: +jitter(b.C_BL3_Speed, 3).toFixed(0),
          FT1_CFM: +jitter(b.C_FT1, 15).toFixed(0),
          FT2_CFM: +jitter(b.C_FT2, 15).toFixed(0),
          FT3_CFM: +jitter(b.C_FT3, 15).toFixed(0),
          P1_Speed: +jitter(b.C_P1_Speed, 4).toFixed(0),
          FM3_GPM: +jitter(b.C_FM3, 0.3).toFixed(1),
          AD1_Pos: +jitter(b.C_AD1_Pos, 2).toFixed(0),
          AD2_Pos: +jitter(b.C_AD2_Pos, 2).toFixed(0),
          AD3_Pos: +jitter(b.C_AD3_Pos, 2).toFixed(0),
          DCW_Duty: +jitter(b.DCW_Duty, 5).toFixed(0),
          IECW_Duty: +jitter(b.IECW_Duty, 5).toFixed(0),
          State: b.ConditionerState,
        },
        regenerator: {
          COMP_Running: b.R_COMP,
          BL1_Speed: +jitter(b.R_BL1_Speed, 4).toFixed(0),
          P1_Speed: +jitter(b.R_P1_Speed, 3).toFixed(0),
          Discharge_PSI: +jitter(b.R_PT1, 8).toFixed(0),
          Suction_PSI: +jitter(b.R_PT2, 5).toFixed(0),
          Superheat: +jitter(b.R_SC1_SH, 2).toFixed(1),
          State: b.Regen_State,
          State_Label: ["Idle","Startup","Warmup","Running","Cooldown","Shutdown"][b.Regen_State] || "Unknown",
        },
        storage: {
          SOD: +jitter(b.Tank_SOD, 0.4).toFixed(1),
          Level_Pct: +jitter(b.Tank_Level, 2).toFixed(0),
          Target_Conc: b.SP_Target_Conc,
          Regen_Thresh: b.SOD_Regen_Thresh,
        },
        controls: {
          SP_SA_CFM: b.SP_SA_CFM,
          SP_OAR: b.SP_OAR,
          kW_Total: +jitter(b.kW_Total, 0.6).toFixed(1),
          Water_GPD: +jitter(b.Water_GPD, 1.5).toFixed(1),
          Compressor_Hrs: b.Compressor_Hours,
          Runtime_Hrs: b.System_Runtime,
          Alarms: b.Alarm_Count,
          Alerts: b.Alert_Count,
        },
        sparkline: Array.from({length:20}, (_,i) => ({
          t: i, kw: jitter(b.kW_Total, 1.2), temp: jitter(b.SA_Temp, 2),
          sod: jitter(b.Tank_SOD, 0.8),
        })),
      });
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);
  return data;
}

// --- THREE.JS 3D ENGINE ---
function ThreeCanvas({ activeView, onSubsystemClick, doorOpen }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const frameRef = useRef(0);

  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE || !mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.012);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(18, 12, 20);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
    sun.position.set(15, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x4488ff, 0.4);
    rim.position.set(-10, 8, -10);
    scene.add(rim);

    const point1 = new THREE.PointLight(0x00ccff, 0.8, 30);
    point1.position.set(0, 6, 0);
    scene.add(point1);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x111822, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(60, 60, 0x1a2a3a, 0x111822);
    grid.position.y = 0;
    scene.add(grid);

    // Materials
    const mat = {
      frame: new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.7, roughness: 0.3 }),
      panel: new THREE.MeshStandardMaterial({ color: 0x1e2d3d, metalness: 0.5, roughness: 0.4 }),
      conditioner: new THREE.MeshStandardMaterial({ color: 0x0077cc, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.9 }),
      regenerator: new THREE.MeshStandardMaterial({ color: 0xcc4400, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.9 }),
      storage: new THREE.MeshStandardMaterial({ color: 0x00aa66, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.9 }),
      controls: new THREE.MeshStandardMaterial({ color: 0x8844cc, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.9 }),
      accent: new THREE.MeshStandardMaterial({ color: 0x00ddff, metalness: 0.8, roughness: 0.2, emissive: 0x004466, emissiveIntensity: 0.5 }),
      door: new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.85 }),
      pipe: new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.8, roughness: 0.2 }),
      desiccant: new THREE.MeshStandardMaterial({ color: 0x33cc88, metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.7 }),
      glow: new THREE.MeshStandardMaterial({ color: 0x00ffaa, emissive: 0x00ff88, emissiveIntensity: 1.0, transparent: true, opacity: 0.6 }),
      compressor: new THREE.MeshStandardMaterial({ color: 0xdd6622, metalness: 0.7, roughness: 0.25 }),
      fan: new THREE.MeshStandardMaterial({ color: 0x889999, metalness: 0.8, roughness: 0.2 }),
      tank: new THREE.MeshStandardMaterial({ color: 0x227744, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.8 }),
      pcb: new THREE.MeshStandardMaterial({ color: 0x115522, metalness: 0.3, roughness: 0.6 }),
      wire: new THREE.MeshStandardMaterial({ color: 0xcc2222, metalness: 0.5, roughness: 0.5 }),
    };

    // Unit dimensions: 17' L x 6' W x 6' H → scaled 1:1 in scene units (1 unit = 1 foot)
    const L = 17, W = 6, H = 6;
    const unitGroup = new THREE.Group();
    const subsystems = { conditioner: new THREE.Group(), regenerator: new THREE.Group(), storage: new THREE.Group(), controls: new THREE.Group() };
    const doors = [];

    // === MAIN FRAME (structural skeleton) ===
    const frameGroup = new THREE.Group();
    // Base frame rails
    const railGeo = new THREE.BoxGeometry(L, 0.15, 0.15);
    [[-W/2+0.1], [W/2-0.1]].forEach(([z]) => {
      const rail = new THREE.Mesh(railGeo, mat.frame);
      rail.position.set(0, 0.075, z);
      rail.castShadow = true;
      frameGroup.add(rail);
    });
    // Vertical corner posts
    const postGeo = new THREE.BoxGeometry(0.15, H, 0.15);
    [[-L/2+0.1, -W/2+0.1], [-L/2+0.1, W/2-0.1], [L/2-0.1, -W/2+0.1], [L/2-0.1, W/2-0.1]].forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeo, mat.frame);
      post.position.set(x, H/2, z);
      post.castShadow = true;
      frameGroup.add(post);
    });
    // Top frame rails
    [[-W/2+0.1], [W/2-0.1]].forEach(([z]) => {
      const topRail = new THREE.Mesh(railGeo, mat.frame);
      topRail.position.set(0, H, z);
      topRail.castShadow = true;
      frameGroup.add(topRail);
    });
    // Cross members
    const crossGeo = new THREE.BoxGeometry(0.12, 0.12, W);
    [-L/2+0.1, 0, L/2-0.1].forEach(x => {
      [0.06, H].forEach(y => {
        const cross = new THREE.Mesh(crossGeo, mat.frame);
        cross.position.set(x, y, 0);
        frameGroup.add(cross);
      });
    });
    // Intermediate vertical posts (section dividers)
    const dividers = [-L/4, L/8];
    dividers.forEach(x => {
      [[-W/2+0.1], [W/2-0.1]].forEach(([z]) => {
        const dPost = new THREE.Mesh(postGeo, mat.frame);
        dPost.position.set(x, H/2, z);
        frameGroup.add(dPost);
      });
    });
    unitGroup.add(frameGroup);

    // === FLOOR & ROOF PANELS ===
    const floorGeo = new THREE.BoxGeometry(L - 0.3, 0.08, W - 0.3);
    const floor = new THREE.Mesh(floorGeo, mat.panel);
    floor.position.set(0, 0.04, 0);
    floor.receiveShadow = true;
    unitGroup.add(floor);
    const roofGeo = new THREE.BoxGeometry(L - 0.3, 0.08, W - 0.3);
    const roof = new THREE.Mesh(roofGeo, mat.panel);
    roof.position.set(0, H + 0.04, 0);
    roof.castShadow = true;
    unitGroup.add(roof);

    // === BACK WALL ===
    const backWallGeo = new THREE.BoxGeometry(L - 0.3, H - 0.2, 0.06);
    const backWall = new THREE.Mesh(backWallGeo, mat.panel);
    backWall.position.set(0, H/2, -W/2 + 0.03);
    unitGroup.add(backWall);

    // === DOORS (front-facing, one per subsystem) ===
    const doorSections = [
      { name: "conditioner", x: -L/2 + (L*0.35)/2, w: L*0.35, color: 0x0066aa },
      { name: "regenerator", x: -L/2 + L*0.35 + (L*0.25)/2, w: L*0.25, color: 0xaa4400 },
      { name: "storage", x: -L/2 + L*0.35 + L*0.25 + (L*0.2)/2, w: L*0.2, color: 0x008855 },
      { name: "controls", x: -L/2 + L*0.35 + L*0.25 + L*0.2 + (L*0.2)/2, w: L*0.2, color: 0x7733aa },
    ];

    doorSections.forEach(sec => {
      const doorGeo = new THREE.BoxGeometry(sec.w - 0.2, H - 0.5, 0.04);
      const doorMat = new THREE.MeshStandardMaterial({
        color: sec.color, metalness: 0.5, roughness: 0.35,
        transparent: true, opacity: 0.75,
      });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(sec.x, H/2, W/2 - 0.02);
      door.castShadow = true;
      door.userData = { subsystem: sec.name, originalX: sec.x, doorWidth: sec.w - 0.2 };
      doors.push(door);
      unitGroup.add(door);

      // Door handle
      const handleGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
      const handle = new THREE.Mesh(handleGeo, mat.accent);
      handle.position.set(sec.x + (sec.w - 0.2)/2 - 0.15, H/2, W/2 + 0.04);
      unitGroup.add(handle);

      // Section label stripe on top
      const stripeMat = new THREE.MeshStandardMaterial({ color: sec.color, emissive: sec.color, emissiveIntensity: 0.4 });
      const stripeGeo = new THREE.BoxGeometry(sec.w - 0.2, 0.06, 0.12);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(sec.x, H + 0.07, W/2 - 0.06);
      unitGroup.add(stripe);
    });

    // Side walls (end panels)
    const sideGeo = new THREE.BoxGeometry(0.06, H - 0.2, W - 0.3);
    [-L/2 + 0.03, L/2 - 0.03].forEach(x => {
      const side = new THREE.Mesh(sideGeo, mat.panel);
      side.position.set(x, H/2, 0);
      unitGroup.add(side);
    });

    // ===================================================================
    // SUBSYSTEM 1: CONDITIONER CORE (left ~35% of unit)
    // Three-channel HMX, blowers, dampers, desiccant pump
    // ===================================================================
    const condX = -L/2 + L*0.175; // center of conditioner section

    // Three HMX channels (heat and mass exchangers)
    for (let i = 0; i < 3; i++) {
      const hmxGeo = new THREE.BoxGeometry(1.5, 4.0, 1.2);
      const hmx = new THREE.Mesh(hmxGeo, mat.conditioner);
      hmx.position.set(condX - 1.5 + i * 1.6, 2.5, -0.5);
      hmx.castShadow = true;
      subsystems.conditioner.add(hmx);

      // Internal wavy plates (visible detail)
      for (let p = 0; p < 5; p++) {
        const plateGeo = new THREE.BoxGeometry(1.3, 3.6, 0.02);
        const plate = new THREE.Mesh(plateGeo, mat.accent);
        plate.position.set(condX - 1.5 + i * 1.6, 2.5, -0.5 - 0.5 + p * 0.24);
        subsystems.conditioner.add(plate);
      }

      // Blower (fan cylinder per channel)
      const fanGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 16);
      const fan = new THREE.Mesh(fanGeo, mat.fan);
      fan.rotation.x = Math.PI / 2;
      fan.position.set(condX - 1.5 + i * 1.6, 1.5, 1.5);
      fan.castShadow = true;
      fan.userData = { isFan: true, speed: 0.05 + i * 0.005 };
      subsystems.conditioner.add(fan);

      // Fan blade cross
      const bladeGeo = new THREE.BoxGeometry(0.9, 0.06, 0.5);
      const blade = new THREE.Mesh(bladeGeo, mat.fan);
      blade.position.copy(fan.position);
      blade.rotation.x = Math.PI / 2;
      blade.userData = { isBlade: true, parent: fan };
      subsystems.conditioner.add(blade);

      // Damper
      const damperGeo = new THREE.BoxGeometry(1.2, 0.08, 1.0);
      const damper = new THREE.Mesh(damperGeo, new THREE.MeshStandardMaterial({
        color: 0x4488bb, metalness: 0.7, roughness: 0.3
      }));
      damper.position.set(condX - 1.5 + i * 1.6, 5.0, 1.0);
      damper.userData = { isDamper: true };
      subsystems.conditioner.add(damper);
    }

    // Desiccant pump
    const pumpGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
    const pump = new THREE.Mesh(pumpGeo, mat.pipe);
    pump.position.set(condX, 0.5, 1.0);
    pump.castShadow = true;
    subsystems.conditioner.add(pump);

    // Piping for desiccant
    const pipePoints = [
      [condX, 0.5, 1.0], [condX, 0.5, -0.5], [condX - 1.5, 0.5, -0.5],
      [condX - 1.5, 2.5, -0.5],
    ];
    for (let p = 0; p < pipePoints.length - 1; p++) {
      const [x1, y1, z1] = pipePoints[p];
      const [x2, y2, z2] = pipePoints[p + 1];
      const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
      const pipeGeo = new THREE.CylinderGeometry(0.06, 0.06, len, 8);
      const pipe = new THREE.Mesh(pipeGeo, mat.desiccant);
      pipe.position.set((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);
      pipe.lookAt(x2, y2, z2);
      pipe.rotateX(Math.PI / 2);
      subsystems.conditioner.add(pipe);
    }

    // Water solenoid valves (DCW and IECW)
    const svGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
    [{x: condX + 2, label: "DCW"}, {x: condX + 2.5, label: "IECW"}].forEach(sv => {
      const valve = new THREE.Mesh(svGeo, mat.accent);
      valve.position.set(sv.x, 0.4, -1.5);
      valve.rotation.z = Math.PI / 2;
      subsystems.conditioner.add(valve);
    });

    unitGroup.add(subsystems.conditioner);

    // ===================================================================
    // SUBSYSTEM 2: REGENERATOR (next ~25% of unit)
    // Compressor, heat pump, regen blower, regen pump
    // ===================================================================
    const regenX = -L/2 + L*0.35 + L*0.125;

    // Compressor (large cylinder)
    const compGeo = new THREE.CylinderGeometry(0.8, 0.85, 1.8, 16);
    const compressor = new THREE.Mesh(compGeo, mat.compressor);
    compressor.position.set(regenX, 1.2, 0);
    compressor.castShadow = true;
    subsystems.regenerator.add(compressor);

    // Compressor top dome
    const domeGeo = new THREE.SphereGeometry(0.75, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, mat.compressor);
    dome.position.set(regenX, 2.1, 0);
    subsystems.regenerator.add(dome);

    // Regen heat exchanger (tall box)
    const regenHXGeo = new THREE.BoxGeometry(1.8, 3.5, 1.5);
    const regenHX = new THREE.Mesh(regenHXGeo, mat.regenerator);
    regenHX.position.set(regenX, 3.5, -0.8);
    regenHX.castShadow = true;
    subsystems.regenerator.add(regenHX);

    // Coil texture inside HX
    for (let c = 0; c < 8; c++) {
      const coilGeo = new THREE.TorusGeometry(0.6, 0.03, 8, 32);
      const coil = new THREE.Mesh(coilGeo, mat.pipe);
      coil.position.set(regenX, 2.0 + c * 0.4, -0.8);
      coil.rotation.y = Math.PI / 2;
      subsystems.regenerator.add(coil);
    }

    // Regen blower
    const rBlowerGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.7, 16);
    const rBlower = new THREE.Mesh(rBlowerGeo, mat.fan);
    rBlower.rotation.x = Math.PI / 2;
    rBlower.position.set(regenX + 0.8, 4.5, 0.8);
    rBlower.castShadow = true;
    rBlower.userData = { isFan: true, speed: 0.04 };
    subsystems.regenerator.add(rBlower);

    // Regen pump
    const rPumpGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 10);
    const rPump = new THREE.Mesh(rPumpGeo, mat.pipe);
    rPump.position.set(regenX - 0.8, 0.4, 0.5);
    subsystems.regenerator.add(rPump);

    // Refrigerant lines (discharge and suction)
    [[regenX, 2.1, 0, regenX, 3.5, -0.8]].forEach(([x1,y1,z1,x2,y2,z2]) => {
      const len = Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2);
      const refLineGeo = new THREE.CylinderGeometry(0.05, 0.05, len, 8);
      const refLine = new THREE.Mesh(refLineGeo, new THREE.MeshStandardMaterial({
        color: 0xff6600, metalness: 0.7, roughness: 0.3
      }));
      refLine.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
      refLine.lookAt(x2,y2,z2);
      refLine.rotateX(Math.PI/2);
      subsystems.regenerator.add(refLine);
    });

    unitGroup.add(subsystems.regenerator);

    // ===================================================================
    // SUBSYSTEM 3: STORAGE TANKS (next ~20% of unit)
    // 2 tanks (concentrated & dilute desiccant)
    // ===================================================================
    const storX = -L/2 + L*0.35 + L*0.25 + L*0.1;

    // Tank 1 — Concentrated
    const tank1Geo = new THREE.CylinderGeometry(0.9, 0.9, 4.0, 16);
    const tank1 = new THREE.Mesh(tank1Geo, mat.tank);
    tank1.position.set(storX - 0.5, 2.2, 0);
    tank1.castShadow = true;
    subsystems.storage.add(tank1);

    // Tank 1 liquid level (animated)
    const liq1Geo = new THREE.CylinderGeometry(0.85, 0.85, 2.8, 16);
    const liq1 = new THREE.Mesh(liq1Geo, mat.desiccant);
    liq1.position.set(storX - 0.5, 1.6, 0);
    liq1.userData = { isLiquid: true };
    subsystems.storage.add(liq1);

    // Tank 2 — Dilute
    const tank2Geo = new THREE.CylinderGeometry(0.7, 0.7, 3.5, 16);
    const tank2 = new THREE.Mesh(tank2Geo, new THREE.MeshStandardMaterial({
      color: 0x2a7755, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.8,
    }));
    tank2.position.set(storX + 1.0, 2.0, 0);
    tank2.castShadow = true;
    subsystems.storage.add(tank2);

    const liq2Geo = new THREE.CylinderGeometry(0.65, 0.65, 2.0, 16);
    const liq2 = new THREE.Mesh(liq2Geo, new THREE.MeshStandardMaterial({
      color: 0x44ddaa, metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.6,
    }));
    liq2.position.set(storX + 1.0, 1.3, 0);
    liq2.userData = { isLiquid: true };
    subsystems.storage.add(liq2);

    // Level sensors on tanks
    [storX - 0.5, storX + 1.0].forEach((tx, i) => {
      [1.0, 2.5, 4.0].forEach((sy, si) => {
        const sGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const sMat = new THREE.MeshStandardMaterial({
          color: si === 0 ? 0xff3333 : si === 1 ? 0xffaa00 : 0x00ff66,
          emissive: si === 0 ? 0xff0000 : si === 1 ? 0xff8800 : 0x00cc44,
          emissiveIntensity: 0.8,
        });
        const sensor = new THREE.Mesh(sGeo, sMat);
        sensor.position.set(tx + (i === 0 ? 0.95 : 0.75), sy, 0);
        subsystems.storage.add(sensor);
      });
    });

    // Inter-tank piping
    const itPipeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const itPipe = new THREE.Mesh(itPipeGeo, mat.desiccant);
    itPipe.rotation.z = Math.PI / 2;
    itPipe.position.set(storX + 0.25, 0.4, 0);
    subsystems.storage.add(itPipe);

    unitGroup.add(subsystems.storage);

    // ===================================================================
    // SUBSYSTEM 4: CONTROLS (rightmost ~20% of unit)
    // ECY-600 PLC, sensor wiring, BACnet comms
    // ===================================================================
    const ctrlX = -L/2 + L*0.35 + L*0.25 + L*0.2 + L*0.1;

    // Main control panel enclosure
    const panelGeo = new THREE.BoxGeometry(2.0, 3.0, 0.4);
    const panel = new THREE.Mesh(panelGeo, new THREE.MeshStandardMaterial({
      color: 0x334455, metalness: 0.6, roughness: 0.3
    }));
    panel.position.set(ctrlX, 3.5, -1.5);
    panel.castShadow = true;
    subsystems.controls.add(panel);

    // ECY-600 PLC (circuit board)
    const plcGeo = new THREE.BoxGeometry(1.4, 1.8, 0.1);
    const plc = new THREE.Mesh(plcGeo, mat.pcb);
    plc.position.set(ctrlX, 3.5, -1.25);
    subsystems.controls.add(plc);

    // PLC status LEDs
    for (let led = 0; led < 6; led++) {
      const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const ledMat = new THREE.MeshStandardMaterial({
        color: led < 3 ? 0x00ff44 : 0xff8800,
        emissive: led < 3 ? 0x00ff44 : 0xff8800,
        emissiveIntensity: 1.0,
      });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(ctrlX - 0.5 + led * 0.2, 4.2, -1.2);
      ledMesh.userData = { isLED: true, blinkRate: 0.5 + Math.random() * 2 };
      subsystems.controls.add(ledMesh);
    }

    // Terminal blocks
    for (let tb = 0; tb < 4; tb++) {
      const tbGeo = new THREE.BoxGeometry(1.2, 0.15, 0.15);
      const tbMesh = new THREE.Mesh(tbGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
      tbMesh.position.set(ctrlX, 2.4 + tb * 0.2, -1.25);
      subsystems.controls.add(tbMesh);
    }

    // Wiring conduit
    const conduitGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    const conduit = new THREE.Mesh(conduitGeo, mat.wire);
    conduit.position.set(ctrlX + 0.8, 2.5, -1.0);
    subsystems.controls.add(conduit);

    // BACnet module
    const bacnetGeo = new THREE.BoxGeometry(0.6, 0.4, 0.12);
    const bacnet = new THREE.Mesh(bacnetGeo, new THREE.MeshStandardMaterial({
      color: 0x2255aa, metalness: 0.5, roughness: 0.4
    }));
    bacnet.position.set(ctrlX - 0.5, 2.8, -1.25);
    subsystems.controls.add(bacnet);

    // Ethernet port indicator
    const ethGeo = new THREE.BoxGeometry(0.12, 0.08, 0.06);
    const eth = new THREE.Mesh(ethGeo, mat.glow);
    eth.position.set(ctrlX - 0.5, 2.7, -1.18);
    eth.userData = { isLED: true, blinkRate: 3 };
    subsystems.controls.add(eth);

    // Sensor junction box
    const jBoxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.3);
    const jBox = new THREE.Mesh(jBoxGeo, mat.panel);
    jBox.position.set(ctrlX, 1.2, 0);
    subsystems.controls.add(jBox);

    unitGroup.add(subsystems.controls);

    // === ACCENT DETAILS ===
    // Blue Frontier logo stripe along top
    const logoStripeGeo = new THREE.BoxGeometry(L - 1, 0.04, 0.15);
    const logoStripe = new THREE.Mesh(logoStripeGeo, mat.accent);
    logoStripe.position.set(0, H + 0.1, W/2 + 0.1);
    unitGroup.add(logoStripe);

    // Air intake louvers (left end)
    for (let lv = 0; lv < 5; lv++) {
      const louverGeo = new THREE.BoxGeometry(0.04, 0.15, W * 0.6);
      const louver = new THREE.Mesh(louverGeo, mat.frame);
      louver.position.set(-L/2 - 0.01, 1.5 + lv * 0.8, 0);
      louver.rotation.z = Math.PI * 0.15;
      unitGroup.add(louver);
    }

    // Exhaust grille (right end)
    for (let eg = 0; eg < 4; eg++) {
      const eGeo = new THREE.BoxGeometry(0.04, 0.12, W * 0.4);
      const eMesh = new THREE.Mesh(eGeo, mat.frame);
      eMesh.position.set(L/2 + 0.01, 2.0 + eg * 0.6, 0.5);
      unitGroup.add(eMesh);
    }

    scene.add(unitGroup);

    // Store refs
    sceneRef.current = { scene, camera, renderer, unitGroup, subsystems, doors, mat, THREE, point1 };

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const doorMeshes = doors;
      const hits = raycaster.intersectObjects(doorMeshes);
      if (hits.length > 0) {
        const sub = hits[0].object.userData.subsystem;
        if (sub) onSubsystemClick(sub);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // Mouse orbit
    let isDragging = false, prevX = 0, prevY = 0;
    let orbitAngle = 0.8, orbitPitch = 0.4, orbitDist = 28;

    const onDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { isDragging = false; };
    const onMove = (e) => {
      if (!isDragging) return;
      orbitAngle += (e.clientX - prevX) * 0.005;
      orbitPitch = Math.max(0.05, Math.min(1.2, orbitPitch + (e.clientY - prevY) * 0.005));
      prevX = e.clientX; prevY = e.clientY;
    };
    const onWheel = (e) => {
      orbitDist = Math.max(10, Math.min(50, orbitDist + e.deltaY * 0.02));
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    renderer.domElement.addEventListener("mouseup", onUp);
    renderer.domElement.addEventListener("mousemove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Touch support
    let touchPrev = null;
    renderer.domElement.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) { touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    });
    renderer.domElement.addEventListener("touchmove", (e) => {
      if (!touchPrev || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchPrev.x;
      const dy = e.touches[0].clientY - touchPrev.y;
      orbitAngle += dx * 0.005;
      orbitPitch = Math.max(0.05, Math.min(1.2, orbitPitch + dy * 0.005));
      touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    renderer.domElement.addEventListener("touchend", () => { touchPrev = null; });

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = Date.now() / 1000;

      // Camera orbit
      camera.position.x = Math.sin(orbitAngle) * orbitDist * Math.cos(orbitPitch);
      camera.position.z = Math.cos(orbitAngle) * orbitDist * Math.cos(orbitPitch);
      camera.position.y = Math.sin(orbitPitch) * orbitDist;
      camera.lookAt(0, H / 2, 0);

      // Animate point light
      point1.position.x = Math.sin(t * 0.5) * 5;
      point1.position.z = Math.cos(t * 0.5) * 3;

      // Animate fans
      scene.traverse(obj => {
        if (obj.userData.isFan) {
          obj.rotation.z += obj.userData.speed;
        }
        if (obj.userData.isLED) {
          const blink = Math.sin(t * obj.userData.blinkRate * Math.PI) > 0;
          obj.visible = blink;
        }
        if (obj.userData.isLiquid) {
          obj.scale.y = 0.9 + Math.sin(t * 0.3) * 0.05;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const nw = mountRef.current?.clientWidth || w;
      const nh = mountRef.current?.clientHeight || h;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("mousedown", onDown);
      renderer.domElement.removeEventListener("mouseup", onUp);
      renderer.domElement.removeEventListener("mousemove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onSubsystemClick]);

  // Handle view changes and door animations
  useEffect(() => {
    const s = sceneRef.current;
    if (!s.scene) return;
    const { subsystems: subs, doors: drs, THREE: T } = s;

    drs.forEach(door => {
      const sub = door.userData.subsystem;
      const isTarget = activeView === sub;
      const isOverview = activeView === "overview";

      if (isTarget && doorOpen) {
        // Slide door open (translate along X)
        door.position.x = door.userData.originalX + door.userData.doorWidth * 0.6;
        door.material.opacity = 0.3;
      } else {
        door.position.x = door.userData.originalX;
        door.material.opacity = 0.75;
      }
    });

    // Fade other subsystems when focused
    Object.entries(subs).forEach(([name, group]) => {
      group.traverse(obj => {
        if (obj.material) {
          if (activeView === "overview") {
            obj.material.transparent = true;
            obj.material.opacity = Math.min(obj.material.opacity + 0.1, 0.9);
            obj.visible = true;
          } else if (activeView === name) {
            obj.material.transparent = true;
            obj.material.opacity = Math.min(obj.material.opacity + 0.1, 1.0);
            obj.visible = true;
          } else {
            obj.material.transparent = true;
            obj.material.opacity = 0.08;
          }
        }
      });
    });
  }, [activeView, doorOpen]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />;
}

// --- SPARKLINE MINI CHART ---
function Sparkline({ data, color, width = 120, height = 28 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- SENSOR CARD ---
function SensorCard({ label, value, unit, color, sub }) {
  return (
    <div style={{
      background: "rgba(10,14,23,0.85)", border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`, borderRadius: 6, padding: "6px 10px",
      marginBottom: 4, backdropFilter: "blur(8px)",
    }}>
      <div style={{ fontSize: 10, color: "#7a8a9a", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 11, color: "#556", marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

// --- SUBSYSTEM DETAIL PANEL ---
function SubsystemPanel({ name, data, onClose }) {
  if (!data) return null;
  const colors = { conditioner: "#0099ff", regenerator: "#ff6622", storage: "#00cc77", controls: "#9955ee" };
  const c = colors[name] || "#fff";
  const titles = { conditioner: "CONDITIONER CORE", regenerator: "REGENERATOR", storage: "STORAGE TANKS", controls: "ECY-600 CONTROLS" };

  const renderFields = () => {
    switch (name) {
      case "conditioner": return (
        <>
          <SensorCard label="Supply Air Temp" value={data.conditioner.SA_Temp} unit="°F" color={c} />
          <SensorCard label="Supply Dewpoint" value={data.conditioner.SA_Dewpoint} unit="°F" color={c} />
          <SensorCard label="Outside Air Temp" value={data.conditioner.OA_Temp} unit="°F" color={c} />
          <SensorCard label="Outside Air RH" value={data.conditioner.OA_RH} unit="%" color={c} />
          <div style={{ borderTop: `1px solid ${c}22`, margin: "6px 0", paddingTop: 6 }}>
            <div style={{ fontSize: 10, color: "#556", marginBottom: 4, letterSpacing: 1 }}>BLOWER SPEEDS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {["BL1","BL2","BL3"].map((b,i) => (
                <div key={b} style={{ textAlign: "center", background: `${c}11`, borderRadius: 4, padding: "4px 0" }}>
                  <div style={{ fontSize: 9, color: "#667" }}>CH{i+1}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "monospace" }}>{data.conditioner[`${b}_Speed`]}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 4 }}>
            {["FT1","FT2","FT3"].map((f,i) => (
              <div key={f} style={{ textAlign: "center", background: `${c}11`, borderRadius: 4, padding: "4px 0" }}>
                <div style={{ fontSize: 9, color: "#667" }}>CFM CH{i+1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c, fontFamily: "monospace" }}>{data.conditioner[`${f}_CFM`]}</div>
              </div>
            ))}
          </div>
          <SensorCard label="LD Pump Speed (C_P1)" value={data.conditioner.P1_Speed} unit="%" color={c} />
          <SensorCard label="LD Flow (C_FM3)" value={data.conditioner.FM3_GPM} unit="GPM" color={c} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 4 }}>
            <SensorCard label="DCW Duty" value={data.conditioner.DCW_Duty} unit="%" color="#00ddff" />
            <SensorCard label="IECW Duty" value={data.conditioner.IECW_Duty} unit="%" color="#00ddff" />
          </div>
          <SensorCard label="Conditioner State" value={data.conditioner.State} unit="" color={c} />
        </>
      );
      case "regenerator": return (
        <>
          <SensorCard label="Compressor" value={data.regenerator.COMP_Running ? "RUNNING" : "OFF"} unit="" color={data.regenerator.COMP_Running ? "#00ff66" : "#ff4444"} />
          <SensorCard label="Regen State" value={data.regenerator.State_Label} unit={`(${data.regenerator.State})`} color={c} />
          <SensorCard label="Regen Blower Speed" value={data.regenerator.BL1_Speed} unit="%" color={c} />
          <SensorCard label="Regen Pump Speed" value={data.regenerator.P1_Speed} unit="%" color={c} />
          <SensorCard label="Discharge Pressure" value={data.regenerator.Discharge_PSI} unit="PSI" color={c} />
          <SensorCard label="Suction Pressure" value={data.regenerator.Suction_PSI} unit="PSI" color={c} />
          <SensorCard label="Superheat" value={data.regenerator.Superheat} unit="°F" color={c} />
        </>
      );
      case "storage": return (
        <>
          <SensorCard label="State of Desiccant (SOD)" value={data.storage.SOD} unit="%" color={c} />
          <SensorCard label="Tank Level" value={data.storage.Level_Pct} unit="%" color={c} />
          <SensorCard label="Target Concentration" value={data.storage.Target_Conc} unit="%" color="#00ddff" />
          <SensorCard label="Regen Threshold" value={data.storage.Regen_Thresh} unit="%" color="#ffaa00" />
          <div style={{ marginTop: 8, padding: 8, background: `${c}11`, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: "#667", marginBottom: 4, letterSpacing: 1 }}>SOD vs THRESHOLDS</div>
            <div style={{ position: "relative", height: 12, background: "#111", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${data.storage.SOD * 2.5}%`, background: `linear-gradient(90deg, ${c}44, ${c})`, borderRadius: 6 }} />
              <div style={{ position: "absolute", left: `${data.storage.Regen_Thresh * 2.5}%`, top: 0, height: "100%", width: 2, background: "#ffaa00" }} />
              <div style={{ position: "absolute", left: `${data.storage.Target_Conc * 2.5}%`, top: 0, height: "100%", width: 2, background: "#00ddff" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#556", marginTop: 2 }}>
              <span>0%</span><span>Regen↑</span><span>Target↑</span><span>100%</span>
            </div>
          </div>
        </>
      );
      case "controls": return (
        <>
          <SensorCard label="Supply Air SP" value={data.controls.SP_SA_CFM} unit="CFM" color={c} />
          <SensorCard label="Outside Air Ratio" value={data.controls.SP_OAR} unit="%" color={c} />
          <SensorCard label="Power Consumption" value={data.controls.kW_Total} unit="kW" color="#ffcc00" />
          <SensorCard label="Water Usage" value={data.controls.Water_GPD} unit="GPD" color="#00bbff" />
          <SensorCard label="Compressor Hours" value={data.controls.Compressor_Hrs.toLocaleString()} unit="hrs" color={c} />
          <SensorCard label="System Runtime" value={data.controls.Runtime_Hrs.toLocaleString()} unit="hrs" color={c} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 4 }}>
            <div style={{
              textAlign: "center", padding: "8px 0", borderRadius: 6,
              background: data.controls.Alarms > 0 ? "#ff222233" : "#00ff4411",
              border: `1px solid ${data.controls.Alarms > 0 ? "#ff4444" : "#00ff44"}33`,
            }}>
              <div style={{ fontSize: 9, color: "#778" }}>ALARMS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: data.controls.Alarms > 0 ? "#ff4444" : "#00ff44", fontFamily: "monospace" }}>{data.controls.Alarms}</div>
            </div>
            <div style={{
              textAlign: "center", padding: "8px 0", borderRadius: 6,
              background: data.controls.Alerts > 0 ? "#ffaa0022" : "#00ff4411",
              border: `1px solid ${data.controls.Alerts > 0 ? "#ffaa00" : "#00ff44"}33`,
            }}>
              <div style={{ fontSize: 9, color: "#778" }}>ALERTS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: data.controls.Alerts > 0 ? "#ffaa00" : "#00ff44", fontFamily: "monospace" }}>{data.controls.Alerts}</div>
            </div>
          </div>
        </>
      );
      default: return null;
    }
  };

  return (
    <div style={{
      position: "absolute", right: 12, top: 70, width: 260, maxHeight: "calc(100vh - 160px)",
      overflowY: "auto", background: "rgba(8,12,20,0.92)", border: `1px solid ${c}33`,
      borderRadius: 10, backdropFilter: "blur(12px)", zIndex: 20,
      scrollbarWidth: "thin", scrollbarColor: `${c}44 transparent`,
    }}>
      <div style={{
        position: "sticky", top: 0, background: "rgba(8,12,20,0.95)", padding: "12px 14px 8px",
        borderBottom: `1px solid ${c}22`, zIndex: 1,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: c, letterSpacing: 2 }}>{titles[name]}</div>
          <button onClick={onClose} style={{
            background: "none", border: `1px solid ${c}44`, color: c, cursor: "pointer",
            borderRadius: 4, padding: "2px 8px", fontSize: 11,
          }}>✕</button>
        </div>
      </div>
      <div style={{ padding: "8px 12px 12px" }}>
        {renderFields()}
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function DOASDigitalTwin() {
  const [activeView, setActiveView] = useState("overview");
  const [doorOpen, setDoorOpen] = useState(false);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const sensorData = useSensorData();

  // Load Three.js
  useEffect(() => {
    if (window.THREE) { setThreeLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => setThreeLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleSubsystemClick = useCallback((name) => {
    if (activeView === name) {
      setActiveView("overview");
      setDoorOpen(false);
    } else {
      setActiveView(name);
      setDoorOpen(true);
    }
  }, [activeView]);

  const subsystemButtons = [
    { key: "conditioner", label: "CONDITIONER", color: "#0099ff", icon: "❄" },
    { key: "regenerator", label: "REGENERATOR", color: "#ff6622", icon: "🔥" },
    { key: "storage", label: "STORAGE", color: "#00cc77", icon: "🛢" },
    { key: "controls", label: "CONTROLS", color: "#9955ee", icon: "⚡" },
  ];

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0e17", position: "relative",
      fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#c8d8e8", overflow: "hidden",
      userSelect: "none",
    }}>
      {/* Load Inter + JetBrains Mono */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* 3D Canvas */}
      {threeLoaded && (
        <ThreeCanvas activeView={activeView} onSubsystemClick={handleSubsystemClick} doorOpen={doorOpen} />
      )}

      {/* TOP BAR */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: "linear-gradient(180deg, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.7) 100%)",
        borderBottom: "1px solid #1a2a3a", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", zIndex: 30,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, background: "linear-gradient(135deg, #0077cc, #00ddff)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800,
          }}>BF</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>DOAS-005 DIGITAL TWIN</div>
            <div style={{ fontSize: 10, color: "#556677" }}>Von's/Albertsons — Gardena, CA | BFLDD1806SSB0SS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {sensorData && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: sensorData.status === "Normal" ? "#00ff66" : "#ff4444",
                boxShadow: `0 0 8px ${sensorData.status === "Normal" ? "#00ff66" : "#ff4444"}`,
                animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 11, color: "#7a8a9a", fontFamily: "monospace" }}>{sensorData.status.toUpperCase()}</span>
            </div>
          )}
          <div style={{ fontSize: 10, color: "#445566", fontFamily: "monospace" }}>
            {sensorData ? new Date(sensorData.timestamp).toLocaleTimeString() : "--:--:--"}
          </div>
        </div>
      </div>

      {/* SUBSYSTEM NAV BUTTONS */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 30, padding: "8px 12px",
        background: "rgba(8,12,20,0.85)", borderRadius: 12, border: "1px solid #1a2a3a",
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={() => { setActiveView("overview"); setDoorOpen(false); }}
          style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${activeView === "overview" ? "#00ddff" : "#1a2a3a"}`,
            background: activeView === "overview" ? "#00ddff11" : "transparent",
            color: activeView === "overview" ? "#00ddff" : "#556677",
            cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: 1,
            transition: "all 0.3s",
          }}
        >
          ◉ OVERVIEW
        </button>
        {subsystemButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => handleSubsystemClick(btn.key)}
            style={{
              padding: "8px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${activeView === btn.key ? btn.color : "#1a2a3a"}`,
              background: activeView === btn.key ? `${btn.color}18` : "transparent",
              color: activeView === btn.key ? btn.color : "#556677",
              fontSize: 10, fontWeight: 700, letterSpacing: 1,
              transition: "all 0.3s",
            }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* LEFT SIDEBAR — Overview Telemetry */}
      {activeView === "overview" && sensorData && (
        <div style={{
          position: "absolute", left: 12, top: 70, width: 200,
          background: "rgba(8,12,20,0.88)", border: "1px solid #1a2a3a",
          borderRadius: 10, padding: 12, zIndex: 20, backdropFilter: "blur(12px)",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#556677", letterSpacing: 2, marginBottom: 8 }}>LIVE TELEMETRY</div>
          <SensorCard label="Supply Air" value={sensorData.conditioner.SA_Temp} unit="°F" color="#0099ff" />
          <SensorCard label="Supply Dewpoint" value={sensorData.conditioner.SA_Dewpoint} unit="°F" color="#0099ff" />
          <SensorCard label="Outside Air" value={sensorData.conditioner.OA_Temp} unit="°F" color="#ff8844" />
          <SensorCard label="Tank SOD" value={sensorData.storage.SOD} unit="%" color="#00cc77" />
          <SensorCard label="Power" value={sensorData.controls.kW_Total} unit="kW" color="#ffcc00" />
          <SensorCard label="Water" value={sensorData.controls.Water_GPD} unit="GPD" color="#00bbff" />
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 9, color: "#445", letterSpacing: 1, marginBottom: 4 }}>POWER TREND</div>
            <Sparkline data={sensorData.sparkline.map(s => s.kw)} color="#ffcc00" />
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 9, color: "#445", letterSpacing: 1, marginBottom: 4 }}>SA TEMP TREND</div>
            <Sparkline data={sensorData.sparkline.map(s => s.temp)} color="#0099ff" />
          </div>
        </div>
      )}

      {/* RIGHT PANEL — Subsystem Detail */}
      {activeView !== "overview" && sensorData && (
        <SubsystemPanel
          name={activeView}
          data={sensorData}
          onClose={() => { setActiveView("overview"); setDoorOpen(false); }}
        />
      )}

      {/* UNIT INFO BADGE */}
      {sensorData && (
        <div style={{
          position: "absolute", bottom: 80, left: 12, padding: "6px 10px",
          background: "rgba(8,12,20,0.8)", borderRadius: 6, border: "1px solid #1a2a3a",
          fontSize: 9, color: "#445566", zIndex: 20, fontFamily: "monospace", lineHeight: 1.6,
        }}>
          SN: {sensorData.serial}<br />
          MODEL: {sensorData.model}<br />
          {sensorData.voltage} | 15 TON | 17'×6'×6'
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div style={{
        position: "absolute", bottom: 80, right: 12, padding: "6px 10px",
        background: "rgba(8,12,20,0.8)", borderRadius: 6, border: "1px solid #1a2a3a",
        fontSize: 9, color: "#445566", zIndex: 20, lineHeight: 1.6,
      }}>
        🖱 Drag to orbit · Scroll to zoom<br />
        Click colored doors to explore subsystems
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334; border-radius: 4px; }
      `}</style>
    </div>
  );
}
