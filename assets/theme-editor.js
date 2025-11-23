// SHOPIFY EVENTS

window.prlxElementsRemover = elementToRemove => {
  window.prlxElements.forEach((item, i)=>{
    if ( item.element.isSameNode(elementToRemove) ) {
      delete window.prlxElements[i];
    }
  });
}

document.addEventListener('shopify:section:load', e=>{

  // parallax & images
  if ( e.target.classList.contains('mount-parallax') ) {
    window.prlxElementsPusher(e.target);
  }
  window.prlxAnimation();

  // product page mobile header
  if ( e.target.classList.contains('mount-product-page') ) {
    if ( e.target.querySelector('product-header').hasAttribute('data-move-header-on-mobile') ) {
      ProductHeaderHelper(`#${e.target.querySelector('product-page').id}`);
    }
    if ( e.target.querySelector('product-slider') ) {
      e.target.querySelector('product-slider')._setHeight(null, false);
    }
  }

  // css sliders
  if ( e.target.classList.contains('mount-css-slider') && e.target.querySelector('css-slider') ) {
    e.target.querySelector('css-slider').resetSlider();
    e.target.querySelector('css-slider').checkSlide();
  }

  // headers
  if ( e.target.classList.contains('mount-header') ) {
    if ( e.target.querySelector('main-header') ) {
      e.target.querySelector('main-header').mount();
    //  e.target.querySelector('main-header').mountStickyHeader();
    }
    setTimeout(()=>{window.scrollTo({
      top: 0,
      behavior: 'auto'
    })}, 500);
  }

  // product page slider
  if ( e.target.classList.contains('mount-product-slider') ) {
    const slider = e.target.querySelector('product-slider');
    setTimeout(()=>{
      slider._checkMobile();
      slider._setHeight();
      slider._getSliderWidth();
      slider._repositionSlider();
      slider._mobilePadding = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--grid-padding'));
    }, 50);
  }

});

document.addEventListener('shopify:section:unload', e=>{

  // parallax refresh
  if ( e.target.classList.contains('mount-parallax') ) {
    e.target.querySelectorAll('[data-scroll-speed]').forEach(element=>{
      window.prlxElementsRemover(element);
    })
    window.prlxElements = window.prlxElements.filter(item=>item);
  }   
  setTimeout(()=>{
    window.prlxAnimation();
  }, 50);

  // images

  // headers
  if ( e.target.classList.contains('mount-header') && e.target.querySelector('main-header') ) {
    e.target.querySelector('main-header').unmount();
  }

});

// parallax (&images) refresh after each interaction

document.addEventListener('shopify:section:select', e=>{
  window.prlxAnimation();
  if ( e.target.classList.contains('mount-header') ) {
    setTimeout(()=>{window.scrollTo({
      top: 0,
      behavior: 'auto'
    })}, 500);
  }
});
document.addEventListener('shopify:block:select', e=>{
  window.prlxAnimation();
  if ( e.target.classList.contains('css-slide') ) {
    e.target.closest('.css-slider').scrollLeft = e.target.offsetLeft;
  }
  if ( e.target.classList.contains('product-gallery__item--custom') ) {
    e.target.closest('product-slider').changeSlide(parseInt(e.target.dataset.index));
  }
});
document.addEventListener('shopify:section:reorder', e=>{
  window.prlxAnimation();
});

document.addEventListener('shopify:block:select', e=>{
  const block = e.target;
  if ( block.classList.contains('toggle') ) {
    if ( !block.querySelector('[data-js-title]').classList.contains('opened') ) {
      block.onClickHandler();
    }
  }
})
document.addEventListener('shopify:block:deselect', e=>{
  const block = e.target;
  if ( block.classList.contains('toggle') ) {
    if ( block.querySelector('[data-js-title]').classList.contains('opened') ) {
      block.onClickHandler();
    }
  }
})
