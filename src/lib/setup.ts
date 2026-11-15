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
  | "memory-card"
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
  body: "Here's the whole setup in about 30 seconds - switch on, shoot, connect and charge.",
  /** public/setup/video/setup.(mp4|webm) and poster.(webp|jpg|png) */
  slot: "video/setup",
  posterSlot: "video/poster",
  alt: "VHSMO setup walkthrough video",
  brief: "Full setup walkthrough video",
} as const;

export type SetupStepContent = {
  id: string;
  number: string;
  /** Short label used by the progress rail. */
  label: string;
  title: string;
  body: string;
  note?: string;
  media: MediaSlotConfig;
};

/** Steps 01-04 share one layout. 05 and 06 have their own sections. */
export const setupSteps: SetupStepContent[] = [
  {
    id: "step-1",
    number: "01",
    label: "Switch on",
    title: "First things first. Switch it on.",
    body: "Move the slider button to the ON position to power up your VHSMO camera.",
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
    // Per the video script: startup sound, light on while starting, then off.
    body: "You'll hear a startup sound as your VHSMO wakes up, and the notification light comes on while it starts. Once the light turns off, your camera is ready to go.",
    media: {
      slot: "step-02/media",
      illustration: "notification-light",
      ratio: "1 / 1",
      fit: "contain",
      alt: "The notification light beside the viewfinder lighting up, then turning off when the camera is ready",
      brief: "Close-up GIF: notification LED on during startup, then off",
    },
  },
  {
    id: "step-3",
    number: "03",
    label: "Ready",
    title: "That's it. You're ready!",
    body: "Point your VHSMO at whatever you'd like to capture and press the shutter button. Your photo is saved to the memory card automatically. No screens, no distractions. Just you and the moment.",
    note: "Want flash? Slide the switch up to Flash and your camera will use flash for your photos.",
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
      title: "Let's set it up",
      body: "Open the app and tap Let's set it up.",
      src: "/setup/step-05/app-1.webp",
      alt: "The VHSMO app's first screen with a Let's set it up button",
    },
    {
      n: 2,
      title: "Pick your camera",
      body: "Choose your camera's colour.",
      src: "/setup/step-05/app-2.webp",
      alt: "The Let's find your VHSMO screen with the three camera colours",
    },
    {
      n: 3,
      title: "Press the Wi-Fi button",
      body: "Press the button on the camera, then tap Light's on!",
      src: "/setup/step-05/app-3.webp",
      alt: "The Press the Wi-Fi button screen showing the back of the camera",
    },
    {
      n: 4,
      title: "Join vhsmo",
      body: "Tap Join when your phone asks and the app finds your camera.",
      src: "/setup/step-05/app-4.webp",
      alt: "The Finding your camera screen with the vhsmo network details",
    },
    {
      n: 5,
      title: "Offload from Home",
      body: "Tap Offload media to move your photos onto your phone.",
      src: "/setup/step-05/app-5.webp",
      alt: "The VHSMO app's Home screen with the offload button",
    },
  ],
};

/** Step 06: charging. */
export const charging = {
  id: "step-6",
  number: "06",
  label: "Charging",
  title: "Power up. Get back out there.",
  body: "Your VHSMO takes up to 8 hours to fully charge.",
  hours: "8",
  photos: "1,000+",
  photosLine: "One full charge lets you capture 1,000+ photos, so you never have to worry about missing a moment.",
  media: {
    slot: "step-06/media",
    illustration: "charging",
    ratio: "4 / 3",
    fit: "cover",
    alt: "The VHSMO charging indicator changing from red to green",
    brief: "GIF: charging LED red to green",
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

/** Unnumbered strip after the video: the card that's already in the camera. */
export const inside = {
  id: "inside",
  eyebrow: "Already inside",
  title: "Nothing extra to buy.",
  body: "Your VHSMO comes with a memory card already installed, so there is nothing to buy or set up. It holds over 2,500 photos, so you can capture thousands of memories before you ever need to transfer or delete a single picture.",
  stat: "2,500+",
  statLabel: "photos on the card",
  media: {
    slot: "inside/media",
    illustration: "memory-card",
    ratio: "4 / 3",
    fit: "cover",
    alt: "The side panel of the VHSMO opening to show the memory card",
    brief: "Photo or GIF: side panel open, memory card visible",
  } satisfies MediaSlotConfig,
};

/** Unnumbered section after the tips: USB transfer and the reset button. */
export const goodToKnow = {
  id: "good-to-know",
  eyebrow: "Good to know",
  title: "Two more things, just in case.",
  items: [
    {
      id: "usb",
      title: "Prefer a computer? Use USB.",
      body: "Connect your VHSMO to your computer with a USB data cable, open the camera's storage and copy your photos across. When you're done, safely eject the storage before you unplug it.",
      note: "Handy when you have lots of photos to back up.",
      media: {
        slot: "good-to-know/usb",
        illustration: "usb-transfer",
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO connected to a laptop with a USB cable while photos copy across",
        brief: "GIF: camera on USB, photo folder on the laptop",
      } satisfies MediaSlotConfig,
    },
    {
      id: "reset",
      title: "Camera stuck? Reset it.",
      // CONFIRM against hardware: the position of the reset button under the
      // side panel is taken from the script, not yet checked on a camera.
      body: "Like any electronic device, your VHSMO can very rarely stop responding. On the side where the memory card goes in, you'll find a small reset button under the same panel. Press and hold it for about four seconds, until the indicator lights blink. The camera restarts and you're back to capturing.",
      note: "Hold for about 4 seconds, until the lights blink.",
      media: {
        slot: "good-to-know/reset",
        illustration: "reset-button",
        ratio: "4 / 3",
        fit: "cover",
        alt: "Pressing and holding the small reset button under the side panel",
        brief: "Photo or GIF: side panel open, reset button pressed",
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

export type TroubleItem = { q: string; a: string };

export const troubleshooting: TroubleItem[] = [
  {
    q: "My camera is stuck or won't respond",
    a: "Open the side panel (the one over the memory card) and press and hold the small reset button for about four seconds, until the indicator lights blink. The camera restarts and you're good to go.",
  },
  {
    q: "The Wi-Fi button won't light up",
    a: "Give it a charge. Plug the camera in for a few minutes, then press the Wi-Fi button again. Make sure the power slider is on ON, not OFF.",
  },
  {
    q: "The app can't find my camera",
    a: "Check the Wi-Fi button is still lit and your phone is close to the camera. In the app, tap Stuck? Join manually, then join the vhsmo network from your phone's Wi-Fi settings (password vhsmo123) and come back to the app.",
  },
  {
    q: "It says \"Unable to Join\"",
    a: "The camera's Wi-Fi needs to be on - press the Wi-Fi button so it stays lit. If you changed the camera's network name or password, use the new details. Tap Open Settings to join by hand if you'd rather.",
  },
  {
    q: "It says \"Please Wait\" on iPhone",
    a: "iOS limits Wi-Fi join attempts to once per minute. Wait a moment and tap Try auto-join again.",
  },
  {
    q: "My phone says \"No internet\"",
    a: "That's fine - the camera doesn't need internet. Your phone is talking straight to the camera over its own Wi-Fi. Stay connected.",
  },
  {
    q: "Why does the app want my location?",
    a: "iOS and Android only let apps join and read Wi-Fi networks with location permission. VHSMO uses it to connect to and communicate with your camera - nothing else.",
  },
  {
    q: "I changed my camera's Wi-Fi name or password",
    a: "Update them in the app under Settings → Camera → Wi-Fi name / Wi-Fi password. If a connection fails in Live Gallery, tap Get Help to enter the new details and Save & Connect. Names can be up to 10 characters; passwords need 8–32 characters with no spaces.",
  },
  {
    q: "My offload stopped halfway",
    a: "Make sure the camera is still on and the Wi-Fi button is lit, reconnect, then tap Try again and Offload. Keep the camera close to your phone until it says Transfer complete.",
  },
  {
    q: "The app says my battery is low",
    a: "Plug the camera into a charger before you offload. Firmware updates need at least 2 bars - a low battery mid-update can damage the camera.",
  },
  {
    q: "My photos aren't in my phone's Photos app",
    a: "Offloaded shots live in the VHSMO app's Gallery, sorted by day. To also copy them to your phone's Photos, turn on Save to phone gallery in the app's Settings.",
  },
];
