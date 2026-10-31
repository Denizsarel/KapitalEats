#!/usr/bin/env node
// KapitalEats build: src/ parçalarını tek index.html'e birleştirir.
//   node build.js            → index.html (tam sayfa)
//   node build.js --artifact → dist/kapitaleats.html (doctype/head/body iskeleti olmadan, claude.ai artifact için)
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');
const js = fs.readdirSync(path.join(src, 'js')).filter(f => f.endsWith('.js')).sort().map(f => read('js/' + f).replace(/\s+$/, '')).join('\n\n');
const head = read('00-head.html').replace(/\s+$/, ''), css = read('10-style.css').replace(/\s+$/, ''), markup = read('20-markup.html').replace(/\s+$/, '');
const full = `${head}\n<style>\n${css}\n</style>\n${markup}\n\n<script>\n${js}\n</script>\n</body>\n</html>\n`;
if (process.argv.includes('--artifact')) {
  const skel = /^(<!DOCTYPE html>|<html lang="tr">|<head>|<meta charset="utf-8">|<meta name="viewport"[^>]*>|<\/head>|<body>|<\/body>|<\/html>)$/;
  const out = full.split('\n').filter(l => !skel.test(l)).join('\n');
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dist', 'kapitaleats.html'), out);
  console.log('dist/kapitaleats.html', out.length, 'bytes');
} else {
  fs.writeFileSync(path.join(root, 'index.html'), full);
  console.log('index.html', full.length, 'bytes');
}
