if ( typeof QuickAddToCart !== 'function' ) {

	class QuickAddToCart extends HTMLElement {
		constructor(){
			super();
			if ( this.querySelector('product-form') ) {
				this.init();
			}
		}
		init(){
			this.querySelector('.button').addEventListener('click', ()=>{
				this.closest('[data-js-product-item]').classList.add('null');
			});
			this.querySelector('product-form').addEventListener('add-to-cart', ()=>{
				this.closest('[data-js-product-item]').classList.remove('null');
				if ( ! document.body.classList.contains('template-cart') ) {
					document.getElementById('site-cart-sidebar').show();
					document.querySelectorAll('[data-header-cart-total').forEach(elm=>{
						elm.textContent = document.querySelector('#AjaxCartForm [data-cart-total]').textContent;
					});
					document.querySelectorAll('[data-header-cart-count]').forEach(elm=>{
						elm.textContent = document.querySelector('#AjaxCartForm [data-cart-count]').textContent;
					})
				}
			});
		}
	}

  if ( typeof customElements.get('quick-add-to-cart') == 'undefined' ) {
		customElements.define('quick-add-to-cart', QuickAddToCart);
	}

}

if ( typeof QuickViewProduct !== 'function' ) {

	class QuickViewProduct extends HTMLElement {
		constructor(){
			super();
			if ( this.querySelector('.button') ) {
				this.init();
			}
		}
		init(){

			this.quickViewModal = null;
			this.querySelector('button').addEventListener('click', (e)=>{

				e.preventDefault();

				if ( ! this.quickViewModal ) {

					const target = e.currentTarget;

					target.classList.add('working');
					target.closest('[data-js-product-item]').classList.add('null');

					fetch(`${target.getAttribute('data-href')}${ target.getAttribute('data-href').includes('?') ? '&' : '?' }view=quick-view`)
						.then(response => response.text())
						.then(text => {

							const quickViewHTML = new DOMParser().parseFromString(text, 'text/html').querySelector('#product-quick-view');

							// create modal w content

							const quickViewContainer = document.createElement('div');
							quickViewContainer.innerHTML = `<modal-box id="modal-${target.dataset.id}"	
								class="modal modal--product" 
								data-options='{
									"enabled": false,
									"showOnce": false,
									"blockTabNavigation": true,
                  "closeByKey": false,
                  "openedModalBodyClass": "no-overflow"
								}'
								tabindex="-1" role="dialog" aria-modal="true" 
							>
								<div class="product-modal-content" style="z-index:9"></div>
								<span class="modal-background" data-js-close></span>
							</modal-box>`;

							this.quickViewModal = quickViewContainer.querySelector('modal-box');
							document.body.appendChild(this.quickViewModal);

							this.quickViewModal.querySelector('.product-modal-content').innerHTML = `
                ${quickViewHTML.innerHTML}
                <button class="product-quick-view__close" data-js-close>${window.KROWN.settings.symbols.close}</button>
              `;

              ProductHeaderHelper(`#${this.quickViewModal.querySelector('product-page').id}`);

							if ( ! window.productPageScripts ) {
								const scripts = this.quickViewModal.querySelectorAll('script');
								// scripts.forEach(elm=>{
								// 	const script = document.createElement('script');
								// 	script.src = elm.src;
								// 	document.body.append(script);
								// 	window.productPageScripts = true;
								// });
								
								scripts.forEach(oldScriptTag => {
									const newScriptTag = document.createElement('script');
									Array.from(oldScriptTag.attributes).forEach(attribute => {
										newScriptTag.setAttribute(attribute.name, attribute.value)
									});
									newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
									oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
								});
								window.productPageScripts = true;
							}

							this.quickViewModal.querySelector('.product-quick-view__close').addEventListener('click', ()=>{
								this.quickViewModal.hide();
							});

							if ( this.quickViewModal.querySelector('[data-js-product-form]') ) {
								this.quickViewModal.querySelector('[data-js-product-form]').addEventListener('add-to-cart', ()=>{
									this.quickViewModal.hide();
								});
							}

							setTimeout(()=>{
								this.quickViewModal.show();
								target.classList.remove('working');
								target.closest('[data-js-product-item]').classList.remove('null');
							}, 250);
							
						});

				} else {
					this.quickViewModal.show();
				}

			})
		}
	}

  if ( typeof customElements.get('quick-view-product') == 'undefined' ) {
		customElements.define('quick-view-product', QuickViewProduct);
	}

}