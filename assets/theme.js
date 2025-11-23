KROWN.themeName = 'Highlight';
KROWN.themeVersion = '3.1.6';

document.documentElement.style.setProperty('--grid-perfect-width', document.documentElement.clientWidth + 'px');
window.addEventListener('resize', ()=>{
  document.documentElement.style.setProperty('--grid-perfect-width', document.documentElement.clientWidth + 'px');
});

const executeOnceOnDomContentLoaded = ()=>{

  // tab navigation

  document.querySelectorAll('.css-slider, .product-variant__input, .simple-arrow, .mount-header [tabindex]').forEach(elm=>{
    elm.addEventListener('blur', e=>{
      e.currentTarget.classList.remove('focus');
    })
  });

  let activeElement = document.activeElement;
  document.addEventListener('keyup', e=>{
    if ( e.keyCode == window.KEYCODES.TAB ) {
      if ( activeElement.classList.contains('focus') && e.target != activeElement ) {
        activeElement.classList.remove('focus');
      }
      if ( e.target.classList.contains('css-slider') ||
        e.target.classList.contains('product-variant__input') ||
        e.target.classList.contains('simple-arrow') || 
        e.target.getAttribute('tabindex') != '-1'
      ) {
        e.target.classList.add('focus');
      }
      activeElement = document.activeElement;
    }
  });

  // newsletter has jump

  if ( window.location.pathname.includes('/challenge') ) {
    setTimeout(()=>{
      window.scroll({
        top: 0, 
        behavior: 'auto'
      });
    }, 300);
  }

  // fix image link borders

  document.querySelectorAll('.rte a img').forEach(elm=>{
    elm.parentNode.style.border = 'none';
  });

}

if ( document.readyState !== 'loading' ) {
  executeOnceOnDomContentLoaded();
} else {
  document.addEventListener('DOMContentLoaded', executeOnceOnDomContentLoaded);
}

// method for apps to tap into and refresh the cart

if ( ! window.refreshCart ) {

	window.refreshCart = () => {
		
		fetch('?section_id=helper-cart')
			.then(response => response.text())
			.then(text => {

				const sectionInnerHTML = new DOMParser().parseFromString(text, 'text/html');
				const cartFormInnerHTML = sectionInnerHTML.getElementById('AjaxCartForm').innerHTML;
				const cartSubtotalInnerHTML = sectionInnerHTML.getElementById('AjaxCartSubtotal').innerHTML;

				const cartItems = document.getElementById('AjaxCartForm');
				cartItems.innerHTML = cartFormInnerHTML;
				cartItems.ajaxifyCartItems();
				document.querySelector('[data-header-cart-count]').textContent = cartItems.querySelector('[data-cart-count]').textContent;

				document.getElementById('AjaxCartSubtotal').innerHTML = cartSubtotalInnerHTML;
				document.getElementById('site-cart-sidebar').show();

		})

	}

}