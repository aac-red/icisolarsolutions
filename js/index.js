/* Wrapper page: tab switching + lazy-loading each page in an iframe */
(function(){
  var PAGES={panels:"panels.html",inverters:"inverters.html"};   /* edit paths here if you rename the files */
  var frames={}, tabs=[].slice.call(document.querySelectorAll('.tab'));
  function load(name){
    if(frames[name]) return;
    var view=document.getElementById('v-'+name), ifr=document.createElement('iframe');
    ifr.title=name==='panels'?'Solar panels 3D viewer':'Solar inverters 3D viewer';
    ifr.setAttribute('scrolling','no');
    ifr.addEventListener('load',function(){var l=view.querySelector('.loading');if(l)l.classList.add('done');});
    ifr.src=PAGES[name];
    view.appendChild(ifr); frames[name]=ifr;
  }
  function show(name,focus){
    tabs.forEach(function(t){var on=t.dataset.v===name;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on&&focus)t.focus();});
    ['panels','inverters'].forEach(function(n){document.getElementById('v-'+n).classList.toggle('on',n===name);});
    load(name);
    try{history.replaceState(null,'','#'+name);}catch(e){}
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t.dataset.v);});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];show(n.dataset.v,true);}});
  });
  window.addEventListener('message',function(e){
    if(!e.data||typeof e.data.icHeight!=='number')return;
    Object.keys(frames).forEach(function(n){if(frames[n].contentWindow===e.source)frames[n].style.height=e.data.icHeight+'px';});
  });
  var start=(location.hash||'').replace('#','')==='inverters'?'inverters':'panels';
  show(start);
})();
