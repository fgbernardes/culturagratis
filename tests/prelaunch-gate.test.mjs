import assert from "node:assert/strict";
import test from "node:test";
import { isPrelaunchRequestAllowed } from "../worker/prelaunch.ts";

test("permite apenas os recursos necessários ao pré-lançamento", () => {
  for (const request of [["GET", "/"], ["GET", "/privacidade"], ["GET", "/inscricao-confirmada"], ["POST", "/api/contactos"], ["GET", "/api/partilha-cgl-20260902.jpg"], ["GET", "/robots.txt"], ["GET", "/sitemap.xml"], ["GET", "/assets/site.css"]]) assert.equal(isPrelaunchRequestAllowed(...request), true);
});

test("mantém o painel administrativo disponível durante o pré-lançamento", () => {
  for (const request of [
    ["GET", "/admin"],
    ["HEAD", "/admin/login"],
    ["GET", "/admin/dashboard"],
    ["GET", "/admin/biblioteca"],
    ["GET", "/admin/studio"],
    ["GET", "/gestao"],
    ["GET", "/api/gestao/eventos"],
    ["POST", "/api/gestao/eventos"],
    ["PATCH", "/api/gestao/eventos/00000000-0000-4000-8000-000000000000"],
    ["PATCH", "/api/gestao/submissoes/1"],
  ]) assert.equal(isPrelaunchRequestAllowed(...request), true);
});

test("bloqueia rotas não lançadas e prefixes administrativos parecidos", () => {
  for (const request of [
    ["GET", "/agenda"],
    ["GET", "/_vinext/image"],
    ["GET", "/api/contactos"],
    ["GET", "/agenda.css"],
    ["GET", "/administrator"],
    ["GET", "/api/gestao-exposta"],
  ]) assert.equal(isPrelaunchRequestAllowed(...request), false);
});
