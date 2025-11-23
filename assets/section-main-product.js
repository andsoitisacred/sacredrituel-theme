if ( typeof ProductPage !== 'function' ) {
	
	class ProductPage extends HTMLElement {

		constructor(){

			super();

			this.productGallery = this.querySelector('.product-gallery');

			// qty helper

			if ( this.querySelector('.product__quantity') ) {
				this.querySelector('.product__quantity').addEventListener('click', e=>{
					e.target.select();
				});
			}

			// Product variant event listener for theme specific logic

			const productVariants = this.querySelector('product-variants');
			if ( productVariants ) {
				productVariants.addEventListener('VARIANT_CHANGE', this.onVariantChangeHandler.bind(this));
				this.onVariantChangeHandler({target:productVariants});
			}

			// Look at add to cart button for changes

			if ( this.querySelector('.product__add-to-cart') ) {
				const addToCartHolder = this.querySelector('.product__cart-actions-holder');
				new MutationObserver((mutationsList, observer)=>{
					for ( const mutation of mutationsList ) {
						if ( mutation.attributeName == 'class' ) {
							addToCartHolder.classList.remove('disabled');
							addToCartHolder.classList.remove('working');
							if ( mutation.target.classList.contains('disabled') ) {
								addToCartHolder.classList.add('disabled');
							}
							if ( mutation.target.classList.contains('working') ) {
								addToCartHolder.classList.add('working');
							}
						}
					} 
				}).observe(this.querySelector('.product__add-to-cart'), {
					attributes: true, childList: false, subtree: false
				});
				if ( this.querySelector('.product__add-to-cart').classList.contains('disabled') ) {
					addToCartHolder.classList.add('disabled');
				}
			}

			// Helper events for different media

			this.productGallery.addEventListener('change', e=>{
				if ( this.productGallery.items[this.productGallery.index].dataset.productMediaType == 'model' ) {
					setTimeout(()=>{
						this.productGallery.toggleDragging(false);	
					}, 15);
					if ( this.xrButton ) {
						this.xrButton.setAttribute('data-shopify-model3d-id', this.productGallery.items[this.productGallery.index].dataset.mediaId);
					}
				}
				this._pauseAllMedia();
			});

			// Calculate complete product height (add extra sections)

			if ( ! this.classList.contains('featured-product') ) {

				const productOffers = this.querySelector('.product__offers > div');
				this._EVENT_SCROLL = e=>{
					if ( window.innerHeight < productOffers.offsetHeight ){
						let y = this.getBoundingClientRect().y,
								z = productOffers.offsetHeight - window.innerHeight;
						if ( Math.abs(y) < z ) {
							productOffers.style.top = `${y}px`;
						} else if ( Math.abs(y) >= z ) {
							productOffers.style.top = `${-z}px`;
						}
					}
				};
				window.addEventListener('scroll', this._EVENT_SCROLL, {passive:true});

				this.style.minHeight = `${productOffers.offsetHeight}px`;
				setInterval(()=>{
					this.style.minHeight = `${productOffers.offsetHeight}px`;
				}, 500);

			}

			// Add to cart event

			if ( ! document.body.classList.contains('template-cart') && KROWN.settings.cart_action == 'overlay' ) {

				let addToCartEnter = false;
				if ( this.querySelector('.product__add-to-cart') ) {
					this.querySelector('.product__add-to-cart').addEventListener('keyup', e=>{
						if ( e.keyCode == window.KEYCODES.RETURN ) {
							addToCartEnter = true;
						}
					})
				}

				if ( this.querySelector('.product__form') ) {
					this.querySelector('.product__form').addEventListener('add-to-cart', ()=>{
						document.getElementById('site-cart-sidebar').show();
						if ( addToCartEnter ) {
							setTimeout(()=>{
								document.querySelector('#site-cart-sidebar .close-sidebar').focus();
							}, 200);
						}
					});
				}

			}

			// Check for models

			const models = this.querySelectorAll('product-model');
			if ( models ) {
				window.ProductModel.loadShopifyXR();
				this.xrButton = this.querySelector('.product-gallery__view-in-space');
			}

		}

		onVariantChangeHandler(e){

			let variant = e.target.currentVariant;

			// variant images

			if ( variant && variant.featured_media != null ) {
				let variantImg = this.productGallery.querySelector('.product-gallery__item[data-media-id="' + variant.featured_media.id + '"]');
				if ( variantImg ) {
					if ( this.productGallery.classList.contains('js-enabled') ) {
						this.productGallery.changeSlide(parseInt(variantImg.dataset.index));
					} else {
						this.productGallery.dataset.initialIndex = variantImg.dataset.index;
					}
				}
			}

		}

		_pauseAllMedia(){

			document.querySelectorAll('.product-gallery .js-youtube').forEach(video => {
				video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
			});
			document.querySelectorAll('.product-gallery .js-vimeo').forEach(video => {
				video.contentWindow.postMessage('{"method":"pause"}', '*');
			});
			document.querySelectorAll('.product-gallery video').forEach(video => video.pause());
			document.querySelectorAll('.product-gallery product-model').forEach(model => {
				if ( model.modelViewerUI ) 
					model.modelViewerUI.pause()
			});
		}

	}
	
	if (typeof customElements.get("product-page") == "undefined") {
		customElements.define("product-page", ProductPage);
	}
	
}