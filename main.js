import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
let isTransitioning = false
let currentMode = 'explore'
let batcaveModel = null, aventadorModel = null, batpodModel = null, batsignalModel = null
let modelsLoaded = 0
const TOTAL_MODELS = 4

// Clickable mesh groups
const screenMeshes   = []   // screens in the batcave GLB
const tumblerMeshes  = []   // built-in batmobile in the batcave GLB
const aventadorMeshes= []   // external Lamborghini Aventador
const batpodMeshes   = []   // batpod motorcycle
const batsignalMeshes= []   // batman+signal model
const hotspotCores   = []
const hotspotObjects = []

// ═══════════════════════════════════════════════════════════
// SCREEN CONTENT
// ═══════════════════════════════════════════════════════════
const SCREEN_SECTIONS = ['identity','missions','arsenal','intel','contact']
let currentScreenSection = 0

const SCREEN_CONTENT = {
  identity: {
    name:'IDENTITY',
    render:()=>`
    <div class="screen-2col">
      <div>
        <h1 class="screen-big">VISHWAS<br>TIWARI</h1>
        <p class="screen-sub">GOTHAM'S AI ARCHITECT</p>
        <span class="screen-label">DESIGNATION</span><div class="screen-value">AI Builder &amp; Co-Founder · Enfibio Technologies</div>
        <span class="screen-label">LOCATION</span><div class="screen-value">Batcave Node: Hyderabad · Open to Global Operations</div>
        <span class="screen-label">TRAINING</span><div class="screen-value">B.Tech CSE · Intelligence Systems Analyst</div>
        <span class="screen-label">CLEARANCE</span><div class="screen-value">OMEGA LEVEL — Top 2% India AI Impact Buildathon</div>
        <span class="screen-label">STATUS</span><div class="screen-value"><span style="color:#00ff88;margin-right:8px">●</span>ACTIVE — READY FOR DEPLOYMENT</div>
      </div>
      <div>
        <span class="screen-label">FIELD BRIEF</span>
        <p class="screen-bio">We are the shadows that build the light. Startup co-founder with 15+ production AI systems across autonomous agents, on-device ML, medical RAG, and defense simulation. Delegate — India AI Impact Summit 2026.</p>
        <br>
        <span class="screen-label">ARSENAL FOCUS</span>
        <p class="screen-bio" style="margin-bottom:28px">On-Device ML · Autonomous Agents · Defense Intelligence · Edge AI · IoT Surveillance</p>
        <div class="screen-stat-grid">
          ${[['15+','AI Systems'],['40K+','Contenders Bested'],['2','Funded Projects'],['OMEGA','Clearance']].map(([n,l])=>`
            <div class="screen-stat-cell"><div class="screen-stat-num">${n}</div><div class="screen-stat-lbl">${l}</div></div>`).join('')}
        </div>
      </div>
    </div>`
  },
  missions:{
    name:'MISSIONS',
    render:()=>`
    <div class="screen-1col">
      <p style="font-family:'Share Tech Mono';font-size:9px;color:rgba(245,197,24,0.4);letter-spacing:0.28em;margin-bottom:22px">CLASSIFIED OPERATIONS — 8 ACTIVE FIELD MISSIONS</p>
      <div class="screen-missions">
        ${[
          {id:'001',code:'WAYNE-OPS',title:'AI Anti-Scam Agent',desc:'Autonomous AI intercepts scammers, voice-impersonates targets. Zero human involvement.',color:'#ff3355'},
          {id:'002',code:'S.A.M',title:'On-Device AI · 40MB Zero Cloud',desc:'TinyLLaMA fine-tuned to 40MB. Full comms control via voice. Continuous wake-word, zero cloud.',color:'#00ff88'},
          {id:'003',code:'MEDGPT',title:'RAG Medical Intelligence',desc:'302 pages of medical trauma literature + real-time PubMed. Llama 3.1 70B with citations.',color:'#00d4ff'},
          {id:'004',code:'MUNZOPAY',title:'Secure P2P Network',desc:"P2P payments over Bluetooth. Zero internet required. Impenetrable offline mesh.",color:'#f5c518'},
          {id:'005',code:'PANOPTIC',title:'UAS-SIGINT Defense Platform',desc:'3D tactical terrain, RADAR/SAR, RF spectrogram, NVG/FLIR modes. iDEX PRIME.',color:'#ff8c00'},
          {id:'006',code:'LEARNMATE',title:'Civilian Education AI',desc:'Adaptive learning node. AI tutor, progression analytics.',color:'#aa66ff'},
          {id:'007',code:'SEWAGE-OPS',title:'Gotham Subterranean IoT',desc:'ESP32 + MQTT. Real-time underground overflow detection.',color:'#00ff88'},
          {id:'008',code:'ENFIBIO',title:'Co-Founded Tech Firm',desc:'Led all tactical tech: AI, IoT, mobile. Funded institutional prototype.',color:'#f5c518'},
        ].map(p=>`<div class="sm-card" style="border-left-color:${p.color}">
          <div class="sm-mid">CASE-FILE-${p.id}</div>
          <div class="sm-code">${p.code}</div>
          <div class="sm-title">${p.title}</div>
          <div class="sm-desc">${p.desc}</div>
        </div>`).join('')}
      </div>
    </div>`
  },
  arsenal:{
    name:'ARSENAL',
    render:()=>`
    <div class="screen-2col">
      <div>
        ${[
          {cat:'⬡ AI / ML SYSTEMS',color:'#f5c518',skills:[['TinyLLaMA / LLMs',95],['RAG + FAISS / Pinecone',90],['OpenCV + MediaPipe',85],['LSTM / Sequences',80],['LLM APIs — Sarvam, OpenRouter',93]]},
          {cat:'◈ EXECUTION STACK',color:'#ff8c00',skills:[['Python / FastAPI',95],['Flutter / Dart',90],['React / Next.js',88],['Node.js / Express',82],['Three.js / WebGL',82]]},
        ].map(g=>`<div style="margin-bottom:26px">
          <div style="font-family:'Bebas Neue';font-size:12px;letter-spacing:0.18em;color:${g.color};margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06)">${g.cat}</div>
          ${g.skills.map(([n,p])=>`<div class="screen-skill">
            <span class="screen-skill-name">${n}</span>
            <div class="screen-skill-bar"><div class="screen-skill-fill skill-anim" style="width:0%;background:${g.color}" data-w="${p}%"></div></div>
          </div>`).join('')}
        </div>`).join('')}
      </div>
      <div>
        ${[
          {cat:'◉ HARDWARE / EMBEDDED',color:'#00ff88',skills:[['ESP32 / IoT / MQTT',85],['BLE / WebSocket',88],['AWS / Cloud Infra',75],['Firebase / MongoDB',85],['Streamlit / HuggingFace',88]]},
          {cat:'▣ LANGUAGES',color:'#00d4ff',skills:[['Python',95],['JavaScript / TypeScript',88],['Dart',90],['Java',70],['PHP',62]]},
        ].map(g=>`<div style="margin-bottom:26px">
          <div style="font-family:'Bebas Neue';font-size:12px;letter-spacing:0.18em;color:${g.color};margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06)">${g.cat}</div>
          ${g.skills.map(([n,p])=>`<div class="screen-skill">
            <span class="screen-skill-name">${n}</span>
            <div class="screen-skill-bar"><div class="screen-skill-fill skill-anim" style="width:0%;background:${g.color}" data-w="${p}%"></div></div>
          </div>`).join('')}
        </div>`).join('')}
        <div style="margin-top:12px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.05)">
          <div style="font-family:'Share Tech Mono';font-size:8px;letter-spacing:0.3em;color:rgba(245,197,24,0.4);margin-bottom:8px">CERTIFICATIONS</div>
          ${['AI-ML Virtual Internship','AWS Cloud Foundations','Google Android Dev','Prompt Engineering — Be10x'].map(c=>`
            <div style="font-family:'Share Tech Mono';font-size:8px;border:1px solid rgba(245,197,24,0.15);padding:4px 10px;color:rgba(245,197,24,0.55);margin-bottom:4px">${c}</div>`).join('')}
        </div>
      </div>
    </div>`
  },
  intel:{
    name:'INTEL',
    render:()=>`
    <div class="screen-intel">
      ${[
        {rank:'01',color:'#f5c518',tier:'🏆 ELITE TIER',title:'TOP 2% — INDIA AI IMPACT BUILDATHON',org:'GUVI × HCL · February 2026',detail:'40,000+ participants. Top 2% globally. Project: AI Honeypot Anti-Fraud System. Delegate at India AI Impact Summit 2026, New Delhi.'},
        {rank:'02',color:'#00ff88',tier:'💡 FUNDED',title:'IEDC INSTITUTIONAL GRANT',org:'Sphoorthy Engineering College · 2024',detail:'Secured institutional grant for Smart Portable Freezer — AI-managed cold chain IoT prototype for medical logistics.'},
      ].map(a=>`<div class="si-card" style="border-left-color:${a.color}">
        <div class="si-rank" style="color:${a.color}">${a.rank}</div>
        <div>
          <div class="si-tier" style="color:${a.color}">${a.tier}</div>
          <div class="si-title">${a.title}</div>
          <div class="si-org">${a.org}</div>
          <div class="si-detail">${a.detail}</div>
        </div>
      </div>`).join('')}
    </div>`
  },
  contact:{
    name:'OPEN COMMS',
    render:()=>`
    <div style="display:flex;flex-direction:column;align-items:center;width:100%">
      <blockquote style="font-family:Cinzel;font-style:italic;font-size:15px;color:rgba(255,255,255,0.28);border-left:2px solid #f5c518;padding:0 0 0 20px;margin:0 0 36px;max-width:560px;line-height:2">
        "THE WORLD DOESN'T NEED ANOTHER DEVELOPER.<br>IT NEEDS THE RIGHT ONE."
      </blockquote>
      <div class="screen-contact">
        <a href="mailto:vishwast656@gmail.com" class="sc-row"><span class="sc-icon">✉</span><div><div class="sc-lbl">EMAIL</div><div class="sc-val">vishwast656@gmail.com</div></div></a>
        <a href="https://github.com/vishwastiwari01" target="_blank" rel="noopener" class="sc-row"><span class="sc-icon">⌥</span><div><div class="sc-lbl">GITHUB</div><div class="sc-val">github.com/vishwastiwari01</div></div></a>
        <a href="https://linkedin.com/in/vishwas-tiwari" target="_blank" rel="noopener" class="sc-row"><span class="sc-icon">◈</span><div><div class="sc-lbl">LINKEDIN</div><div class="sc-val">linkedin.com/in/vishwas-tiwari</div></div></a>
        <a href="tel:+916302429095" class="sc-row"><span class="sc-icon">◉</span><div><div class="sc-lbl">PHONE</div><div class="sc-val">+91 6302429095</div></div></a>
        <a href="mailto:vishwast656@gmail.com" class="sc-cta">⬡ INITIATE CONTACT</a>
      </div>
    </div>`
  }
}

// ═══════════════════════════════════════════════════════════
// WAYPOINTS
// ═══════════════════════════════════════════════════════════
const WAYPOINTS = [
  // Eye-level overview — looking across the cave floor, not top-down
  { id:'overview',     label:'⬡ OVERVIEW',     camPos:new THREE.Vector3(0, 3.5, 14),  target:new THREE.Vector3(0, 2, 0),      panel:null },
  // Fly IN in front of the elevated Bat-computer screens at the top left
  { id:'bat_computer', label:'◈ BAT-COMPUTER', camPos:new THREE.Vector3(-2, 8.5, -1),   target:new THREE.Vector3(-3, 8, -8),  panel:'identity' },
  // Aventador at ground level — side view of the car
  { id:'aventador',    label:'⬡ BATMOBILE',    camPos:new THREE.Vector3(7, 1.8, 5),   target:new THREE.Vector3(4.5, 1, 2),    panel:'missions' },
  // Batpod — close-up front angle
  { id:'batpod',       label:'◉ BATPOD',       camPos:new THREE.Vector3(0, 1.5, 5.5), target:new THREE.Vector3(-3.5, 1, 3.5), panel:'arsenal'  },
  // Batman + Bat-signal — look across toward them
  { id:'batsignal',    label:'▣ BAT-SIGNAL',   camPos:new THREE.Vector3(-2, 2.5, 2),  target:new THREE.Vector3(-5, 1.5, -1),  panel:'intel'    },
  // Contact — pull back to central view
  { id:'contact',      label:'◎ OPEN COMMS',   camPos:new THREE.Vector3(1, 3, 10),    target:new THREE.Vector3(0, 2, 0),      panel:'contact'  },
]
const WAYPOINT_KEYS = { '1':'overview','2':'bat_computer','3':'aventador','4':'batpod','5':'batsignal','6':'contact' }
let activeWaypoint = 'overview'

// ═══════════════════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════════════════
const canvas = document.getElementById('cave')
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.55    // bumped: 0.45 was too dark with cave BG
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
// Background handled via CSS (body background-image), canvas stays transparent
// so the cave photo shows cleanly behind all 3D content
renderer.setClearColor(0x000000, 0)   // transparent canvas clear
scene.fog = new THREE.FogExp2(0x080612, 0.014)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 300)
camera.position.set(0, 18, 22)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.04
controls.enableRotate = true      // ← re-enabled drag rotation
controls.enablePan    = true      // ← re-enabled pan
controls.enableZoom   = true
controls.zoomSpeed    = 0.8
controls.minDistance  = 2
controls.maxDistance  = 30
controls.target.set(0, 1.5, 0)
controls.enabled = false

// ═══════════════════════════════════════════════════════════
// BLOOM — significantly reduced
// ═══════════════════════════════════════════════════════════
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // strength ← was 0.8
  0.2,  // radius   ← tighter
  0.7   // threshold ← only very hot surfaces
)
composer.addPass(bloomPass)
composer.addPass(new OutputPass())

// ═══════════════════════════════════════════════════════════
// CAVE ENVIRONMENT — rocky walls, ceiling, stalactites
// ═══════════════════════════════════════════════════════════
function buildCaveShell() {
  // Cylinder cave walls
  const wallGeo = new THREE.CylinderGeometry(35, 30, 40, 12, 1, true)
  const wallMat = new THREE.MeshStandardMaterial({ color:0x0d0b14, roughness:1.0, metalness:0, side:THREE.BackSide })
  const wall = new THREE.Mesh(wallGeo, wallMat); wall.position.set(0,5,0); scene.add(wall)

  // Ceiling dome
  const ceilGeo = new THREE.SphereGeometry(32, 16, 8, 0, Math.PI*2, 0, Math.PI/2)
  const ceilMat = new THREE.MeshStandardMaterial({ color:0x080610, roughness:1, side:THREE.BackSide })
  scene.add(new THREE.Mesh(ceilGeo, ceilMat))

  // Floor (receives shadows)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60,60,1,1),
    new THREE.MeshStandardMaterial({ color:0x060510, roughness:1, metalness:0 })
  )
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor)

  // Stalactites hanging from ceiling
  const stalPositions = [
    [-8,4,3.5],[-12,-3,4.2],[6,-8,2.8],[10,6,5.1],[-5,10,3.3],
    [14,-5,4.4],[-15,2,5.2],[3,12,3.1],[-10,8,2.5],[8,-4,4.0],
    [-18,-8,3.8],[12,10,2.9],[-7,-12,4.8],[15,3,3.3],
  ]
  const stalMat = new THREE.MeshStandardMaterial({ color:0x0a0912, roughness:1 })
  stalPositions.forEach(([x,z,h]) => {
    const geo = new THREE.ConeGeometry(0.25+Math.random()*0.4, h, 6)
    const mesh = new THREE.Mesh(geo, stalMat)
    mesh.position.set(x, 20-h/2, z)
    scene.add(mesh)
  })

  // Subtle rock scatter at floor level
  for (let i=0; i<20; i++) {
    const r = 0.15+Math.random()*0.6
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 0),
      new THREE.MeshStandardMaterial({ color:0x09080f, roughness:1 })
    )
    rock.position.set((Math.random()-0.5)*28, r*0.3, (Math.random()-0.5)*24)
    rock.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3)
    scene.add(rock)
  }
}
buildCaveShell()

// ═══════════════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════════════
scene.add(new THREE.AmbientLight(0x0a1525, 0.85))
scene.add(new THREE.HemisphereLight(0x0a2040, 0x000000, 0.6))

// Screen glow — very dim
const screenL1 = new THREE.PointLight(0x002288, 1.0, 12); screenL1.position.set(-4,3,-1); scene.add(screenL1)
const screenL2 = new THREE.PointLight(0x001166, 0.6, 7);  screenL2.position.set(-2,2,1);  scene.add(screenL2)

// Batmobile key
const carKeyTarget = new THREE.Object3D(); carKeyTarget.position.set(4,0,2); scene.add(carKeyTarget)
const carKey = new THREE.SpotLight(0xffcc00, 5, 18, Math.PI/5, 0.4, 1)
carKey.position.set(6,7,6); carKey.target = carKeyTarget
carKey.castShadow = true; carKey.shadow.mapSize.set(1024,1024); scene.add(carKey)

// Car rim
const carRim = new THREE.PointLight(0x0044ff, 2.0, 8); carRim.position.set(2,2,6); scene.add(carRim)

// Bat-signal from above (dim)
const batSig = new THREE.SpotLight(0xf5c518, 2.5, 40, Math.PI/8, 0.6, 0.5)
batSig.position.set(0,20,0); batSig.target.position.set(0,0,0)
scene.add(batSig); scene.add(batSig.target)

// Bat-signal model spot (filled in once model loads)
let batsignalSpot = null

// ═══════════════════════════════════════════════════════════
// HDRI ENV MAP
// ═══════════════════════════════════════════════════════════
const pmrem = new THREE.PMREMGenerator(renderer)
pmrem.compileEquirectangularShader()
new RGBELoader()
  .setPath('https://threejs.org/examples/textures/equirectangular/')
  .load('venice_sunset_1k.hdr', (tex) => {
    scene.environment = pmrem.fromEquirectangular(tex).texture
    tex.dispose(); pmrem.dispose()
  }, undefined, () => {
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment()).texture
  })

// ═══════════════════════════════════════════════════════════
// LOADER SETUP
// ═══════════════════════════════════════════════════════════
const progressBar   = document.getElementById('progressBar')
const progressLabel = document.getElementById('progressLabel')
const STAGES = [
  [0,  'INITIALIZING BATCAVE SYSTEMS...'],
  [10, 'LOADING CAVE STRUCTURE...'],
  [30, 'DEPLOYING BATMOBILE...'],
  [50, 'DEPLOYING BATPOD...'],
  [65, 'LOADING BAT-SIGNAL...'],
  [80, 'CALIBRATING HOLOGRAPHIC HUD...'],
  [93, 'ESTABLISHING SECURE LINK...'],
  [100,'ALL SYSTEMS GO — CLEARANCE GRANTED'],
]
let currentProgress = 0
function setProgress(val) {
  val = Math.min(100, Math.max(currentProgress, val))
  currentProgress = val
  progressBar.style.width = val + '%'
  const idx = STAGES.findLastIndex(([p]) => val >= p)
  if (idx >= 0) progressLabel.textContent = STAGES[idx][1]
  if (val >= 100) {
    setTimeout(() => {
      const btn = document.getElementById('enterBtn')
      btn.style.display = 'block'
      gsap.fromTo(btn, {opacity:0,y:10}, {opacity:1,y:0,duration:0.6})
    }, 400)
  }
}

// DRACO
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
dracoLoader.setDecoderConfig({ type:'wasm' })
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// ─── autoFitModel ───
function autoFitModel(model, targetSize) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim === 0) return
  const scale = targetSize / maxDim
  model.scale.setScalar(scale)
  const box2 = new THREE.Box3().setFromObject(model)
  const c2 = box2.getCenter(new THREE.Vector3())
  model.position.x -= c2.x; model.position.z -= c2.z
  const box3 = new THREE.Box3().setFromObject(model)
  model.position.y -= box3.min.y
}

// ─── fixMaterials ───
function fixMaterials(model, type) {
  model.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true; child.receiveShadow = true
    child.frustumCulled = false

    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach(mat => {
      if (!mat) return
      mat.needsUpdate = true; mat.depthWrite = true
      if (mat.opacity !== undefined && mat.opacity < 0.15 && !mat.name?.toLowerCase().includes('glass')) {
        mat.opacity = 1; mat.transparent = false
      }
    })

    const n = child.name.toLowerCase()
    const m = Array.isArray(child.material) ? child.material[0] : child.material
    if (!m) return

    if (type === 'cave') {
      // Screens by name
      if (n.includes('screen') || n.includes('monitor') || n.includes('display') || n.includes('computer') || n.includes('tv') || n.includes('panel')) {
        m.emissive = new THREE.Color(0x000d2b)
        m.emissiveIntensity = 0.3
        screenMeshes.push(child)
      } else if (n.includes('neon') || n.includes('led') || n.includes('glow')) {
        m.emissive = new THREE.Color(0xf5c518); m.emissiveIntensity = 1.5
      }
      // The GLB's built-in Tumbler/Batmobile is also in the cave — detect it and make it clickable
      if (n.includes('tumbler') || n.includes('batmobile') || n.includes('vehicle') ||
          n.includes('car_body') || n.includes('car_') || n.includes('_car') || n.includes('wheel')) {
        tumblerMeshes.push(child)
      }
    }

    if (type === 'car') {
      aventadorMeshes.push(child)
      if (n.includes('headlight') || n.includes('tail') || n.includes('lamp')) {
        m.emissive = new THREE.Color(0xffcc00); m.emissiveIntensity = 3
      }
    }

    if (type === 'batpod') {
      batpodMeshes.push(child)
      if (n.includes('headlight') || n.includes('light') || n.includes('led')) {
        m.emissive = new THREE.Color(0x0055ff); m.emissiveIntensity = 2
      }
    }

    if (type === 'batsignal') {
      batsignalMeshes.push(child)
      if (n.includes('light') || n.includes('signal') || n.includes('lamp') || n.includes('bulb') || n.includes('glow')) {
        m.emissive = new THREE.Color(0xf5c518); m.emissiveIntensity = 1.5
      }
      if (n.includes('batman') || n.includes('cape') || n.includes('suit') || n.includes('dark') || n.includes('knight')) {
        if (m.color) m.color.set(0x0a0a0f)
        m.metalness = 0.3
      }
    }
  })
}

function onModelReady(progressTarget) {
  modelsLoaded++
  setProgress(progressTarget)
  if (modelsLoaded >= TOTAL_MODELS) {
    setProgress(100)
    repositionHotspots()
  }
}

// ─── BATCAVE ───
gltfLoader.load('https://media.githubusercontent.com/media/vishwastiwari01/Batfolio/main/models/the_batcave.glb',
  (gltf) => {
    batcaveModel = gltf.scene
    autoFitModel(batcaveModel, 20)
    fixMaterials(batcaveModel, 'cave')
    scene.add(batcaveModel)
    console.log('✅ Batcave loaded. Screens:', screenMeshes.length, 'Tumbler parts:', tumblerMeshes.length)

    // Screen fallback: if no screens found by name, pick all large flat meshes in back half
    if (screenMeshes.length === 0) {
      console.warn('⚠️ No screens by name — using position-based fallback')
      batcaveModel.traverse(c => {
        if (!c.isMesh) return
        const wp = new THREE.Vector3(); c.getWorldPosition(wp)
        if (wp.z < -2) {  // meshes in the back half of the cave
          screenMeshes.push(c)
        }
      })
      console.log('Screen fallback found', screenMeshes.length, 'meshes')
    }

    // Tumbler fallback: if none found by name, pick all large meshes above y=2 and back
    if (tumblerMeshes.length === 0) {
      console.warn('⚠️ No Tumbler by name — picking elevated meshes')
      batcaveModel.traverse(c => {
        if (!c.isMesh) return
        const wp = new THREE.Vector3(); c.getWorldPosition(wp)
        if (wp.y > 2 && wp.x > 3) tumblerMeshes.push(c)
      })
    }
    onModelReady(30)
  },
  (xhr) => { if (xhr.total>0) setProgress(10 + (xhr.loaded/xhr.total)*18) },
  (err) => { console.error('❌ Batcave:', err); buildFallbackCave(); onModelReady(30) }
)

// ─── AVENTADOR ───
gltfLoader.load('https://media.githubusercontent.com/media/vishwastiwari01/Batfolio/main/models/aventador.glb',
  (gltf) => {
    aventadorModel = gltf.scene
    autoFitModel(aventadorModel, 5)
    aventadorModel.position.set(4.5, 0, 2)
    aventadorModel.rotation.y = -Math.PI/5
    fixMaterials(aventadorModel, 'car')
    scene.add(aventadorModel)
    console.log('✅ Aventador loaded')
    onModelReady(50)
  },
  (xhr) => { if (xhr.total>0) setProgress(30 + (xhr.loaded/xhr.total)*18) },
  (err) => { console.error('❌ Aventador:', err); buildFallbackCar(); onModelReady(50) }
)

// ─── BATPOD ───
gltfLoader.load('https://media.githubusercontent.com/media/vishwastiwari01/Batfolio/main/models/dark_knight_batpod.glb',
  (gltf) => {
    batpodModel = gltf.scene
    autoFitModel(batpodModel, 3.5)
    // Place batpod between the Aventador and the cave center
    batpodModel.position.set(-2.5, 0, 4.5)
    batpodModel.rotation.y = Math.PI/3
    fixMaterials(batpodModel, 'batpod')
    scene.add(batpodModel)
    console.log('✅ Batpod loaded')
    onModelReady(65)
  },
  (xhr) => { if (xhr.total>0) setProgress(50 + (xhr.loaded/xhr.total)*13) },
  (err) => { console.warn('⚠️ Batpod:', err); onModelReady(65) }
)

// ─── BATMAN / BAT-SIGNAL ───
gltfLoader.load('https://media.githubusercontent.com/media/vishwastiwari01/Batfolio/main/models/batman_the_animated_series_1992.glb',
  (gltf) => {
    batsignalModel = gltf.scene
    autoFitModel(batsignalModel, 4.5)   // slightly smaller
    // Position in the open front-left area — clearly visible from overview
    batsignalModel.position.set(-5, 0, 0)
    batsignalModel.rotation.y = -Math.PI/8  // facing slightly toward camera
    fixMaterials(batsignalModel, 'batsignal')
    scene.add(batsignalModel)

    // Spotlight from above pointing at the model
    batsignalSpot = new THREE.SpotLight(0xf5c518, 3, 20, Math.PI/6, 0.4)
    batsignalSpot.position.set(-5, 8, 1)
    batsignalSpot.target = batsignalModel
    batsignalSpot.castShadow = false
    scene.add(batsignalSpot)

    // Ground backlight — blue-purple under the base for drama
    const sigGround = new THREE.PointLight(0x4400ff, 2.5, 6)
    sigGround.position.set(-5, 0.5, 0); scene.add(sigGround)

    console.log('✅ Batman/Bat-signal loaded. Signal meshes:', batsignalMeshes.length)
    onModelReady(80)
  },
  (xhr) => { if (xhr.total>0) setProgress(65 + (xhr.loaded/xhr.total)*13) },
  (err) => { console.warn('⚠️ Batman model:', err); onModelReady(80) }
)

// Failsafe
setTimeout(() => { if (currentProgress < 100) { setProgress(100); buildFallbackCave() } }, 20000)

// ═══════════════════════════════════════════════════════════
// FALLBACKS
// ═══════════════════════════════════════════════════════════
function buildFallbackCave() {
  if (batcaveModel) return
  const mat = new THREE.MeshStandardMaterial({ color:0x0a0a12, roughness:0.95 })
  for (let i=0; i<4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.1), new THREE.MeshBasicMaterial({ color:0x000d2b }))
    s.position.set(-6+i*2.2, 2.6, -9); screenMeshes.push(s); scene.add(s)
  }
}
function buildFallbackCar() {
  if (aventadorModel) return
  const mat = new THREE.MeshStandardMaterial({ color:0x050507, metalness:1, roughness:0.04 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2,0.6,2.1), mat)
  body.position.set(4.5,0.35,2); aventadorMeshes.push(body); scene.add(body)
}


// ═══════════════════════════════════════════════════════════
// INVISIBLE CLICK PROXIES
// ═══════════════════════════════════════════════════════════
// Large invisible plane hanging in front of the elevated bat-computer screens
// so they are very easy to click even from a distance
const screenProxyGeo = new THREE.PlaneGeometry(16, 8)
const screenProxyMat = new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })
const screenProxy = new THREE.Mesh(screenProxyGeo, screenProxyMat)
screenProxy.position.set(-3, 9, -7.5)
screenProxy.rotation.y = Math.PI / 8
screenProxy.userData.type = 'screen'
screenMeshes.push(screenProxy)
scene.add(screenProxy)



// ═══════════════════════════════════════════════════════════
// HOTSPOT REPOSITIONING after models load
// ═══════════════════════════════════════════════════════════
const HOTSPOTS = [
  { id:'identity', position:new THREE.Vector3(-4,3,-1), label:'BAT-COMPUTER', color:0x0088ff },
  { id:'missions', position:new THREE.Vector3(4,2,1),   label:'BATMOBILE',    color:0xf5c518 },
  { id:'arsenal',  position:new THREE.Vector3(-3,2,3),  label:'BATPOD',       color:0xff8c00 },
  { id:'intel',    position:new THREE.Vector3(-6,3,-5), label:'BAT-SIGNAL',   color:0x00ff88 },
  { id:'contact',  position:new THREE.Vector3(0,2,6),   label:'OPEN COMMS',   color:0xaa44ff },
]

function findMeshCenter(model, kw) {
  let found = null
  model.traverse(c => {
    if (!c.isMesh) return
    if (kw.some(k => c.name.toLowerCase().includes(k))) {
      found = new THREE.Box3().setFromObject(c).getCenter(new THREE.Vector3())
    }
  })
  return found
}

function repositionHotspots() {
  if (batcaveModel) {
    const desk = findMeshCenter(batcaveModel, ['desk','computer','monitor','screen','console'])
    if (desk) {
      HOTSPOTS[0].position.copy(desk).add(new THREE.Vector3(0,1.8,0))
      hotspotObjects[0].group.position.copy(HOTSPOTS[0].position)
      hotspotObjects[0].group.userData.baseY = HOTSPOTS[0].position.y
    }
  }
  if (aventadorModel) {
    const c = new THREE.Box3().setFromObject(aventadorModel).getCenter(new THREE.Vector3())
    HOTSPOTS[1].position.copy(c).add(new THREE.Vector3(0,1.8,0))
    hotspotObjects[1].group.position.copy(HOTSPOTS[1].position)
    hotspotObjects[1].group.userData.baseY = HOTSPOTS[1].position.y
  }
  if (batpodModel) {
    const c = new THREE.Box3().setFromObject(batpodModel).getCenter(new THREE.Vector3())
    HOTSPOTS[2].position.copy(c).add(new THREE.Vector3(0,1.5,0))
    hotspotObjects[2].group.position.copy(HOTSPOTS[2].position)
    hotspotObjects[2].group.userData.baseY = HOTSPOTS[2].position.y
  }
  if (batsignalModel) {
    const c = new THREE.Box3().setFromObject(batsignalModel).getCenter(new THREE.Vector3())
    HOTSPOTS[3].position.copy(c).add(new THREE.Vector3(0,2,0))
    hotspotObjects[3].group.position.copy(HOTSPOTS[3].position)
    hotspotObjects[3].group.userData.baseY = HOTSPOTS[3].position.y
  }
}

// ═══════════════════════════════════════════════════════════
// HOTSPOT MESHES
// ═══════════════════════════════════════════════════════════
function buildHotspot(h) {
  const group = new THREE.Group()
  group.position.copy(h.position)
  group.userData = { ...h, baseY: h.position.y }

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.07,16,16),
    new THREE.MeshBasicMaterial({ color:h.color })
  )
  group.add(core); hotspotCores.push(core)

  const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.13,0.16,64),
    new THREE.MeshBasicMaterial({ color:h.color, transparent:true, opacity:0.85, side:THREE.DoubleSide, depthWrite:false }))
  group.add(ring1)

  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.22,0.25,64),
    new THREE.MeshBasicMaterial({ color:h.color, transparent:true, opacity:0.4, side:THREE.DoubleSide, depthWrite:false }))
  ring2.rotation.x = Math.PI/4; group.add(ring2)

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,3.5,4),
    new THREE.MeshBasicMaterial({ color:h.color, transparent:true, opacity:0.18 }))
  beam.position.y = 1.75; group.add(beam)

  scene.add(group)
  hotspotObjects.push({ group, core, ring1, ring2, beam })
  return { group, core, ring1, ring2, beam }
}
HOTSPOTS.forEach(h => buildHotspot(h))

// ═══════════════════════════════════════════════════════════
// CAVE DUST
// ═══════════════════════════════════════════════════════════
const dustCount = 400, dustPos = new Float32Array(dustCount*3), dustVel = []
for (let i=0;i<dustCount;i++) {
  dustPos[i*3]=(Math.random()-.5)*28; dustPos[i*3+1]=Math.random()*12; dustPos[i*3+2]=(Math.random()-.5)*28
  dustVel.push({ x:(Math.random()-.5)*.003, y:(Math.random()-.5)*.0012, z:(Math.random()-.5)*.003 })
}
const dustGeo = new THREE.BufferGeometry()
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos,3))
scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color:0x2a2840, size:0.03, transparent:true, opacity:0.5, sizeAttenuation:true })))

function updateDust() {
  const p = dustGeo.attributes.position.array
  for (let i=0;i<dustCount;i++) {
    p[i*3]+=dustVel[i].x; p[i*3+1]+=dustVel[i].y; p[i*3+2]+=dustVel[i].z
    if (p[i*3+1]>13) p[i*3+1]=0.1; if (p[i*3+1]<0) p[i*3+1]=12
  }
  dustGeo.attributes.position.needsUpdate = true
}

// ═══════════════════════════════════════════════════════════
// HOVER HIGHLIGHTING
// ═══════════════════════════════════════════════════════════
let hoveredMesh = null
const origEmissive = new THREE.Color(), origEmissiveInt = { v:0 }

function applyHover(mesh) {
  if (mesh === hoveredMesh) return
  clearHover()
  hoveredMesh = mesh
  const m = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  if (m?.emissive) { origEmissive.copy(m.emissive); origEmissiveInt.v = m.emissiveIntensity||0; m.emissive.set(0xf5c518); m.emissiveIntensity = 0.3 }
}
function clearHover() {
  if (!hoveredMesh) return
  const m = Array.isArray(hoveredMesh.material) ? hoveredMesh.material[0] : hoveredMesh.material
  if (m?.emissive) { m.emissive.copy(origEmissive); m.emissiveIntensity = origEmissiveInt.v }
  hoveredMesh = null
}

// ═══════════════════════════════════════════════════════════
// RAYCASTING
// ═══════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const labelEl = document.getElementById('hotspotLabel')

const TYPE_LABELS = {
  screen:        '◈ BAT-COMPUTER — CLICK TO ACCESS',
  car:           '⬡ AVENTADOR — CLICK FOR MISSIONS',
  batpod:        '◉ BATPOD — CLICK FOR ARSENAL',
  batsignal:     '▣ BAT-SIGNAL — CLICK FOR INTEL',
  batman_figure: '▣ BATMAN — CLICK FOR INTEL',
}

function checkHover(e) {
  mouse.x = (e.clientX/window.innerWidth)*2-1
  mouse.y = -(e.clientY/window.innerHeight)*2+1
  raycaster.setFromCamera(mouse, camera)

  const allClickable = [...screenMeshes,...tumblerMeshes,...aventadorMeshes,...batpodMeshes,...batsignalMeshes]
  const hits = raycaster.intersectObjects(allClickable, false)

  if (hits.length > 0) {
    const mesh = hits[0].object
    applyHover(mesh)
    const t = mesh.userData.type || (screenMeshes.includes(mesh) ? 'screen' : aventadorMeshes.includes(mesh) ? 'car' : batpodMeshes.includes(mesh) ? 'batpod' : 'batsignal')
    labelEl.textContent = TYPE_LABELS[t] || '● INTERACT'
    labelEl.style.display = 'block'
    labelEl.style.left = (e.clientX+16)+'px'; labelEl.style.top = (e.clientY-8)+'px'
    document.body.style.cursor = 'pointer'; return
  }
  clearHover()

  const hsHits = raycaster.intersectObjects(hotspotCores)
  if (hsHits.length > 0) {
    const idx = hotspotCores.indexOf(hsHits[0].object)
    labelEl.textContent = HOTSPOTS[idx].label
    labelEl.style.display = 'block'
    labelEl.style.left = (e.clientX+16)+'px'; labelEl.style.top = (e.clientY-8)+'px'
    document.body.style.cursor = 'pointer'; return
  }

  labelEl.style.display = 'none'; document.body.style.cursor = 'crosshair'
}

window.addEventListener('mousemove', (e) => { if (controls.enabled && !isTransitioning) checkHover(e) })

// Click handler
window.addEventListener('click', (e) => {
  if (!controls.enabled || isTransitioning || currentMode === 'screen') return
  mouse.x = (e.clientX/window.innerWidth)*2-1
  mouse.y = -(e.clientY/window.innerHeight)*2+1
  raycaster.setFromCamera(mouse, camera)

  // Screens (bat-computer)
  const sHits = raycaster.intersectObjects(screenMeshes, false)
  if (sHits.length > 0) { flyToWaypoint('bat_computer', true, 'identity'); return }

  // Tumbler (built-in batmobile in the cave GLB)
  const tHits = raycaster.intersectObjects(tumblerMeshes, false)
  if (tHits.length > 0) { flyToWaypoint('aventador', true, 'missions'); return }  // reuse missions panel

  // Aventador (external lamborghini)
  const aHits = raycaster.intersectObjects(aventadorMeshes, false)
  if (aHits.length > 0) { flyToWaypoint('aventador', true, 'missions'); flashLights(aventadorModel); return }

  // Batpod
  const bHits = raycaster.intersectObjects(batpodMeshes, false)
  if (bHits.length > 0) { flyToWaypoint('batpod', true, 'arsenal'); return }

  // Batman / batsignal
  const sigHits = raycaster.intersectObjects(batsignalMeshes, false)
  if (sigHits.length > 0) { flyToWaypoint('batsignal', true, 'intel'); return }

  // Hotspot spheres (fallback)
  const hHits = raycaster.intersectObjects(hotspotCores)
  if (hHits.length > 0) {
    const idx = hotspotCores.indexOf(hHits[0].object)
    const sectionMap = ['identity','missions','arsenal','intel','contact']
    flyToWaypoint(WAYPOINTS[idx+1]?.id || 'overview', true, sectionMap[idx])
  }
})

// Debug dbl-click
window.addEventListener('dblclick', (e) => {
  if (!controls.enabled) return
  mouse.x = (e.clientX/window.innerWidth)*2-1
  mouse.y = -(e.clientY/window.innerHeight)*2+1
  raycaster.setFromCamera(mouse, camera)
  const all = [batcaveModel, aventadorModel, batpodModel, batsignalModel].filter(Boolean)
  const hits = raycaster.intersectObjects(all, true)
  if (hits.length) { const p=hits[0].point; console.log(`Pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`) }
})

// ═══════════════════════════════════════════════════════════
// FLASH LIGHTS — Aventador headlights on click
// ═══════════════════════════════════════════════════════════
function flashLights(model) {
  if (!model) return
  model.traverse(child => {
    if (!child.isMesh) return
    const n = child.name.toLowerCase()
    if (!(n.includes('headlight') || n.includes('light') || n.includes('lamp'))) return
    const m = Array.isArray(child.material) ? child.material[0] : child.material
    if (!m) return
    gsap.timeline()
      .to({v:m.emissiveIntensity||0}, { v:8, duration:0.3, ease:'power2.out', onUpdate:function(){ m.emissiveIntensity=this.targets()[0].v } })
      .to({v:8}, { v:3, duration:1.5, delay:0.3, ease:'power3.inOut', onUpdate:function(){ m.emissiveIntensity=this.targets()[0].v } })
  })
}

// ═══════════════════════════════════════════════════════════
// WAYPOINT NAVIGATION
// ═══════════════════════════════════════════════════════════
function flyToWaypoint(waypointId, openPanel=false, panelId=null) {
  const wp = WAYPOINTS.find(w => w.id === waypointId)
  if (!wp || isTransitioning) return
  isTransitioning = true
  activeWaypoint = waypointId

  document.querySelectorAll('.nav-wp-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.wp === waypointId)
  )

  gsap.to(camera.position, {
    x:wp.camPos.x, y:wp.camPos.y, z:wp.camPos.z,
    duration:2.0, ease:'power3.inOut',
    onComplete: () => {
      isTransitioning = false
      if (openPanel) {
        const id = panelId || wp.panel
        if (id) showScreenContent(id)
      }
    }
  })
  gsap.to(controls.target, {
    x:wp.target.x, y:wp.target.y, z:wp.target.z,
    duration:2.0, ease:'power3.inOut',
    onUpdate: () => controls.update()
  })
}

function buildNavBar() {
  const container = document.getElementById('navButtons')
  if (!container) return
  WAYPOINTS.forEach((wp, i) => {
    const btn = document.createElement('button')
    btn.className = 'nav-wp-btn' + (i===0 ? ' active' : '')
    btn.dataset.wp = wp.id
    btn.textContent = wp.label
    btn.title = `Shortcut: ${i+1}`
    btn.addEventListener('click', () => flyToWaypoint(wp.id, true))
    container.appendChild(btn)
  })
}

// ═══════════════════════════════════════════════════════════
// SCREEN OVERLAY
// ═══════════════════════════════════════════════════════════
function showScreenContent(sectionId) {
  const idx = SCREEN_SECTIONS.indexOf(sectionId)
  currentScreenSection = idx >= 0 ? idx : 0
  renderScreenSection()
  const overlay = document.getElementById('screenOverlay')
  overlay.classList.remove('hidden')
  requestAnimationFrame(() => overlay.classList.add('active'))
  currentMode = 'screen'
}

function renderScreenSection() {
  const key = SCREEN_SECTIONS[currentScreenSection]
  const data = SCREEN_CONTENT[key]; if (!data) return
  document.getElementById('screenSectionName').textContent = data.name
  document.getElementById('screenBody').innerHTML = data.render()
  document.getElementById('screenTime').textContent = new Date().toLocaleTimeString('en-US',{hour12:false})
  document.getElementById('screenDots').innerHTML = SCREEN_SECTIONS.map((_,i)=>
    `<div class="screen-dot ${i===currentScreenSection?'active':''}" data-idx="${i}"></div>`
  ).join('')
  document.querySelectorAll('.screen-dot').forEach(d =>
    d.addEventListener('click', () => { currentScreenSection=parseInt(d.dataset.idx); renderScreenSection() })
  )
  setTimeout(() => {
    document.querySelectorAll('.skill-anim').forEach(el => { el.style.width = el.dataset.w || '80%' })
  }, 150)
}

function screenNavigate(dir) {
  currentScreenSection = (currentScreenSection + dir + SCREEN_SECTIONS.length) % SCREEN_SECTIONS.length
  const body = document.getElementById('screenBody')
  body.style.opacity='0'; body.style.transform=`translateX(${dir*28}px)`
  setTimeout(() => {
    renderScreenSection()
    body.style.transition='none'; body.style.transform=`translateX(${-dir*28}px)`; body.style.opacity='0'
    requestAnimationFrame(() => { body.style.transition='opacity 0.3s ease,transform 0.3s ease'; body.style.opacity='1'; body.style.transform='translateX(0)' })
  }, 200)
}

function exitScreen() {
  const overlay = document.getElementById('screenOverlay')
  overlay.classList.remove('active')
  setTimeout(() => overlay.classList.add('hidden'), 500)
  currentMode = 'explore'
  isTransitioning = true
  gsap.to(camera.position, {
    x:8, y:5, z:14, duration:2, ease:'power3.inOut',
    onComplete: () => { isTransitioning = false; flyToWaypoint('overview') }
  })
  gsap.to(controls.target, { x:0, y:1, z:0, duration:2, ease:'power3.inOut' })
}

document.getElementById('screenPrev').addEventListener('click', () => screenNavigate(-1))
document.getElementById('screenNext').addEventListener('click', () => screenNavigate(1))
document.getElementById('screenExitBtn').addEventListener('click', exitScreen)

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (currentMode === 'screen') {
    if (e.key==='ArrowRight') screenNavigate(1)
    if (e.key==='ArrowLeft')  screenNavigate(-1)
    if (e.key==='Escape')     exitScreen()
    return
  }
  if (WAYPOINT_KEYS[e.key]) flyToWaypoint(WAYPOINT_KEYS[e.key], true)
})

// ═══════════════════════════════════════════════════════════
// AMBIENT AUDIO — rain + thunder
// ═══════════════════════════════════════════════════════════
const ambientAudio = new Audio('./jci-21-rain-and-thunder-sfx-12820.mp3')
ambientAudio.loop   = true
ambientAudio.volume = 0
ambientAudio.preload = 'auto'

let audioMuted = false

function audioFadeIn(targetVol = 0.32, durationMs = 3000) {
  const steps = 40, stepMs = durationMs / steps
  const delta = targetVol / steps
  let cur = 0
  const iv = setInterval(() => {
    cur++
    ambientAudio.volume = Math.min(targetVol, ambientAudio.volume + delta)
    if (cur >= steps) clearInterval(iv)
  }, stepMs)
}

function toggleMute() {
  audioMuted = !audioMuted
  ambientAudio.muted = audioMuted
  const btn = document.getElementById('muteBtn')
  if (btn) btn.textContent = audioMuted ? '🔇 MUTED' : '🔊 SOUND'
}
window.toggleMute = toggleMute  // expose to inline onclick (ES module scope)

// ═══════════════════════════════════════════════════════════
// ENTER CAVE
// ═══════════════════════════════════════════════════════════
function startExperience() {
  controls.enabled = true
  camera.position.set(0, 18, 22); camera.lookAt(0,0,0)
  gsap.to(camera.position, { x:0, y:3.5, z:14, duration:3.5, ease:'power3.inOut' })
  buildNavBar()
  document.getElementById('caveNav').style.display = 'flex'
  gsap.fromTo('#caveNav', { opacity:0 }, { opacity:1, duration:1, delay:2.5 })

  // Start ambient rain + thunder
  ambientAudio.play().then(() => audioFadeIn(0.32, 4000)).catch(() => {
    // Autoplay blocked — wait for first user interaction
    const resume = () => { ambientAudio.play().then(() => audioFadeIn(0.32, 2000)); document.removeEventListener('click', resume) }
    document.addEventListener('click', resume)
  })

  // Show mute button
  const muteBtn = document.getElementById('muteBtn')
  if (muteBtn) { muteBtn.style.display = 'block'; gsap.fromTo(muteBtn, {opacity:0}, {opacity:1, duration:1, delay:3}) }
}

document.getElementById('enterBtn').addEventListener('click', () => {
  gsap.to('#loader', { opacity:0, duration:1.2, ease:'power2.out',
    onComplete:() => { document.getElementById('loader').style.display='none'; startExperience() }
  })
})

// ═══════════════════════════════════════════════════════════
// TICKER & UPTIME
// ═══════════════════════════════════════════════════════════
const TICKER_ITEMS = [
  '⬡ VISHWAS TIWARI · AVAILABLE FOR OPPORTUNITIES',
  '◈ TOP 2% · INDIA AI IMPACT BUILDATHON · 40,000+ PARTICIPANTS',
  '⬡ MEDGPT LIVE · medgpt1.streamlit.app',
  '◈ ENFIBIO TECHNOLOGIES · IEDC FUNDED STARTUP · HYDERABAD',
  '⬡ S.A.M · 40MB ON-DEVICE AI · ZERO CLOUD',
  '◈ OPEN TO REMOTE & RELOCATION',
  '⬡ 15+ AI SYSTEMS IN PRODUCTION',
  '◈ GRADUATION: MAY 2026 · B.TECH CSE',
]
const sep = '&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;'
const tc = TICKER_ITEMS.join(sep)
document.getElementById('tickerInner').innerHTML = tc + sep + tc

const t0 = Date.now()
setInterval(() => {
  const s=Math.floor((Date.now()-t0)/1000)
  document.getElementById('uptime').textContent = [Math.floor(s/3600),Math.floor((s%3600)/60),s%60].map(n=>String(n).padStart(2,'0')).join(':')
  if (currentMode==='screen') document.getElementById('screenTime').textContent = new Date().toLocaleTimeString('en-US',{hour12:false})
}, 1000)

// ═══════════════════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight)
})

// ═══════════════════════════════════════════════════════════
// RENDER LOOP
// ═══════════════════════════════════════════════════════════
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  controls.update()
  updateDust()

  // ─── Subtle Parallax (Mouse Movement 3D) ───
  if (controls.enabled && !isTransitioning) {
    scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, (mouse.x * 0.03), 0.05)
    scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, -(mouse.y * 0.03), 0.05)
  }

  // Hotspot animation
  hotspotObjects.forEach(({ group, core, ring1, ring2, beam }, i) => {
    const off = i*1.1
    const baseY = group.userData.baseY ?? HOTSPOTS[i].position.y
    group.position.y = baseY + Math.sin(t*1.2+off)*0.09
    ring1.rotation.z = t*0.9+off; ring2.rotation.z = -t*0.6+off
    core.scale.setScalar(1 + Math.sin(t*3+off)*0.28)
    beam.material.opacity = 0.12 + Math.sin(t*2+off)*0.07
    ring1.lookAt(camera.position)
  })

  // Bat-signal rotation (Batman figure slowly rotates signal)
  if (batsignalSpot) {
    const pulse = Math.sin(t*1.5)
    batsignalSpot.intensity = 2.5 + pulse * 0.5
  }

  // Subtle screen flicker
  screenL1.intensity = 1.0 + Math.sin(t*3.2+0.5)*0.15
  batSig.intensity   = 2.5 + Math.sin(t*1.1)*0.3
  carKey.intensity   = 5 + Math.sin(t*0.7)*0.4

  composer.render()
}

animate()
