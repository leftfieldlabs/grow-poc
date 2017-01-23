goog.provide('gaUtils.components.ScrollAwareSection');

goog.require('gaUtils.utils.scrollSectionMonitor');
goog.require('gaUtils.utils.scrollSectionMonitor.EventType');
goog.require('goog.dom');
goog.require('goog.events');



/**
 * Initialises a new scroll-aware section.
 * @extends {goog.ui.Component}
 * @constructor
 */
gaUtils.components.ScrollAwareSection = function() {
  gaUtils.components.ScrollAwareSection.base(this, 'constructor');


  /**
   * The element to target (defaults to the component's element).
   * @type {Element}
   * @private
   */
  this.targetEl_ = null;


  /**
   * Whether classes should be added to the target.
   * @type {boolean}
   * @private
   */
  this.addClassesOnEnter_ = false;


  /**
   * Whether classes should be removed from the target.
   * @type {boolean}
   * @private
   */
  this.removeClassesOnLeave_ = false;


  /**
   * CSS classes to add and/or remove.
   * @type {string}
   * @private
   */
  this.classesToToggle_ = null;


  /**
   * How much of the element must be visible to count as 'viewed' (in px).
   * @type {number}
   * @private
   */
  this.offset_ = 0;


  /**
   * How long the element must remain visible to count as 'viewed' (in ms).
   * @type {number}
   * @private
   */
  this.delay_ = 0;


  /**
   * The ID to associate with the viewport events.
   * @type {string}
   * @private
   */
  this.eventId_ = 'Class toggle';
};
goog.inherits(gaUtils.components.ScrollAwareSection, goog.ui.Component);


/**
 * Data attributes.
 * @enum {string}
 * @private
 */
gaUtils.components.ScrollAwareSection.DataAttributes_ = {
  TARGET_QUERY: 'target',
  CLASSES_TO_TOGGLE: 'classes',
  ADD_ON_ENTER: 'addOnEnter',
  REMOVE_ON_LEAVE: 'removeOnLeave',
  SCROLL_DELAY: 'scrollDelay',
  SCROLL_OFFSET: 'scrollOffset'
};


/**
 * Called when the component's element is known to be in the document.
 * @override
 */
gaUtils.components.ScrollAwareSection.prototype.enterDocument =
    function() {
  gaUtils.components.ScrollAwareSection.base(this, 'enterDocument');

  var target = document.querySelector(
      goog.dom.dataset.get(this.getElement(),
      gaUtils.components.ScrollAwareSection.DataAttributes_.TARGET_QUERY));

  this.targetEl_ = target || this.getElement();

  this.setCustomOptions_();

  this.monitor_();
};


/**
 * Update default options with values from data attributes.
 * @private
 */
gaUtils.components.ScrollAwareSection.prototype.setCustomOptions_ =
    function() {

  var customDelay = parseInt(goog.dom.dataset.get(this.getElement(),
      gaUtils.components.TrackingSection.DataAttributes_.SCROLL_DELAY));
  var customOffset = parseInt(goog.dom.dataset.get(this.getElement(),
      gaUtils.components.TrackingSection.DataAttributes_.SCROLL_OFFSET));

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
gaUtils.components.ScrollAwareSection.prototype.monitor_ = function() {
  var attrs = gaUtils.components.ScrollAwareSection.DataAttributes_;
  var hasClassesToToggle = goog.dom.dataset.has(this.getElement(),
      attrs.CLASSES_TO_TOGGLE);

  if (hasClassesToToggle) {
    this.addClassesOnEnter_ =
        goog.dom.dataset.has(this.getElement(),
        attrs.ADD_ON_ENTER);
    this.removeClassesOnLeave_ = goog.dom.dataset.has(this.getElement(),
        attrs.REMOVE_ON_LEAVE);
    this.classesToToggle_ = goog.dom.dataset.get(this.getElement(),
        attrs.CLASSES_TO_TOGGLE).split(' ');
  }

  // Set initial properties
  this.scrollData = {
    element: this.getElement(),
    target: this.targetEl_,
    toggleClasses: this.classesToToggle_ || null,
    addClassesOnEnter: !!this.classesToToggle_ && this.addClassesOnEnter_,
    removeClassesOnLeave: !!this.classesToToggle_ && this.removeClassesOnLeave_,
    offset: this.offset_,
    delay: this.delay_,
    eventId: this.eventId_
  };

  // If the component toggles classes on itself or a target,
  // Add a listener for enter and leave events
  if (!!this.classesToToggle_) {
    goog.events.listen(
        this.scrollData.target,
        [gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_ENTER,
         gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_LEAVE],
        goog.bind(function(e) {
          this.toggleClasses_(e.event_.detail);
        }, this),
        false, this);
  }

  // Monitor the component for viewport entry and exit
  gaUtils.utils.scrollSectionMonitor.addSection(this.scrollData);
};


/**
 * Toggle classes on a component or its target.
 * @param {object} eventDetail
 * @private
 */
gaUtils.components.ScrollAwareSection.prototype.toggleClasses_ =
    function(eventDetail) {

  if (eventDetail.eventId !== this.eventId_ ||
      !this.toggleClasses_ || !this.classesToToggle_) {
    return;
  }

  if (eventDetail.isInView && this.addClassesOnEnter_) {
    goog.dom.classlist.addAll(this.targetEl_, this.classesToToggle_);
  }
  else if (!eventDetail.isInView && this.removeClassesOnLeave_) {
    goog.dom.classlist.removeAll(this.targetEl_, this.classesToToggle_);
  }

};
