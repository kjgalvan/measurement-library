goog.module('measurementLibrary.eventProcessor.GoogleAnalyticsEventProcessor');

const uuidv4 = goog.require('measurementLibrary.eventProcessor.uuidv4');

/**
 * A class that processes events pushed to the data layer
 * by constructing and sending Google Analytics events via
 * Measurement Protocol.
 * For its Google Analytic events, it generates a unique client ID
 * and stores it in the long term storage model provided.
 * @implements {EventProcessor}
 */
class GoogleAnalyticsEventProcessor {
  /**
   * @param {{
   *     'api_secret': (string|undefined),
   *     'measurement_id': (string|undefined),
   *     'measurement_url': string,
   *     'client_id_expires': number,
   *     'automatic_params': !Object<string, boolean>,
   * }=} optionsObject
   */
  constructor({
      'api_secret': apiSecret,
      'measurement_id': measurementId,
      'measurement_url': measurementUrl = 'https://www.google-analytics.com/mp/collect',
      'client_id_expires': clientIdExpires = Number.POSITIVE_INFINITY,
      'automatic_params': userAutomaticParams = {},
    } = {}) {
    /**
     * Parameters that are important to all events and will be searched for
     * globally in the data model.
     * @private @const {!Object<string, boolean>}
     */
    this.automaticParams_ = Object.assign({
      'page_path': true,
      'page_location': true,
      'page_title': true,
      'user_id': true,
      'client_id': true,
    }, userAutomaticParams);

    /**
     * Parameters that are to be set at the top level of the JSON
     * post body instead of as event parameters.
     * @private @const {!Object<string,boolean>}
     */
    this.topLevelParams_ = {
      'client_id': true,
      'user_id': true,
      'timestamp_micros': true,
      'user_properties': true,
      'non_personalized_ads': true,
    };

    /**
     * An API secret that can be generated via Google Analytics UI
     * NOTE: This processor makes public network requests using this
     * API secret. To avoid spam, regenerate API secrets regularly.
     * @private @const {string|undefined}
     */
    this.apiSecret_ = apiSecret;

    /**
     * The identifier for property being measured. Can be found using
     * the Google Analytics UI.
     * @private @const {string|undefined}
     */
    this.measurementId_ =
        measurementId ? measurementId.toUpperCase() : measurementId;

    /**
     * URL to send network requests to. Defaults to the Google Analytics
     * collection endpoint. Data must be sent via HTTPS.
     * @private @const {string}
     */
    this.measurementUrl_ = measurementUrl;

    /**
     * How long the client ID key should be stored in long term storage
     * measured in seconds. Defaults to positive infinity.
     */
    this.clientIdExpires_ = clientIdExpires;

    /**
     * What method to use for UUID v4 generation.
     */
    this.uuidv4_ = uuidv4;
  }

  /**
   * Names the event processor so multiple processors
   * can share previous configuration.
   * @return {string}
   * @export
   */
  getName() {
    return 'googleAnalytics';
  }

  /**
   * WIP
   *
   * @param {!StorageInterface} storageInterface An interface to an object to
   *    load or save persistent data with.
   * @param {{get:function(string):*, set:function(string, *)}} modelInterface
   *    An interface to load or save short term page data from the data layer.
   * @param {string} eventName The name of the event passed to the data layer.
   * @param {!Object<string, *>=} eventArgs The events passed to the data layer.
   * @export
   */
  processEvent(storageInterface, modelInterface, eventName, eventArgs) {
    // constructs and sends JSON POST requests to GA
  }

  /**
   * WIP
   *
   * @param {string} key The location at which to store data in the model.
   *    Dot notation is used to access a nested value (i.e. 'employees.jim'
   *    is the key 'jim' in the nested 'employees' object).
   * @param {*} value The data to store.
   * @param {{get:function(string):*, set:function(string, *)}} modelInterface
   *    An interface to load or save short term page data from the data layer.
   * @return {number} How long the key should be stored in seconds.
   *     If -1, then the default value saved in storage will be used.
   *     If 0, the data is not saved to long term storage at all.
   *     If Number.POSITIVE_INFINITY, data will be stored forever.
   * @export
   */
  persistTime(key, value) {
    // checks to see if key is client ID
    // Returns client ID expires if true
    return -1;
  }
}

exports = GoogleAnalyticsEventProcessor;