const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'www');
const rootResolved = path.resolve(root);
const port = 4173;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Length': Buffer.byteLength(body),
    ...headers
  });
  res.end(body);
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found');
      return;
    }

    send(res, 200, data, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/' || pathname === '/index.html') {
    serveFile(res, path.join(root, 'index.html'));
    return;
  }

  if (pathname.startsWith('/api/')) {
    const body = [];

    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => {
      const payload = Buffer.concat(body).toString('utf8');
      send(res, 501, JSON.stringify({
        success: false,
        message: 'El servidor local de vista previa no ejecuta PHP. Usa tu servidor PHP/MySQL para probar el formulario.',
        received: payload
      }), {
        'Content-Type': 'application/json; charset=utf-8'
      });
    });
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(rootResolved + path.sep) && filePath !== rootResolved) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send(res, 404, 'Not found');
      return;
    }

    serveFile(res, filePath);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview server running at http://127.0.0.1:${port}/`);
});
