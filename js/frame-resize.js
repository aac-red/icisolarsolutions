/* Tells the parent page (index.html) how tall this page is, so the iframe fits without inner scrollbars. */
(function(){
  if(window.parent===window) return;
  function send(){ var h=Math.ceil(document.body.getBoundingClientRect().height); window.parent.postMessage({icHeight:h},'*'); }
  window.addEventListener('load',send); window.addEventListener('resize',send);
  if(window.ResizeObserver) new ResizeObserver(send).observe(document.body);
  setTimeout(send,400); setTimeout(send,1500); setTimeout(send,3500);
})();
