import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('a rota /admin apresenta a transferência de eventos publicados para o Studio', () => {
  const page = readFileSync('app/admin/page.tsx', 'utf8');
  const client = readFileSync('app/admin/admin-client.tsx', 'utf8');
  assert.match(page, /import AdminClient from "\.\/admin-client"/);
  assert.match(client, /event\.status === "published" && !event\.access52/);
  assert.match(client, /Preparar no Studio/);
  assert.match(client, /sessionStorage\.setItem\("cgl-studio-published-event", JSON\.stringify\(event\)\)/);
  assert.match(client, /window\.location\.assign\("\/admin\/studio"\)/);
});
