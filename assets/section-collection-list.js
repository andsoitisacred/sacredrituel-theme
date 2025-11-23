if ( typeof CollectionListItem !== 'function' ) {

  class CollectionListItem extends HTMLElement {
    constructor(){
      super();
      setTimeout(()=>{
        this.querySelector('.collection-list-item-image').style.visibility = 'visible';
      }, 200);
      this.addEventListener('mousemove', e=>{
        const image = this.querySelector('.collection-list-item-image');
        image.style.top = `${(e.clientY - this.getBoundingClientRect().top)}px`;
        image.style.left = `${(e.clientX - this.getBoundingClientRect().left)}px`;
      }, {passive: true});
    }
  }
  
  if (typeof customElements.get("collection-list-item") == "undefined") {
    customElements.define("collection-list-item", CollectionListItem);
  }

}
