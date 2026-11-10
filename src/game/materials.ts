import * as THREE from 'three';

export const LIVING_MOUNTAINS_PALETTE = {
  mountainGreen: '#3f6a3c',
  desertGold: '#d4a253',
  stoneBrown: '#8c6f56',
  asphaltGray: '#383f49',
  skyBlue: '#2b6cb0',
  warmCopper: '#c87236',
} as const;

export interface MaterialLibrary {
  roadVertexMaterial: THREE.MeshStandardMaterial;
  yemeniStoneMaterial: THREE.MeshStandardMaterial;
  yemeniMudBrickMaterial: THREE.MeshStandardMaterial;
  cliffRockMaterial: THREE.MeshStandardMaterial;
  guardrailMetalMaterial: THREE.MeshStandardMaterial;
  guardrailPostMaterial: THREE.MeshStandardMaterial;
  chevronSignMaterial: THREE.MeshStandardMaterial;
  startBannerMaterial: THREE.MeshStandardMaterial;
  finishBannerMaterial: THREE.MeshStandardMaterial;
  marketSignMaterial: THREE.MeshStandardMaterial;
  carWashSignMaterial: THREE.MeshStandardMaterial;
  treeTrunkMaterial: THREE.MeshStandardMaterial;
  treeCanopyMaterial: THREE.MeshStandardMaterial;
  distantMountainMaterial: THREE.MeshStandardMaterial;
  setNightEmissiveIntensity: (intensity: number) => void;
  dispose: () => void;
}

function createRoadSurfaceMaps(maxAnisotropy: number): {
  diffuse: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d8d6d0';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle aggregate grain
  for (let i = 0; i < 6500; i++) {
    const x = (i * 73) % 512;
    const y = (i * 137) % 512;
    const v = 175 + ((i * 29) % 65);
    ctx.fillStyle = `rgb(${v},${v - 2},${v - 5})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle dual wheel track wear bands along the lanes
  ctx.fillStyle = 'rgba(40, 44, 52, 0.14)';
  ctx.fillRect(95, 0, 34, 512);
  ctx.fillRect(175, 0, 34, 512);
  ctx.fillRect(302, 0, 34, 512);
  ctx.fillRect(382, 0, 34, 512);

  // Subtle surface cracks
  ctx.strokeStyle = 'rgba(35, 38, 45, 0.28)';
  ctx.lineWidth = 1.5;
  for (let c = 0; c < 14; c++) {
    let cx = 40 + ((c * 67) % 430);
    let cy = (c * 39) % 512;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += ((c + s) % 2 === 0 ? 1 : -1) * 8;
      cy += 11;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Edge white lines at left/right road shoulders
  ctx.fillStyle = 'rgba(245, 242, 232, 0.82)';
  ctx.fillRect(20, 0, 10, 512);
  ctx.fillRect(482, 0, 10, 512);

  // Dashed warm-copper/amber center mountain highway line
  ctx.fillStyle = 'rgba(232, 168, 46, 0.9)';
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(251, y, 10, 38);
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.anisotropy = maxAnisotropy;

  // Bump & Roughness map for road micro-relief and wet sheen variation
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3200; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const v = 90 + ((i * 41) % 85);
    bCtx.fillStyle = `rgb(${v},${v},${v})`;
    bCtx.fillRect(x, y, 2, 2);
  }
  // Darker wheel tracks (smoother when wet)
  bCtx.fillStyle = 'rgba(60,60,60,0.35)';
  bCtx.fillRect(48, 0, 18, 256);
  bCtx.fillRect(88, 0, 18, 256);
  bCtx.fillRect(150, 0, 18, 256);
  bCtx.fillRect(190, 0, 18, 256);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  return { diffuse, bump, roughness: bump };
}

function createYemeniHouseMaps(maxAnisotropy: number): {
  diffuse: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const emCanvas = document.createElement('canvas');
  emCanvas.width = 256;
  emCanvas.height = 256;
  const emCtx = emCanvas.getContext('2d')!;
  emCtx.fillStyle = '#000000';
  emCtx.fillRect(0, 0, 256, 256);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, 256, 256);

  // Warm dressed highland stone courses
  ctx.fillStyle = LIVING_MOUNTAINS_PALETTE.stoneBrown;
  ctx.fillRect(0, 0, 256, 256);

  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    ctx.fillStyle = row % 2 === 0 ? '#8c6f56' : '#a5876b';
    ctx.fillRect(0, y, 256, 15);
    ctx.fillStyle = '#5c4635';
    ctx.fillRect(0, y + 15, 256, 1);

    bCtx.fillStyle = '#404040';
    bCtx.fillRect(0, y + 15, 256, 1);
  }

  // Traditional white gypsum decorative frieze band (حزام الجص الأبيض والزخارف)
  ctx.fillStyle = '#f5f2eb';
  ctx.fillRect(0, 80, 256, 9);
  ctx.fillRect(0, 166, 256, 9);

  // Qamariya arched windows (القمريات اليمنية الملونة)
  const qamariyaColors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  const drawWindow = (wx: number, wy: number, idx: number) => {
    // White gypsum arch surround
    ctx.fillStyle = '#f8f5ee';
    ctx.beginPath();
    ctx.arc(wx + 18, wy + 18, 18, Math.PI, 0);
    ctx.lineTo(wx + 36, wy + 46);
    ctx.lineTo(wx, wy + 46);
    ctx.closePath();
    ctx.fill();

    // Inner dark wooden frame & glass
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wx + 4, wy + 20, 28, 22);

    // Stained-glass Qamariya fanlight
    const qCol = qamariyaColors[idx % qamariyaColors.length];
    ctx.fillStyle = qCol;
    ctx.beginPath();
    ctx.arc(wx + 18, wy + 18, 13, Math.PI, 0);
    ctx.fill();

    // Emissive warm glow for sunset/night lighting
    emCtx.fillStyle = '#f59e0b';
    emCtx.beginPath();
    emCtx.arc(wx + 18, wy + 18, 12, Math.PI, 0);
    emCtx.fill();
    emCtx.fillStyle = '#fde68a';
    emCtx.fillRect(wx + 6, wy + 22, 24, 18);
  };

  let wCounter = 0;
  for (const wx of [24, 110, 196]) {
    drawWindow(wx, 22, wCounter++);
    drawWindow(wx, 108, wCounter++);
    drawWindow(wx, 190, wCounter++);
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.anisotropy = maxAnisotropy;

  const emissive = new THREE.CanvasTexture(emCanvas);
  emissive.colorSpace = THREE.SRGBColorSpace;
  emissive.wrapS = THREE.RepeatWrapping;
  emissive.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  return { diffuse, emissive, bump };
}

function createMudBrickTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm Shibam/Wadi mud-brick plaster with white gypsum roofline & lime accents
  ctx.fillStyle = '#b9895a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 24);
  ctx.fillRect(0, 120, 256, 6);

  for (const wx of [28, 96, 168]) {
    for (const wy of [42, 144]) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(wx - 3, wy - 3, 30, 38);
      ctx.fillStyle = '#2d231a';
      ctx.fillRect(wx, wy, 24, 32);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRockBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Layered geological strata bands
  for (let y = 0; y < 256; y += 8) {
    const shade = 95 + ((y * 17) % 70);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 256, 6);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createChevronSignTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#111827';
  for (let x = -32; x < 280; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 64, 64);
    ctx.lineTo(x + 32, 128);
    ctx.lineTo(x, 128);
    ctx.lineTo(x + 32, 64);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 122);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createBannerTexture(
  titleAr: string,
  subtitleAr: string,
  accentHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#141923';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);

  ctx.fillStyle = accentHex;
  ctx.fillRect(28, 28, 18, 200);
  ctx.fillRect(978, 28, 18, 200);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#f8f5ee';
  ctx.font = 'bold 68px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleAr, 512, 102);

  ctx.fillStyle = accentHex;
  ctx.font = 'bold 38px Cairo, sans-serif';
  ctx.fillText(subtitleAr, 512, 186);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMaterialLibrary(renderer: THREE.WebGLRenderer): MaterialLibrary {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const roadMaps = createRoadSurfaceMaps(maxAniso);
  const houseMaps = createYemeniHouseMaps(maxAniso);
  const mudBrickTex = createMudBrickTexture(maxAniso);
  const rockBumpTex = createRockBumpTexture();
  const chevronTex = createChevronSignTexture(maxAniso);

  const startBannerTex = createBannerTexture(
    'مَسَالِك — الجبال النابضة بالحياة',
    'بوابة مرتفعات تعز · دروب اليمن المفتوحة',
    '#c87236',
    maxAniso
  );
  const finishBannerTex = createBannerTexture(
    'نهاية المرحلة — قمة المسالك',
    'تحدي الدروب الجبلية · MASALIK v0.4.0',
    '#10b981',
    maxAniso
  );
  const marketSignTex = createBannerTexture(
    'سوق واستراحة القمم الشعبي',
    'قهوة يمنية · تموينات المسافرين · منتجات محلية',
    '#d4a253',
    maxAniso
  );
  const carWashSignTex = createBannerTexture(
    'مغسلة ومركز العناية بالمركبات',
    'إزالة الطين والغبار الجبلي · تلميع فوري',
    '#38bdf8',
    maxAniso
  );

  const roadVertexMaterial = new THREE.MeshStandardMaterial({
    map: roadMaps.diffuse,
    bumpMap: roadMaps.bump,
    bumpScale: 0.018,
    roughnessMap: roadMaps.roughness,
    vertexColors: true,
    roughness: 0.84,
    metalness: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const yemeniStoneMaterial = new THREE.MeshStandardMaterial({
    map: houseMaps.diffuse,
    bumpMap: houseMaps.bump,
    bumpScale: 0.03,
    emissiveMap: houseMaps.emissive,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.15,
    roughness: 0.8,
    metalness: 0.06,
  });

  const yemeniMudBrickMaterial = new THREE.MeshStandardMaterial({
    map: mudBrickTex,
    bumpMap: houseMaps.bump,
    bumpScale: 0.02,
    roughness: 0.88,
    metalness: 0.03,
  });

  const cliffRockMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    bumpMap: rockBumpTex,
    bumpScale: 0.08,
    roughness: 0.9,
    metalness: 0.04,
    flatShading: true,
  });

  const guardrailMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4dae3,
    roughness: 0.32,
    metalness: 0.82,
  });

  const guardrailPostMaterial = new THREE.MeshStandardMaterial({
    color: 0x525b66,
    roughness: 0.58,
    metalness: 0.58,
  });

  const chevronSignMaterial = new THREE.MeshStandardMaterial({
    map: chevronTex,
    roughness: 0.38,
    metalness: 0.25,
  });

  const startBannerMaterial = new THREE.MeshStandardMaterial({
    map: startBannerTex,
    roughness: 0.35,
    metalness: 0.2,
  });

  const finishBannerMaterial = new THREE.MeshStandardMaterial({
    map: finishBannerTex,
    roughness: 0.35,
    metalness: 0.2,
    emissive: new THREE.Color(0x064e3b),
    emissiveIntensity: 0.35,
  });

  const marketSignMaterial = new THREE.MeshStandardMaterial({
    map: marketSignTex,
    roughness: 0.38,
    metalness: 0.18,
    emissive: new THREE.Color(0x78350f),
    emissiveIntensity: 0.28,
  });

  const carWashSignMaterial = new THREE.MeshStandardMaterial({
    map: carWashSignTex,
    roughness: 0.32,
    metalness: 0.22,
    emissive: new THREE.Color(0x0c4a6e),
    emissiveIntensity: 0.35,
  });

  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c422c,
    roughness: 0.9,
    metalness: 0.02,
  });

  const treeCanopyMaterial = new THREE.MeshStandardMaterial({
    color: LIVING_MOUNTAINS_PALETTE.mountainGreen,
    roughness: 0.8,
    metalness: 0.04,
  });

  const distantMountainMaterial = new THREE.MeshStandardMaterial({
    color: 0x435166,
    roughness: 0.94,
    metalness: 0.02,
    flatShading: true,
  });

  return {
    roadVertexMaterial,
    yemeniStoneMaterial,
    yemeniMudBrickMaterial,
    cliffRockMaterial,
    guardrailMetalMaterial,
    guardrailPostMaterial,
    chevronSignMaterial,
    startBannerMaterial,
    finishBannerMaterial,
    marketSignMaterial,
    carWashSignMaterial,
    treeTrunkMaterial,
    treeCanopyMaterial,
    distantMountainMaterial,
    setNightEmissiveIntensity: (intensity: number) => {
      yemeniStoneMaterial.emissiveIntensity = intensity;
      marketSignMaterial.emissiveIntensity = 0.2 + intensity * 0.55;
      carWashSignMaterial.emissiveIntensity = 0.25 + intensity * 0.55;
    },
    dispose: () => {
      roadMaps.diffuse.dispose();
      roadMaps.bump.dispose();
      houseMaps.diffuse.dispose();
      houseMaps.emissive.dispose();
      houseMaps.bump.dispose();
      mudBrickTex.dispose();
      rockBumpTex.dispose();
      chevronTex.dispose();
      startBannerTex.dispose();
      finishBannerTex.dispose();
      marketSignTex.dispose();
      carWashSignTex.dispose();
      roadVertexMaterial.dispose();
      yemeniStoneMaterial.dispose();
      yemeniMudBrickMaterial.dispose();
      cliffRockMaterial.dispose();
      guardrailMetalMaterial.dispose();
      guardrailPostMaterial.dispose();
      chevronSignMaterial.dispose();
      startBannerMaterial.dispose();
      finishBannerMaterial.dispose();
      marketSignMaterial.dispose();
      carWashSignMaterial.dispose();
      treeTrunkMaterial.dispose();
      treeCanopyMaterial.dispose();
      distantMountainMaterial.dispose();
    },
  };
}
