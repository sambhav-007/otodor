# Graph Report - ototor  (2026-06-07)

## Corpus Check
- 107 files · ~264,255 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 709 nodes · 956 edges · 107 communities (97 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d91f348`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]

## God Nodes (most connected - your core abstractions)
1. `PredictiveSearch` - 23 edges
2. `FacetFiltersForm` - 20 edges
3. `SlideshowComponent` - 16 edges
4. `CartItems` - 15 edges
5. `settings` - 15 edges
6. `CartDrawer` - 11 edges
7. `MenuDrawer` - 11 edges
8. `sections` - 11 edges
9. `BulkAdd` - 10 edges
10. `icon` - 10 edges

## Surprising Connections (you probably didn't know these)
- `connectedCallback()` --calls--> `subscribe()`  [INFERRED]
  otodor-shopify/assets/price-per-item.js → otodor-shopify/assets/pubsub.js
- `connectedCallback()` --calls--> `subscribe()`  [INFERRED]
  otodor-shopify/assets/quick-add-bulk.js → otodor-shopify/assets/pubsub.js
- `constructor()` --calls--> `debounce()`  [INFERRED]
  otodor-shopify/assets/cart.js → otodor-shopify/assets/global.js
- `show()` --calls--> `trapFocus()`  [INFERRED]
  otodor-shopify/assets/pickup-availability.js → otodor-shopify/assets/global.js
- `constructor()` --calls--> `debounce()`  [INFERRED]
  otodor-shopify/assets/media-gallery.js → otodor-shopify/assets/global.js

## Import Cycles
- None detected.

## Communities (107 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (12): AccountIcon, BulkModal, CartPerformance, DeferredMedia, HTMLUpdateUtility, ModalDialog, ModalOpener, pauseAllMedia() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (14): CartNotification, DetailsModal, getFocusableElements(), HeaderDrawer, MenuDrawer, removeTrapFocus(), trapFocus(), constructor() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (4): initializeScrollAnimationTrigger(), FacetFiltersForm, FacetRemove, PriceRange

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (21): cleanErrorMessageOnType(), connectedCallback(), constructor(), getSectionsToRender(), getTotalBar(), handleScrollIntoView(), handleSwitchVariantOnEnter(), initEventListeners() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (16): QuantityInput, buildRequestUrlWithParams(), connectedCallback(), handleOptionValueChange(), handleSwapProduct(), handleUpdateProductInfo(), initializeProductSwapUtility(), initQuantityHandlers() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (5): CartItems, CartRemoveButton, constructor(), debounce(), SearchForm

### Community 6 - "Community 6"
Cohesion: 0.31
Nodes (10): clearErrorMessage(), clearInputFields(), constructor(), disableableFields(), disableInputFields(), displayErrorMessage(), enableInputFields(), inputFields() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (55): order, block_order, settings, type, block_order, settings, type, settings (+47 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (12): fetchConfig(), handleErrorMessage(), onSubmitHandler(), connectedCallback(), constructor(), getSectionsToRender(), getSectionsUrl(), listenForActiveInput() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (40): card_1, card_2, card_3, card_4, cat_1, cat_2, cat_3, cat_4 (+32 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (14): Brand Tone, Collections, Content Principles, Design Inspiration, Future Vision, Homepage Strategy, Homepage Structure, OTODOR Website Project (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (7): closeSelector(), filterCountries(), hidePanel(), normalizeString(), onContainerKeyUp(), openSelector(), resetFilter()

### Community 15 - "Community 15"
Cohesion: 0.21
Nodes (20): comp_1, comp_2, comp_3, comp_4, settings, type, settings, type (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (6): preprocessHTML(), preventDuplicatedIDs(), preventVariantURLSwitching(), removeDOMElements(), removeGalleryListSemantic(), updateImageSizes()

### Community 18 - "Community 18"
Cohesion: 0.31
Nodes (3): attributes, CustomerAddresses, selectors

### Community 20 - "Community 20"
Cohesion: 0.39
Nodes (8): announceLiveRegion(), constructor(), onSlideChanged(), playActiveMedia(), preventStickyHeader(), removeListSemantic(), setActiveMedia(), setActiveThumbnail()

### Community 22 - "Community 22"
Cohesion: 0.46
Nodes (7): init(), initCounters(), initFadeInReveals(), initFadeUpReveals(), initParallax(), initScaleInReveals(), initStaggerReveals()

### Community 23 - "Community 23"
Cohesion: 0.36
Nodes (6): connectedCallback(), constructor(), getCartQuantity(), getVolumePricingArray(), onInputChange(), updatePricePerItem()

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (4): createOverlay(), magnify(), prepareOverlay(), toggleLoadingSpinner()

### Community 105 - "Community 105"
Cohesion: 0.07
Nodes (48): feat_1, feat_2, feat_3, feat_4, feat_5, feat_6, pillar_1, pillar_2 (+40 more)

### Community 106 - "Community 106"
Cohesion: 0.23
Nodes (14): review_1, review_2, review_3, blocks, settings, type, settings, type (+6 more)

## Knowledge Gaps
- **78 isolated node(s):** `PUB_SUB_EVENTS`, `selectors`, `attributes`, `trapFocusHandlers`, `subscribers` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `debounce()` connect `Community 5` to `Community 0`, `Community 10`, `Community 20`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `subscribe()` connect `Community 4` to `Community 10`, `Community 3`, `Community 5`, `Community 23`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `fetchConfig()` connect `Community 10` to `Community 0`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `PUB_SUB_EVENTS`, `selectors`, `attributes` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06105457909343201 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09269162210338681 - nodes in this community are weakly interconnected._