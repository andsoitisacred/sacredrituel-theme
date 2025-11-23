(function(){
  // debug flag so you can confirm it loaded
  window.__srTabHashFix = { loadedAt: Date.now(), v: "click-child" };

  function getSlug(){
    var h = location.hash;
    if (!h || h === '#') return null;
    return decodeURIComponent(h.slice(1)).toLowerCase();
  }

  function deepClick(el){
    if (!el) return false;
    try { el.focus(); } catch(e){}
    // fire real pointer/mouse + normal click on THE CHILD carrying data-tab-id
    try { el.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,cancelable:true,view:window})); } catch(e){}
    try { el.dispatchEvent(new MouseEvent('mousedown'  ,{bubbles:true,cancelable:true,view:window})); } catch(e){}
    try { el.dispatchEvent(new MouseEvent('mouseup'    ,{bubbles:true,cancelable:true,view:window})); } catch(e){}
    try { el.click(); } catch(e){}
    return true;
  }

  function clickBySlug(slug){
    // IMPORTANT: target the CHILD that has data-tab-id (not the [role="tab"] wrapper)
    var child = document.querySelector('[data-tab-id="'+ slug +'"]');
    if (!child) return false;
    return deepClick(child);
  }

  function triggersReady(){
    // Wait until Replo has mounted tab triggers
    return document.querySelector('[role="tab"][data-replo-tabs-trigger="true"]');
  }

  function run(){
    var slug = getSlug(); if (!slug) return;

    // Try immediately
    if (clickBySlug(slug)) {
      // belt-and-suspenders re-click after hydration settles
      setTimeout(function(){ clickBySlug(slug); }, 250);
      return;
    }

    // Wait for mount + stabilization, then click child
    var lastMut = performance.now();
    var mo = new MutationObserver(function(){ lastMut = performance.now(); });
    mo.observe(document.documentElement, { childList:true, subtree:true });

    var start = performance.now();
    var iv = setInterval(function(){
      var ready = !!triggersReady();
      var settled = (performance.now() - lastMut) > 150; // avoid clicking mid-hydration
      if (ready && settled && clickBySlug(slug)) {
        // re-assert once more shortly in case hydration flips state back
        setTimeout(function(){ clickBySlug(slug); }, 250);
        clearInterval(iv); mo.disconnect();
      } else if (performance.now() - start > 8000) {
        clearInterval(iv); mo.disconnect();
      }
    }, 100);
  }

  function onReady(fn){
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', function(){ setTimeout(fn, 0); });
    }
  }

  onReady(run);                          // first load
  window.addEventListener('pageshow', run);   // bfcache/initial navs
  window.addEventListener('hashchange', run); // in-page hash switches
})();