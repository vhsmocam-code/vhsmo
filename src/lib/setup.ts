/**
 * Content for the /setup guide. Everything on the page comes from here:
 * copy, media slots and their shapes. To swap in a real photo, GIF or video,
 * drop the file at the slot's path under public/setup/ (see the README
 * there) - no code change needed.
 */

/** Factory Wi-Fi the camera broadcasts as its own hotspot. */
export const CAMERA_WIFI = {
  network: "vhsmo",
  password: "vhsmo123",
} as const;

/**
 * A media slot. `slot` is a path under public/setup/ WITHOUT an extension;
 * the resolver (src/lib/setup-media.ts) picks the first file that exists
 * among mp4, webm, gif, webp, jpg, png. `ratio` is fixed so nothing shifts
 * while media loads.
 */
/** Drawn, animated stand-ins (src/components/setup/illustrations). */
export type IllustrationId =
  | "power-on"
  | "notification-light"
  | "ready-to-shoot"
  | "wifi-on"
  | "app-connect"
  | "charging"
  | "charge-red"
  | "charge-green"
  | "usb-transfer"
  | "reset-button";

export type MediaSlotConfig = {
  slot: string;
  /** Shown when the slot has no real file yet. */
  illustration?: IllustrationId;
  /** CSS aspect-ratio, e.g. "4 / 5". */
  ratio: string;
  /** contain = never crop hardware details; cover = lifestyle shots. */
  fit: "cover" | "contain";
  alt: string;
  /** Shown on the placeholder so the team knows what to shoot. */
  brief: string;
  /** Existing real image used until the slot has its own file. */
  fallback?: string;
};

export const heroMedia: MediaSlotConfig = {
  slot: "hero/camera",
  ratio: "6 / 5",
  fit: "contain",
  alt: "The VHSMO camera in baby pink",
  brief: "Hero shot of the VHSMO camera",
  fallback: "/setup/camera-pink.webp",
};

export const setupVideo = {
  eyebrow: "Watch",
  title: "Prefer watching? We've got you.",
  body: "The whole setup, start to finish: switch on, shoot, connect and charge.",
  /** https://www.youtube.com/watch?v=bC3Oyn1y418 */
  youtubeId: "bC3Oyn1y418",
  alt: "VHSMO setup walkthrough video",
} as const;

export type SetupStepContent = {
  id: string;
  number: string;
  /** Short label used by the progress rail. */
  label: string;
  title: string;
  body: string;
  note?: string;
  /** Show the note as a highlighted callout with this icon instead of a quiet aside. */
  noteIcon?: "flash" | "wifi" | "usb" | "reset";
  media: MediaSlotConfig;
};

/** Steps 01-04 share one layout. 05 and 06 have their own sections. */
export const setupSteps: SetupStepContent[] = [
  {
    id: "step-1",
    number: "01",
    label: "Switch on",
    title: "First things first. Switch it on.",
    body: "Pull the slider from OFF to ON to power up your VHSMO camera.",
    media: {
      slot: "step-01/media",
      illustration: "power-on",
      ratio: "1 / 1",
      fit: "cover",
      alt: "The slider button on the VHSMO camera being moved to ON",
      brief: "GIF: slider moved to ON",
    },
  },
  {
    id: "step-2",
    number: "02",
    label: "Notification light",
    title: "Look for the notification light.",
    // Confirmed by the team: red while starting, then no light means ready.
    body: "As soon as you switch it on, the notification light glows red for a few seconds while your VHSMO starts up, and you'll hear a startup sound. When the light goes out, your camera is on and ready to go. No light means it's ready.",
    media: {
      slot: "step-02/media",
      illustration: "notification-light",
      ratio: "1 / 1",
      fit: "contain",
      alt: "The notification light beside the viewfinder glowing red while the camera starts, then turning off when it is ready",
      brief: "Close-up GIF: notification LED red during startup, then off",
    },
  },
  {
    id: "step-3",
    number: "03",
    label: "Ready",
    title: "That's it. You're ready!",
    body: "Point your VHSMO at whatever you'd like to capture and press the shutter button. Your photo is saved to the memory card automatically. No screens, no distractions. Just you and the moment.",
    note: "Want flash? Slide the switch up to Flash and your camera will use flash for your photos.",
    noteIcon: "flash",
    media: {
      slot: "step-03/media",
      illustration: "ready-to-shoot",
      ratio: "16 / 9",
      fit: "cover",
      alt: "Someone taking a photo with the VHSMO camera",
      brief: "Wide lifestyle photo or GIF: camera in use",
    },
  },
  {
    id: "step-4",
    number: "04",
    label: "Wi-Fi",
    title: "Want to see your moments? Connect.",
    body: "When you want to view or, more importantly, offload your photos, press the Wi-Fi button on your VHSMO. The button will light up to indicate that Wi-Fi is enabled.",
    note: "Wi-Fi is only needed when you access your photos through the VHSMO app.",
    noteIcon: "wifi",
    media: {
      slot: "step-04/media",
      illustration: "wifi-on",
      ratio: "1 / 1",
      fit: "cover",
      alt: "The Wi-Fi button on the VHSMO camera being pressed and lighting up",
      brief: "GIF: Wi-Fi button pressed and lighting up",
    },
  },
];

/**
 * A yellow ring drawn around a button on an app screenshot. `x`/`y` place
 * its centre as a percent of the screenshot's width/height; `w`, `h` and
 * the corner radius `r` are a percent of the screenshot's width (so the
 * ring keeps its shape at any size). Without `r` the ring is a pill/circle.
 */
export type TourHighlight = { x: number; y: number; w: number; h: number; r?: number };
export type TourScreen = {
  id: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
  /** Colour of the soft glow behind the phone. */
  glow: string;
  highlights: TourHighlight[];
};

/** Step 05: connect through the VHSMO app. */
export const appGuide = {
  id: "step-5",
  number: "05",
  label: "App",
  title: "Your photos, right on your phone.",
  body: "Open the VHSMO app and follow the on-screen instructions to connect your camera and access your photos.",
  media: {
    slot: "step-05/camera",
    illustration: "app-connect",
    ratio: "4 / 3",
    fit: "cover",
    alt: "The VHSMO camera connecting to the VHSMO app",
    brief: "Camera + phone connecting (photo or GIF)",
  } satisfies MediaSlotConfig,
  /** The first connection triggers a compulsory firmware update. */
  firmware: {
    tag: "Important",
    title: "Your first update is required.",
    body: "The first time you connect your VHSMO to the app, you'll be asked to install a firmware update. It includes important fixes and optimisations, so it's compulsory. Future updates arrive the same way.",
    points: [
      "Follow the instructions in the app.",
      "Keep your camera powered on and connected the whole time.",
      "Charge it first: updates need at least 2 battery bars.",
    ],
  },
  /**
   * The scroll story: four real screens from the app (iOS simulator
   * captures, demo photos, mock camera) that change in one phone as the
   * visitor scrolls. Highlight positions are measured from
   * public/setup/step-05/tour-*.webp (900 x 1958); re-measure if the
   * screenshots change.
   */
  tour: [
    {
      id: "home",
      title: "Home",
      caption: "Once your camera shows Connected with its battery level, tap Offload media to bring your photos across.",
      src: "/setup/step-05/tour-home.webp",
      alt: "The VHSMO app's Home screen: the pink camera, Connected with 86% battery, and an Offload media button",
      glow: "#fdf100",
      highlights: [
        { x: 16.6, y: 44.3, w: 33, h: 9 },
        { x: 50.1, y: 52.3, w: 96.5, h: 21.5, r: 6 },
      ],
    },
    {
      id: "live",
      title: "Live Gallery",
      caption: "Your shots land here as you take them. Tap the yellow button to take a photo from your phone.",
      src: "/setup/step-05/tour-live.webp",
      alt: "The VHSMO app's Live Gallery showing photos from the connected camera in a film strip",
      glow: "#ff5fa2",
      highlights: [
        { x: 11.3, y: 9.85, w: 18, h: 8.5 },
        { x: 50, y: 83.1, w: 19.5, h: 19.5 },
      ],
    },
    {
      id: "rolls",
      title: "Your rolls",
      caption: "Every offload is saved on your phone as a roll, sorted by day, with your favourites on top.",
      src: "/setup/step-05/tour-rolls.webp",
      alt: "The VHSMO app's Your rolls screen with favourites and offloaded rolls sorted by day",
      glow: "#1093ff",
      highlights: [
        { x: 50.1, y: 25.7, w: 96.5, h: 43, r: 7 },
        { x: 26.1, y: 55.2, w: 46.5, h: 55.5, r: 6 },
      ],
    },
    {
      id: "favs",
      title: "Favourites",
      caption: "Your favourite shots, kept together in one roll. Switch between the film strip and a grid.",
      src: "/setup/step-05/tour-favs.webp",
      alt: "The Favourites roll in the VHSMO app, shown as a film strip of photos",
      glow: "#ff5fa2",
      highlights: [{ x: 86.8, y: 9.35, w: 21.5, h: 11.5 }],
    },
  ] as TourScreen[],
};

/** Step 06: charging. */
export const charging = {
  id: "step-6",
  number: "06",
  label: "Charging",
  title: "Power up. Get back out there.",
  body: "Plug a USB-C cable into the charging port on the side of your VHSMO, next to the ON/OFF switch. The small light beside the port glows red while it charges and turns green when it's full. It takes up to 8 hours to fully charge.",
  hours: "8",
  photos: "1,000+",
  photosLine: "One full charge lets you capture 1,000+ photos, so you never have to worry about missing a moment.",
  media: {
    slot: "step-06/media",
    illustration: "charging",
    ratio: "4 / 3",
    fit: "cover",
    alt: "The VHSMO turning from the front to its side, where a cable plugs into the USB-C port and the light beside it glows red, then green when charged",
    brief: "GIF: camera turns to the side port, cable plugs in, light beside the port red then green",
  } satisfies MediaSlotConfig,
  states: [
    {
      id: "red",
      dot: "bg-[#ff3b30]",
      label: "Red",
      meaning: "Charging",
      media: {
        slot: "step-06/charging-red",
        illustration: "charge-red",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The small light beside the VHSMO's USB-C port glowing red while it charges",
        brief: "Photo: light beside the USB-C port glowing red",
      } satisfies MediaSlotConfig,
    },
    {
      id: "green",
      dot: "bg-[#34c759]",
      label: "Green",
      meaning: "Fully charged",
      media: {
        slot: "step-06/charged-green",
        illustration: "charge-green",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The small light beside the VHSMO's USB-C port glowing green when it is fully charged",
        brief: "Photo: light beside the USB-C port glowing green",
      } satisfies MediaSlotConfig,
    },
  ],
};

/** Unnumbered section after the tips: USB transfer and the reset button. */
export const goodToKnow = {
  id: "good-to-know",
  eyebrow: "Good to know",
  title: "Two more things, just in case.",
  items: [
    {
      id: "usb",
      title: "Prefer a cable? Use USB.",
      body: "Connect your VHSMO to your computer or phone with a USB data cable, open the camera's storage and copy your photos across. When you're done, safely eject the storage before you unplug it.",
      note: "Handy when you have lots of photos to back up.",
      noteIcon: "usb" as const,
      media: {
        slot: "good-to-know/usb",
        illustration: "usb-transfer",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO on a desk, wired to a phone with a USB cable; six photos appear on the phone one by one",
        brief: "GIF: photos copy over USB onto a phone",
      } satisfies MediaSlotConfig,
    },
    {
      id: "reset",
      title: "Camera stuck? Reset it.",
      // Matches the real underside: a small cover marked with a memory-card
      // icon, an R and a screw. CONFIRM the open layout against hardware.
      body: "Like any electronic device, your VHSMO can very rarely stop responding. Turn it over and unscrew the small cover on the underside, the one marked with a memory-card icon and an R. Press and hold the reset button (R) for about four seconds, until the indicator lights blink. The camera restarts and you're back to capturing.",
      note: "Hold for about 4 seconds, until the lights blink.",
      noteIcon: "reset" as const,
      media: {
        slot: "good-to-know/reset",
        illustration: "reset-button",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO turning onto its underside, the cover marked with a memory-card icon, an R and a screw coming off to show the card and the reset button",
        brief: "Photo or GIF: underside cover open, reset button pressed",
      } satisfies MediaSlotConfig,
    },
  ],
};

/** Step 07: tips. */
export const tips = {
  id: "step-7",
  number: "07",
  label: "Tips",
  title: "A few little things to remember.",
  items: [
    {
      title: "Save your battery.",
      body: "Keep the Wi-Fi button turned OFF whenever you aren't using the VHSMO app. It can significantly improve your battery life, so switch it off once you're done.",
    },
    {
      title: "Charge before heading out.",
      body: "Make sure your VHSMO is charged before taking it along for the day.",
    },
    {
      title: "Offload your photos.",
      body: "Connect through the VHSMO app regularly to view and transfer your captured photos.",
    },
    {
      title: "Stay in the moment.",
      body: "Don't worry about checking every picture right after taking it. Enjoy the people around you, capture the little things, and let the memories happen naturally.",
    },
  ],
};

/** Order of sections for the progress rail. */
export const progressSteps = [
  ...setupSteps.map((s) => ({ id: s.id, number: s.number, label: s.label })),
  { id: appGuide.id, number: appGuide.number, label: appGuide.label },
  { id: charging.id, number: charging.number, label: charging.label },
  { id: tips.id, number: tips.number, label: tips.label },
];
