import type { DatabaseSync } from "node:sqlite";
import { nowSql } from "./db";
import { currencies } from "./config";
import { hashPassword } from "./password";

type Pair = [zh: string, en: string];
type Spec = [keyZh: string, keyEn: string, valZh: string, valEn: string];

interface SeedProduct {
  slug: string;
  category: string;
  name: Pair;
  subtitle: Pair;
  description: Pair;
  price: number;
  compare?: number;
  unit: Pair;
  moq?: number;
  weight: number;
  stock: number;
  featured?: boolean;
  badge?: Pair;
  specs: Spec[];
  variants?: Pair[];
  sort?: number;
}

const CATEGORIES = [
  {
    slug: "aluminum-trims",
    name: ["铝合金装饰线条", "Aluminium Profiles"],
    tagline: ["6063-T5 阳极氧化 · 5 年不褪色", "6063-T5 anodised · 5-year colour warranty"],
    description: [
      "高精级铝型材挤压成型，壁厚均匀、直线度好，适合饰面板收口、阳角保护、踢脚线与灯槽。支持颜色、长度、开模定制。",
      "High-precision extruded aluminium with consistent wall thickness and straightness — for panel joints, corner protection, skirting and lighting coves. Custom colours, lengths and tooling available.",
    ],
    image: "/images/categories/aluminum-trims.svg",
    sort: 1,
  },
  {
    slug: "wood-fiber-profiles",
    name: ["竹木纤维线条", "Wood-Fibre Trims"],
    tagline: ["零甲醛 · 防水防潮 · 可钉可锯", "Zero formaldehyde · waterproof · cut & nail"],
    description: [
      "竹粉与 PVC 高温共挤，密度高、握钉力强，表面 UV 木纹转印。与集成墙板同色配套，收口自然。",
      "Bamboo powder and PVC co-extruded at high temperature for dense, screw-holding profiles with UV wood-grain finishes. Colour-matched with our wall panels.",
    ],
    image: "/images/categories/wood-fiber-profiles.svg",
    sort: 2,
  },
  {
    slug: "wall-panels",
    name: ["背景墙板", "Feature Wall Panels"],
    tagline: ["毛坯直装 · 5 分钟上墙 · B1 防火", "Install over bare walls · B1 fire rating"],
    description: [
      "竹木纤维集成墙板、3D 波浪板、格栅板与石纹大板，卡扣拼接无需刮腻子刷漆。家装、工装、酒店客房全场景适用。",
      "WPC wall panels, 3D waves, acoustic grilles and stone-effect boards. Click-together install without plastering or painting — for homes, retail and hospitality.",
    ],
    image: "/images/categories/wall-panels.svg",
    sort: 3,
  },
  {
    slug: "accessories",
    name: ["安装配件", "Install Accessories"],
    tagline: ["辅料一站配齐 · 施工不出错", "Everything needed to finish the install"],
    description: [
      "卡扣、结构胶、阴阳角套件与样品册，按施工节点配齐，避免二次采购。",
      "Clips, adhesive, corner kits and sample packs — everything a crew needs, in one order.",
    ],
    image: "/images/categories/accessories.svg",
    sort: 4,
  },
];

const METAL_FINISHES: Pair[] = [
  ["哑光黑", "Matte Black"],
  ["拉丝银", "Brushed Silver"],
  ["香槟金", "Champagne Gold"],
  ["象牙白", "Ivory White"],
];

const WOOD_FINISHES: Pair[] = [
  ["原木色", "Natural Oak"],
  ["胡桃木", "Walnut"],
  ["浅灰橡", "Light Grey Oak"],
  ["奶油白", "Cream White"],
];

const PRODUCTS: SeedProduct[] = [
  // ── Aluminium profiles ────────────────────────────────────────────────
  {
    slug: "alu-t-profile-10",
    category: "aluminum-trims",
    name: ["铝合金 T 型收边条 10mm", "Aluminium T-Profile 10 mm"],
    subtitle: ["饰面板中缝收口，平整利落", "Clean centre-joint closure for decorative panels"],
    description: [
      "采用 6063-T5 高精级铝型材挤压成型，T 型结构可嵌入两块板材之间，形成笔直、均匀的装饰分缝。表面经阳极氧化或拉丝处理，耐磨抗腐蚀，长期使用不氧化发黑。\n\n适用于墙面饰面板、背景墙、柜体门板的中缝收口，也常用于天花与护墙板拼接位置。单支 2.9 米，50 支/箱，支持整箱发货与工程定制。",
      "Extruded from 6063-T5 high-precision aluminium, the T-section sits between two panels to create a perfectly straight, even reveal joint. Anodised or brushed finishes resist wear and corrosion without darkening over time.\n\nUsed for centre joints on wall panels, feature walls and cabinet doors, and for ceiling-to-wall transitions. Each piece is 2.9 m, 50 pieces per carton; project customisation available.",
    ],
    price: 3800,
    compare: 4500,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 260,
    stock: 800,
    featured: true,
    badge: ["热销", "Best seller"],
    specs: [
      ["材质", "Material", "6063-T5 铝合金", "6063-T5 aluminium"],
      ["表面处理", "Finish", "阳极氧化 / 拉丝", "Anodised / brushed"],
      ["规格", "Dimensions", "10 × 10 × 2900 mm", "10 × 10 × 2900 mm"],
      ["壁厚", "Wall thickness", "1.2 mm", "1.2 mm"],
      ["包装", "Packing", "50 支/箱", "50 pcs/carton"],
    ],
    variants: METAL_FINISHES,
    sort: 1,
  },
  {
    slug: "alu-u-channel-8",
    category: "aluminum-trims",
    name: ["铝合金 U 型槽线 8mm", "Aluminium U-Channel 8 mm"],
    subtitle: ["板材收边、包边与灯带嵌入", "Edge closure, capping and LED housing"],
    description: [
      "U 型槽可用于板材端头包边、玻璃与饰面板收口，也可作为灯带嵌入槽使用。开口 8 mm，适配 5–8 mm 厚饰面板，内壁光滑无毛刺，安装后线条干净利落。\n\n6063-T5 铝材挤压，壁厚 1.0 mm，常规长度 2.9 m，可定制 3 m / 4 m。表面可选四色，常规现货，交期 7–12 天。",
      "The U-channel caps panel edges, trims glass and decorative boards, and doubles as an LED strip housing. An 8 mm opening fits 5–8 mm panels; the smooth, burr-free interior gives a crisp finished edge.\n\nExtruded 6063-T5 aluminium, 1.0 mm wall, 2.9 m standard (3 m / 4 m on request). Four colours in stock; lead time 7–12 days.",
    ],
    price: 3200,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 210,
    stock: 1200,
    specs: [
      ["材质", "Material", "6063-T5 铝合金", "6063-T5 aluminium"],
      ["表面处理", "Finish", "阳极氧化", "Anodised"],
      ["规格", "Dimensions", "8 × 8 × 2900 mm", "8 × 8 × 2900 mm"],
      ["壁厚", "Wall thickness", "1.0 mm", "1.0 mm"],
      ["适配板厚", "Panel thickness", "5–8 mm", "5–8 mm"],
    ],
    variants: METAL_FINISHES,
    sort: 2,
  },
  {
    slug: "alu-corner-l20",
    category: "aluminum-trims",
    name: ["L 型阳角线 20×20", "Aluminium L-Angle Corner Trim 20×20"],
    subtitle: ["护角、阳角收边一体成型", "Protects and finishes external corners"],
    description: [
      "L 型 90° 直角结构，包覆墙板阳角，避免磕碰破损，同时遮盖板材切割边。表面阳极氧化，硬度高、耐刮擦，适合家装与商业空间高频使用区域。\n\n常规 20×20 mm、2.9 m/支，另有 30×30、40×40 大规格。配套免钉胶或卡扣安装，施工效率高。",
      "A 90° L-section wraps external corners, protecting panel edges from impact while hiding cut lines. The anodised surface is hard and scratch-resistant — ideal for high-traffic residential and commercial areas.\n\nStandard 20×20 mm, 2.9 m per piece; 30×30 and 40×40 available. Fix with construction adhesive or clips for fast installation.",
    ],
    price: 4200,
    compare: 4900,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 300,
    stock: 900,
    featured: true,
    badge: ["新品", "New"],
    specs: [
      ["材质", "Material", "6063-T5 铝合金", "6063-T5 aluminium"],
      ["规格", "Dimensions", "20 × 20 × 2900 mm", "20 × 20 × 2900 mm"],
      ["壁厚", "Wall thickness", "1.2 mm", "1.2 mm"],
      ["表面", "Finish", "阳极氧化 / 喷涂", "Anodised / powder coated"],
      ["包装", "Packing", "40 支/箱", "40 pcs/carton"],
    ],
    variants: METAL_FINISHES,
    sort: 3,
  },
  {
    slug: "alu-skirting-80",
    category: "aluminum-trims",
    name: ["铝合金踢脚线 80mm", "Aluminium Skirting 80 mm"],
    subtitle: ["隐藏走线槽 · 卡扣免打胶安装", "Concealed cable channel · clip-on install"],
    description: [
      "80 mm 高铝合金踢脚线，背部预留走线槽，可隐藏网线、电源线，墙面更整洁。卡扣式安装，无需打胶，后期可拆卸维护，不伤墙板。\n\n表面为耐磨喷涂或木纹转印，与地板、墙板颜色匹配。单支 2.5 m，常规颜色现货，定制颜色 10–15 天。",
      "An 80 mm aluminium skirting with a hidden cable channel at the back for network and power cables. Clip-on installation needs no adhesive and can be removed for maintenance without damaging the wall.\n\nWear-resistant powder coating or wood-grain transfer matches flooring and panels. 2.5 m per piece; standard colours in stock, custom colours 10–15 days.",
    ],
    price: 6800,
    unit: ["根（2.5m）", "pc (2.5 m)"],
    weight: 520,
    stock: 600,
    featured: true,
    specs: [
      ["高度", "Height", "80 mm", "80 mm"],
      ["长度", "Length", "2500 mm", "2500 mm"],
      ["壁厚", "Wall thickness", "1.0 mm", "1.0 mm"],
      ["安装", "Installation", "卡扣式，免打胶", "Clip-on, no adhesive"],
      ["颜色", "Colours", "12 款常规色", "12 standard colours"],
    ],
    variants: METAL_FINISHES,
    sort: 4,
  },
  {
    slug: "alu-led-cove-35",
    category: "aluminum-trims",
    name: ["LED 灯槽线条 35mm", "Aluminium LED Cove Profile 35 mm"],
    subtitle: ["见光不见灯，洗墙灯带一体槽", "Hidden-light cove with opal diffuser"],
    description: [
      "一体化 LED 灯槽，35 mm 宽，可嵌入 12 mm 灯带与乳白 PC 扩散罩，实现见光不见灯的洗墙效果。铝材散热好，灯带寿命更长、光衰更慢。\n\n适用于吊顶回光槽、背景墙顶部、柜体灯槽。2 m/支，含扩散罩与端盖，可按米定制并预装灯带。",
      "An integrated 35 mm LED cove that houses a 12 mm strip and an opal PC diffuser for a seamless wall-wash with no visible diodes. The aluminium body dissipates heat, extending strip life and slowing lumen depreciation.\n\nFor ceiling coves, feature-wall tops and cabinet lighting. 2 m per piece with diffuser and end caps; cut-to-length and pre-wired options available.",
    ],
    price: 8800,
    compare: 9800,
    unit: ["根（2m）", "pc (2 m)"],
    weight: 340,
    stock: 450,
    featured: true,
    badge: ["设计师推荐", "Designer pick"],
    specs: [
      ["宽度", "Width", "35 mm", "35 mm"],
      ["适配灯带", "Strip width", "≤12 mm", "≤12 mm"],
      ["长度", "Length", "2000 mm", "2000 mm"],
      ["材质", "Material", "6063 铝合金 + PC 罩", "6063 aluminium + PC diffuser"],
      ["安装", "Mounting", "嵌入式 / 明装", "Recessed / surface"],
    ],
    variants: [
      ["白色罩", "White diffuser"],
      ["磨砂罩", "Frosted diffuser"],
      ["黑色边框", "Black trim"],
    ],
    sort: 5,
  },
  {
    slug: "alu-flat-trim-30",
    category: "aluminum-trims",
    name: ["平口装饰线 30mm", "Aluminium Flat Trim 30 mm"],
    subtitle: ["简约平板线条，弱化接缝", "Minimal flat trim for subtle joints"],
    description: [
      "30 mm 平板铝线条，正面微弧过渡，视觉轻盈简洁，适合现代简约风格的墙面分区与吊顶收口。\n\n壁厚 1.2 mm，阳极氧化处理，2.9 m/支。可与 U 型槽、T 型条组合成完整收口系统。",
      "A 30 mm flat aluminium trim with a softly eased face for a light, minimal look — suited to modern wall zoning and ceiling transitions.\n\n1.2 mm wall, anodised, 2.9 m per piece. Combine with U-channels and T-profiles for a complete joint system.",
    ],
    price: 5200,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 290,
    stock: 700,
    specs: [
      ["规格", "Dimensions", "30 × 8 × 2900 mm", "30 × 8 × 2900 mm"],
      ["壁厚", "Wall thickness", "1.2 mm", "1.2 mm"],
      ["表面", "Finish", "阳极氧化 / 喷涂", "Anodised / powder coated"],
      ["安装", "Installation", "结构胶 / 卡扣", "Adhesive / clips"],
      ["包装", "Packing", "50 支/箱", "50 pcs/carton"],
    ],
    variants: METAL_FINISHES,
    sort: 6,
  },

  // ── Wood-fibre profiles ───────────────────────────────────────────────
  {
    slug: "wf-flat-30",
    category: "wood-fiber-profiles",
    name: ["竹木纤维平板线条 30mm", "WPC Flat Trim 30 mm"],
    subtitle: ["零甲醛基材，可钉可锯", "Zero-formaldehyde, cut and nail like timber"],
    description: [
      "以竹粉与 PVC 高温共挤成型，密度均匀、握钉力强，可按现场尺寸直接锯切，无需专用工具。表面 UV 转印木纹，耐水防潮，不霉变、不翘曲。\n\n用于墙板接缝、护墙板腰线、柜体收口。30 mm 宽，2.9 m/支，50 支/箱，颜色可与墙板、地板配套。",
      "Co-extruded bamboo powder and PVC for uniform density and strong screw-holding; cut on site with standard tools. UV-transfer wood grain resists water, mould and warping.\n\nFor panel joints, wainscot rails and cabinet trim. 30 mm wide, 2.9 m per piece, 50 per carton. Colours match our panels and flooring.",
    ],
    price: 2200,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 180,
    stock: 1500,
    badge: ["环保 E0", "E0 emission"],
    specs: [
      ["基材", "Core", "竹木纤维 / WPC", "Bamboo-PVC composite"],
      ["宽度", "Width", "30 mm", "30 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["环保等级", "Emission", "E0（≤0.05 mg/m³）", "E0 (≤0.05 mg/m³)"],
      ["表面", "Finish", "UV 木纹转印", "UV wood-grain transfer"],
    ],
    variants: WOOD_FINISHES,
    sort: 1,
  },
  {
    slug: "wf-corner-25",
    category: "wood-fiber-profiles",
    name: ["竹木纤维阳角线 25mm", "WPC External Corner 25 mm"],
    subtitle: ["与墙板同色，收角不留缝", "Colour-matched corner without gaps"],
    description: [
      "90° 阳角包边线条，与同色墙板插接后形成完整护角，避免墙板切割边外露。圆弧过渡，触感柔和，儿童房与走廊更安全。\n\n25×25 mm，2.9 m/支，颜色与集成墙板全系配套，可整箱发货。",
      "A 90° corner trim that interlocks with same-colour panels for a complete, gap-free corner — no exposed panel cuts. Soft rounded profile for safer hallways and kids' rooms.\n\n25×25 mm, 2.9 m per piece, colour-matched to the full panel range, carton quantities available.",
    ],
    price: 2400,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 200,
    stock: 1100,
    specs: [
      ["规格", "Dimensions", "25 × 25 × 2900 mm", "25 × 25 × 2900 mm"],
      ["基材", "Core", "竹木纤维", "Bamboo-PVC composite"],
      ["颜色", "Colour", "与墙板同色", "Colour-matched to panels"],
      ["安装", "Installation", "插接 + 结构胶", "Interlock + adhesive"],
      ["包装", "Packing", "60 支/箱", "60 pcs/carton"],
    ],
    variants: WOOD_FINISHES,
    sort: 2,
  },
  {
    slug: "wf-arc",
    category: "wood-fiber-profiles",
    name: ["竹木纤维弧形线条", "WPC Arc Profile"],
    subtitle: ["R150 弯曲半径，弧形墙顶过渡", "R150 bend for curved walls and ceilings"],
    description: [
      "专为弧形墙、弧形吊顶设计的可弯线条，最小弯曲半径 R150，热风枪加热后即可随结构弯曲，冷却定型不反弹。\n\n表面 UV 转印，与墙板同色。2.9 m/支，适合酒店大堂、展厅、圆弧背景墙等造型空间。",
      "A bendable profile for curved walls and ceilings — minimum radius R150. Warm with a heat gun, follow the structure, and it sets without spring-back.\n\nUV-transfer finish, colour-matched to panels. 2.9 m per piece for hotel lobbies, showrooms and rounded feature walls.",
    ],
    price: 2800,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 220,
    stock: 500,
    specs: [
      ["最小弯曲半径", "Min. bend radius", "R150", "R150"],
      ["规格", "Dimensions", "40 × 20 × 2900 mm", "40 × 20 × 2900 mm"],
      ["基材", "Core", "竹木纤维（可弯配方）", "Flexible WPC compound"],
      ["安装", "Installation", "热风加热后弯曲", "Heat-gun bending"],
      ["颜色", "Colour", "8 款木纹", "8 wood-grain colours"],
    ],
    variants: WOOD_FINISHES,
    sort: 3,
  },
  {
    slug: "wf-skirting-60",
    category: "wood-fiber-profiles",
    name: ["竹木纤维踢脚线 60mm", "WPC Skirting 60 mm"],
    subtitle: ["防水防潮，拖地不鼓包", "Waterproof — no swelling when mopping"],
    description: [
      "竹木纤维基材完全不吸水，拖地、回南天不鼓包、不发霉。60 mm 高度遮挡墙板与地面缝隙，背面带走线槽。\n\n与墙板同色配套，2.9 m/支。阴阳角配件可选，整屋收口一次配齐。",
      "The WPC core absorbs no water — no swelling or mould in humid weather. At 60 mm it hides the panel-to-floor gap, with a cable channel at the back.\n\nColour-matched with panels, 2.9 m per piece. Internal and external corner pieces available for a complete room installation.",
    ],
    price: 3600,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 420,
    stock: 800,
    specs: [
      ["高度", "Height", "60 mm", "60 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["基材", "Core", "竹木纤维", "Bamboo-PVC composite"],
      ["防水", "Water resistance", "完全不吸水", "Fully waterproof"],
      ["配件", "Accessories", "阴阳角 / 连接件", "Corner / joiner pieces"],
    ],
    variants: WOOD_FINISHES,
    sort: 4,
  },
  {
    slug: "wf-waist-50",
    category: "wood-fiber-profiles",
    name: ["竹木纤维腰线 50mm", "WPC Waist Rail 50 mm"],
    subtitle: ["墙面分区，一条定型", "One line to zone a wall"],
    description: [
      "50 mm 腰线用于墙面上下分区，平衡墙板比例，替代传统护墙板压条。插接式安装，接缝严密不外露。\n\n2.9 m/支，与墙板同色，适合客厅、餐厅、走廊的整墙造型。",
      "A 50 mm rail that divides a wall horizontally, balancing panel proportions and replacing traditional wainscot moulding. Interlocking installation keeps joints tight.\n\n2.9 m per piece, colour-matched to panels — for living, dining and hallway feature walls.",
    ],
    price: 3200,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 300,
    stock: 700,
    specs: [
      ["宽度", "Width", "50 mm", "50 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["基材", "Core", "竹木纤维", "Bamboo-PVC composite"],
      ["安装", "Installation", "插接式", "Interlocking"],
      ["包装", "Packing", "50 支/箱", "50 pcs/carton"],
    ],
    variants: WOOD_FINISHES,
    sort: 5,
  },
  {
    slug: "wf-ceiling-60",
    category: "wood-fiber-profiles",
    name: ["竹木纤维顶角线 60mm", "WPC Coving 60 mm"],
    subtitle: ["墙顶过渡，遮缝免找平", "Hides ceiling gaps without levelling"],
    description: [
      "60 mm 顶角线用于墙板与天花交界，遮盖缝隙与不平整，墙面无需二次找平。轻质基材，单人即可安装。\n\n2.9 m/支，颜色与墙板配套。可搭配 LED 灯带做回光造型。",
      "A 60 mm coving that covers the joint and uneven edges between wall panels and ceiling — no secondary levelling needed. Lightweight enough for one-person installation.\n\n2.9 m per piece, colour-matched to panels. Can integrate with LED strips for a cove-light detail.",
    ],
    price: 3000,
    unit: ["根（2.9m）", "pc (2.9 m)"],
    weight: 320,
    stock: 650,
    specs: [
      ["宽度", "Width", "60 mm", "60 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["基材", "Core", "竹木纤维", "Bamboo-PVC composite"],
      ["安装", "Installation", "结构胶 + 插接", "Adhesive + interlock"],
      ["包装", "Packing", "40 支/箱", "40 pcs/carton"],
    ],
    variants: WOOD_FINISHES,
    sort: 6,
  },

  // ── Wall panels ───────────────────────────────────────────────────────
  {
    slug: "panel-flat-300",
    category: "wall-panels",
    name: ["竹木纤维集成墙板 300mm", "WPC Wall Panel 300 mm"],
    subtitle: ["毛坯直装，5 分钟上墙", "Direct onto bare walls — installs in minutes"],
    description: [
      "300 mm 宽竹木纤维集成墙板，公母槽卡扣拼接，无需刮腻子、刷漆，毛坯墙面找平后直接安装。基材密度高、抗冲击、防潮防霉，适用于家装客厅卧室、工装门店与酒店客房。\n\n厚度 8 mm，标准长度 2.9 / 3.0 m，表面 UV 转印（木纹 / 石纹 / 纯色），防火等级 B1，环保等级 E0。按平方米计价，含公母槽。",
      "300 mm WPC panels click together with tongue-and-groove edges — no plastering, no painting, straight onto a levelled bare wall. The dense core resists impact, moisture and mould; ideal for living rooms, bedrooms, retail fit-outs and hotel rooms.\n\n8 mm thick, 2.9 / 3.0 m lengths, UV-transfer finishes (wood, stone, solid), B1 fire rating, E0 emissions. Priced per square metre, edges included.",
    ],
    price: 6800,
    compare: 8800,
    unit: ["㎡", "m²"],
    weight: 3800,
    stock: 5000,
    featured: true,
    badge: ["爆款", "Best seller"],
    specs: [
      ["宽度", "Width", "300 mm", "300 mm"],
      ["厚度", "Thickness", "8 mm", "8 mm"],
      ["长度", "Length", "2.9 m / 3.0 m", "2.9 m / 3.0 m"],
      ["防火等级", "Fire rating", "B1", "B1"],
      ["环保等级", "Emission", "E0", "E0"],
      ["安装", "Installation", "卡扣 + 结构胶", "Clips + adhesive"],
    ],
    variants: [
      ["原木色", "Natural Oak"],
      ["胡桃木", "Walnut"],
      ["浅灰布纹", "Light Grey Fabric"],
      ["奶油白", "Cream White"],
    ],
    sort: 1,
  },
  {
    slug: "panel-wave-3d",
    category: "wall-panels",
    name: ["3D 波浪板", "3D Wave Panel"],
    subtitle: ["曲线光影，造型墙面首选", "Sculpted curves for statement walls"],
    description: [
      "立体波浪曲面在灯光下形成明暗渐变，无需软装即可成为空间焦点。一体成型，不是贴皮，长期使用不变形。\n\n宽度 150 mm、起伏深度 20 mm，长度 2.9 m，可横向或纵向安装。按平方米计价，适合背景墙、吧台、酒店前台。",
      "Sculpted waves catch light in gradients, turning a wall into a focal point without extra styling. One-piece moulded construction — not a veneer — so it stays true over time.\n\n150 mm pitch, 20 mm relief, 2.9 m lengths, install horizontally or vertically. Priced per square metre; for feature walls, bars and hotel receptions.",
    ],
    price: 15800,
    unit: ["㎡", "m²"],
    weight: 4500,
    stock: 1800,
    featured: true,
    badge: ["网红款", "Trending"],
    specs: [
      ["波距", "Pitch", "150 mm", "150 mm"],
      ["起伏深度", "Relief", "20 mm", "20 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["厚度", "Thickness", "9 mm", "9 mm"],
      ["防火等级", "Fire rating", "B1", "B1"],
      ["安装", "Installation", "结构胶 + 卡扣", "Adhesive + clips"],
    ],
    variants: [
      ["米白", "Off-white"],
      ["浅灰", "Light Grey"],
      ["原木色", "Natural Oak"],
    ],
    sort: 2,
  },
  {
    slug: "panel-grille",
    category: "wall-panels",
    name: ["格栅墙板", "Acoustic Grille Panel"],
    subtitle: ["30×50 格栅，吸音降噪", "30×50 slats with acoustic backing"],
    description: [
      "30×50 mm 立体格栅，背后贴黑色吸音毡，可降低中高频混响，适合影音室、办公室、餐厅与门店背景墙。\n\n格栅条为竹木纤维材质，轻质且防潮，卡扣拼装，可做弧形与转角。标准 2.9 m 长度，按平方米计价。",
      "30×50 mm slats over black acoustic felt reduce mid/high-frequency reverberation — for media rooms, offices, restaurants and retail feature walls.\n\nWPC slats are lightweight and moisture-resistant, click-assembled and available in curved or corner versions. 2.9 m standard length, priced per square metre.",
    ],
    price: 18800,
    unit: ["㎡", "m²"],
    weight: 4200,
    stock: 1200,
    featured: true,
    specs: [
      ["格栅规格", "Slat size", "30 × 50 mm", "30 × 50 mm"],
      ["基材", "Substrate", "竹木纤维 + 吸音毡", "WPC + acoustic felt"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["吸音系数", "NRC", "0.55（中高频）", "0.55 (mid/high)"],
      ["安装", "Installation", "卡扣 / 结构胶", "Clips / adhesive"],
    ],
    variants: [
      ["黑胡桃", "Black Walnut"],
      ["浅橡木", "Light Oak"],
      ["哑光黑", "Matte Black"],
    ],
    sort: 3,
  },
  {
    slug: "panel-marble",
    category: "wall-panels",
    name: ["大理石纹墙板", "Marble-Effect Wall Panel"],
    subtitle: ["岩板质感，1/5 造价", "Stone look at a fifth of the cost"],
    description: [
      "高清 UV 打印大理石纹理，连纹拼接后接近天然岩板效果，但重量仅为岩板的五分之一，无需干挂，普通墙面即可安装。\n\n8 mm 厚，600 mm 宽，2.9 m/支，按平方米计价。适合电视背景墙、前台、卫生间干区。",
      "High-resolution UV-printed marble veining that runs continuously across panels — close to natural stone but a fifth of the weight, installed directly without dry-hanging.\n\n8 mm thick, 600 mm wide, 2.9 m per piece, priced per square metre. For TV walls, receptions and dry bathroom zones.",
    ],
    price: 12800,
    unit: ["㎡", "m²"],
    weight: 4000,
    stock: 2200,
    specs: [
      ["宽度", "Width", "600 mm", "600 mm"],
      ["厚度", "Thickness", "8 mm", "8 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["纹理", "Veining", "连纹拼接", "Continuous vein match"],
      ["防火等级", "Fire rating", "B1", "B1"],
    ],
    variants: [
      ["鱼肚白", "Calacatta White"],
      ["劳伦黑金", "Laurent Black Gold"],
      ["爵士白", "Statuario White"],
      ["浅灰岩", "Grey Stone"],
    ],
    sort: 4,
  },
  {
    slug: "panel-woodgrain",
    category: "wall-panels",
    name: ["木纹饰面板", "Wood-Grain Wall Panel"],
    subtitle: ["贴近实木的纹理，免漆免维护", "Real timber look, no painting or upkeep"],
    description: [
      "同步对花 UV 木纹，纹理深浅与实木接近，哑光表面不反光，适合卧室、书房、茶室等需要安静氛围的空间。\n\n基材防水防潮，可直接用于地下室、沿海地区。600 mm 宽，2.9 m/支，按平方米计价。",
      "Registered UV wood grain with depth close to solid timber; the matte surface avoids glare — suited to bedrooms, studies and tea rooms.\n\nThe core is waterproof, so it works in basements and coastal climates. 600 mm wide, 2.9 m per piece, priced per square metre.",
    ],
    price: 11800,
    unit: ["㎡", "m²"],
    weight: 3900,
    stock: 2400,
    specs: [
      ["宽度", "Width", "600 mm", "600 mm"],
      ["厚度", "Thickness", "8 mm", "8 mm"],
      ["长度", "Length", "2900 mm", "2900 mm"],
      ["表面", "Finish", "同步对花 UV 木纹", "Registered UV wood grain"],
      ["环保等级", "Emission", "E0", "E0"],
    ],
    variants: [
      ["原木色", "Natural Oak"],
      ["胡桃木", "Walnut"],
      ["白蜡木", "Ash"],
      ["仿古棕", "Antique Brown"],
    ],
    sort: 5,
  },
  {
    slug: "panel-charcoal",
    category: "wall-panels",
    name: ["炭晶大板 1220×2440", "Charcoal Wall Board 1220×2440"],
    subtitle: ["大板少缝，公共空间更高级", "Large format, fewer joints"],
    description: [
      "1220×2440 mm 大规格炭晶板，单片覆盖面积近 3 ㎡，墙面接缝更少，质感更完整。表面为哑光石纹或布纹，抗污易擦洗。\n\n厚度 6 mm，适合酒店大堂、写字楼、展厅与高端住宅背景墙。按平方米计价，可裁切。",
      "A 1220×2440 mm large-format charcoal board covering nearly 3 m² per sheet for fewer joints and a more continuous surface. Matte stone or fabric textures resist staining and wipe clean.\n\n6 mm thick, for hotel lobbies, offices, showrooms and high-end residential feature walls. Priced per square metre, cut-to-size available.",
    ],
    price: 26800,
    unit: ["㎡", "m²"],
    weight: 6500,
    stock: 900,
    specs: [
      ["规格", "Sheet size", "1220 × 2440 mm", "1220 × 2440 mm"],
      ["厚度", "Thickness", "6 mm", "6 mm"],
      ["单片面积", "Coverage", "≈2.98 ㎡/片", "≈2.98 m²/sheet"],
      ["表面", "Finish", "哑光石纹 / 布纹", "Matte stone / fabric"],
      ["防火等级", "Fire rating", "B1", "B1"],
    ],
    variants: [
      ["雪山白", "Snow White"],
      ["深灰岩", "Dark Grey Stone"],
      ["米灰布纹", "Beige Fabric"],
    ],
    sort: 6,
  },

  // ── Accessories ───────────────────────────────────────────────────────
  {
    slug: "acc-clip",
    category: "accessories",
    name: ["铝合金安装卡扣（100 只装）", "Mounting Clips (100 pcs)"],
    subtitle: ["免打孔固定，安装提速 3 倍", "No-drill fixing, 3× faster installs"],
    description: [
      "配套铝合金线条与墙板的隐形卡扣，免打孔固定，保护板材表面。一袋 100 只，约可安装 20–25 ㎡。\n\n镀锌钢材质，防锈耐用，配不锈钢自攻钉。",
      "Hidden clips for our aluminium profiles and wall panels — no drilling through the face, protecting the finish. 100 pieces per bag, enough for roughly 20–25 m².\n\nGalvanised steel for corrosion resistance, stainless self-tapping screws included.",
    ],
    price: 1500,
    unit: ["袋", "bag"],
    weight: 320,
    stock: 2000,
    specs: [
      ["数量", "Quantity", "100 只/袋", "100 pcs/bag"],
      ["材质", "Material", "镀锌钢", "Galvanised steel"],
      ["适配", "Compatibility", "墙板 / 铝线条", "Panels / aluminium profiles"],
      ["覆盖面积", "Coverage", "约 20–25 ㎡", "approx. 20–25 m²"],
      ["配件", "Includes", "不锈钢自攻钉 ×100", "100 stainless screws"],
    ],
    sort: 1,
  },
  {
    slug: "acc-adhesive",
    category: "accessories",
    name: ["免钉结构胶", "Construction Adhesive"],
    subtitle: ["高初粘，墙板线条通用", "High grab for panels and trims"],
    description: [
      "改性硅烷结构胶，初粘力强、无溶剂气味，可粘接竹木纤维板、铝材、瓷砖与木材。一支 600 ml，约可施工 8–10 ㎡。\n\n固化后有一定弹性，适应墙体微变形，不脆裂。配胶枪使用。",
      "Modified-silane adhesive with high initial grab and no solvent odour; bonds WPC panels, aluminium, tile and timber. 600 ml per cartridge, enough for roughly 8–10 m².\n\nCures with slight flexibility to accommodate wall movement without cracking. Requires a standard caulking gun.",
    ],
    price: 3500,
    unit: ["支", "cartridge"],
    weight: 900,
    stock: 1500,
    specs: [
      ["容量", "Volume", "600 ml", "600 ml"],
      ["类型", "Type", "改性硅烷结构胶", "Modified silane"],
      ["固化时间", "Cure time", "24 小时", "24 hours"],
      ["施工量", "Coverage", "约 8–10 ㎡/支", "approx. 8–10 m²"],
      ["颜色", "Colour", "白色 / 透明", "White / clear"],
    ],
    sort: 2,
  },
  {
    slug: "acc-corner-kit",
    category: "accessories",
    name: ["阴阳角安装套件", "Corner Install Kit"],
    subtitle: ["一屋阴阳角一次配齐", "All internal and external corners in one kit"],
    description: [
      "包含阴角 10 只、阳角 10 只、连接件 10 只与安装说明，满足 100 ㎡ 以内常规户型收角需求。\n\n与竹木纤维线条完全同色，卡扣式安装，无需现场切割。",
      "Includes 10 internal corners, 10 external corners, 10 joiners and installation instructions — enough for a typical home up to 100 m².\n\nColour-matched to our WPC profiles, clip-on installation with no on-site cutting.",
    ],
    price: 5800,
    unit: ["套", "kit"],
    weight: 800,
    stock: 600,
    specs: [
      ["包含", "Contents", "阴角 10 + 阳角 10 + 连接件 10", "10 internal + 10 external + 10 joiners"],
      ["适配", "Compatibility", "竹木纤维线条", "WPC profiles"],
      ["安装", "Installation", "卡扣式", "Clip-on"],
      ["颜色", "Colour", "8 款木纹可选", "8 wood-grain colours"],
    ],
    sort: 3,
  },
  {
    slug: "acc-sample",
    category: "accessories",
    name: ["样品册（5 色 + 3 段线条）", "Sample Kit (5 colours + 3 trims)"],
    subtitle: ["先看样再下单，样品费可抵扣", "See before you buy — fee credited on first order"],
    description: [
      "内含 5 张 200×300 mm 墙板色卡、3 段 200 mm 线条样段与一册色卡说明，顺丰包邮（国内）。\n\n样品费在首单满 3000 元时全额抵扣。海外客户可发 DHL，运费到付。",
      "Includes five 200×300 mm panel swatches, three 200 mm trim samples and a colour booklet. Free SF Express shipping in China.\n\nThe sample fee is fully credited against a first order over ¥3,000. International samples ship by DHL at cost.",
    ],
    price: 9900,
    compare: 12000,
    unit: ["套", "kit"],
    weight: 1200,
    stock: 300,
    featured: true,
    badge: ["先看样", "Sample first"],
    specs: [
      ["包含", "Contents", "5 色卡 + 3 线条 + 色卡册", "5 swatches + 3 trims + booklet"],
      ["规格", "Swatch size", "200 × 300 mm", "200 × 300 mm"],
      ["运费", "Shipping", "国内包邮", "Free in China"],
      ["抵扣", "Credit", "首单满 3000 元抵扣", "Credited on orders over ¥3,000"],
    ],
    sort: 4,
  },
];

const COUPONS = [
  { code: "WELCOME10", type: "percent", value: 10, min: 9900, expires: "2027-06-30", maxUses: 0 },
  { code: "TRADE15", type: "percent", value: 15, min: 300000, expires: "2027-12-31", maxUses: 0 },
  { code: "SAVE200", type: "fixed", value: 20000, min: 150000, expires: "2027-03-31", maxUses: 0 },
  { code: "AUTUMN300", type: "fixed", value: 30000, min: 200000, expires: "2026-11-30", maxUses: 0 },
];

const SHIPPING = [
  { code: "sf-express", zh: "顺丰速运", en: "SF Express", carrierZh: "顺丰", carrierEn: "SF", group: "domestic", base: 2500, perKg: 0, freeOver: 99900, min: 1, max: 3, sort: 1 },
  { code: "debang", zh: "德邦物流", en: "Debang Logistics", carrierZh: "德邦", carrierEn: "Debang", group: "domestic", base: 4000, perKg: 800, freeOver: 299900, min: 3, max: 6, sort: 2 },
  { code: "pickup", zh: "工厂自提", en: "Factory pickup", carrierZh: "自提", carrierEn: "Pickup", group: "domestic", base: 0, perKg: 0, freeOver: 0, min: 1, max: 2, sort: 3 },
  { code: "dhl-asia", zh: "DHL 国际快递（亚洲）", en: "DHL Express (Asia)", carrierZh: "DHL", carrierEn: "DHL", group: "asia", base: 28000, perKg: 6500, freeOver: 0, min: 3, max: 6, sort: 1 },
  { code: "air-asia", zh: "空运专线（亚洲）", en: "Air Line (Asia)", carrierZh: "专线", carrierEn: "Consolidated air", group: "asia", base: 12000, perKg: 4500, freeOver: 0, min: 7, max: 12, sort: 2 },
  { code: "sea-asia", zh: "海运拼箱（亚洲）", en: "Sea LCL (Asia)", carrierZh: "海运", carrierEn: "Sea freight", group: "asia", base: 60000, perKg: 1800, freeOver: 0, min: 18, max: 30, sort: 3 },
  { code: "dhl-global", zh: "DHL / FedEx 国际快递", en: "DHL / FedEx Express", carrierZh: "DHL / FedEx", carrierEn: "DHL / FedEx", group: "global", base: 38000, perKg: 9000, freeOver: 0, min: 5, max: 9, sort: 1 },
  { code: "air-global", zh: "国际空运专线", en: "International Air Line", carrierZh: "空运专线", carrierEn: "Consolidated air", group: "global", base: 22000, perKg: 5500, freeOver: 0, min: 9, max: 16, sort: 2 },
  { code: "sea-global", zh: "海运拼箱（全球）", en: "Sea LCL (Worldwide)", carrierZh: "海运", carrierEn: "Sea freight", group: "global", base: 120000, perKg: 2200, freeOver: 0, min: 28, max: 45, sort: 3 },
];

function slugifyVariant(productSlug: string, index: number): string {
  return `${productSlug.toUpperCase().replace(/-/g, "")}-${String(index + 1).padStart(2, "0")}`;
}

export function seedDatabase(db: DatabaseSync): void {
  const row = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (row.n > 0) {
    return;
  }

  const insertCategory = db.prepare(
    "INSERT INTO categories (slug, name_zh, name_en, tagline_zh, tagline_en, description_zh, description_en, image, sort) VALUES (?,?,?,?,?,?,?,?,?)",
  );
  for (const c of CATEGORIES) {
    insertCategory.run(c.slug, c.name[0], c.name[1], c.tagline[0], c.tagline[1], c.description[0], c.description[1], c.image, c.sort);
  }

  const insertProduct = db.prepare(`
    INSERT INTO products
      (slug, category, name_zh, name_en, subtitle_zh, subtitle_en, description_zh, description_en,
       price_cents, compare_at_cents, unit_zh, unit_en, moq, weight_g, stock, featured, badge_zh, badge_en,
       image, images, specs, sort)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const insertVariant = db.prepare(
    "INSERT INTO variants (product_id, sku, name_zh, name_en, price_delta_cents, image, stock, sort) VALUES (?,?,?,?,?,?,?,?)",
  );

  for (const p of PRODUCTS) {
    const image = `/images/products/${p.slug}.svg`;
    const images = [image, `/images/products/${p.slug}-b.svg`];
    const specs = p.specs.map(([kZh, kEn, vZh, vEn]) => ({ kZh, kEn, vZh, vEn }));
    const result = insertProduct.run(
      p.slug,
      p.category,
      p.name[0],
      p.name[1],
      p.subtitle[0],
      p.subtitle[1],
      p.description[0],
      p.description[1],
      p.price,
      p.compare ?? null,
      p.unit[0],
      p.unit[1],
      p.moq ?? 1,
      p.weight,
      p.stock,
      p.featured ? 1 : 0,
      p.badge?.[0] ?? null,
      p.badge?.[1] ?? null,
      image,
      JSON.stringify(images),
      JSON.stringify(specs),
      p.sort ?? 0,
    );
    const productId = Number(result.lastInsertRowid);
    const variants = p.variants ?? [];
    variants.forEach((v, i) => {
      insertVariant.run(productId, slugifyVariant(p.slug, i), v[0], v[1], 0, image, p.stock, i);
    });
  }

  const insertCoupon = db.prepare(
    "INSERT INTO coupons (code, type, value, min_subtotal_cents, expires_at, max_uses) VALUES (?,?,?,?,?,?)",
  );
  for (const c of COUPONS) {
    insertCoupon.run(c.code, c.type, c.value, c.min, c.expires, c.maxUses);
  }

  const insertShipping = db.prepare(`
    INSERT INTO shipping_methods
      (code, name_zh, name_en, carrier_zh, carrier_en, country_group, base_cents, per_kg_cents, free_over_cents, days_min, days_max, sort)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const s of SHIPPING) {
    insertShipping.run(s.code, s.zh, s.en, s.carrierZh, s.carrierEn, s.group, s.base, s.perKg, s.freeOver, s.min, s.max, s.sort);
  }

  const insertSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run("brand_name", "WALLINE");
  insertSetting.run("free_shipping_note_zh", "国内订单满 ¥999 免运费（顺丰）");
  insertSetting.run("free_shipping_note_en", "Free SF Express shipping on China orders over ¥999");
  for (const [code, currency] of Object.entries(currencies)) {
    insertSetting.run(`rate_${code}`, String(currency.rate));
  }

  // Demo account so the order history UI can be explored immediately.
  const demo = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@walline.com") as { id: number } | undefined;
  let demoUserId: number | null = null;
  if (!demo) {
    const inserted = db
      .prepare("INSERT INTO users (email, password_hash, name, phone, company, country) VALUES (?,?,?,?,?,?)")
      .run("demo@walline.com", hashPassword("demo1234"), "张先生", "+86 139 0000 0000", "佛山雅居装饰工程有限公司", "CN");
    demoUserId = Number(inserted.lastInsertRowid);
  } else {
    demoUserId = demo.id;
  }

  // Two sample orders give the admin dashboard something real to show.
  const panel = db.prepare("SELECT id, slug, name_zh, name_en, image, unit_zh, unit_en, weight_g FROM products WHERE slug = ?").get("panel-flat-300") as
    | { id: number; slug: string; name_zh: string; name_en: string; image: string; unit_zh: string; unit_en: string; weight_g: number }
    | undefined;
  const trim = db.prepare("SELECT id, slug, name_zh, name_en, image, unit_zh, unit_en, weight_g FROM products WHERE slug = ?").get("alu-t-profile-10") as typeof panel;

  if (panel && trim) {
    const now = nowSql();
    const order1 = db
      .prepare(
        `INSERT INTO orders (order_no, user_id, locale, currency, fx_rate, email, name, phone, company, country, province, city, address, postal,
          subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code, shipping_code, shipping_days, payment_method, payment_status, status, created_at, paid_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run("WL20261018001", demoUserId, "zh", "CNY", 1, "demo@walline.com", "张先生", "+86 139 0000 0000", "佛山雅居装饰工程有限公司", "CN", "广东省", "佛山市", "南海区里水镇和顺花园 3 座 1802", "528244", 174000, 0, 17400, 156600, "WELCOME10", "sf-express", "1-3", "wechat", "paid", "shipped", now, now);
    const order1Id = Number(order1.lastInsertRowid);
    db.prepare("INSERT INTO order_items (order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image, unit_price_cents, qty, weight_g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(order1Id, panel.id, panel.slug, panel.name_zh, panel.name_en, "原木色", "Natural Oak", panel.unit_zh, panel.unit_en, panel.image, 6800, 20, 3800);
    db.prepare("INSERT INTO order_items (order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image, unit_price_cents, qty, weight_g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(order1Id, trim.id, trim.slug, trim.name_zh, trim.name_en, "哑光黑", "Matte Black", trim.unit_zh, trim.unit_en, trim.image, 3800, 10, 260);

    const order2 = db
      .prepare(
        `INSERT INTO orders (order_no, user_id, locale, currency, fx_rate, email, name, phone, company, country, province, city, address, postal,
          subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code, shipping_code, shipping_days, payment_method, payment_status, status, created_at, paid_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run("WL20261021002", demoUserId, "en", "USD", 0.1405, "demo@walline.com", "Mr. Zhang", "+86 139 0000 0000", "Foshan Yaju Decoration Co., Ltd.", "AU", "NSW", "Sydney", "12 Harbour View Rd", "2000", 396000, 92000, 0, 488000, "", "dhl-global", "5-9", "stripe", "paid", "processing", now, now);
    const order2Id = Number(order2.lastInsertRowid);
    db.prepare("INSERT INTO order_items (order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image, unit_price_cents, qty, weight_g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(order2Id, panel.id, panel.slug, panel.name_zh, panel.name_en, "胡桃木", "Walnut", panel.unit_zh, panel.unit_en, panel.image, 6800, 30, 3800);
    db.prepare("INSERT INTO order_items (order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image, unit_price_cents, qty, weight_g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(order2Id, trim.id, trim.slug, trim.name_zh, trim.name_en, "拉丝银", "Brushed Silver", trim.unit_zh, trim.unit_en, trim.image, 3800, 40, 260);
  }
}
