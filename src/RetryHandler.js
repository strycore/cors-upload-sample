class RetryHandler {
  /**
   * Helper for implementing retries with backoff. Initial retry
   * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
   *
   * @constructor
   */
  constructor() {
    this.interval = 1000; // Start at one second
    this.maxInterval = 60 * 1000; // Don't wait longer than a minute
  }

  /**
   * Invoke the function after waiting
   *
   * @param {function} fn Function to invoke
   */
  retry(fn) {
    setTimeout(fn, this.interval);
    this.interval = this.nextInterval();
  }

  /**
   * Reset the counter (e.g. after successful request.)
   */
  reset() {
    this.interval = 1000;
  }

  /**
   * Calculate the next wait time.
   * @return {number} Next wait interval, in milliseconds
   *
   * @private
   */
  nextInterval() {
    var interval = this.interval * 2 + RetryHandler.getRandomInt(0, 1000);
    return Math.min(interval, this.maxInterval);
  }

  /**
   * Get a random int in the range of min to max.
   * Used to add jitter to wait times.
   *
   * @private
   * @param {number} min Lower bounds
   * @param {number} max Upper bounds
   * @return {number} A random number
   */
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export default RetryHandler;
