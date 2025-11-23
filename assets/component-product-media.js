if (typeof ProductModel !== "function") {

	class ProductModel extends HTMLElement {

		constructor() {
			super();
			Shopify.loadFeatures([
				{
					name: "model-viewer-ui",
					version: "1.0",
					onLoad: this.setupModelViewerUI.bind(this),
				},
			]);
		}
		setupModelViewerUI(errors) {
			if (errors) return;
			this.modelViewerUI = new Shopify.ModelViewerUI(
				this.querySelector("model-viewer")
			);
			const modelViewerEl = this.modelViewerUI.viewer;
			modelViewerEl.addEventListener(
				"shopify_model_viewer_ui_toggle_play",
				() => {
					if (modelViewerEl.closest(".product-gallery")) {
						modelViewerEl.closest(".product-gallery").toggleDragging(false);
					}
				}
			);
			modelViewerEl.addEventListener(
				"shopify_model_viewer_ui_toggle_pause",
				() => {
					if (modelViewerEl.closest(".product-gallery")) {
						modelViewerEl.closest(".product-gallery").toggleDragging(true);
					}
				}
			);
			if (
				modelViewerEl.closest(".product-gallery__item") &&
				modelViewerEl.closest(".product-gallery__item").dataset.index == "0"
			) {
				if (modelViewerEl.closest(".product-gallery")) {
					modelViewerEl.closest(".product-gallery").toggleDragging(false);
				}
			}
		}
	}

	if (typeof customElements.get("product-model") == "undefined") {
		customElements.define("product-model", ProductModel);
	}

}

window.ProductModel = {
	
	loadShopifyXR() {
		Shopify.loadFeatures([
			{
				name: "shopify-xr",
				version: "1.0",
				onLoad: this.setupShopifyXR.bind(this),
			},
		]);
	},
	
	setupShopifyXR(errors) {
		if (errors) return;
		if (!window.ShopifyXR) {
			document.addEventListener("shopify_xr_initialized", () =>
				this.setupShopifyXR()
			);
			return;
		}
		document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
			window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
			modelJSON.remove();
		});
		window.ShopifyXR.setupXRElements();
	}
	
};
