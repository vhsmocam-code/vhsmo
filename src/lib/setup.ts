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
  noteIcon?: "flash" | "wifi";
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
  screens: [
    {
      n: 1,
      title: "Live Gallery",
      body: "See your shots appear as you take them, straight from your camera.",
      src: "/setup/step-05/app-1.webp",
      alt: "The VHSMO app's Live Gallery showing photos from the connected camera",
    },
    {
      n: 2,
      title: "Home",
      body: "Your camera shows as connected, with its battery level. Tap Offload media to move your photos across.",
      src: "/setup/step-05/app-2.webp",
      alt: "The VHSMO app's Home screen with the camera connected and an Offload media button",
    },
    {
      n: 3,
      title: "Offload Gallery",
      body: "Every offload is saved on your phone and sorted by day, ready to look back on.",
      src: "/setup/step-05/app-3.webp",
      alt: "The VHSMO app's Your rolls screen with favourites and offloaded rolls sorted by day",
    },
  ],
};

/** Step 06: charging. */
export const charging = {
  id: "step-6",
  number: "06",
  label: "Charging",
  title: "Power up. Get back out there.",
  body: "Plug a USB-C cable into the charging port on the side of your VHSMO, next to the ON/OFF switch. It takes up to 8 hours to fully charge.",
  hours: "8",
  photos: "1,000+",
  photosLine: "One full charge lets you capture 1,000+ photos, so you never have to worry about missing a moment.",
  media: {
    slot: "step-06/media",
    illustration: "charging",
    ratio: "4 / 3",
    fit: "cover",
    alt: "The VHSMO turning from the front to its side, where a cable plugs into the charging port next to the ON/OFF switch",
    brief: "GIF: camera turns to the side port, cable plugs in, charging",
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
        alt: "The VHSMO charging LED glowing red",
        brief: "Photo: charging LED red",
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
        alt: "The VHSMO charging LED glowing green",
        brief: "Photo: charged LED green",
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
      media: {
        slot: "good-to-know/usb",
        illustration: "usb-transfer",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO on a USB cable, copying photos to a laptop and then to a phone",
        brief: "GIF: camera on USB, photos copying to a laptop, then a phone",
      } satisfies MediaSlotConfig,
    },
    {
      id: "reset",
      title: "Camera stuck? Reset it.",
      // CONFIRM against hardware: the cover position on the underside and the
      // screw, reset button and card order are from the team's description.
      body: "Like any electronic device, your VHSMO can very rarely stop responding. Turn it over and unscrew the small cover on the underside: you'll find the reset button in the middle and the memory card on the right. Press and hold the reset button for about four seconds, until the indicator lights blink. The camera restarts and you're back to capturing.",
      note: "Hold for about 4 seconds, until the lights blink.",
      media: {
        slot: "good-to-know/reset",
        illustration: "reset-button",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO turning onto its underside, the small cover coming off to show the reset button and the memory card",
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
