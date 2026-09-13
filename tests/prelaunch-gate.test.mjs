import assert from "node:assert/strict";
import test from "node:test";
import { isPrelaunchRequestAllowed } from "../worker/prelaunch.ts";

test("permite apenas os recursos necessários ao pré-lançamento", () => {
  for (const request of [["GET", "/"], ["GET", "/privacidade"], ["GET", "/inscricao-confirmada"], ["POST", "/api/contactos"], ["GET", "/api/partilha-cgl-20260902.jpg"], ["GET", "/robots.txt"], ["GET", "/sitemap.xml"], ["GET", "/assets/site.css"]]) assert.equal(isPrelaunchRequestAllowed(...request), true);
});

test("bloqueia rotas não lançadas", () => {
  for (const request of [["GET", "/agenda"], ["GET", "/admin/login"], ["GET", "/gestao"], ["GET", "/_vinext/image"], ["GET", "/api/contactos"], ["GET", "/agenda.css"]]) assert.equal(isPrelaunchRequestAllowed(...request), false);
});
