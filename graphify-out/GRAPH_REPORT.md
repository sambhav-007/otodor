# Graph Report - ototor  (2026-06-08)

## Corpus Check
- 110 files · ~246,321 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 758 nodes · 1031 edges · 131 communities (111 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2687b8be`
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
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 129|Community 129]]
- [[_COMMUNITY_Community 130|Community 130]]

## God Nodes (most connected - your core abstractions)
1. `PredictiveSearch` - 23 edges
2. `FacetFiltersForm` - 20 edges
3. `settings` - 18 edges
4. `SlideshowComponent` - 16 edges
5. `CartItems` - 15 edges
6. `icon` - 14 edges
7. `sections` - 12 edges
8. `CartDrawer` - 11 edges
9. `MenuDrawer` - 11 edges
10. `BulkAdd` - 10 edges

## Surprising Connections (you probably didn't know these)
- `constructor()` --calls--> `debounce()`  [INFERRED]
  otodor-shopify/assets/cart.js → otodor-shopify/assets/global.js
- `show()` --calls--> `trapFocus()`  [INFERRED]
  otodor-shopify/assets/pickup-availability.js → otodor-shopify/assets/global.js
- `hide()` --calls--> `removeTrapFocus()`  [INFERRED]
  otodor-shopify/assets/pickup-availability.js → otodor-shopify/assets/global.js
- `constructor()` --calls--> `debounce()`  [INFERRED]
  otodor-shopify/assets/media-gallery.js → otodor-shopify/assets/global.js
- `constructor()` --calls--> `debounce()`  [INFERRED]
  otodor-shopify/assets/quick-add-bulk.js → otodor-shopify/assets/global.js

## Import Cycles
- None detected.

## Communities (131 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (4): BulkModal, ModalOpener, SectionId, trapFocusHandlers

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (4): initializeScrollAnimationTrigger(), FacetFiltersForm, FacetRemove, PriceRange

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (21): cleanErrorMessageOnType(), connectedCallback(), constructor(), getSectionsToRender(), getTotalBar(), handleScrollIntoView(), handleSwitchVariantOnEnter(), initEventListeners() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (11): buildRequestUrlWithParams(), connectedCallback(), handleOptionValueChange(), handleSwapProduct(), handleUpdateProductInfo(), initializeProductSwapUtility(), initQuantityHandlers(), renderProductInfo() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (5): CartItems, CartRemoveButton, constructor(), debounce(), SearchForm

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (22): QuantityInput, connectedCallback(), constructor(), getCartQuantity(), getVolumePricingArray(), onInputChange(), updatePricePerItem(), publish() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (17): block_order, settings, type, block_order, settings, type, settings, block_order (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (11): fetchConfig(), handleErrorMessage(), onSubmitHandler(), constructor(), getSectionsToRender(), getSectionsUrl(), listenForActiveInput(), listenForKeydown() (+3 more)

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
Cohesion: 0.11
Nodes (23): pillar_1, pillar_3, pillar_4, pillar_5, pillar_6, pillar_7, pillar_8, blocks (+15 more)

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (4): createOverlay(), magnify(), prepareOverlay(), toggleLoadingSpinner()

### Community 105 - "Community 105"
Cohesion: 0.15
Nodes (13): feat_1, feat_2, feat_3, feat_5, settings, type, settings, type (+5 more)

### Community 106 - "Community 106"
Cohesion: 0.23
Nodes (14): review_1, review_2, review_3, blocks, settings, type, settings, type (+6 more)

### Community 107 - "Community 107"
Cohesion: 0.15
Nodes (16): settings, settings, background_image, cta_primary_label, cta_primary_link, cta_secondary_label, cta_secondary_link, heading_suffix (+8 more)

### Community 108 - "Community 108"
Cohesion: 0.13
Nodes (14): order, type, block_order, type, block_order, type, type, type (+6 more)

### Community 109 - "Community 109"
Cohesion: 0.20
Nodes (12): settings, block_order, settings, type, settings, otodor_products, cta_label, cta_link (+4 more)

### Community 110 - "Community 110"
Cohesion: 0.22
Nodes (11): step_1, step_2, step_3, blocks, description, settings, type, settings (+3 more)

### Community 112 - "Community 112"
Cohesion: 0.28
Nodes (3): DeferredMedia, ModalDialog, pauseAllMedia()

### Community 113 - "Community 113"
Cohesion: 0.33
Nodes (6): constructor(), fetchAvailability(), handleBodyClick(), hide(), onClickRefreshList(), update()

### Community 114 - "Community 114"
Cohesion: 0.22
Nodes (9): spec_1, spec_2, spec_3, spec_4, blocks, type, type, type (+1 more)

### Community 115 - "Community 115"
Cohesion: 0.25
Nodes (4): getFocusableElements(), HeaderDrawer, trapFocus(), show()

### Community 116 - "Community 116"
Cohesion: 0.57
Nodes (8): hotspot_x, hotspot_y, label, title, settings, settings, settings, settings

### Community 118 - "Community 118"
Cohesion: 0.29
Nodes (7): block_order, settings, type, otodor_trust_bar, aria_label, pause_on_hover, speed

### Community 123 - "Community 123"
Cohesion: 0.50
Nodes (4): block_order, settings, type, otodor_process

### Community 128 - "Community 128"
Cohesion: 0.67
Nodes (3): feat_4, settings, type

### Community 129 - "Community 129"
Cohesion: 0.67
Nodes (3): feat_6, settings, type

### Community 130 - "Community 130"
Cohesion: 0.67
Nodes (3): pillar_2, settings, type

## Knowledge Gaps
- **98 isolated node(s):** `version`, `configurations`, `allow`, `PUB_SUB_EVENTS`, `selectors` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `debounce()` connect `Community 5` to `Community 0`, `Community 10`, `Community 20`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `subscribe()` connect `Community 6` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `fetchConfig()` connect `Community 10` to `Community 0`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `version`, `configurations`, `allow` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09269162210338681 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09885057471264368 - nodes in this community are weakly interconnected._