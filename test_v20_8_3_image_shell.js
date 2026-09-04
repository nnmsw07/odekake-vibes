const fs = require('fs');
const assert = require('assert');
const css = fs.readFileSync('styles.css','utf8');
const html = fs.readFileSync('index.html','utf8');
assert.ok(css.includes('.image-shell{position:relative;display:block;width:100%;height:100%;overflow:hidden}'), 'image-shell containing block missing');
assert.ok(css.includes('.image-shell::after{'), 'image-shell overlay rule missing');
assert.ok(/styles\.css\?v=(?:2091|2102|2110)/.test(html), 'stylesheet cache buster not updated');
console.log('v20.8.3 image-shell regression test PASS');
