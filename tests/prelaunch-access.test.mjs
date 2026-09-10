import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir } from 'node:fs/promises';

import { prelaunchResponse } from '../worker/prelaunch-access.mjs';

test('direct editorial visits and RSC requests cannot expose the site before launch', () => {
  for (const path of ['/agenda', '/agenda/', '/%61genda', '/sobre', '/eventos/teste', '/categorias', '/freguesias', '/acesso-52', '/contactos', '/submeter-evento', '/agenda?_rsc=abc']) {
    const response = prelaunchResponse(new Request('https://www.culturagratis.com' + path, {headers: {RSC: '1'}}));
    assert.equal(response?.status, 307, path);
    assert.equal(response.headers.get('Location'), '/', path);
    assert.equal(response.headers.get('Cache-Control'), 'no-store', path);
  }
});

test('event API remains unavailable even with a fake admin cookie or encoded path', async () => {
  for (const path of ['/api/eventos', '/api/eventos/', '/api/%65ventos', '/api/submissoes']) {
    const response = prelaunchResponse(new Request('https://www.culturagratis.com' + path, {headers: {Cookie:'admin=true'}}));
    assert.equal(response?.status, 503, path);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
    assert.equal((await response.json()).events, undefined);
  }
});

test('newsletter, confirmation, privacy, assets and existing authenticated management keep working', () => {
  for (const path of ['/', '/privacidade', '/privacidade/', '/inscricao-confirmada', '/api/contactos', '/api/partilha-cgl-20260902.jpg', '/admin/login', '/admin/dashboard', '/gestao', '/api/gestao/eventos', '/robots.txt', '/sitemap.xml', '/assets/app-123.js', '/_vinext/image?url=%2Fcgl-logo.png&w=640', '/cgl-logo.png']) {
    assert.equal(prelaunchResponse(new Request('https://www.culturagratis.com' + path)), null, path);
  }
});

test('unknown routes fail closed without a date or query-string opening switch', () => {
  for (const path of ['/new-editorial-page', '/admin-pretend', '/api/gestao-fake', '/agenda?launch=true', '/agenda?date=2026-09-26']) {
    assert.ok(prelaunchResponse(new Request('https://www.culturagratis.com' + path)), path);
  }
});

test('encoded separators cannot disguise an editorial route as an asset or admin route', () => {
  for (const path of ['/assets%2f..%2fagenda', '/admin%2f..%2fagenda', '/assets/%252e%252e%252fagenda']) {
    assert.equal(prelaunchResponse(new Request('https://www.culturagratis.com' + path))?.status, 400, path);
  }
});

test('compiled worker serves the actual bundled CSS and JS through ASSETS', async () => {
  const {default: worker} = await import('../dist/server/index.js');
  const names = await readdir(new URL('../dist/client/assets/', import.meta.url));
  for (const extension of ['.css', '.js']) {
    const name = names.find(n => n.endsWith(extension));
    const bytes = await readFile(new URL('../dist/client/assets/' + name, import.meta.url));
    const response = await worker.fetch(new Request('https://www.culturagratis.com/assets/' + name), {
      ASSETS: {fetch: async request => {
        assert.equal(new URL(request.url).pathname, '/assets/' + name);
        return new Response(bytes, {headers: {'Content-Type': extension === '.css' ? 'text/css' : 'text/javascript'}});
      }},
    }, {waitUntil(){}, passThroughOnException(){}});
    assert.equal(response.status, 200, name);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes, name);
  }
});
