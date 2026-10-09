/* Solar Inverters page: model catalog (category tabs, thumbnails, spotlight) */
(function(){
  /* build the thumbnail buttons from js/inverter-data.js (images are normal files in images/inverters/) */
  var thumbsHost=document.getElementById('thumbs'), altNames={single:'Single Phase PV',three:'Three Phase PV',storage:'Energy Storage',utility:'Utility Scale'};
  window.INVERTER_MODELS.forEach(function(m){
    var b=document.createElement('button'); b.type='button'; b.className='thumb';
    b.dataset.c=m.cat; b.dataset.name=m.name; b.dataset.kw=m.kw; b.setAttribute('aria-label',m.name);
    b.dataset.src=encodeURI(window.INVERTER_FOLDERS[m.cat]+'/'+m.image);
    var im=document.createElement('img'); im.alt='Solis '+altNames[m.cat]+' inverter'; im.loading='lazy'; im.src=b.dataset.src;
    var sp=document.createElement('span'); sp.textContent=m.name;
    b.appendChild(im); b.appendChild(sp); thumbsHost.appendChild(b);
  });
  var cats={single:'Single Phase PV Inverter',three:'Three Phase PV Inverter',storage:'Energy Storage Inverter',utility:'Utility Scale PV Inverter'};
  var thumbs=[].slice.call(document.querySelectorAll('.thumb')), tabs=[].slice.call(document.querySelectorAll('#cat-tabs button'));
  var img=document.getElementById('spot-img'), nm=document.getElementById('spot-name'), kw=document.getElementById('spot-kw'), cg=document.getElementById('spot-cat'), stage=document.getElementById('spot-stage');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pick(t){ thumbs.forEach(function(x){x.setAttribute('aria-current',String(x===t));}); img.src=t.dataset.src; img.alt='Solis inverter '+t.dataset.name; nm.textContent=t.dataset.name; kw.textContent=t.dataset.kw; cg.textContent=cats[t.dataset.c]; }
  function show(c){ tabs.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.c===c));}); var first=null; thumbs.forEach(function(t){var on=t.dataset.c===c;t.hidden=!on;if(on&&!first)first=t;}); if(first)pick(first); }
  tabs.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.c);});});
  thumbs.forEach(function(t){t.addEventListener('click',function(){pick(t);});});
  if(!reduce){
    img.classList.add('float');
    stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;img.classList.remove('float');img.style.transform='perspective(900px) rotateY('+(x*26)+'deg) rotateX('+(-y*20)+'deg)';});
    stage.addEventListener('pointerleave',function(){img.style.transform='';img.classList.add('float');});
  }
  show('single');
})();
