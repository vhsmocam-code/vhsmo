import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-px mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="display mt-6 text-[clamp(2.5rem,8vw,6rem)]">
        Out of frame.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you're looking for has drifted out of focus. Let's get you back
        to something sharp.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products/vhsmo-camera">View the camera</Link>
        </Button>
      </div>
    </section>
  );
}
