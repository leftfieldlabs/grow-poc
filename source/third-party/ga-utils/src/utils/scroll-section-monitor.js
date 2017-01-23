goog.provide('gaUtils.utils.scrollSectionMonitor');
goog.provide('gaUtils.utils.scrollSectionMonitor.EventType');
goog.provide('gaUtils.utils.scrollSectionMonitor.addSection');
goog.require('goog.array');
goog.require('goog.async.Throttle');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');

/**
 * Events.
 * @enum {string}
 */
gaUtils.utils.scrollSectionMonitor.EventType = {
  VIEWPORT_ENTER: 'viewportEnter',
  VIEWPORT_LEAVE: 'viewportLeave',
  VIEWPORT_LEAVE_TOP: 'viewportLeaveTop',
  VIEWPORT_LEAVE_BOTTOM: 'viewportLeaveBottom'
};

/**
 * Flag indicating whether the scroll section monitor has started.
 * @type {boolean}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.started_ = false;

/**
 * Whether a document or viewport change is taking place.
 * @type {boolean}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.isChanging_ = false;

/**
 * The last DOM's last recorded height.
 * @type {?number}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.lastDocHeight_ = null;

/**
 * The DOM's last recorded scrollTop position.
 * @type {?number}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.lastDocTop_ = null;

/**
 * The ViewportSizeMonitor's last recorded height.
 * @type {?number}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.lastVsmHeight_ = null;

/**
 * The ViewportSizeMonitor's last recorded width.
 * @type {?number}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.lastVsmWidth_ = null;

/**
 * A handle for a timeout used to continue rAF loops temporarily.
 * @type {?number}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.changeTimer_ = null;

/**
 * Viewport size monitor, used to measure the viewport.
 * @type {?goog.dom.ViewportSizeMonitor}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.vsm_ = null;

/**
 * An array containing each section to be monitored
 * and its relevant properties.
 * @type {Array.<Object>}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.sections_ = [];

/**
 * Cache the current viewport offset. Updated onces per frame
 * @type {Object}
 * @private
 */
gaUtils.utils.scrollSectionMonitor.currentViewportOffset_ = {};

/**
 * Start monitoring a section for viewport entry and exit.
 * @param {Object} section Object representing the section to monitor.
 * @return {boolean}
 */
gaUtils.utils.scrollSectionMonitor.addSection = function(section) {
  if (!section.element || !section.target) {
    return false;
  }
  // Add the section to the array of monitored sections
  gaUtils.utils.scrollSectionMonitor.sections_.push(section);
  // Update the section's offsets
  gaUtils.utils.scrollSectionMonitor.updateOffsets_(section);
  // Start handling viewport changes
  gaUtils.utils.scrollSectionMonitor.start_();
  return true;
};

/**
 * Update the stored offsets of a monitored section element.
 * @param {Object} section The section whose offsets should be updated.
 * @return {Object} section The section, with its latest offset values.
 * @private
 */
gaUtils.utils.scrollSectionMonitor.updateOffsets_ = function(section) {
  var additionalOffset = section.offset || 0;
  var offsetTop =
    goog.style.getPageOffsetTop(section.element) + additionalOffset;
  var offsetBottom =
    offsetTop + goog.style.getSize(section.element).height - additionalOffset;
  section.offsetTop = offsetTop;
  section.offsetBottom = offsetBottom;
  return section;
};

/**
 * Calculate and store the current viewport offset. Should only be done
 * once per frame
 * @private
 */
gaUtils.utils.scrollSectionMonitor.updateViewportOffsets_ = function() {
  var viewportTop = (
      document.documentElement && document.documentElement.scrollTop) ||
    document.body.scrollTop;
  var viewportBottom =
    viewportTop + gaUtils.utils.scrollSectionMonitor.vsm_.getSize().height;
  gaUtils.utils.scrollSectionMonitor.currentViewportOffset_ = {
    top: viewportTop,
    bottom: viewportBottom
  };
};

/**
 * Test whether a monitored section is currently in the viewport.
 * @param {Object} section The section to test.
 * @return {boolean} isInViewport True if the section is in the viewport
 * @private
 */
gaUtils.utils.scrollSectionMonitor.isInViewport_ = function(section) {
  if (goog.style.getStyle_(section.element, 'display') === 'none') {
    // Display none elements are not in viewport
    return {
      isInView: false
    };
  }
  // Get the current offsets of the viewport
  var viewportTop = gaUtils.utils.scrollSectionMonitor
    .currentViewportOffset_.top;
  var viewportBottom = gaUtils.utils.scrollSectionMonitor
    .currentViewportOffset_.bottom;
  // Get the current offsets of the monitored section
  var sectionOffsets = gaUtils.utils.scrollSectionMonitor
    .updateOffsets_(section);
  var sectionTop = sectionOffsets.offsetTop;
  var sectionBottom = sectionOffsets.offsetBottom;
  // Return details of the section's location relative to the viewport
  return {
    isInView: viewportTop < sectionBottom && viewportBottom > sectionTop,
      fromTop: viewportTop < sectionTop,
      fromBottom: viewportTop > sectionBottom
  };
};

/**
 * Trigger the enter or leave events on a section, as appropriate.
 * @param {Object} section The section to trigger the event on.
 * @param {!string} eventType The event type to fire
 * @param {Object} detail The info to attach to the event.
 * @private
 */
gaUtils.utils.scrollSectionMonitor.triggerEvent_ =
function(section, eventType, detail) {
  if (!section.element || !section.target) {
    return;
  }
  if (section.eventId) {
    detail.eventId = section.eventId;
  }
  var event;
  var eventParams = {
    bubbles: true,
    cancelable: true,
    detail: detail
  };
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(
        eventType,
        eventParams);
  }
  else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(
        eventType,
        eventParams.bubbles,
        eventParams.cancelable,
        eventParams.detail);
  }
  section.target.dispatchEvent(event);
};

/**
 * Trigger the enter or leave events on a section, as appropriate.
 * @param {Object} section The section to trigger the event on.
 * @param {Object} viewportReport Config object that states if the element is
 * in view or not and from where is it leaving.
 * @private
 */
gaUtils.utils.scrollSectionMonitor.onSectionViewChange_ =
function(section, viewportReport) {
  if (viewportReport.isInView) {
    gaUtils.utils.scrollSectionMonitor.triggerEvent_(section,
        gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_ENTER,
        viewportReport);
  } else {
    gaUtils.utils.scrollSectionMonitor.triggerEvent_(section,
        gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_LEAVE,
        viewportReport);
    var eventType = viewportReport.fromTop ?
      gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_LEAVE_TOP :
      gaUtils.utils.scrollSectionMonitor.EventType.VIEWPORT_LEAVE_BOTTOM;
    gaUtils.utils.scrollSectionMonitor.triggerEvent_(section,
        eventType, viewportReport);
  }
};

/**
 * Trigger events on sections which have just entered or left the viewport.
 * @private
 */
gaUtils.utils.scrollSectionMonitor.checkViewportChanges_ = function() {
  var ssm = gaUtils.utils.scrollSectionMonitor;
  var vsmSize = ssm.vsm_.getSize();
  var docTop = goog.dom.getDocumentScroll().y;
  var docHeight = goog.dom.getDocumentHeight();
  if (vsmSize.height === ssm.lastVsmHeight_ &&
      vsmSize.width === ssm.lastVsmWidth_ &&
      docTop === ssm.lastDocTop_ &&
      docHeight === ssm.lastDocHeight_ &&
      !ssm.isChanging_) {
    return;
  }
  gaUtils.utils.scrollSectionMonitor.updateViewportOffsets_();
  goog.array.forEach(ssm.sections_, function(section) {
    var viewportReport = ssm.isInViewport_(section);
    var delay = section.delay || 0;
    if (viewportReport.isInView !== section.isInView) {
      section.isInView = viewportReport.isInView;
      if (section.viewChangeTimer) {
        clearTimeout(section.viewChangeTimer);
      }
      section.viewChangeTimer = setTimeout(function() {
        ssm.onSectionViewChange_(section, viewportReport);
      }, delay);
    }
  });
  ssm.lastVsmHeight_ = vsmSize.height;
  ssm.lastVsmWidth_ = vsmSize.width;
  ssm.lastDocTop_ = docTop;
  ssm.lastDocHeight_ = docHeight;
  ssm.isChanging_ = true;
  ssm.changeTimer_ = setTimeout(function() {
    ssm.isChanging_ = false;
  }, 500);
};

/**
 * Starts the scroll section monitor, a utility which
 * triggers events when watched elements enter or exit the viewport.
 * Watched elements are defined in markup with the
 * [data-ga-utils-scroll-aware] attribute
 * @private
 */
gaUtils.utils.scrollSectionMonitor.start_ = function() {
  if (gaUtils.utils.scrollSectionMonitor.started_) {
    return;
  }
  gaUtils.utils.scrollSectionMonitor.vsm_ =
    new goog.dom.ViewportSizeMonitor();
  var update = function() {
    requestAnimationFrame(function() {
      gaUtils.utils.scrollSectionMonitor.checkViewportChanges_();
      update();
    });
  };
  update();
};
