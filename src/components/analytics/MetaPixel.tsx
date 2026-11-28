"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, flushPending, pixel } from "@/lib/meta-pixel";

/**
 * Meta Pixel base code (from Meta's setup email), loaded on every page so the
 * funnel events can fire anywhere. PageView is deliberately NOT in the snippet:
 * it is sent only when the visitor is on the landing page ("/"), on first load
 * and on each later arrival there (the App Router never reloads the page).
 * The <noscript> image is dropped for the same reason - it can't be limited to "/".
 */
export function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Same path again (strict-mode re-run, re-render): nothing new to report.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (pathname === "/") pixel("PageView");
  }, [pathname]);

  return (
    <Script id="meta-pixel" strategy="afterInteractive" onReady={flushPending}>
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');`}
    </Script>
  );
}
