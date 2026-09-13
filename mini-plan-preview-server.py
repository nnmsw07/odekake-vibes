#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import os

PORT = int(os.environ.get('PORT', '8000'))
UPSTREAM = os.environ.get('KIBUN_API_UPSTREAM', 'https://kibun-api.misawa-nana7.workers.dev')

class Handler(SimpleHTTPRequestHandler):
    def proxy(self):
        upstream_path = self.path[len('/api'):]
        if not upstream_path.startswith('/'):
            upstream_path = '/' + upstream_path
        target = UPSTREAM.rstrip('/') + upstream_path
        body = None
        if self.command in ('POST', 'PUT', 'PATCH'):
            length = int(self.headers.get('Content-Length', '0') or 0)
            body = self.rfile.read(length) if length else None
        headers = {'Accept': self.headers.get('Accept', 'application/json')}
        if self.headers.get('Content-Type'):
            headers['Content-Type'] = self.headers['Content-Type']
        req = Request(target, data=body, headers=headers, method=self.command)
        try:
            with urlopen(req, timeout=20) as res:
                payload = res.read()
                self.send_response(res.status)
                self.send_header('Content-Type', res.headers.get('Content-Type', 'application/json'))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
        except HTTPError as exc:
            payload = exc.read()
            self.send_response(exc.code)
            self.send_header('Content-Type', exc.headers.get('Content-Type', 'application/json'))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:
            payload = ('{"error":"preview proxy failed: %s"}' % str(exc).replace('"', '\\"')).encode('utf-8')
            self.send_response(502)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    def do_GET(self):
        if self.path.startswith('/api/'):
            return self.proxy()
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            return self.proxy()
        self.send_error(405)

if __name__ == '__main__':
    print(f'Kibun Mini Plan preview: http://0.0.0.0:{PORT}/mini-plan-preview.html')
    print(f'API proxy -> {UPSTREAM}')
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
