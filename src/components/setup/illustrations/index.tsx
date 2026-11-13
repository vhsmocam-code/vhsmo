import type { ComponentType } from "react";
import type { IllustrationId } from "@/lib/setup";
import { AppConnect } from "./AppConnect";
import { ChargeState, Charging } from "./Charging";
import { NotificationLight } from "./NotificationLight";
import { PowerOn } from "./PowerOn";
import { ReadyToShoot } from "./ReadyToShoot";
import { WifiOn } from "./WifiOn";

type Scene = ComponentType<{ label: string; paused?: boolean }>;

function ChargeRed({ label }: { label: string }) {
  return <ChargeState label={label} state="red" />;
}

function ChargeGreen({ label }: { label: string }) {
  return <ChargeState label={label} state="green" />;
}

/** Drawn, animated stand-ins for each media slot (see src/lib/setup.ts). */
export const illustrations: Record<IllustrationId, Scene> = {
  "power-on": PowerOn,
  "notification-light": NotificationLight,
  "ready-to-shoot": ReadyToShoot,
  "wifi-on": WifiOn,
  "app-connect": AppConnect,
  charging: Charging,
  "charge-red": ChargeRed,
  "charge-green": ChargeGreen,
};

export { AppConnect, Charging, NotificationLight, PowerOn, ReadyToShoot, WifiOn };
