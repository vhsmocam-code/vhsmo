#!/usr/bin/env python3
"""
Dev server for the VHSMO App Store campaign.

Identical to `python3 -m http.server`, except it tells the browser not to
cache anything. Plain http.server sends no Cache-Control at all, so
browsers apply heuristic caching and quietly keep serving a stale
styles/preview.js after you have edited it — which looks exactly like
your CSS change "not working".

    python3 serve.py            # http://localhost:4321
    python3 serve.py 8080       # another port
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):          # one tidy line per request
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"VHSMO campaign → http://localhost:{port}  (Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
