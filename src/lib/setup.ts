/**
 * Copy for the /setup guide. Wording mirrors the VHSMO App's own
 * onboarding, tour and error dialogs so what people read here matches
 * what they see on their phone.
 */

/** Factory Wi-Fi the camera broadcasts as its own hotspot. */
export const CAMERA_WIFI = {
  network: "vhsmo",
  password: "vhsmo123",
} as const;

export type CameraColour = {
  name: string;
  src: string;
  reaction: string;
};

export const cameraColours: CameraColour[] = [
  { name: "Cosmic black", src: "/setup/camera-black.webp", reaction: "Timeless" },
  { name: "Cherry red", src: "/setup/camera-red.webp", reaction: "Iconic" },
  { name: "Baby pink", src: "/setup/camera-pink.webp", reaction: "Dreamy" },
];

/** Pins on the back-of-camera photo. Positions are % of the image box. */
export type AnatomyPin = {
  id: string;
  label: string;
  title: string;
  body: string;
  x: number;
  y: number;
};

export const anatomyPins: AnatomyPin[] = [
  {
    id: "power",
    label: "1",
    title: "Power switch",
    body: "Three positions: OFF, ON and Flash. Slide to ON to shoot, or all the way up to Flash for nights and dark rooms.",
    x: 22,
    y: 52.5,
  },
  {
    id: "wifi",
    label: "2",
    title: "Wi-Fi button",
    body: "Press once to latch it in. White light = Wi-Fi on, no light = off. Keep it on while the app is talking to the camera.",
    x: 76.5,
    y: 42,
  },
  {
    id: "shutter",
    label: "3",
    title: "Shutter",
    body: "On top. Shoot any time - your VHSMO works without your phone, the app or Wi-Fi.",
    x: 74.5,
    y: 15.5,
  },
];

export type WalkthroughStep = {
  id: string;
  title: string;
  body: string;
  /** Short aside under the body, e.g. a platform difference. */
  aside?: string;
  screen: string;
  alt: string;
};

/** The in-app flow, one real screenshot per step. */
export const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "app",
    title: "Get the app",
    body: "Download VHSMO, open it and tap Let's set it up.",
    screen: "/setup/screens/hook.webp",
    alt: "The VHSMO app's first screen: Live the moment, with a Let's set it up button",
  },
  {
    id: "pick",
    title: "Pick your camera",
    body: "Choose the colour you've got and tap That's the one.",
    screen: "/setup/screens/pick-camera.webp",
    alt: "The Let's find your VHSMO screen with the three camera colours",
  },
  {
    id: "wifi",
    title: "Press the Wi-Fi button",
    body: "Press it once so it latches in. When the white light stays on, tap Light's on!",
    aside: "Light won't come on? Charge the camera for a few minutes and try again.",
    screen: "/setup/screens/wifi-button.webp",
    alt: "The Press the Wi-Fi button screen showing the back of the camera",
  },
  {
    id: "join",
    title: "Join vhsmo",
    body: "Your phone asks to join the camera's network - tap Join and the app finds your camera. If it can't hop on by itself, it shows the network and password to join in Wi-Fi settings.",
    aside: "Allow location when asked - iPhone and Android need it to connect to the camera's Wi-Fi. A \"no internet\" warning is expected.",
    screen: "/setup/screens/connecting.webp",
    alt: "The Finding your camera screen, with the vhsmo network name and password to join manually",
  },
  {
    id: "offload",
    title: "Shoot, then offload",
    body: "Shoot with or without your phone. When you're back in range, connect and tap Offload media on Home to move the whole roll to the app.",
    aside: "Keep the camera and its Wi-Fi button on until the transfer is complete.",
    screen: "/setup/screens/home.webp",
    alt: "The VHSMO app's Home screen with the camera and the offload button",
  },
];

export type TroubleItem = { q: string; a: string };

export const troubleshooting: TroubleItem[] = [
  {
    q: "The Wi-Fi light won't turn on",
    a: "Give it a charge. Plug the camera in for a few minutes, then press the Wi-Fi button again. Make sure the power switch is on ON or Flash, not OFF.",
  },
  {
    q: "The app can't find my camera",
    a: "Check the white light is still on and your phone is close to the camera. In the app, tap Stuck? Join manually, then join the vhsmo network from your phone's Wi-Fi settings (password vhsmo123) and come back to the app.",
  },
  {
    q: "It says \"Unable to Join\"",
    a: "The camera's Wi-Fi needs to be on - press the Wi-Fi button until the white light stays lit. If you changed the camera's network name or password, use the new details. Tap Open Settings to join by hand if you'd rather.",
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
    a: "Make sure the camera is still on and the Wi-Fi light is white, reconnect, then tap Try again and Offload. Keep the camera close to your phone until it says Transfer complete.",
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
