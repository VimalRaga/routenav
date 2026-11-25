/* Route Navigator offline cache.
   App files: network first (so updates arrive), cached copy when offline.
   Libraries from CDNs (PDF.js, barcode): cached after first use. Google Maps always needs internet. */
var C='rn-v2';
var CORE=['./','./index.html','./routenav.js','./icon.png','./manifest.json'];
var LIBS=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(CORE).then(function(){return Promise.all(LIBS.map(function(u){return c.add(u).catch(function(){});}));});}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.origin===location.origin){
    var key=u.pathname.endsWith('/routenav.js')?'./routenav.js':r;
    e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(key,cp);});}return res;}).catch(function(){return caches.match(key,{ignoreSearch:true}).then(function(m){return m||caches.match('./index.html');});}));
    return;
  }
  if(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(u.host)){
    e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp);});return res;});}));
  }
});
