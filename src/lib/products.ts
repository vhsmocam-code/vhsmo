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
  /** The finish's product page: /products/<slug>. Stable - shared links,
   *  ads and the sitemap point here, so never rename one in place. */
  slug: string;
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
  /** URL segment of this finish's product page. */
  slug: string;
  swatch: string;
  body: string;
  lightScale: number;
  images: ProductImage[];
}

/** Local artwork per SKU. Order here is the order the swatches render in. */
export const variantAssets: Record<string, VariantAssets> = {
  "VHSMO-BPK": {
    slug: "vhsmo-baby-pink",
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
    slug: "vhsmo-cosmic-black",
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
    slug: "vhsmo-cherry-red",
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

/** The product-level page - opens on the first finish still in stock. */
export const PRODUCT_SLUG = "vhsmo-camera";

/** Every slug that has a product page, the product-level one first. */
export const productSlugs = [
  PRODUCT_SLUG,
  ...Object.values(variantAssets).map((a) => a.slug),
];

/** A finish's page, or the product-level page when no finish is given. */
export function productHref(variant?: Pick<ProductVariant, "slug">): string {
  return `/products/${variant?.slug ?? PRODUCT_SLUG}`;
}

/** Slug for a finish name as the shop lists it ("Cherry Red" -> the Cherry
 *  Red page). Falls back to the product page for names it doesn't know. */
export function productHrefForColor(
  variants: ProductVariant[],
  color: string,
): string {
  return productHref(
    variants.find((v) => v.color.toLowerCase() === color.toLowerCase()),
  );
}

/** "Cherry Red" -> "vhsmo-cherry-red" - only for rows with no artwork entry. */
export function slugForColor(color: string): string {
  const s = color
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `vhsmo-${s || "camera"}`;
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

/** The camera's real specifications. The homepage accordion and the product
 *  page's spec sheet both render this list, so they can't drift apart. */
export const specifications: SpecGroup[] = [
  {
    group: "Image",
    items: [
      { label: "Sensor", value: "5MP CMOS sensor" },
      { label: "Lens", value: "Fixed-focus retro lens, 71° field of view" },
      { label: "Shooting", value: "Automatic exposure and white balance" },
      { label: "Flash", value: "Built-in 2W LED flash" },
    ],
  },
  {
    group: "Design",
    items: [
      { label: "Viewfinder", value: "Classic 35mm optical viewfinder" },
      { label: "Screen", value: "None - by design" },
      { label: "Controls", value: "One shutter button, one Wi-Fi button" },
      { label: "Mode", value: "Stills only - no video" },
    ],
  },
  {
    group: "Transfer & storage",
    items: [
      { label: "Wireless", value: "Direct Wi-Fi transfer to the VHSMO app" },
      { label: "Internet", value: "Not needed - local, cloud-free" },
      { label: "Wired", value: "USB-C photo transfer to a computer" },
      { label: "Storage", value: "4GB microSD included, 3,000+ photos" },
    ],
  },
  {
    group: "Power",
    items: [
      { label: "Battery", value: "1000mAh rechargeable" },
      { label: "Charging", value: "USB-C, up to 8 hours for a full charge" },
      { label: "App", value: "VHSMO for iOS and Android" },
      { label: "Warranty", value: "12-month limited warranty" },
    ],
  },
];

/** The short spec list the homepage accordion shows. */
export const keySpecs: { label: string; value: string }[] = [
  { label: "Sensor", value: "5MP CMOS sensor" },
  { label: "Lens", value: "Fixed-focus retro lens with a 71° field of view" },
  { label: "Shooting", value: "Automatic exposure and white balance" },
  { label: "Transfer", value: "Direct wireless transfer through the VHSMO app" },
  { label: "USB-C", value: "Rechargeable battery and wired photo transfer" },
  { label: "Viewfinder", value: "Classic 35MM optical viewfinder" },
  { label: "Flash", value: "Built-in 2W LED flash" },
  { label: "Storage", value: "4GB microSD card included" },
];

/** What ships in every box. `icon` is a lucide name the UI maps to a glyph. */
export const boxContents: {
  item: string;
  detail: string;
  icon: "camera" | "cable" | "card" | "lanyard";
}[] = [
  { item: "VHSMO Camera", detail: "In the finish you picked", icon: "camera" },
  { item: "USB-C cable", detail: "Charging and photo transfer", icon: "cable" },
  { item: "4GB microSD card", detail: "Pre-installed, 3,000+ photos", icon: "card" },
  { item: "VHSMO lanyard", detail: "Keeps it on you, not in a drawer", icon: "lanyard" },
];

/** The three steps on the product page's How it works section. */
export const howItWorks: {
  step: string;
  title: string;
  detail: string;
  illustration: "ready-to-shoot" | "wifi-on" | "app-connect";
}[] = [
  {
    step: "01",
    title: "Point & shoot",
    detail:
      "Frame it through the viewfinder and press the shutter. No menus, no modes, no screen to check.",
    illustration: "ready-to-shoot",
  },
  {
    step: "02",
    title: "Press the Wi-Fi button",
    detail:
      "When you're ready to see them, press the Wi-Fi button on the back. The camera makes its own direct connection - no internet needed.",
    illustration: "wifi-on",
  },
  {
    step: "03",
    title: "In your app in seconds",
    detail:
      "Open the VHSMO app and your photos land on your phone, ready to keep or share. Nothing goes through a cloud.",
    illustration: "app-connect",
  },
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
