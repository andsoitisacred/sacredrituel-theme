

if ( typeof ProductReviews !== 'function' ) {

	class ProductReviews {

		constructor(_this){
			const observer = new MutationObserver((mutations, observer)=>{
				for ( const mutation of mutations ) {
					if ( mutation.addedNodes.length > 0 ) {
						mutation.addedNodes.forEach(elm=>{
							if ( elm.tagName == 'DIV' && elm.classList.contains('spr-container') ) {
								this.init(elm);
								observer.disconnect();
							} 
						});
					}
				}
			})
			if ( _this.querySelector('.spr-review') ) {
				this.init(_this.querySelector('.spr-container'))
			} else {
				observer.observe(_this, {childList: true})
			}
		}

		init(elm){

      // create css slider for reviews

			if ( elm.querySelector('.spr-review') ) {

				// redo reviews title

				const ratingTextEl = document.querySelector('[data-js-review-value]');

				document.querySelector('#shopify-product-reviews .spr-summary-starrating').prepend(this.createRatingEl(document.querySelector('.spr-summary-starrating'), 'spr-custom-rating', (ratingTextEl ? ratingTextEl.textContent : '')));

				// create reviews slider

				const reviews = elm.querySelector('.spr-reviews');
				reviews.querySelectorAll('.spr-review').forEach((review, key)=>{
					review.classList = `spr-review css-slide three-tenths lap--smart-width palm--smart-width ${key == 0 ? 'push-left-one-tenth' : 'push-left-half-tenth'} palm--push-left-padding`;
					review.dataset.index = 99;
				});

				const reviewsSliderHolder = document.createElement('div');
				reviewsSliderHolder.innerHTML = `<css-slider
					class="css-slider css-slider--snapping" 
					data-navigation-class="ten-tenths lap--twelve-tenths push-left-one-tenth lap--push-left-padding"
				>
					<div class="spr-reviews css-slides-container">
						${reviews.innerHTML}
					</div>
				</div>`

				reviewsSliderHolder.querySelectorAll('.spr-review').forEach(review=>{
					this.initReview(review);
				});

				reviews.remove();
				elm.querySelector('.spr-content').append(reviewsSliderHolder);

				elm.querySelector('.spr-summary-actions').classList.add('with-reviews');
				elm.append(elm.querySelector('.spr-summary-actions'));

				const reviewsSlider = reviewsSliderHolder.querySelector('css-slider');
				setTimeout(()=>{
					reviewsSlider.resetSlider(true);
				}, 100);

				// use jsonp to load more reviews

				const paginationObserver = new IntersectionObserver((entries, observer)=>{
					entries.forEach(entry=>{
						if ( entry.isIntersecting ) {
							if ( entry.target.querySelector('.spr-pagination-next a') ) {
								const nextPage = entry.target.querySelector('.spr-pagination-next a');
								getJSONP(`${SPR.api_url}/reviews?page=${nextPage.dataset.page}&product_id=${nextPage.dataset.productId}&shop=${window.location.hostname}`, (data)=>
									{
										nextPage.closest('.spr-pagination').remove();
										const innerHTML = new DOMParser().parseFromString(data.reviews, 'text/html');
										if ( innerHTML.querySelectorAll('.spr-review, .spr-pagination') ) {
											innerHTML.querySelectorAll('.spr-review, .spr-pagination').forEach(elm=>{
												if ( elm.classList.contains('spr-review') ) {
													elm.classList = 'spr-review css-slide three-tenths lap--smart-width palm--smart-width push-left-half-tenth palm--push-left-padding';
													elm.dataset.index = 99;
												}
												reviewsSlider.querySelector('.css-slides-container').append(elm);
												if ( elm.classList.contains('spr-pagination') ) {
													paginationObserver.disconnect();
													paginationObserver.observe(elm);
												} else {
													this.initReview(elm);
												}
											});
										}
										reviewsSlider.afterAppend();
										reviewsSlider.resetSlider(true, false);
									}
								);
							}
						}
					})
				}, {threshold: 1});
				if ( reviewsSliderHolder.querySelector('.spr-pagination') ) {
					paginationObserver.observe(reviewsSliderHolder.querySelector('.spr-pagination'));
				}

			} else {

			}

      // go to element

      document.getElementById('shopify-product-reviews').classList.add('init')

			// turn form into popup

			const reviewForm = document.createElement('div');
			reviewForm.id = 'spr-form-modal';
			reviewForm.innerHTML = `<div id="spr-form" class="spr-form-holder address-popup">
				<div class="basicLightboxClose" tabindex="0">×</div>
			</div>`;
			
			document.querySelector('.spr-summary-actions-newreview').setAttribute('onclick', '');
			const reviewModalForm = window.basicLightbox.create(reviewForm, {
				trigger: document.querySelector('.spr-summary-actions-newreview'),
				focus: 'input[type="text"]'
			});

			reviewModalForm.element().querySelector('.spr-form-holder').prepend(elm.querySelector('.spr-form'));
			reviewModalForm.element().querySelector('.spr-form').style.display = 'block';

			elm.querySelector('.spr-summary-actions-newreview').innerHTML = `
				${KROWN.settings.symbols.plus}
				<span>${elm.querySelector('.spr-summary-actions-newreview').innerHTML}</span>`;

		}

		initReview(review){

			review.querySelector('.spr-review-header').insertBefore(this.createRatingEl(review, 'spr-review-custom-rating'), review.querySelector('.spr-review-header').firstElementChild.nextSibling);

			review.insertBefore(review.querySelector('.spr-review-header-byline'), review.querySelector('.spr-review-footer'));

			let textContent = review.querySelector('.spr-review-content-body').textContent;
			if ( window.wordFunctions.count(textContent) > 30 ) {

				const moreEl = document.createElement('span');
				moreEl.classList = 'spr-review-read-more';
				moreEl.textContent = KROWN.settings.locales.product_read_review;
				moreEl.tabIndex = 0;

				let reviewModal = window.basicLightbox.create(`<div class="spr-review-modal">
					<div class="spr-review-header">${review.querySelector('.spr-review-header').innerHTML}</div>
					${review.querySelector('.spr-review-content-body').innerHTML}
					<span class="spr-review-header-byline">${review.querySelector('.spr-review-header-byline').innerHTML}</span>
				</div>`, {
					trigger: moreEl
				});

				review.querySelector('.spr-review-content-body').textContent = window.wordFunctions.trim(textContent, 30);
				review.querySelector('.spr-review-content').append(moreEl);

			}

			review.querySelector('.spr-review-reportreview').setAttribute('tabindex', '-1');

		}

		createRatingEl(elm, className, textContent=""){
			const ra = elm.querySelectorAll('.spr-icon-star').length,
						rb = elm.querySelectorAll('.spr-icon-star-half-alt').length > 0 ? '.5' : '',
						ratingEl = document.createElement('span');
			ratingEl.classList = `${className} text-size--regular`;
			ratingEl.innerHTML = `<span>${ textContent != "" ? textContent : `${(ra + rb)} / 5` }</span>${KROWN.settings.symbols.star}`;
			return ratingEl;
		}

	}
  
	if ( document.getElementById('shopify-product-reviews') ) {
		new ProductReviews(document.getElementById('shopify-product-reviews'));
	}

}

window.isLanguageTrimByCharacter = function() {
  const languagesTrimByCharacter = ['zh', 'ja', 'th'];
  return languagesTrimByCharacter.includes(document.documentElement.lang);
}
window.wordFunctions = {
  count: function(str) {
    if (window.isLanguageTrimByCharacter()) {
      return str.length;
    } else {
      return str.match(/(\p{Letter}+)/gu).length;
    }
  },
  trim: function(str, max) {
    let trimmedStr;
    if (window.isLanguageTrimByCharacter()) {
      trimmedStr = str.slice(0, max);
    } else {
      const array = str.trim().split(' ');
      trimmedStr = array.slice(0, max).join(' ');
    }
    const ellipsis = str.length > trimmedStr.length ? '...' : '';
    return trimmedStr + ellipsis;
  }
}

const getJSONP = (url, callback) => {
	let callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
	window[callbackName] = data => {
			delete window[callbackName];
			document.body.removeChild(script);
			callback(data);
	};
	const script = document.createElement('script');
	script.src = `${url}${url.indexOf('?') >= 0 ? '&' : '?'}callback=${callbackName}`;
	document.body.appendChild(script);
}