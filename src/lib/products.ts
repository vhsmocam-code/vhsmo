export interface ProductImage {
  src: string;
  alt: string;
}

/**
 * Everything sellable - name, colour, price, stock - comes from the Supabase
 * `products` table. Nothing about a buyable product is hardcoded here.
 *
 * The only thing that stays local is the artwork: the studio renders in
 * /public and the two hex values the swatch row and the 3D viewer need, keyed
 * by SKU. A row whose SKU has no entry here still sells - it just falls back
 * to the default finish's photos.
 */
export interface VariantAssets {
  /** Hex shown in the swatch row on the purchase panel. */
  swatch: string;
  /**
   * The shell colour the 3D viewer paints onto the body material.
   *
   * These are not eyeballed to match `swatch` - each one is the literal
   * baseColorFactor of the body material in that colourway's export
   * (vhsmo.glb, blackVhsmo.glb, newredVhsmo.glb), converted from linear to sRGB
   * hex. Those three files are byte-identical apart from that single value:
   * same geometry buffers, same other nine materials, same node tree. So the
   * viewer loads one model and re-tints it rather than shipping 783 KB per
   * finish and re-downloading on every swatch click - the pixels come out the
   * same either way. Re-read the factor from the GLB if a colourway is
   * re-exported; only if an export ever changes something *other* than this
   * material does a per-colour model file start to earn its weight.
   */
  body: string;
  /**
   * Multiplier on the 3D viewer's lighting rig for this finish. The rig is
   * balanced for the pale pink body; a dark saturated shell shows the same
   * white environment sheen far more visibly and reads over-lit, so such a
   * finish can run the lights at a fraction. Omit for 1 (the studio default).
   */
  lightScale?: number;
  images: ProductImage[];
}

/** A row of `products` joined to its local artwork - what the UI renders. */
export interface ProductVariant {
  /** The Supabase row id; the cart and orders key off this. */
  id: string;
  sku: string;
  name: string;
  color: string;
  description: string;
  /** `selling_price` - what is actually charged. */
  price: number;
  /** `mrp` - struck through next to the price when it is higher. */
  mrp: number;
  stock: number;
  swatch: string;
  body: string;
  lightScale: number;
  images: ProductImage[];
}

/** Local artwork per SKU. Order here is the order the swatches render in. */
export const variantAssets: Record<string, VariantAssets> = {
  "VHSMO-BPK": {
    swatch: "#f2a8bd",
    body: "#ffc9d2",
    images: [
      {
        src: "/buyproduct/pinkFront.webp",
        alt: "VHSMO Camera in Baby Pink, front view",
      },
      {
        src: "/buyproduct/pinkBack.webp",
        alt: "VHSMO Camera in Baby Pink, back view",
      },
      {
        src: "/buyproduct/pinkSide.webp",
        alt: "VHSMO Camera in Baby Pink, three-quarter side view",
      },
    ],
  },
  "VHSMO-BLK": {
    swatch: "#1c1a19",
    body: "#222222",
    images: [
      {
        src: "/buyproduct/blackFront.webp",
        alt: "VHSMO Camera in Black, front view",
      },
      {
        src: "/buyproduct/blackBack.webp",
        alt: "VHSMO Camera in Black, back view",
      },
      {
        src: "/buyproduct/blackSide.webp",
        alt: "VHSMO Camera in Black, three-quarter side view",
      },
    ],
  },
  "VHSMO-CHR": {
    swatch: "#c02b25",
    body: "#950606",
    lightScale: 0.7,
    images: [
      {
        src: "/buyproduct/redFront.webp",
        alt: "VHSMO Camera in Cherry Red, front view",
      },
      {
        src: "/buyproduct/redBack.webp",
        alt: "VHSMO Camera in Cherry Red, back view",
      },
      {
        src: "/buyproduct/redSide.webp",
        alt: "VHSMO Camera in Cherry Red, three-quarter side view",
      },
    ],
  },
};

/** The shot used wherever the product stands in for itself outside the
 *  gallery (open graph, the in-the-box grid, the fly-to-cart ghost). */
export const DEFAULT_PRODUCT_IMAGE = variantAssets["VHSMO-BPK"]!.images[0]!;

/** Copy that belongs to the product but has no column in the table. */
export const productCopy = {
  tagline: "A pocket camera with instant wireless transfer.",
  currency: "INR",
  estimatedShipping: "First batch · ships 2026",
  highlights: [
    "Real 2000s-style photos. No filters. No overlays.",
    "Screen-free. No menus. Stay in the moment.",
    "Wireless to the VHSMO app in seconds.",
    "Palm-sized. Cloud-free. Ready to go.",
  ],
  /** Below this, the panel starts saying how few are left. */
  lowStockThreshold: 20,
};

/** Look up a variant by row id, falling back to the first one on offer. */
export function variantFor(
  variants: ProductVariant[],
  id: string,
): ProductVariant | undefined {
  return variants.find((v) => v.id === id) ?? variants[0];
}

export interface SpecGroup {
  group: string;
  items: { label: string; value: string }[];
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Named icon rendered on a kodak disc - no stock photography. */
  icon: "strap" | "skin" | "battery" | "looks";
  comingSoon?: boolean;
}

export const specifications: SpecGroup[] = [
  {
    group: "Sensor & Image",
    items: [
      { label: "Sensor", value: "61MP full-frame BSI CMOS" },
      { label: "ISO range", value: "64 – 102,400" },
      { label: "Dynamic range", value: "15 stops" },
      { label: "Colour science", value: "Aperture Warm Profile" },
    ],
  },
  {
    group: "Body & Controls",
    items: [
      { label: "Construction", value: "CNC aluminium, full-grain leather" },
      { label: "Weight", value: "498 g (body only)" },
      { label: "Controls", value: "Mechanical shutter, ISO & aperture dials" },
      { label: "Weather sealing", value: "IP53 dust & splash resistant" },
    ],
  },
  {
    group: "Performance",
    items: [
      { label: "Stabilisation", value: "8-stop 5-axis in-body" },
      { label: "Shutter", value: "1/8000s – 60s, silent electronic" },
      { label: "Viewfinder", value: "5.76M-dot OLED, 0.9× magnification" },
      { label: "Storage", value: "Dual UHS-II SD" },
    ],
  },
  {
    group: "Connectivity & Power",
    items: [
      { label: "Battery", value: "Up to 540 frames per charge" },
      { label: "Charging", value: "USB-C PD, full charge in 90 min" },
      { label: "Wireless", value: "Wi-Fi 6 + Bluetooth 5.2" },
      { label: "Ports", value: "USB-C, micro-HDMI, 3.5mm" },
    ],
  },
];

export const boxContents: { item: string; detail: string }[] = [
  { item: "Aperture Field One body", detail: "In Graphite or Sand finish" },
  { item: "USB-C charging cable", detail: "Braided, 1.5m" },
  { item: "Leather wrist strap", detail: "Full-grain, hand-stitched" },
  { item: "Lens cap & body cap", detail: "Machined aluminium" },
  { item: "Quick-start guide", detail: "Letterpress printed" },
  { item: "Lifetime membership", detail: "Aperture Field Notes community" },
];

/** A feature callout in the 3D inspect section. Selecting one glides the
 *  orbit camera to `view` (spherical angles around the model, radians). */
export interface InspectFeature {
  id: string;
  title: string;
  detail: string;
  view: { azimuth: number; polar: number; radius: number };
}

export const inspectFeatures: InspectFeature[] = [
  {
    id: "lens",
    title: "True 2000s optics",
    detail:
      "A real CCD-era lens and flash that slightly soft, overexposed digicam look straight off the sensor. No filters faking it.",
    view: { azimuth: 0.15, polar: 1.25, radius: 5.6 },
  },
  {
    id: "button",
    title: "One button",
    detail:
      "Point, press, done. No menus, no modes, no settings to scroll  the camera decides so you can stay in the moment.",
    view: { azimuth: 0.35, polar: 0.5, radius: 6.4 },
  },
  {
    id: "transfer",
    title: "Instant transfer",
    detail:
      "Every shot lands in the VHSMO app within seconds of pressing the shutter. Shoot the night, post the night.",
    view: { azimuth: Math.PI - 0.35, polar: 1.2, radius: 6.2 },
  },
  {
    id: "pocket",
    title: "Palm-sized body",
    detail:
      "Small enough for a jeans pocket, light enough to forget it's there  until the moment you don't want to miss.",
    view: { azimuth: Math.PI / 2, polar: 1.45, radius: 7 },
  },
];

/** Product-specific FAQ shown under the 3D inspect section. */
export const productFaq: { q: string; a: string }[] = [
  {
    q: "Is this a film camera? Do I need to buy film?",
    a: "No film, ever. VHSMO is digital with a sensor and lens tuned to shoot like the pocket cameras of the 2000s - you get the look without developing costs or waiting weeks for scans.",
  },
  {
    q: "How do my photos get to my phone?",
    a: "The camera pairs with the VHSMO app over wireless. Every shot appears in the app within seconds of taking it - no cables, no card readers, no exporting.",
  },
  {
    q: "How long does the battery last?",
    a: "A full night out and then some - hundreds of shots on one charge. When it does run flat, it charges over USB-C with the same cable as your phone.",
  },
  {
    q: "How many photos can it hold?",
    a: "Thousands. And since everything syncs to your phone as you shoot, the camera's storage is a backup, not a limit.",
  },
  {
    q: "Will it survive a night out?",
    a: "It's built for exactly that - a solid, pocket-proof body that shrugs off bags, jackets and dance floors. Treat it like your keys, not like glassware.",
  },
  {
    q: "When does it ship, and can I get my money back?",
    a: "First batch ships in 2026. Reserving locks the early price and is fully refundable - nothing is charged until your camera actually ships.",
  },
];

export const accessories: Accessory[] = [
  {
    id: "acc-strap",
    name: "Wrist Strap",
    description: "A woven cord that keeps VHSMO on you - not in a drawer.",
    price: 299,
    icon: "strap",
  },
  {
    id: "acc-skin",
    name: "Pocket Skin",
    description: "A grippy silicone skin. Blush, cream or charcoal.",
    price: 499,
    icon: "skin",
  },
  {
    id: "acc-battery",
    name: "Day-Two Battery",
    description: "A second charge for the nights that keep going.",
    price: 899,
    icon: "battery",
  },
  {
    id: "acc-looks",
    name: "Film-Look Pack",
    description: "Extra in-app looks, straight from the darkroom.",
    price: 0,
    icon: "looks",
    comingSoon: true,
  },
];
