import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  Battery,
  Camera,
  Compass,
  Feather,
  Hand,
  ShieldCheck,
  Sparkles,
  Truck,
  Undo2,
  Wallet,
  Clock,
  Users,
  Play,
  Heart,
  Mail,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Aperture,
    title: "61MP full-frame",
    description:
      "A sensor tuned for skin, light and shadow - not for spec sheets.",
  },
  {
    icon: Hand,
    title: "Mechanical dials",
    description: "Every important setting lives under your fingertips.",
  },
  {
    icon: Feather,
    title: "498 grams",
    description: "Light enough to carry everywhere, dense enough to trust.",
  },
  {
    icon: Camera,
    title: "Warm colour science",
    description: "Files that feel finished the moment they leave the camera.",
  },
  {
    icon: Battery,
    title: "All-day battery",
    description: "540 frames per charge, fully charged over USB-C in up to 8 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Built to last",
    description: "Machined aluminium and full-grain leather, sealed against weather.",
  },
];

export interface JourneyStep {
  year: string;
  title: string;
  description: string;
}

export const journey: JourneyStep[] = [
  {
    year: "2022",
    title: "A frustration",
    description:
      "Three photographers, tired of cameras that felt like computers, sketched a different idea on a napkin in Lisbon.",
  },
  {
    year: "2023",
    title: "First prototype",
    description:
      "A 3D-printed body and a borrowed sensor. Ugly, but it proved the feeling we were chasing was real.",
  },
  {
    year: "2024",
    title: "The dials",
    description:
      "Eleven iterations of the shutter dial until the click felt exactly right. Sound designers were involved.",
  },
  {
    year: "2025",
    title: "Field testing",
    description:
      "120 photographers across 19 countries carried pre-production units for six months and shaped the firmware.",
  },
  {
    year: "2026",
    title: "Production",
    description:
      "Tooling is complete. The first batch is in production and reserved for pre-order customers.",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export const team: TeamMember[] = [
  {
    name: "Mara Voss",
    role: "Founder & Industrial Design",
    bio: "Former Leica designer. Believes a camera should disappear in the hand.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Daniel Okafor",
    role: "Co-founder & Imaging",
    bio: "Spent a decade on sensor colour pipelines. Obsessed with warm skin tones.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Yuki Tanaka",
    role: "Head of Mechanical",
    bio: "Makes things click - literally. Owns the feel of every moving part.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sofia Reyes",
    role: "Community & Field Notes",
    bio: "Documentary photographer running the beta programme across 19 countries.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "It's the first digital camera that made me feel like I did when I shot film. I think before I press the shutter again.",
    name: "Elena Marchetti",
    role: "Travel photographer · Beta tester",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "The files come out warm and finished. I've barely touched my editing presets in three months of shooting.",
    name: "James Whitfield",
    role: "Portrait photographer · Beta tester",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "It weighs nothing and goes everywhere. The dials mean I never dive into a menu mid-moment.",
    name: "Priya Nair",
    role: "Street photographer · Beta tester",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "I've owned every flagship of the last decade. This is the only one I actually look forward to picking up.",
    name: "Marcus Bell",
    role: "Documentary filmmaker · Beta tester",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  /** Optional call-to-action rendered after the answer. */
  link?: { href: string; label: string };
}

export const faqs: FaqItem[] = [
  {
    question: "What does a pre-order actually reserve?",
    answer:
      "Your pre-order secures a unit from the limited first production batch and locks in launch pricing. You're charged a fully refundable deposit today and the balance only when your camera ships.",
  },
  {
    question: "When will my camera ship?",
    answer:
      "The first batch ships in 2026, in the order reservations were placed. You'll receive tracking and a firm date by email before any balance is charged.",
  },
  {
    question: "Can I cancel or get a refund?",
    answer:
      "Yes. Your deposit is fully refundable at any time before shipping, no questions asked. After delivery you have 30 days for a full money-back return.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "All payments are processed over encrypted, PCI-compliant infrastructure. We never store your full card details on our servers.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes, on PIN codes where our courier supports it. A ₹200 COD fee is added and shown at checkout, and we verify your email address with a one-time code. Pay the full amount in cash or UPI when your VHSMO arrives. Coupons apply to online payment only.",
  },
  {
    question: "What's covered by the warranty?",
    answer:
      "Every VHSMO includes a 1-year limited warranty covering manufacturing defects, with optional extension to three years available at checkout closer to shipping.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Checkout currently delivers within India and its union territories. Ordering from anywhere else? Fill in the international order form and we'll arrange shipping and pricing for your country directly.",
    link: {
      href: "/international-order",
      label: "Open the international order form",
    },
  },
];

export interface TrustItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const trustItems: TrustItem[] = [
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Encrypted, PCI-compliant payments",
  },
  {
    icon: Sparkles,
    title: "1-year warranty",
    description: "Against manufacturing defects",
  },
  {
    icon: Truck,
    title: "Free shipping",
    description: "Worldwide, fully tracked",
  },
  {
    icon: Undo2,
    title: "Easy returns",
    description: "30-day money-back guarantee",
  },
];

export const preorderTrust: TrustItem[] = [
  {
    icon: Wallet,
    title: "Refundable deposit",
    description: "Cancel anytime before shipping",
  },
  {
    icon: Clock,
    title: "Ships March 2026",
    description: "First batch, in reservation order",
  },
  {
    icon: ShieldCheck,
    title: "1-year warranty",
    description: "Extendable to three years",
  },
  {
    icon: Compass,
    title: "Field Notes access",
    description: "Lifetime community membership",
  },
];

/* ------------------------------------------------------------------ */
/*  Community - comments on reels + DMs                                 */
/* ------------------------------------------------------------------ */

const avatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=120&q=80`;

export interface ReelComment {
  handle: string;
  time: string;
  text: string;
  likes: number;
  image: string;
  liked?: boolean;
}

export interface CommunityReel {
  title: string;
  thumbnail: string;
  totalComments: number;
  comments: ReelComment[];
}

export const communityReels: CommunityReel[] = [
  {
    title: "Reel: Launch Update",
    thumbnail: "/buyproduct/pinkFront.webp",
    totalComments: 48,
    comments: [
      {
        handle: "@analog.vibez",
        time: "2d",
        text: "This is exactly what the camera world needed. So excited! 💚",
        likes: 124,
        image: avatar("1500648767791-00dcc994a43e"),
        liked: true,
      },
      {
        handle: "@film.with.jay",
        time: "2d",
        text: "The design, the vision, the vibe. Everything 🔥",
        likes: 98,
        image: avatar("1507003211169-0a1dd7228f2d"),
      },
      {
        handle: "@retro.frames",
        time: "3d",
        text: "Finally a product that gets it. Can't wait!",
        likes: 76,
        image: avatar("1506794778202-cad84cf45f1d"),
      },
    ],
  },
  {
    title: "Reel: Behind the Scenes",
    thumbnail: "/buyproduct/blackSide.webp",
    totalComments: 32,
    comments: [
      {
        handle: "@creators.of.today",
        time: "1d",
        text: "Love how much effort you're putting into this. Rooting for you guys!",
        likes: 63,
        image: avatar("1534528741775-53994a69daeb"),
      },
      {
        handle: "@visualdiaries.exe",
        time: "2d",
        text: "This is more than a product. This is a movement.",
        likes: 49,
        image: avatar("1544005313-94ddf0286df2"),
      },
      {
        handle: "@shotbykali",
        time: "4d",
        text: "Can't wait to get my hands on this. The concept is insane.",
        likes: 32,
        image: avatar("1573497019940-1c28c88b4f3e"),
      },
    ],
  },
  {
    title: "Reel: First Look at VHSMO",
    thumbnail: "/buyproduct/redFront.webp",
    totalComments: 35,
    comments: [
      {
        handle: "@vintage.eyes",
        time: "1d",
        text: "This is going to change the game. Mark my words.",
        likes: 87,
        image: avatar("1502685104226-ee32379fefbe"),
      },
      {
        handle: "@glypse.png",
        time: "2d",
        text: "Finally a camera made for our generation. Let's go!",
        likes: 71,
        image: avatar("1508214751196-bcfd4ca60f91"),
      },
      {
        handle: "@shootwithfilm",
        time: "3d",
        text: "The details are crazy. Can't believe this is real!",
        likes: 62,
        image: avatar("1463453091185-61582044d556"),
      },
    ],
  },
  {
    title: "Reel: Packaging Reveal",
    thumbnail: "/buyproduct/pinkSide.webp",
    totalComments: 28,
    comments: [
      {
        handle: "@unboxed.diary",
        time: "1d",
        text: "Packaging is insane. The experience is everything.",
        likes: 56,
        image: avatar("1545996124-0501ebae84d0"),
      },
      {
        handle: "@filmlover_22",
        time: "2d",
        text: "Minimal. Clean. Perfect. Just like the camera.",
        likes: 41,
        image: avatar("1500648767791-00dcc994a43e"),
      },
      {
        handle: "@analog.collective",
        time: "3d",
        text: "You guys nailed the aesthetic ✨",
        likes: 28,
        image: avatar("1492562080023-ab3db95bfbce"),
      },
    ],
  },
];

export interface DirectMessage {
  handle: string;
  time: string;
  text: string;
  image: string;
}

export const communityMessages: DirectMessage[] = [
  {
    handle: "@sarthak.jpg",
    time: "2d",
    text: "Just wanted to say, I love what you're building. Any update on the launch date? 🔥",
    image: avatar("1507003211169-0a1dd7228f2d"),
  },
  {
    handle: "@ananya.visuals",
    time: "3d",
    text: "Will there be a creator collaboration program? I'd love to be a part of this journey! ✨",
    image: avatar("1500648767791-00dcc994a43e"),
  },
  {
    handle: "@muse.with.me",
    time: "4d",
    text: "Your videos give me so much inspiration. Keep going, you're doing amazing! 💚",
    image: avatar("1534528741775-53994a69daeb"),
  },
];

export interface CommunityStat {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const communityStats: CommunityStat[] = [
  { value: "28.4K+", label: "Followers", icon: Users },
  { value: "1.2M+", label: "Reel Views", icon: Play },
  { value: "45K+", label: "Engagements", icon: Heart },
  { value: "10K+", label: "DMs Received", icon: Mail },
];

export const communityAvatars: string[] = [
  avatar("1534528741775-53994a69daeb"),
  avatar("1500648767791-00dcc994a43e"),
  avatar("1507003211169-0a1dd7228f2d"),
  avatar("1544005313-94ddf0286df2"),
  avatar("1506794778202-cad84cf45f1d"),
];

export const samplePhotos: { src: string; alt: string; location: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    alt: "Golden light over a mountain ridge",
    location: "Dolomites · 35mm",
  },
  {
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    alt: "Misty forest at dawn",
    location: "Oregon · 50mm",
  },
  {
    src: "https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&w=1200&q=80",
    alt: "Portrait in warm window light",
    location: "Lisbon · 75mm",
  },
  {
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
    alt: "Lake reflecting evening sky",
    location: "Hallstatt · 35mm",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    alt: "Sunlight through tall trees",
    location: "Black Forest · 50mm",
  },
];
