if ( typeof ProductSlider !== "function" ) {

  class ProductSlider extends HTMLElement {

    constructor(){

      super();

      const ua = navigator.userAgent.toLowerCase();
      this._ios15 = ( 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch ) && ua.includes('applewebkit') && ( ua.includes('os 15_') || ua.includes('version/15') );

      this.classList.add('js-enabled');

      this.viewport = this.querySelector('.product-gallery__viewport');
      this.container = this.querySelector('.product-gallery__container');
      this.holder = this.querySelector('.product-gallery__items');
      this.items = this.querySelectorAll('.product-gallery__item');

      this.index = this.dataset.initialIndex ? parseInt(this.dataset.initialIndex) : 0;
      this.length = this.items.length;

      this.timeout = null;
      this.animating = false;

      this._mobilePadding = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--grid-padding'));

      this.changeSlide = index => {

        if ( this.mobile ) {

          this._iOS15snapping();
          this.holder.scrollTo({
            left: this.items[index].offsetLeft - parseInt(getComputedStyle(this.items[index]).marginLeft),
            top: 0,
            behavior: 'smooth'
          });

          this._checkNav(index);
          this._checkIndex(true);
          this._setHeight();

        } else {

          this._blockAnimation(true);
          this._resetClasses();

          if ( index > this.index ) {

            let prevIndex = this.index;
            this.index = index-1;

            this.holder.classList.add('no-transitions');
            this._resetClasses();
            this._resetOrder([prevIndex, this.index]);
            this.holder.style.transform = `translateX(${( this.index * this.width * - 1 )}px`;
            this.items[prevIndex].classList.add('active');
            this.items[index].classList.add('after-active');
            this._checkNav(index);

            setTimeout(()=>{
              this.holder.classList.remove('no-transitions');
              this.items[prevIndex].classList.remove('active');
              this.items[prevIndex].classList.add('before-active');
              this.holder.style.transform = `translateX(${( index * this.width * - 1 )}px`;
              this.items[index].classList.remove('after-active');
              this.items[index].classList.add('active');
              this.index = index;
              this.dispatchEvent(this.EVENT_CHANGE);
            }, 10);

          } else if ( index < this.index ) {
              
            let prevIndex = this.index;
            this.index = index+1;

            this.holder.classList.add('no-transitions');
            this._resetClasses();
            this._resetOrder([prevIndex, this.index]);
            this.holder.style.transform = `translateX(${( this.index * this.width * - 1 )}px`;
            this.items[prevIndex].classList.add('active');
            this.items[index].classList.add('before-active');
            this._checkNav(index);

            setTimeout(()=>{
              this.holder.classList.remove('no-transitions');
              this.items[prevIndex].classList.remove('active');
              this.items[prevIndex].classList.add('after-active');
              this.holder.style.transform = `translateX(${( index * this.width * - 1 )}px`;
              this.items[index].classList.remove('before-active');
              this.items[index].classList.add('active');
              this.index = index;
              this.dispatchEvent(this.EVENT_CHANGE);
            }, 10);

          }

        }

        this._setHeight(index);
        
      }

      this.toggleDragging = toggle => {
        if ( ! toggle ) {
          this.container.classList.add('force-no-drag');
        } else {
          this.container.classList.remove('force-no-drag');
        }
      }

      this.EVENT_CHANGE = new Event('change');
      this.EVENT_SETTLE = new Event('settle');

      // Add navigation buttons

      const navEl = document.createElement('div');
      navEl.setAttribute('class', `product-gallery__navigation ${this.dataset.navClass ? this.dataset.navClass : 'five-tenths lap--six-tenths smaller-lap--eleven-tenths push-left-one-tenth lap--push-left-none smaller-lap--push-left-padding'}`); 
      navEl.innerHTML = `
        <div class="product-gallery__no">
          <span class="product-gallery__index">${(this.index+1)}</span> / ${this.length}
        </div>
        <button class="product-gallery__prev simple-arrow simple-arrow--left">
          <span class="visually-hidden">${KROWN.settings.locales.prev}</span>
          ${KROWN.settings.symbols.arrow}
        </button>
        <button class="product-gallery__next simple-arrow simple-arrow--right">
          <span class="visually-hidden">${KROWN.settings.locales.next}</span>
          ${KROWN.settings.symbols.arrow}
        </button>`;
      this.appendChild(navEl);

      this.indexEl = this.querySelector('.product-gallery__index');
      this.prevEl = this.querySelector('.product-gallery__prev');
      this.nextEl = this.querySelector('.product-gallery__next');

      this.prevEl.addEventListener('click', ()=>{
        this.prevSlide();
      });

      this.nextEl.addEventListener('click', ()=>{
        this.nextSlide();
      });

      this.querySelectorAll('.product-gallery__prev, .product-gallery__next').forEach(elm=>{
        elm.addEventListener('keydown', e=>{
          if ( e.keyCode == window.KEYCODES.RETURN ) {
            window.scrollY = this.container.offsetTop - 100;
            setTimeout(()=>{
              this.items[this.index].focus();
            }, 50);
          }
        });
      });

      // Set up mobile swipping

      this.container.addEventListener('touchstart', e=>{
        if ( ! this.mobile && ! this.container.classList.contains('force-no-drag') ) {
          this.touchX = e.touches[0].screenX;
          this.container.classList.add('dragging-enabled');
        }
      }, {passive:true});
      this.container.addEventListener('touchmove', e=>{
        if ( ! this.mobile && this.container.classList.contains('dragging-enabled') && ! this.container.classList.contains('force-no-drag') ) {
          let direction = this.touchX - e.touches[0].screenX;
          if ( direction > 0 ) {
            this.nextSlide();
            this.container.classList.remove('dragging-enabled');
          } else if ( direction < 0 ) {
            this.prevSlide();    			
            this.container.classList.remove('dragging-enabled');
          }
        }
      }, {passive:true});
      this.container.addEventListener('touchend', e=>{
        if ( ! this.mobile ) {
          this.container.classList.remove('dragging-enabled');
        }
      }, {passive:true});

      // Set up desktop grabbing

      this.container.addEventListener('mousedown', e=>{
        if ( ! this.mobile && ! this.container.classList.contains('force-no-drag') ) {
          this.mouseX = e.screenX;
          this.container.classList.add('dragging-enabled');
          this.container.classList.add('mouse-down');
        }
      });
      this.container.addEventListener('mouseup', e=>{
        if ( ! this.mobile ) {
          this.container.classList.remove('mouse-down');
          this.container.classList.remove('pointer-events-off');
          this.container.classList.remove('dragging-enabled');
        }
      });

      this.container.addEventListener('mousemove', e=>{
        if ( ! this.mobile && this.container.classList.contains('dragging-enabled') && ! this.container.classList.contains('force-no-drag') ) {
          let direction = this.mouseX - e.screenX;
          if ( Math.abs(direction) > 1 ) {
            this.container.classList.add('pointer-events-off');
            if ( direction > 0 ) {
              this.nextSlide();
              this.container.classList.remove('dragging-enabled');
            } else if ( direction < 0 ) {
              this.prevSlide();
              this.container.classList.remove('dragging-enabled');
            }
          }
        }
      });

      // mobile scroll event

      this.OBSERVER = new IntersectionObserver(entries=>{
        if ( this.mobile ) {
          entries.forEach(entry=>{
            if ( entry.intersectionRatio >= .3 ) {
              this.index = parseInt(entry.target.getAttribute('data-index'));
              this._checkNav();
              this._checkIndex(true);
              this._setHeight();
              this.dispatchEvent(this.EVENT_CHANGE);
            }
          });
        }
      }, {
        threshold: [0, .3]
      });
      this.items.forEach(slide=>{
        this.OBSERVER.observe(slide);
      });

      // Initial reset

      this._checkMobile();
      this._resetOrder();
      this._checkIndex();
      this._checkNav();
      this._setHeight();
      this._getSliderWidth();
      setTimeout(()=>{
        this._getSliderWidth();
        this._repositionSlider();
      }, 100);
      this._repositionSlider();
      this.EVENT_RESIZE = ()=>{
        this._checkMobile();
        this._setHeight();
        this._getSliderWidth();
        this._repositionSlider();
        this._mobilePadding = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--grid-padding'));
      };
      window.addEventListener('resize', this.EVENT_RESIZE);
      this.items[this.index].classList.add('enable-tab');

      if ( this.mobile ) {
        this.holder.scrollLeft = this.items[this.index].offsetLeft;
      }

    }

    _checkMobile() {
      let afterContent = getComputedStyle(this, ':after').content;
      if ( afterContent.indexOf('mobile-enabled') != -1 ) {
        this.mobile = true;
      } else {
        this.mobile = false;
      }
    }

    _checkIndex(justClasses=false) {
      if ( justClasses ) {
        this._resetClasses();
      }
      this.items[this.index].classList.add('active');
      if ( this.items[this.index+1] ) {
        this.items[this.index+1].classList.add('after-active');
      } 
      if ( this.items[this.index-1] ) {
        this.items[this.index-1].classList.add('before-active');
      } 
      if ( !justClasses ) {
        this.indexEl.innerHTML = this.index+1;
      }
    }

    _checkNav(forceIndex=null){
      let index = forceIndex != null ? forceIndex : this.index;
      this.nextEl.classList.remove('active');
      this.nextEl.classList.remove('disabled');
      this.prevEl.classList.remove('disabled');
      this.nextEl.removeAttribute('disabled');
      this.prevEl.removeAttribute('disabled');
      if ( ! this.items[index+1] ) {
        this.nextEl.classList.add('disabled');
        this.nextEl.setAttribute('disabled', 'disabled');
      }
      if ( ! this.items[index-1] ) {
        this.prevEl.classList.add('disabled');
        this.prevEl.setAttribute('disabled', 'disabled');
      }
      this.indexEl.innerHTML = index+1;
    }

    _getSliderWidth(){
      this.width = this.items[0].getBoundingClientRect().width;
    }

    _repositionSlider(){
      this.holder.classList.add('no-transitions');
      this.holder.style.transform = `translateX(${( this.index * this.width * - 1 )}px`;
      setTimeout(()=>{
        this.holder.classList.remove('no-transitions');
      }, 10);
    }

    _resetClasses(){
      this.items.forEach(item=>{
        item.classList.remove('before-active');
        item.classList.remove('after-active');
        item.classList.remove('active');
      });
    }

    _resetOrder(swapIndex=null){
      this.items.forEach((item, i)=>{
        let order = i;
        if ( swapIndex != null ) {
          if ( i == swapIndex[0] ) {
            order = swapIndex[1];
          } else if ( i == swapIndex[1] ) {
            order = swapIndex[0];
          }
        }
        item.style.order = order;
      })
    }

    _translateSlider(){
      this.holder.style.transform = `translateX(${( this.index * this.width * - 1 )}px`;
      this._checkIndex();
      this._checkNav();
    }

    _blockAnimation(force=false){
      this.animating = true;
      this.timeout = setTimeout(()=>{
        this.animating = false;
        this.dispatchEvent(this.EVENT_SETTLE);
        if ( force ) {
          this._resetOrder();
          this._resetClasses();
          this._checkIndex();
        }
      }, 500);
    }

    _setHeight(forceIndex=null, animation=true){
      let index = forceIndex != null ? forceIndex : this.index;
      if ( !animation ) this.viewport.classList.add('no-transition');
      if ( this.items[index].querySelector('.lazy-image') )
        this.viewport.style.height = `${this.items[index].querySelector('.lazy-image').offsetHeight}px`;
      if ( !animation ) {
        setTimeout(()=>{
          this.viewport.classList.remove('no-transition');
        }, 20);
      }
    }

    _iOS15snapping() {
      if ( this._ios15 ) {
        this.holder.classList.add('disable-snapping');
      }
      setTimeout(()=>{
        if ( this._ios15 ) {
          this.holder.classList.remove('disable-snapping');
        }
      }, 500);
    }

    nextSlide() {
      if ( ! this.mobile ) {
        if ( ! this.animating ) {
          this._blockAnimation();
          this._resetClasses();
          if ( this.index+1 < this.length ) {
            this.index++;
          }
          this._checkIndex();
          this._checkNav();
          this._setHeight();
          this._translateSlider();
          this.dispatchEvent(this.EVENT_CHANGE);
        }
      } else {
        if ( this.index+1 < this.length ) {
          this.index++;
        }
        this._iOS15snapping();
        this.holder.scrollTo({
          left: this.items[this.index].offsetLeft - parseInt(getComputedStyle(this.items[this.index]).marginLeft),
          top: 0,
          behavior: 'smooth'
        });
        this._setHeight();
        this._checkNav();
        this._checkIndex(true);
      }
    }

    prevSlide() {
      if ( ! this.mobile ) {
        if ( ! this.animating ) {
          this._blockAnimation();
          this._resetClasses();
          if ( this.index-1 >= 0 ) {
            this.index--;
          }
          this._checkIndex();
          this._checkNav();
          this._setHeight();
          this._translateSlider();
          this.dispatchEvent(this.EVENT_CHANGE);
        }
      } else {
        if ( this.index-1 >= 0 ) {
          this.index--;
        }
        this._iOS15snapping();
        this.holder.scrollTo({
          left: this.items[this.index].offsetLeft - parseInt(getComputedStyle(this.items[this.index]).marginLeft),
          top: 0,
          behavior: 'smooth'
        });
        this._setHeight();
        this._checkNav();
        this._checkIndex(true);
      }
    }

  }

	if (typeof customElements.get("product-slider") == "undefined") {
    customElements.define('product-slider', ProductSlider);
  }

}