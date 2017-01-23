goog.provide('gaUtils.utils.tracker');
goog.provide('gaUtils.utils.tracker.DataAttributes');
goog.provide('gaUtils.utils.tracker.trackEvent');
goog.require('goog.array');
/**
 * Simple interface to help send events to GA via AutoTrack.
 * @param {string} methodName The analytics method to use
 * @param {string} category The event category
 * @param {string} action The event action
 * @param {string=} opt_label The event label
 * @param {string=} opt_value The event value
 * @private
 */
gaUtils.utils.tracker.pushCommand_ =
  function(methodName, category, action, opt_label, opt_value) {
    var methodArgs = Array.prototype.slice.call(arguments);
    var tracker = window['tracker'] || window['gaTracker'];
    // Ensure category, action and label are strings.
    goog.array.forEach(methodArgs, function(arg, i) {
      if (goog.isDefAndNotNull(arg) && !goog.isString(arg)) {
        methodArgs[i] = arg.toString();
      }
    });
    tracker['pushCommand'](methodArgs);
};

/**
 * Track an analytics event via AutoTrack.
 * @param {string} category The event category
 * @param {string} action The event action
 * @param {string=} opt_label The event label
 * @param {string=} opt_value The event value
 */
gaUtils.utils.tracker.trackEvent =
  function(category, action, opt_label, opt_value) {
    gaUtils.utils.tracker.pushCommand_(
      gaUtils.utils.tracker.AnalyticsMethods_.TRACK_EVENT,
      category, action, opt_label, opt_value);
};

/**
 * Attributes for getting GA values from the DOM.
 * @enum {string}
 */
gaUtils.utils.tracker.DataAttributes = {
  CATEGORY: 'gaUtilsCategory',
  ACTION: 'gaUtilsAction',
  LABEL: 'gaUtilsLabel',
  LABEL_PREFIX: 'gaUtilsLabelPrefix'
};

/**
 * Analytics tracking methods.
 * @enum {string}
 * @private
 */
gaUtils.utils.tracker.AnalyticsMethods_ = {
  TRACK_EVENT: '_trackEvent'
};
