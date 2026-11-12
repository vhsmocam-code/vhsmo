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
export type MediaSlotConfig = {
  slot: string;
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
  alt: "The VHSMO camera",
  brief: "Hero shot of the VHSMO camera",
  fallback: "/setup/camera-black.webp",
};

export const setupVideo = {
  eyebrow: "Watch",
  title: "Prefer watching? We've got you.",
  body: "Watch the complete walkthrough and get your VHSMO ready in just a few minutes.",
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
    // CONFIRM against hardware: LED colour and behaviour are deliberately
    // not described until the team verifies them on the real camera.
    body: "Once your VHSMO powers on, wait for the notification LED to light up. This LED indicates that the camera has powered on and is ready for use.",
    media: {
      slot: "step-02/media",
      ratio: "1 / 1",
      fit: "contain",
      alt: "Close-up of the notification LED on the VHSMO camera",
      brief: "Close-up GIF or photo: notification LED",
    },
  },
  {
    id: "step-3",
    number: "03",
    label: "Ready",
    title: "That's it. You're ready!",
    body: "Your VHSMO is now ready to capture moments. Start taking photos and enjoy the experience.",
    media: {
      slot: "step-03/media",
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
    ratio: "4 / 3",
    fit: "cover",
    alt: "The VHSMO camera connecting to the VHSMO app",
    brief: "Camera + phone connecting (photo or GIF)",
  } satisfies MediaSlotConfig,
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
        ratio: "4 / 3",
        fit: "cover",
        alt: "The VHSMO charging LED glowing green",
        brief: "Photo: charged LED green",
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
      body: "Keep the Wi-Fi button turned OFF when you aren't using the mobile app. This helps conserve battery.",
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
      title: "Keep capturing.",
      body: "Your VHSMO is made to capture everyday moments. Don't overthink it!",
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
