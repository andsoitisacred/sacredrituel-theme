if (typeof CSSSlider !== "function") {

	class CSSSlider extends HTMLElement {

		constructor() {
			super();
			const ua = navigator.userAgent.toLowerCase();
			this._ios15 = ua.includes("applewebkit") && ua.includes("version/15");
			this.initSlider();
		}

		destroySlider() {
			this.classList.remove("enabled");
			this.sliderEnabled = false;
			window.removeEventListener("resize", this.RESIZE_EVENT);
			window.removeEventListener("scroll", this.SCROLL_EVENT);
		}

		initSlider() {
			// create custom events

			this._readyEvent = new CustomEvent("ready");
			this._changeEvent = new CustomEvent("change");
			this._scrollEvent = new CustomEvent("scroll");
			this._navEvent = new CustomEvent("navigation");
			this._pointerDownEvent = new CustomEvent("pointerDown");
			this._pointerUpEvent = new CustomEvent("pointerUp");

			// setup variables

			this.items = this.querySelectorAll(".css-slide[data-index]");
			this.indexedItems = [];
			this.index = 0;
			this.length = this.items.length;
			this.windowWidth = window.innerWidth;

			this.scrollLeft = 0;

			if (this.length > 1) {
				// add navigation

				this.navigation = document.createElement("div");
				this.navigation.classList = `css-slider-navigation ${this.getAttribute(
					"data-navigation-class"
				)}`;
				this.navigation.style.display = "none";
				this.navigation.innerHTML = `<div>
          <span class="css-slider-navigation__index">0</span> / <span class="css-slider-navigation__length">0</span>
        </div>
        <button class="css-slider-navigation__prev simple-arrow simple-arrow--left disabled">
          <span class="visually-hidden">${KROWN.settings.locales.prev}</span>
          ${KROWN.settings.symbols.arrow}
        </button>
        <button class="css-slider-navigation__next simple-arrow simple-arrow--right">
          <span class="visually-hidden">${KROWN.settings.locales.next}</span>
          ${KROWN.settings.symbols.arrow}
        </button>`;

				if (this.classList.contains("css-slider--auto-height")) {
					this.parentNode.parentNode.insertBefore(
						this.navigation,
						this.parentNode.nextSibling
					);
				} else {
					this.parentNode.insertBefore(this.navigation, this.nextSibling);
				}

				this.indexEl = this.navigation.querySelector(
					".css-slider-navigation__index"
				);
				this.lengthEl = this.navigation.querySelector(
					".css-slider-navigation__length"
				);
				this.prevEl = this.navigation.querySelector(
					".css-slider-navigation__prev"
				);
				this.nextEl = this.navigation.querySelector(
					".css-slider-navigation__next"
				);

				this.prevEl.addEventListener("click", (e) => {
					this.changeSlide("prev");
				});
				this.nextEl.addEventListener("click", (e) => {
					this.changeSlide("next");
				});

				if (this.classList.contains("css-slider--auto-height")) {
					this.parentNode.style.height = this.items[0].offsetHeight + "px";
				}

				// scroll event for slides check
				this.SCROLL_EVENT = debounce(() => {
					// checking selected index
					if (!this._sliderBlockScroll) {
						const scrollItems = this.indexedItems.entries();
						const scrollArray = Array.from(scrollItems, (elm) =>
							Math.abs(elm[1].offsetLeft - this.scrollLeft)
						);
						const scrollDistance = Math.min(...scrollArray);
						const scrollIndex = scrollArray.indexOf(scrollDistance);
						/*if ( this.indexedItems[this.length-2].offsetLeft-this.scrollLeft < 0 ) {
            this.index = this.length - 1;
            this.checkSlide();
            this.dispatchEvent(this._changeEvent);
          } else */ if (scrollIndex != this.index) {
							this.index = scrollIndex;
							this.checkSlide();
							this.dispatchEvent(this._changeEvent);
						}
					}
				}, 10);

				this.addEventListener("scroll", this.SCROLL_EVENT, { passive: true });

				// reinit on resize
				this.RESIZE_EVENT = debounce(() => {
					if (this.windowWidth != window.innerWidth) {
						this.resetSlider();
					}
					this.windowWidth = window.innerWidth;
				}, 100);
				window.addEventListener("resize", this.RESIZE_EVENT);
				this.resetSlider(true);

				// mouse events for non touch devices

				if (
					!(
						"ontouchstart" in window ||
						(window.DocumentTouch && document instanceof DocumentTouch)
					)
				) {
					this.addEventListener("mousedown", (e) => {
						this.mouseX = e.screenX;
						this.classList.add("can-drag");
						this.classList.add("mouse-down");
					});
					this.addEventListener("mouseup", (e) => {
						this.classList.remove("mouse-down");
						this.classList.remove("can-drag");
						this.classList.remove("pointer-events-off");
					});

					this.addEventListener("mouseleave", (e) => {
						this.classList.remove("mouse-down");
						this.classList.remove("can-drag");
						this.classList.remove("pointer-events-off");
					});

					this.addEventListener("mousemove", (e) => {
						if (this.classList.contains("can-drag")) {
							this.classList.add("pointer-events-off");
							let direction = this.mouseX - e.screenX;
							if (Math.abs(direction) > 1) {
								if (direction > 0) {
									this.changeSlide("next");
									this.classList.remove("can-drag");
								} else if (direction < 0) {
									this.changeSlide("prev");
									this.classList.remove("can-drag");
								}
							}
						}
					});

					this.querySelectorAll(".css-slides-container").forEach((elm) => {
						elm.addEventListener("mousedown", (e) => {
							e.preventDefault();
						});
					});
				}
			} else if (this.length == 1) {
				this.classList.add("css-slider--singular");
			} else {
				this.classList.add("css-slider--empty");
			}

			// dispatch ready event

			this.classList.add("enabled");
			this.sliderEnabled = true;
			this.dispatchEvent(this._readyEvent);
		}

		changeSlide(direction, behavior = "smooth") {
			// function that changes the slide, either by word (next/prev) or index

			if (direction == "next") {
				if (this.index + 1 < this.length) {
					this.index++;
				}
			} else {
				if (this.index - 1 >= 0) {
					this.index--;
				}
			}

			this.checkSlide();

			this._sliderBlockScroll = true;
			if (this._ios15) {
				this.classList.add("disable-snapping");
			}
			setTimeout(() => {
				this._sliderBlockScroll = false;
				if (this._ios15) {
					this.classList.remove("disable-snapping");
				}
			}, 500);

			this.scrollTo({
				top: 0,
				left:
					this.indexedItems[this.index].offsetLeft -
					parseInt(getComputedStyle(this.indexedItems[0]).marginLeft),
				behavior: behavior,
			});
			this.dispatchEvent(this._changeEvent);
		}

		checkSlide() {
			// checks slide after index change and updates navigation / viewport

			this.prevEl.classList.remove("disabled");
			this.nextEl.classList.remove("disabled");
			if (this.index == 0) {
				this.prevEl.classList.add("disabled");
			}
			if (this.index == this.length - 1) {
				this.nextEl.classList.add("disabled");
			}
			this.indexEl.innerHTML = this.index + 1;
			if (this.classList.contains("css-slider--auto-height")) {
				this.parentNode.style.height =
					this.indexedItems[this.index].offsetHeight + "px";
			}
		}

		afterAppend() {
			this.items = this.querySelectorAll(".css-slide[data-index]");
		}

		resetSlider(nojump = false, resetIndex = true) {
			let slidesWidth = 0,
				slidesPerPage = 0,
				page = 0,
				pages = 0,
				totalWidth = this.classList.contains("css-slider--auto-height")
					? window.innerWidth
					: this.querySelector(".css-slides-container").offsetWidth - 20,
				hideNavigation = false;

			// 0 reset

			this.indexedItems = [];
			this.classList.add("disable-snapping");

			// 1 find out how many pages

			this.items.forEach((elm, i) => {
				elm.classList.remove("css-slide--snap");
				slidesWidth += elm.offsetWidth;
				if (slidesWidth > totalWidth && slidesPerPage == 0) {
					slidesPerPage = i;
				}
			});

			if (slidesPerPage == 0) {
				slidesPerPage = this.items.length;
				hideNavigation = true;
			}

			this.items.forEach((elm, i) => {
				if (i % slidesPerPage == 0) {
					elm.classList.add("css-slide--snap");
					elm.setAttribute("data-index", page++);
				}
			});

			this.indexedItems = this.querySelectorAll(".css-slide--snap");

			if (resetIndex) {
				this.index = 0;
			}
			this.length = Math.ceil(this.items.length / slidesPerPage);
			this.lengthEl.innerHTML = this.length;
			this.indexEl.innerHTML = 1;

			if (hideNavigation) {
				this.navigation.style.display = "none";
				this.classList.add("css-slider--no-drag");
			} else {
				this.navigation.style.display = "block";
				this.classList.remove("css-slider--no-drag");
			}

			if (!nojump) {
				this.scrollTo({
					top: 0,
					left: 0,
					behavior: "auto",
				});
			}
			this.classList.remove("disable-snapping");
		}
	}
	
  if (typeof customElements.get("css-slider") == "undefined") {
		customElements.define("css-slider", CSSSlider);
	}

}
