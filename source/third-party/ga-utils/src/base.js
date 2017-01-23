goog.provide('gaUtils');

goog.require('gaUtils.components.TrackingSection');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.animationFrame.polyfill');
goog.require('goog.dom.dataset');

/**
 * Initialize gaUtils
 */
gaUtils.init = function() {
  goog.dom.animationFrame.polyfill.install();
  gaUtils.init.initTrackingSections_();
};

/**
 * Component names referenced by data attribute.
 * @enum {string}
 * @private
 */
gaUtils.init.Components_ = {
  TRACKING_SECTIONS: '[data-ga-utils-tracking-section]',
  SCROLL_AWARE: '[data-ga-utils-scroll-aware]'
};

/**
 * Init Analytics Tracking Sections.
 * @private
 * @return {Array.<gaUtils.components.TrackingSection>}
 */
gaUtils.init.initTrackingSections_ = function() {
  return goog.array.map(
    document.querySelectorAll(gaUtils.init.Components_.TRACKING_SECTIONS),
    function(el) {
      var section = new gaUtils.components.TrackingSection();
      section.decorate(el);
      return section;
    });
};

/**
 * Init scroll aware sections
 * @return {Array.<android.components.ScrollAwareSection>}
 * @private
 */
gaUtils.init.initScrollAwareSections_ = function() {
  return goog.array.map(
      document.querySelectorAll(
          gaUtils.init.Components_.SCROLL_AWARE),
      function(el) {
        var section = new gaUtils.components.ScrollAwareSection();
        section.decorate(el);
        return section;
      });
};

goog.exportSymbol('gaUtils.init', gaUtils.init);
