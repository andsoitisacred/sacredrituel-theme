if ( typeof MainHeader !== 'function' ) {

	class MainHeader extends HTMLElement {

		constructor(){
			super();
			this.mount();
		}

		mount(){

			/* -- > DRAWERS < -- */

			// drawer cart connections

			const sidebarCart = document.getElementById('site-cart-sidebar');

			if ( document.getElementById('cart-open-button') ) {
				document.getElementById('cart-open-button').addEventListener('click', e=>{
					e.preventDefault();
					document.getElementById('cart-open-button').setAttribute('aria-expanded', 'true');
					sidebarCart.show();
				})
				document.getElementById('cart-open-button').addEventListener('keyup', e=>{
					if ( e.keyCode == window.KEYCODES.RETURN ) {
						sidebarCart.querySelector('.close-sidebar').focus();
					}
				})
			}

			// drawer menu connection

			const sidebarMenu = document.getElementById('site-menu-sidebar');
			sidebarMenu.innerHTML = this.querySelector('[data-js-site-navigation-content]').innerHTML;
			if ( ! Shopify.designMode ) {
				this.querySelector('[data-js-site-navigation-content]').remove();
			}
			
			if ( document.getElementById('menu-open-button') ) {
				document.getElementById('menu-open-button').addEventListener('click', e=>{
					e.preventDefault();
					document.getElementById('menu-open-button').setAttribute('aria-expanded', 'true');
					sidebarMenu.show();
				});
				document.getElementById('menu-open-button').addEventListener('keyup', e=>{
					if ( e.keyCode == window.KEYCODES.RETURN ) {
						sidebarMenu.querySelector('.close-sidebar').focus();
					}
				});
			}

			// search drawer connection

			const sidebarSearch = document.getElementById('site-search-sidebar');

			if ( document.getElementById('search-open-button') ) {
				document.getElementById('search-open-button').addEventListener('click', (function(e){
					e.preventDefault();
					document.getElementById('search-open-button').setAttribute('aria-expanded', 'true');
					sidebarSearch.show();
					setTimeout(()=>{
						sidebarSearch.querySelector('[data-js-search-input]').focus();
					},10);
				}).bind(this));
			}

			// closing drawers

			document.querySelectorAll('.sidebar__close button.close-sidebar').forEach(elm=>{
				elm.addEventListener('click', e=>{
					e.preventDefault();
					if ( e.target.closest('.sidebar').classList.contains('sidebar--opened') ) {
						e.target.closest('.sidebar').hide();
					}
				});
			});
			document.querySelector('.page-overlay').addEventListener('click', e=>{
				if ( document.querySelector('.sidebar--opened') ) {
					document.querySelector('.sidebar--opened').hide();
				}
			});
			document.addEventListener('keydown', e=>{
				if ( e.keyCode == window.KEYCODES.ESC ) {
					if ( document.querySelector('.sidebar--opened') ) {
						document.querySelector('.sidebar--opened').hide();
					}
				}
			});

			// resizing drawers

			this.RESIZE_SidebarHelper = debounce(()=>{
				if ( document.querySelector('.sidebar--opened') )
					document.querySelector('.sidebar--opened').style.height = window.innerHeight + 'px';
			}, 200);
			window.addEventListener('resize', this.RESIZE_SidebarHelper);

			// _end of drawers

			/* -- > STICKY SIDEBAR < -- */

			this.mountStickyHeader();
			
			/* -- > NAVIGATION < -- */

			let submenuLevel = 0,
					sidebarMenus = document.querySelector('.sidebar__menus'),
					closeButton = document.querySelector('#site-menu-sidebar button.close-sidebar'),
					backButton = document.querySelector('#site-menu-sidebar button.navigate-back');

			document.querySelectorAll('.sidebar__menus .sidebar__menu .has-submenu > a').forEach(elm=>{

				elm.addEventListener('click', e=>{

					e.preventDefault();
					sidebarMenus.scrollTop = 0;

					if ( e.target.parentElement.classList.contains('has-second-submenu') ) {
						submenuLevel = 2;
					} else {
						submenuLevel = 1;
					}

					e.target.parentElement.classList.add('opened');
					e.target.closest('.sidebar__menus').classList.add('opened');
					e.target.parentElement.parentElement.classList.add('opened');
					e.target.parentElement.parentElement.parentElement.classList.add('opened');

					closeButton.style.display = 'none';
					backButton.style.display = 'flex';

				});

				elm.addEventListener('keydown', e=>{
					if ( e.keyCode == window.KEYCODES.RETURN ) {
						sidebarMenu._unmountA11YHelper();
						let submenuFocus = [backButton];
						elm.parentElement.querySelectorAll('a').forEach(innerElm=>{
							submenuFocus.push(innerElm);
						})
						sidebarMenu._mountA11YHelper(submenuFocus);
						setTimeout(()=>{
							backButton.focus();
						}, 10);
					}
				});

			});

			backButton.addEventListener('click', e=>{

				e.preventDefault();

					if ( submenuLevel == 1 ) {
						submenuLevel = 0;
						sidebarMenus.classList.remove('opened')
						sidebarMenus.querySelectorAll('.opened').forEach(elm=>{
							elm.classList.remove('opened');
						});
						sidebarMenus.scrollTop = 0;
						backButton.style.display = 'none';
						closeButton.style.display = 'flex';
					} else if ( submenuLevel == 2 ) {
						submenuLevel = 1;
						sidebarMenus.querySelector('.has-second-submenu.opened').parentElement.classList.remove('opened');
						sidebarMenus.querySelector('.has-second-submenu.opened').parentElement.parentElement.classList.remove('opened');
						sidebarMenus.querySelector('.has-second-submenu.opened').classList.remove('opened');
					}

			});

			document.querySelector('.sidebar__close button.navigate-back').addEventListener('keydown', e=>{
				if ( e.keyCode == window.KEYCODES.RETURN ) {
					if ( submenuLevel == 1 ) {
						sidebarMenu._unmountA11YHelper();
						setTimeout(()=>{
							closeButton.focus();
							sidebarMenu._mountA11YHelper();
						}, 10);
					}
				}
			});

			document.querySelector('.sidebar__close button.navigate-back').addEventListener('click', e=>{

				e.preventDefault();

					if ( submenuLevel == 1 ) {
						submenuLevel = 0;
						sidebarMenus.classList.remove('opened')
						sidebarMenus.querySelectorAll('.opened').forEach(elm=>{
							elm.classList.remove('opened');
						});
						sidebarMenus.scrollTop = 0;
						backButton.style.display = 'none';
						closeButton.style.display = 'flex';
					} else if ( submenuLevel == 2 ) {
						submenuLevel = 1;
						sidebarMenus.querySelector('.has-second-submenu.opened').parentElement.classList.remove('opened');
						sidebarMenus.querySelector('.has-second-submenu.opened').parentElement.parentElement.classList.remove('opened');
						sidebarMenus.querySelector('.has-second-submenu.opened').classList.remove('opened');
					}

			});

			document.querySelector('.sidebar__close button.navigate-back').addEventListener('keydown', e=>{
				if ( e.keyCode == window.KEYCODES.RETURN ) {
					if ( submenuLevel == 1 ) {
						sidebarMenu._unmountA11YHelper();
						setTimeout(()=>{
							closeButton.focus();
							sidebarMenu._mountA11YHelper();
						}, 10);
					}
				}
			});

		}

		mountStickyHeader() {

			this.siteHeaderParent = document.querySelector('.mount-header');

			if ( this.dataset.sticky === 'sticky--scroll' ) {

				window.lst = window.scrollY;
				window.lhp = 0;
				window.sot = 0;

				this.SCROLL_StickyHelper = () =>{

					var st = window.scrollY;

					if ( st == 0 || st <= window.sot  ) {
						this.siteHeaderParent.classList.remove('is-sticky');
						this.siteHeaderParent.classList.remove('is-colorful');
						this.siteHeaderParent.classList.remove('is-animating');
					}

					if ( st < 0 || Math.abs(lst - st) <= 5 ) {
						return;	
					}
					if ( st > window.lhp ) {
						if ( st == 0 && this.siteHeaderParent.classList.contains('is-sticky') ) {
							this.siteHeaderParent.classList.remove('is-sticky');
							this.siteHeaderParent.classList.remove('is-colorful');
							this.siteHeaderParent.classList.remove('is-animating');
						} else if ( st <= lst && ! this.siteHeaderParent.classList.contains('is-sticky') ) {
							window.lhp = this.offsetTop;
							if ( Math.abs(this.siteHeaderParent.getBoundingClientRect().top) > this.siteHeaderParent.offsetHeight ) {
								window.sot = this.offsetTop > 0 ? this.offsetTop : window.sot;
								this.siteHeaderParent.classList.add('is-sticky');
								this.siteHeaderParent.classList.add('is-colorful');
								this.siteHeaderParent.classList.add('is-animating');
							}
						} else if ( st > lst && this.siteHeaderParent.classList.contains('is-sticky') ) {
							this.siteHeaderParent.classList.remove('is-sticky');
							this.siteHeaderParent.classList.remove('is-colorful');
							this.siteHeaderParent.classList.remove('is-animating');
						}
						
					}

					window.lst = st;

				}

				window.addEventListener('scroll', this.SCROLL_StickyHelper, {passive:true});

			} else if ( this.dataset.sticky === 'sticky' ) {
				this.siteHeaderParent.classList.add('is-sticky');
				this.siteHeaderParent.classList.add('is-sticky-always');
				if ( this.dataset.stickyBackground == 'true' ) {
					this.siteHeaderParent.classList.add('is-sticky-always-without-margin');
					this.siteHeaderParent.classList.add('is-colorful');
				}
			}

		}

		unmount(){
			window.removeEventListener('resize', this.RESIZE_SidebarHelper);
			window.removeEventListener('scroll', this.SCROLL_StickyHelper);
		}

	}

	if (typeof customElements.get("main-header") == "undefined") {
		customElements.define("main-header", MainHeader);
	}

}

if ( typeof SidebarDrawer !== 'function' ) {

	class SidebarDrawer extends HTMLElement {

		constructor(){
			super();
			this.querySelector('.close-sidebar')?.addEventListener('click', ()=>{
				this.hide();
			});
			document.addEventListener('keydown', e=>{
				if ( e.keyCode == window.KEYCODES.ESC ) {
					const openedSidebar = document.querySelector('sidebar-drawer.sidebar--opened');
					if ( openedSidebar ){
						openedSidebar.hide();
					}
				}
			});
		}

		/* 
			* generic hide/show functions 
		*/

		show(){

			this.opened = true;
			document.body.classList.add('sidebar-opened');
			if ( this.classList.contains('sidebar--right') ) {
				document.body.classList.add('sidebar-opened--right');
			} else if ( this.classList.contains('sidebar--left') ) {
				document.body.classList.add('sidebar-opened--left');
			}
			this.style.display = 'block';
			setTimeout(()=>{
				this.classList.add('sidebar--opened');
				this.style.height = window.innerHeight + 'px';
				this._mountA11YHelper();
			}, 15);

		}

		hide(){

			this.opened = false;
			this.classList.remove('sidebar--opened');

			document.body.classList.remove('sidebar-opened');
			document.body.classList.remove('sidebar-opened--left');
			document.body.classList.remove('sidebar-opened--right');
			this._unmountA11YHelper();

			if ( this.id == 'site-cart-sidebar' ) {
				document.getElementById('cart-open-button').setAttribute('aria-expanded', 'false');
			} else if ( this.id == 'site-search-sidebar' ) {
				document.getElementById('search-open-button').setAttribute('aria-expanded', 'false');
			} else if ( this.id == 'site-menu-sidebar' ) {
				document.getElementById('menu-open-button').setAttribute('aria-expanded', 'false');
			}

			setTimeout(()=>{
				this.style.display = 'none';
			}, 501);

		}

		/*
			* a11y helpers / tab catcher 
		*/

		_mountA11YHelper(forcedFocus){

			let focusable = forcedFocus ? forcedFocus : this.querySelectorAll('[tabindex="0"], button, [href], input:not([type="hidden"]), select, textarea, .regular-select-cover');

			let firstFocusable = focusable[0];
			let lastFocusable = focusable[focusable.length - 1];

			if ( this.id == 'site-cart-sidebar' && this.querySelector('.cart-holder').getAttribute('data-items') != '0' ) {
				lastFocusable = focusable[focusable.length - 2];
			}

			this.A11Y_TAB_EVENT = ((firstFocusable, lastFocusable, e)=>{
				let isTabPressed = (e.key === 'Tab' || e.keyCode === window.KEYCODES.TAB);
				if (!isTabPressed) { 
					return; 
				}
				if ( e.shiftKey ) /* shift + tab */ {
					if (document.activeElement === firstFocusable) {
						lastFocusable.focus();
						e.preventDefault();
					}
				} else /* tab */ {
					if (document.activeElement === lastFocusable) {
						firstFocusable.focus();
						e.preventDefault();
					}
				}
			}).bind(this, firstFocusable, lastFocusable)

			this.addEventListener('keydown', this.A11Y_TAB_EVENT);

		}

		_unmountA11YHelper(){
			this.removeEventListener('keydown', this.A11Y_TAB_EVENT);
		}

	}

	if (typeof customElements.get("sidebar-drawer") == "undefined") {
		customElements.define("sidebar-drawer", SidebarDrawer);
	}

}
