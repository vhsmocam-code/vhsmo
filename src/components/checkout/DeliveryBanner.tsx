import { Truck } from "lucide-react";
import { DELIVERY_ETA } from "@/lib/shipping";

/** Reassurance strip below the shipping form. */
export function DeliveryBanner() {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-kodak/60 bg-kodak/15 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-kodak/60 text-darkroom">
        <Truck className="size-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-darkroom">Fast &amp; Free Delivery</p>
        <p className="text-xs text-darkroom/60">
          Delivered in {DELIVERY_ETA}, depending on your address.
        </p>
      </div>
    </div>
  );
}
