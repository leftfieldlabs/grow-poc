goog.provide('gaUtils.components.TrackingSection');

goog.require('gaUtils.utils.scrollSectionMonitor.EventType');
goog.require('gaUtils.utils.scrollSectionMonitor.addSection');
goog.require('gaUtils.utils.tracker.trackEvent');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.Component');

/**
 * Initialises a new analytics tracking section.
 * @constructor
 * @extends {goog.ui.Component}
 * @final
 */
gaUtils.components.TrackingSection = function() {
  gaUtils.components.TrackingSection.base(this, 'constructor');

  /**
   * The name of the section, as it will be reported to GA.
   * @type {?string}
   * @private
   */
  this.sectionName_ = null;

  /**
   * Whether this section has been viewed and tracked.
   * @type {boolean}
   * @private
   */
  this.wasTracked_ = false;

  /**
   * How much fo the element must be visible to count as 'viewed' (in px).
   * @type {number}
   * @private
   */
  this.offset_ = 150;

  /**
   * How long the element must remain visible to count as 'viewed' (in ms)
   * @type {number}
   * @private
   */
  this.delay_ = 1500;

  /**
   * The ID to associate with the viewport events.
   * @type {string}
   * @private
   */
  this.eventId_ = 'Analytics tracking';

};

// Set inheritance of Tracking Section to goog.ui.Component
goog.inherits(gaUtils.components.TrackingSection, goog.ui.Component);

/**
 * Data attributes
 * @enum {string}
 * @private
 */
gaUtils.components.TrackingSection.DataAttributes_ = {
  SECTION_DELAY: 'gaUtilsTrackingDelay',
  SECTION_NAME: 'gaUtilsTrackingName',
  SECTION_OFFSET: 'gaUtilsTrackingOffset'
};


/**
 * Scroll Depth analytics event category.
 * @const {string}
 */
gaUtils.components.TrackingSection.CATEGORY = 'scroll-depth';

/**
 * Scroll Depth analytics event action.
 * @const {string}
 */
gaUtils.components.TrackingSection.ACTION = 'scroll';

/**
 * Called when the component's element is known to be in the document.
 * @override
 */
gaUtils.components.TrackingSection.prototype.enterDocument = function() {
  gaUtils.components.TrackingSection.base(this, 'enterDocument');
  this.sectionName_ = goog.dom.dataset.get(
      this.getElement(),
      gaUtils.components.TrackingSection.DataAttributes_.SECTION_NAME);
  this.setCustomOptions_();
  this.monitor_();
};

/**
 * Update default options with values from data attributes.
 * @private
 */
gaUtils.components.TrackingSection.prototype.setCustomOptions_ =
function() {
  var customDelay = parseInt(
      goog.dom.dataset.get(this.getElement(),
      gaUtils.components.TrackingSection.DataAttributes_.SECTION_DELAY));
  var customOffset = parseInt(goog.dom.dataset.get(
      this.getElement(),
      gaUtils.components.TrackingSection.DataAttributes_.SECTION_OFFSET));
  if (!isNaN(customDelay)) {
    this.delay_ = customDelay;
  }
  if (!isNaN(customOffset)) {
    this.offset_ = customOffset;
  }
};

/**
 * Prepare the component for scroll monitoring.
 * @private
 */
gaUtils.components.TrackingSection.prototype.monitor_ = function() {
  // Fail silently if a section name is not provided
  if (!this.sectionName_) {
    return;
  }
  goog.events.listen(
    this.getElement(),
    gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_ENTER,
    this.trackView_,
    false, this);
  gaUtils.utils.scrollSectionMonitor.addSection({
    element: this.getElement(),
    target: this.getElement(),
    offset: this.offset_,
    delay: this.delay_,
    eventId: this.eventId_
  });
};

/**
 * Fire a Google Analytics event.
 * @param {gaUtils.utils.CustomEvent} e The fired event
 * @private
 */
gaUtils.components.TrackingSection.prototype.trackView_ = function(e) {
  if (this.wasTracked_ || e.event_.detail.eventId !== this.eventId_) {
    return;
  }
  gaUtils.utils.tracker.trackEvent(
    gaUtils.components.TrackingSection.CATEGORY,
    gaUtils.components.TrackingSection.ACTION, this.sectionName_);
  this.wasTracked_ = true;
};
