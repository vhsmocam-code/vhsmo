/**
 * VHSMO landing page - the whole magazine issue, copy and assets.
 * Voice: fashion campaign, never spec sheet. Edit copy here, not in sections.
 */

import { DELIVERY_NOTE, DISPATCH_ETA } from "./shipping";

export const RESERVE_HREF = "/#reserve";
export const YEAR_MARK = "/2026";
export const TAGLINE = ["Point.", "Shoot.", "Share."];

/** The running-head band shared by the launch poster and the landing page. */
export const LAUNCH_BANNER = "launching july 25 2026: 6:00 pm ist";

export const hero = {
  kicker: "Designed to be noticed · Built to last a lifetime",
  headline: "VHSMO",
  sub: "A screen-free pocket camera with the soul of 2000s.",
  cta: "Order Now",
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
      "Your photos, on your phone in seconds - ready to view, organise and share.",
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

/** A buyer's unboxing story, as they posted it. type "video" is supported by
 *  the viewer (muted autoplay, advances on end) - add clips as entries only. */
export type Story = {
  src: string;
  /** Intrinsic size of the file - keeps next/image's aspect box honest. */
  w: number;
  h: number;
  /** Instagram handle without the @, or undefined when we don't have one. */
  handle?: string;
  /** Finish name exactly as the shop lists it. */
  finish: "Baby Pink" | "Cosmic Black" | "Cherry Red";
  type: "photo" | "video";
  /** A line from their message, rendered as text under the media (DM cards). */
  quote?: string;
  /** Video only: still frame shown on the card and until playback starts. */
  poster?: string;
  /** Tiny inline preview (base64) shown instantly while the real image loads. */
  blur?: string;
  /** object-position for photos that aren't 9:16. */
  focus?: string;
};

export const reviews = {
  eyebrow: "REC — straight from your stories",
  headline: "Unboxed.",
  highlight: "Unfiltered.",
  sub: "Real stories from people who got theirs. We didn't stage, edit or pay for a single one.",
  signOff: "Got yours? Tag @vhsmo.cam_ — you might end up here.",
  instagram: "https://www.instagram.com/vhsmo.cam_/",
  cta: "Join the club",
  stories: [
    { src: "/reviews/review-video.mp4", w: 720, h: 1280, handle: "jaee_bhilare", finish: "Baby Pink", type: "video", poster: "/reviews/review-video-poster.jpg" },
    { src: "/reviews/asadd06.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAB6ADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAHAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8ApT6LFJEd5jbplM/MPQkVQ/sC0/55D8qJ/EumxXs1ybQ+efl3g8kD17D8qZ/wmdt/z7N/30P8K3itPeIlo9D/2Q==", w: 724, h: 1304, handle: "__asadd06", finish: "Cosmic Black", type: "photo" },
    { src: "/reviews/mahajan-eeshaan.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACKADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8AqGNIkyArEDovJxiq32mL/nk//fP/ANetz7UjdUBccZP0x0pnnf7C/lXJz6vSxtys/9k=", w: 900, h: 1598, handle: "mahajan.eeshaan", finish: "Baby Pink", type: "photo" },
    { src: "/reviews/cherry-unboxing.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACqADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8IAEQgADgAKAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdAQEBAQEhISEhISEhISEj/2wBDAQsMDBIREh8RER9LMyozS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0v/2gAMAwEAAhEDEQAAAUoC0yf/2gAIAQEAAQUCkU/pXpSr/9oACAEDEQE/Aaf/2gAIAQIRAT8BN/2X/9oACAEBAAY/Aq148H5P5dv/xAAzEAEAAwACAgICAgMBAQAAAgsBEQAhMUFRYXGBkaGxwfDREOHxIDBAUGBwgJCgsMDQ4P/aAAgBAQABPyFsY10uc/pQgU9KmW//2gAMAwEAAhEDEQAAEL//xAAzEQEBAQADAAECBQUBAQABAQkBABEhMRBBUWEgcfCRgaGx0cHh8TBAUGBwgJCgsMDQ4P/aAAgBAxEBPxAGc3//2gAIAQIRAT8QPzB/F//aAAgBAQABPxB8czOvj7rMqKZr/tdgn8D5KxklVv8A/9k=", w: 1206, h: 1608, handle: "radhika_dn_", finish: "Cherry Red", type: "photo", focus: "60% 50%" },
    { src: "/reviews/teh-27.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACKADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8AdqpvZ5NojKQx4VGDY3f3sD1FZHkN6y/991oagZ7ueV3K+VFtCLjnH8WfrWb5UP8AzySs+bzLsf/Z", w: 920, h: 1587, handle: "teh._.27", finish: "Cherry Red", type: "photo" },
    { src: "/reviews/zahrabeingher.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACKADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8A85ms5ZLUzBVBAySTycDNYeJvarFzI5bBOR2B7fSq+WpOV9wsf//Z", w: 900, h: 1598, handle: "zahrabeingher", finish: "Cosmic Black", type: "photo" },
    { src: "/reviews/photamora-frames.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACKADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8Ank1q3u9Sgs7ZwrK2JMLhWwckf57103mRegritM/s2bVXR4ibtEBaT+E9uBnqa6nyoqmLbVwqWi7I/9k=", w: 920, h: 1587, handle: "photamora.frames", finish: "Cherry Red", type: "photo" },
    { src: "/reviews/two-seats-left.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAB6ADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAHAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8A1/P0vebeNtzqcEDnBHWnYtfRvyNaaW9hZs728e1pDliMZNP+0R+h/SoZdj//2Q==", w: 724, h: 1302, handle: "two.seats.left", finish: "Cherry Red", type: "photo" },
    { src: "/reviews/shruthi-23.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAB6ADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAHAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8A5+XwtpjWK3AlIcgBhnn096y/+Ebsf+erfn/9akbxFZMzu9mCzqFI3HbgY7fhUP8Ab1h/z4p+ZraMo21iKUezP//Z", w: 724, h: 1308, handle: "shruthi.23_", finish: "Cherry Red", type: "photo" },
    { src: "/reviews/chaitalkswithyou.jpg", blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAACKADAAQAAAABAAAADgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/8AAEQgADgAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAAf/aAAwDAQACEQMRAD8Ao3MsN9ZFok2Txg+bk/wqeuDXOYh/vfoKrXOtJNeZks4xJgRDa7hcgbQ2M9R1p3m3n9xP++2/wpty+y0l6FuN3dn/2Q==", w: 900, h: 1598, handle: "chaitalkswithyou", finish: "Cherry Red", type: "photo" },
  ] satisfies Story[] as Story[],
};

export const showcase = {
  kicker: "The object",
  image: {
    src: "/camera-cutout.png",
    alt: "The VHSMO pocket camera, studio lit",
    width: 1536,
    height: 1024,
  },
  cta: "Order Now",
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
      a: "Built for days out, not battery anxiety. The 1000mAh battery is designed for everyday shooting and takes up to 8 hours to fully charge over USB-C. Actual use will vary depending on how often you use the flash and wireless transfer.",
    },
    {
      q: "Why doesn't VHSMO have a screen?",
      a: "Because the best moments happen when you're actually in them.\n\nNo stopping to check. No deleting the imperfect ones. No turning a memory into a photoshoot. Just take the picture, stay with your people, and let the moment keep moving.\n\nYou'll see what you caught later in the VHSMO app - and sometimes, the surprise is the best part.",
    },
    {
      q: "How soon will my VHSMO ship?",
      a: `Shipping is free across India. Orders ship within ${DISPATCH_ETA}, with delivery taking ${DELIVERY_NOTE}.\n\nOnce your camera is on its way, you'll get tracking details by email so you can follow it to your door.`,
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
  sub: "Limited stock. Order yours before it's gone.",
  cta: "Order Now",
  photo: {
    src: "/buyproduct/pinkFront.webp",
    alt: "Someone raising a pink VHSMO to their eye, mid-shot in the sun",
  },
};
