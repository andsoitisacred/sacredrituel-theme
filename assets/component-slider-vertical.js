if ( typeof SliderVertical !== "function" ) {

	class SliderVertical extends HTMLElement {

		constructor() {
			super();
			this.UNMOUNT();
			this.MOUNT();
		}

		MOUNT(){

			this.headingsHolder = this.querySelector('.vertical-slider-headings');
			this.querySelectorAll('.slide-heading').forEach(header=>{
				const duplicateHeader = header.cloneNode(true);
				this.headingsHolder.appendChild(duplicateHeader);
			});
			this.headings = this.querySelectorAll('.vertical-slider-headings .slide-heading');

			// First & last slide observers

			this.OBSERVER_A = new IntersectionObserver(entries=>{
				entries.forEach(entry=>{
					this._observer_A_function(entry);
				});
			}, {
				threshold: [0.05, .6]
			});

			// Observer for all slides except the first one

			this.OBSERVER_B = new IntersectionObserver(entries=>{
				entries.forEach(entry=>{
					this._observer_B_function(entry);
				});
			}, {
				threshold: [0.05, .7]
			});

			// Observer for main slider

			this.OBSERVER_MAIN = new IntersectionObserver(entries=>{
				entries.forEach(entry=>{
					this._observer_MAIN_function(entry);
				});
			}, {
				threshold: 0
			});

			// Observer for next section

			this.OBSERVER_NEXT = new IntersectionObserver(entries=>{
				entries.forEach(entry=>{
					this._observer_NEXT_function(entry);
				});
			}, {
				threshold: 0
			});

			// ADD CREATED OBSERVERS

			this.slides = this.querySelectorAll('.slide');
			this.slides.forEach(slide=>{

				if ( slide.dataset.first === 'true' ) {	
					// observe first slide
					this.OBSERVER_A.observe(slide);
					if ( slide.dataset.last === 'true' ) {
						// observe last as well, when there is only one
						this.OBSERVER_B.observe(slide);
					}
				} else {
					// observer other slides
					this.OBSERVER_B.observe(slide);
				}

				if ( slide.hasAttribute('data-link') ) {
					const slideMobileLink = document.createElement('a');
					slideMobileLink.className = 'slide-heading';
					slideMobileLink.setAttribute('href', slide.querySelector('a').getAttribute('href'));
					if ( slide.querySelector('.slide-title') ) slideMobileLink.appendChild(slide.querySelector('.slide-title'));
					if ( slide.querySelector('.slide-caption') ) slideMobileLink.appendChild(slide.querySelector('.slide-caption'));
					slide.querySelector('.slide-heading').append(slideMobileLink);
				}

			});

			this.OBSERVER_MAIN.observe(this.parentNode);

			setTimeout(()=>{
				if ( ! this.parentNode.nextElementSibling ) {
					const next = document.querySelector('.page-content').nextElementSibling;
					if ( next.children.length == 0 ) {
						next = next.nextElementSibling;
					}
					this.OBSERVER_NEXT.observe(next);
				} else {
					this.OBSERVER_NEXT.observe(this.parentNode.nextElementSibling);
				}
				if ( ! this.parentNode.previousSibling ) {
					const neverRemove = this.querySelectorAll('.vertical-slider-headings .slide-heading')[0];
					neverRemove.classList.add('never-remove');
					if ( Math.abs(this.parentNode.getBoundingClientRect().y) < window.innerHeight ) {
						neverRemove.classList.add('active-up');
						neverRemove.style.display = 'flex';
					}
				}
			}, 25);

			// set up resizing event (for overflowing captions fix)

			this.RESIZE_EVENT = debounce(()=>{
				this._resizeCaptions();
			}, 100);
			window.addEventListener('resize', this.RESIZE_EVENT);
			this._resizeCaptions();

		}

		_observer_A_function(entry){

			const entryHeading = this.headings[entry.target.dataset.index];

			if ( entry.target.dataset.first === "true" ) {

				if ( ! entry.target.classList.contains('active') && entry.intersectionRatio >= .6 ) {

					// activate the first slide
					if ( this.querySelector('.slide.active') ) {
						this.querySelector('.slide.active').classList.remove('active');
					}
					entry.target.classList.add('active');

					this._resetHeadingClasses();
					entryHeading.style.display = 'flex';
					if (entry.boundingClientRect.top > 0) {
						entryHeading.classList.add('active-up');
					} else {
						entryHeading.classList.add('active-down');
					}

				} else if ( ! entry.target.classList.contains('active') && entry.intersectionRatio >= 0.05 && entry.intersectionRatio < .6 ) {

					// activate the first slide (for small screens from up)
					if ( this.querySelector('.slide.active') ) {
						this.querySelector('.slide.active').classList.remove('active');
					}
					entry.target.classList.add('active');

					this._resetHeadingClasses();
					entryHeading.style.display = 'flex';
					entryHeading.classList.add('active-down');

				} else if ( ! entryHeading.classList.contains('never-remove') && entry.target.classList.contains('active') && entry.intersectionRatio < .6 && entry.boundingClientRect.top > 0 ) {

					// get the first slide out of the screen (on scroll up)
					entry.target.classList.remove('active');
					entryHeading.classList.remove('active-up');
					entryHeading.classList.remove('active-down');
					entryHeading.classList.add('hide-up');

				}

			}
		}

		_observer_B_function(entry){

			const entryHeading = this.headings[entry.target.dataset.index];

			if ( entry.intersectionRatio > 0.05 && ! entry.target.classList.contains('active') && entry.target.dataset.first !== "true" ) {

				if ( ! ( entry.target.dataset.last === 'true' && entry.boundingClientRect.top < 0 ) ) {

						// remove all active classes when slide is switched, and activate the new slide
						if ( this.querySelector('.slide.active') ) {
							this.querySelector('.slide.active').classList.remove('active');
						}
						entry.target.classList.add('active');

						this._resetHeadingClasses();
						entryHeading.style.display = 'flex';
						if (entry.boundingClientRect.top > 0) {
							entryHeading.classList.add('active-up');
						} else {
							entryHeading.classList.add('active-down');
						}

				}
				
			} 
		}

		_observer_MAIN_function(entry){
			if ( entry.intersectionRatio == 0 ) {
				if ( this.querySelector('.slide.active') ) {
					this.querySelector('.slide.active').classList.remove('active');
				}
				this.querySelectorAll('.active-up').forEach(elm=>{elm.classList.remove('active-up')});
				this.querySelectorAll('.active-down').forEach(elm=>{elm.classList.remove('active-down')});
				this.querySelectorAll('.slide-heading').forEach(elm=>{elm.style.display='none'});
			}
		}

		_observer_NEXT_function(entry){
			if ( entry.intersectionRatio > 0 ) {
				if ( this.slides[this.slides.length-1].classList.contains('active') ) {
					setTimeout(()=>{
						if ( this.querySelector('.slide.active') ) {
							this.querySelector('.slide.active').classList.remove('active');
						}
						this.querySelectorAll('.active-up').forEach(elm=>{elm.classList.remove('active-up')});
						this.querySelectorAll('.active-down').forEach(elm=>{elm.classList.remove('active-down')});
						this.headings[this.headings.length-1].classList.add('hide-down');
					}, 20);
				}
			} else if (entry.intersectionRatio == 0 ) {
				if ( entry.boundingClientRect.top > 0 ) {
					if ( ! this.querySelector('.slide.active') ) {
						let rect = this.parentNode.getBoundingClientRect();
						if ( rect.y < 0 && Math.abs(rect.y) < rect.height ) {
							this.slides[this.slides.length-1].classList.add('active');
							let entryHeading = this.headings[this.headings.length-1];
							entryHeading.classList.remove('hide-down');
							entryHeading.classList.remove('hide-up');
							entryHeading.style.display = 'flex';
							entryHeading.classList.add('active-up');
						}
					}
				}
			}
		}

		_resetHeadingClasses(){
			this.headingsHolder.querySelectorAll('.active-up, .active-down, .hide-down, .hide-up').forEach(elm=>{
				elm.style.display = 'none';
				elm.classList.remove('active-up');
				elm.classList.remove('active-down');
				elm.classList.remove('hide-down');
				elm.classList.remove('hide-up');
			});
		}
			
		_resizeCaptions() {
			this.slides.forEach(slide=>{
				slide.querySelectorAll('.slide-image[data-caption]').forEach(function(elm){
					elm.querySelector('.slide-image__caption').style.width = (elm.offsetHeight - 10) + 'px';
				});
			});
		}

		initVideo(video){
			video.classList.add('loaded');
		}

		UNMOUNT() {	
			if ( this.OBSERVER_A )
				this.OBSERVER_A.disconnect();
			if ( this.OBSERVER_B )
				this.OBSERVER_B.disconnect();
			if ( this.OBSERVER_MAIN )
				this.OBSERVER_MAIN.disconnect();
			if ( this.OBSERVER_NEXT )
				this.OBSERVER_NEXT.disconnect();
			window.removeEventListener('resize', this.RESIZE_EVENT);
		}

	}

	if (typeof customElements.get("vertical-slider") == "undefined") {
		customElements.define('vertical-slider', SliderVertical);
	}

}