"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Renders the global navbar + footer around the page, but hides them on
 * checkout routes, which use their own minimal chrome. The success page is
 * the exception - it closes with the universal footer.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome =
    (pathname?.startsWith("/checkout") &&
      !pathname?.startsWith("/checkout/success")) ||
    pathname?.startsWith("/launch") ||
    false;

  return (
    <>
      {!hideChrome && <Header />}
      <main id="main" className="relative">
        {children}
      </main>
      {!hideChrome && <Footer />}
    </>
  );
}
