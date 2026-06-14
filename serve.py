#!/usr/bin/env python3
"""Локальный dev-сервер для GameQuest.

Главное отличие от `python -m http.server`: он отдаёт файлы с заголовками
no-cache, поэтому браузер всегда подхватывает свежие версии JS/CSS и не
приходится вручную сбрасывать кэш после каждой правки.

Запуск:  python serve.py            (порт 8123 по умолчанию)
         python serve.py 9000       (другой порт)
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    server = ThreadingHTTPServer(("0.0.0.0", port), NoCacheHandler)
    print(f"GameQuest dev server: http://localhost:{port}/index.html (no-cache)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
