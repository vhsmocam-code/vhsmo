/**
 * VHSMO landing page - the whole magazine issue, copy and assets.
 * Voice: fashion campaign, never spec sheet. Edit copy here, not in sections.
 */

export const RESERVE_HREF = "/#reserve";
export const YEAR_MARK = "/2026";
export const TAGLINE = ["Point.", "Shoot.", "Share."];

/** The running-head band shared by the launch poster and the landing page. */
export const LAUNCH_BANNER = "launching july 25 2026: 6:00 pm ist";

export const hero = {
  kicker: "Designed to be noticed · Built to last a lifetime",
  headline: "VHSMO",
  sub: "A screen-free pocket camera with the soul of 2000s.",
  cta: "Pre Order Now",
  image: {
    src: "/heroLatest.webp",
    alt: "VHSMO camera in a cinematic scene",
  },
  imageMobile: {
    src: "/heroNewDim.webp",
    alt: "VHSMO camera in a cinematic scene",
  },
  camera: {
    src: "/camera.webp",
    alt: "VHSMO camera in a cinematic scene",
  },
};

export const features = {
  items: [
    {
      icon: "lens",
      title: "Retro lens",
      body: "True 2000s optics - no filters, no overlays.",
    },
    {
      icon: "transfer",
      title: "Instant transfer",
      body: "Every shot on your phone, wirelessly, in seconds.",
    },
    {
      icon: "pocket",
      title: "Pocket build",
      body: "Palm-sized - always with you, always ready.",
    },
  ],
};

export const story = {
  kicker: "Why we exist",
  pullQuote: "Cameras got smarter. Photos got emptier.",
  paragraphs: [
    "Somewhere along the way, photos became something to perfect instead of something to remember.",
    "Yet the ones we treasure most are rarely perfect. They're blurry, overexposed, badly framed and unmistakably real.",
    "That's the feeling we built VHSMO around. A screen-free camera that keeps you in the moment instead of pulling you out of it. No checking. No retaking. No chasing perfection. Just trust that the moment in front of you is already worth remembering.",
  ],
  crew: [
    {
      name: "Maya Okonkwo",
      role: "Optics intern",
      bio: "Film-photography obsessive. Maya spent three months chasing the exact warm bloom of an early-2000s point-and-shoot, then rebuilt our lens coating to keep the beautiful flaw instead of correcting it.",
      fact: "Owns 41 disposable cameras.",
    },
    {
      name: "Diego Marchetti",
      role: "Firmware intern",
      bio: "Allergic to menus. Diego wrote the one-button firmware and the instant-transfer pipeline, deleting every setting he possibly could until only the shutter was left.",
      fact: "Ships photos to your phone in under 3s.",
    },
    {
      name: "Priya Raman",
      role: "Design intern",
      bio: "Shaped the pocketable body and the tactile click of the shutter. Priya prototyped 60 shells in foam before the one that disappears into your palm.",
      fact: "60 foam prototypes, 1 keeper.",
    },
  ],
  photos: [
    {
      src: "/story/story1.JPG",
      alt: "The first digicam shot that led to VHSMO",
      caption: "the photo that started it",
      story: "One digicam shot, one obvious problem, and the beginning of VHSMO.",
    },
    {
      src: "/story/story2.jpg",
      alt: "The team celebrating VHSMO's first cheque with their mentors",
      caption: "first big cheque",
      story:
        "Our first big win, shared with the mentors willing to bet on what it could become.",
    },
    {
      src: "/story/story3.webp",
      alt: "Friends piled together at night, shot on VHSMO Prototype Version 3.1",
      caption: "an iconic night, in 3MP",
      story:
        "Captured on Prototype Version 3.1 of VHSMO - imperfect, unforgettable, and exactly how it felt.",
    },
    {
      src: "/story/story4.avif",
      alt: "A frame shot on VHSMO Prototype Version 2.3 with a 2MP lens",
      caption: "the photo that put us on the map",
      story:
        "Shot on VHSMO Prototype Version 2.3 with a 2MP lens - the frame that started our social media journey.",
    },
    {
      src: "/story/story5.jpg",
      alt: "An early 3D-printed VHSMO prototype held together by wires",
      caption: "the version held together by wires",
      story:
        "An early VHSMO prototype - 3D-printed, hand-assembled, and built to prove the idea.",
    },
    {
      src: "/story/story6.jpg",
      alt: "A college dorm desk covered in unfinished VHSMO prototypes",
      caption: "the original VHSMO HQ",
      story:
        "A college dorm desk, several unfinished prototypes, where VHSMO was soldered, tested, broken, and rebuilt.",
    },
  ],
};

export const instantTransfer = {
  kicker: "Instant transfer",
  headline: ["Shoot it.", "It's already on", "your phone."],
  body: "No cables. No card readers. No transfers. Every shot lands in your camera roll in seconds, while the night keeps going.",
  note: "it's already there",
  app: {
    name: "VHSMO App",
    description:
      "Your photos, on your phone in seconds - ready to view, organise, edit and share. Coming soon to iOS and Android.",
  },
  features: ["Film Filters", "Your Gallery", "Easy Sharing"],
  phone: {
    title: "Camera Roll",
    subtitle: "Instant. Seamless. Yours.",
    photos: [
      "/vhsmoclicks/one.jpg",
      "/vhsmoclicks/two.JPEG",
      "/vhsmoclicks/three.jpg",
      "/vhsmoclicks/four.jpeg",
      "/vhsmoclicks/five.JPG",
      "/vhsmoclicks/six.jpg",
      "/vhsmoclicks/seven.jpg",
      "/samples/sample-warm.jpg",
      "/samples/sample-flat.jpg",
      "/buyproduct/pinkSide.webp",
      "/buyproduct/pinkFront.webp",
      "/hero-green.jpg",
    ],
  },
  flyingPrint: "/vhsmoclicks/four.jpeg",
  cameraCutout: "/camera-cutout.png",
};

export const careers = {
  kicker: "Join the crew",
  headline: "Create Your Own Career.",
  body: "We're always on the lookout for creators & enthusiasts to join our team. If VHSMO sounds like the place for you, drop us your info - we'll be sure to reach out :)",
  image: {
    src: "/buyproduct/pinkFront.webp",
    alt: "A VHSMO creator shooting on the pink camera",
    width: 1500,
    height: 1200,
  },
  areas: ["Design", "Engineering", "Marketing", "Retail & Ops", "Something else"],
  cta: "Work with Us",
  stickers: ["Play it live.", "Let's retro", "Rewind nothing.", "No filters. No cloud."],
};

export const shotOn = {
  kicker: "Shot on VHSMO / Vol. I",
  headline: "Real moments. No filters.",
  photos: [
    {
      src: "/vhsmoclicks/one.jpg",
      alt: "Two friends dressed up at a house party",
    },
    {
      src: "/vhsmoclicks/two.JPEG",
      alt: "A night out, caught in direct flash",
    },
    {
      src: "/vhsmoclicks/three.jpg",
      alt: "An in-between moment shot on VHSMO",
    },
    { src: "/vhsmoclicks/four.jpeg", alt: "A trip photographed on VHSMO" },
    { src: "/vhsmoclicks/five.JPG", alt: "Golden hour shot on VHSMO" },
    { src: "/vhsmoclicks/six.jpg", alt: "Friends shot on VHSMO" },
    { src: "/vhsmoclicks/seven.jpg", alt: "A quiet moment shot on VHSMO" },
    { src: "/vhsmoclicks/eight.jpg", alt: "A night out shot on VHSMO" },
    {
      src: "/vhsmoclicks/nine.jpg",
      alt: "Friends in direct flash, shot on VHSMO",
    },
    { src: "/vhsmoclicks/eleven.jpg", alt: "A candid moment shot on VHSMO" },
    {
      src: "/vhsmoclicks/twentythree.jpg",
      alt: "An evening out shot on VHSMO",
    },
    { src: "/vhsmoclicks/twelve.jpg", alt: "A quiet moment shot on VHSMO" },
    { src: "/vhsmoclicks/twentyone.jpg", alt: "A day out shot on VHSMO" },
    {
      src: "/vhsmoclicks/fourteen.JPEG",
      alt: "A moment between friends, shot on VHSMO",
    },
    { src: "/vhsmoclicks/eighteen.jpg", alt: "Golden hour, shot on VHSMO" },
    { src: "/vhsmoclicks/sixteen.JPEG", alt: "A night in, shot on VHSMO" },
    { src: "/vhsmoclicks/seventeen.jpg", alt: "A trip photographed on VHSMO" },
    { src: "/vhsmoclicks/fifteen.jpg", alt: "A party caught on VHSMO" },
    {
      src: "/vhsmoclicks/nineteen.jpg",
      alt: "An in-between moment shot on VHSMO",
    },
    { src: "/vhsmoclicks/twenty.jpg", alt: "A quiet moment shot on VHSMO" },
    { src: "/vhsmoclicks/thirteen.JPEG", alt: "Friends shot on VHSMO" },
    { src: "/vhsmoclicks/twentytwo.jpg", alt: "A late night shot on VHSMO" },
    {
      src: "/vhsmoclicks/ten.jpg",
      alt: "A candid frame shot on VHSMO",
    },
    { src: "/vhsmoclicks/twentyfour.jpg", alt: "A weekend shot on VHSMO" },
    { src: "/vhsmoclicks/twentyfive.jpg", alt: "A moment caught on VHSMO" },
    { src: "/vhsmoclicks/twentysix.JPEG", alt: "A night out shot on VHSMO" },
  ],
  marquee: "now rolling",
};

export const community = {
  kicker: "The corkboard",
  headline: "People keep sending us their nights.",
  scraps: [
    {
      handle: "@mars.jpg",
      text: "took it to a wedding instead of my phone. best decision. everyone kept grabbing it",
    },
    {
      handle: "@felixshoots",
      text: "the photos look like my childhood and i can't explain it better than that",
    },
    {
      handle: "@notlaura",
      text: "my friends fight over who holds the vhsmo now",
    },
    {
      handle: "@dev.rolls",
      text: "shot our whole road trip on it. 300 photos, zero edits, all keepers",
    },
    {
      handle: "@kira_kira",
      text: "it was on my phone before we left the parking lot. HOW",
    },
  ],
  photos: [
    { src: "/vhsmoclicks/six.jpg", alt: "Community photo shot on VHSMO" },
    { src: "/vhsmoclicks/two.JPEG", alt: "Community photo shot on VHSMO" },
    { src: "/vhsmoclicks/seven.jpg", alt: "Community photo shot on VHSMO" },
  ],
};

export const showcase = {
  kicker: "The object",
  image: {
    src: "/camera-cutout.png",
    alt: "The VHSMO pocket camera, studio lit",
    width: 1536,
    height: 1024,
  },
  cta: "Pre Order Now",
};

export const faq = {
  kicker: "Fine print",
  items: [
    {
      q: "What makes VHSMO different from other cameras?",
      a: "VHSMO gives you the look of a real 2000s digicam without the usual hassle. Pocket-sized and ready when the moment starts. No screen pulling you away. No menus. No filters. Just you, your people, and the memory as it happened - then your photos transfer to your phone in seconds, locally and cloud-free.",
    },
    {
      q: "How do I transfer photos from the camera?",
      a: "Press the WI-FI button on the camera & connect your VHSMO to the app and transfer your photos wirelessly over a direct local connection. No internet, cloud, or SD card reader needed.\n\nPrefer a cable? Connect the camera to a compatible device using USB-C for wired photo transfer.",
    },
    {
      q: "Do I need my phone to use a VHSMO?",
      a: "No. VHSMO is designed to be used on its own and stores 3,000+ photos, so your phone can stay out of the moment. You only need it when you're ready to view your memories or transfer them from the camera.",
    },
    {
      q: "What is the battery life of a VHSMO?",
      a: "Built for days out, not battery anxiety. The 1000mAh battery is designed for everyday shooting and recharges over USB-C in around 90 minutes. Actual use will vary depending on how often you use the flash and wireless transfer.",
    },
    {
      q: "Why doesn't VHSMO have a screen?",
      a: "Because the best moments happen when you're actually in them.\n\nNo stopping to check. No deleting the imperfect ones. No turning a memory into a photoshoot. Just take the picture, stay with your people, and let the moment keep moving.\n\nYou'll see what you caught later in the VHSMO app - and sometimes, the surprise is the best part.",
    },
    {
      q: "Why is there a wait for the pre-order batch?",
      a: "This is VHSMO's first production run - not stock sitting in a warehouse. We've spent too long building this to rush the part that matters most. Every camera is being manufactured, assembled, tested, and quality-checked to make sure VHSMO is genuinely worth the wait.\n\nReserved units are scheduled to ship by late August 2026. If your order has not shipped by 15 September 2026, you can request a full refund - no questions asked. We'll also send you an update before dispatch.",
    },
    {
      q: "Does VHSMO record video?",
      a: "VHSMO is built for still photography - capturing real, unplanned moments in a single frame. It does not record video; it is designed to make every photograph feel like a memory worth keeping.",
    },
  ],
};

export const finalCta = {
  welcome: "welcome to\nthe club!!!!!!",
  population:
    "Population: you, us, and everyone who knows the imperfect pictures usually mean the most.",
  closer: "You made it to the end. That probably means you get it.",
  welcomeLine: "Welcome to the club.",
  wordmark: "VHSMO",
  lineOne: "The world keeps moving.",
  lineTwo: "Stay in the moment.",
  lineThree: "Capture the memory.",
  sub: "First batch - /2026. Reserve yours before it's gone.",
  cta: "Pre Order Now",
  photo: {
    src: "/buyproduct/pinkFront.webp",
    alt: "Someone raising a pink VHSMO to their eye, mid-shot in the sun",
  },
};
