import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync("app/components/cgl-home.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("a barra da Home fica compacta depois do scroll", () => {
  assert.match(home, /isHeaderCompact/);
  assert.match(home, /addEventListener\("scroll"/);
  assert.match(home, /cgl-home-header\$\{isHeaderCompact \? " is-compact" : ""\}/);
  assert.match(css, /\.cgl-home-header\.is-compact/);
});

test("a hero da Home não herda o espaçamento exterior legado", () => {
  assert.match(css, /\.cgl-home-hero\s*\{[^}]*padding:\s*0;/s);
  assert.match(css, /\.cgl-home-hero\s*\{[^}]*gap:\s*0;/s);
});

test("a barra sticky não é bloqueada e a pesquisa fica sem texto decorativo atrás", () => {
  assert.match(css, /\.cgl-home\s*\{[^}]*overflow-x:\s*clip;[^}]*overflow-y:\s*visible;/s);
  assert.match(css, /\.cgl-home-hero-copy::after\s*\{[^}]*content:\s*none;/s);
  assert.match(css, /\.cgl-home-brand img\s*\{\s*width:\s*138px;/s);
});

test("as duas metades da hero têm a mesma altura", () => {
  assert.match(css, /\.cgl-home-hero\s*\{[^}]*align-items:\s*stretch;/s);
});

test("o rodapé da Home é compacto e inclui as redes sociais oficiais", () => {
  assert.match(home, /cgl-home-socials/);
  assert.match(home, /facebook/);
  assert.match(home, /instagram/);
  assert.match(home, /threads/);
  assert.match(home, /tiktok/);
  assert.match(home, /youtube/);
  assert.match(home, /whatsapp/);
  assert.match(css, /\.cgl-home-footer\s*\{[^}]*min-height:\s*0;/s);
});

test("o rodapé usa o logótipo negativo em tamanho visível", () => {
  assert.match(home, /src="\/cgl-logo-negative\.png"/);
  assert.match(css, /\.cgl-home-footer > div > img\s*\{\s*width:\s*112px;/s);
});

test("o rodapé usa ícones SVG fiéis e um logo negativo dominante", () => {
  assert.match(home, /function FooterSocialIcon/);
  assert.match(home, /viewBox="0 0 24 24"/);
  assert.match(home, /Facebook/);
  assert.match(home, /Instagram/);
  assert.match(home, /Threads/);
  assert.match(home, /TikTok/);
  assert.match(home, /YouTube/);
  assert.match(home, /WhatsApp/);
  assert.match(css, /\.cgl-home-footer > div > img\s*\{\s*width:\s*138px;/s);
});

test("a barra superior reduz sem diminuir o logótipo", () => {
  assert.match(css, /\.cgl-home-header\s*\{[^}]*min-height:\s*146px;[^}]*padding-block:\s*4px;/s);
  assert.match(css, /\.cgl-home-brand img\s*\{\s*width:\s*138px;/s);
});

test("o rodapé organiza marca, navegação e contacto em três blocos no desktop", () => {
  assert.match(
    css,
    /\.cgl-home-footer\s*\{[^}]*grid-template-columns:\s*minmax\(280px,\s*1fr\)\s+auto\s+minmax\(360px,\s*1fr\);[^}]*padding-block:\s*16px;/s
  );
  assert.match(css, /\.cgl-home-footer\s*>\s*nav\s*\{[^}]*justify-content:\s*center;/s);
  assert.match(css, /\.cgl-home-footer\s*>\s*aside\s*\{[^}]*justify-items:\s*end;/s);
});
test("o contacto do rodapé fica centrado sobre as redes sociais", () => {
  assert.match(
    css,
    /\.cgl-home-footer-meta\s*\{[^}]*grid-template-rows:\s*auto\s+auto\s+auto;[^}]*justify-items:\s*center;/s
  );
  assert.match(css, /\.cgl-home-footer-meta\s*>\s*aside\s*\{\s*display:\s*contents;/s);
});
test("o apoio sai da Home e passa a estar acessível no cabeçalho", () => {
  assert.doesNotMatch(home, /<section className="cgl-home-support"/);
  assert.match(home, /className="cgl-home-actions"/);
  assert.match(home, /className="cgl-home-support-link" href="\/apoia"/);
  assert.match(css, /\.cgl-home-actions\s*\{[^}]*display:\s*flex;/s);
  assert.match(css, /\.cgl-home-support-link\s*\{[^}]*box-shadow:\s*3px 3px 0 var\(--sunset\);/s);
});