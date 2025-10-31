#!/usr/bin/env node
import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const fallbackFile = join(distDir, 'index.html');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

function getContentType(filePath) {
  return mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

async function openFile(filePath) {
  await fs.access(filePath);
  return createReadStream(filePath);
}

async function resolveFile(pathname) {
  let candidate = pathname;
  if (candidate.endsWith('/')) {
    candidate += 'index.html';
  }
  const normalized = normalize(join(distDir, candidate));
  if (!normalized.startsWith(distDir)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
  try {
    const stream = await openFile(normalized);
    return { stream, filePath: normalized };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw Object.assign(error, { code: 'ENOENT' });
    }
    throw error;
  }
}

async function respond(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith('..')) {
    pathname = '/';
  }
  try {
    const { stream, filePath } = await resolveFile(pathname);
    res.statusCode = 200;
    res.setHeader('Content-Type', getContentType(filePath));
    stream.pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT' && !extname(pathname)) {
      try {
        const stream = await openFile(fallbackFile);
        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(fallbackFile));
        stream.pipe(res);
        return;
      } catch (fallbackError) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
    }
    const status = error.statusCode ?? (error.code === 'ENOENT' ? 404 : 500);
    res.statusCode = status;
    res.end(status === 404 ? 'Not Found' : 'Internal Server Error');
  }
}

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? process.env.WEB_PORT ?? 4173);

async function ensureDist() {
  try {
    await fs.access(fallbackFile);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('No web build found. Run "pnpm --filter expo-cng-unity-web run build" first.');
      process.exit(1);
    }
    throw error;
  }
}

await ensureDist();

const server = createServer((req, res) => {
  void respond(req, res);
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}`);
});
