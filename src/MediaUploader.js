import RetryHandler from './RetryHandler.js';

class MediaUploader {
  /**
   * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
   * files or in-memory constructs.
   *
   * @example
   * var content = new Blob(["Hello world"], {"type": "text/plain"});
   * var uploader = new MediaUploader({
   *   file: content,
   *   token: accessToken,
   *   onComplete: function(data) { ... }
   *   onError: function(data) { ... }
   * });
   * uploader.upload();
   *
   * @constructor
   * @param {object} options Hash of options
   * @param {string} options.token Access token
   * @param {Blob} options.file Blob-like item to upload
   * @param {string} [options.fileId] ID of file if replacing
   * @param {object} [options.params] Additional query parameters
   * @param {string} [options.contentType] Content-type, if overriding the type of the blob.
   * @param {object} [options.metadata] File metadata
   * @param {number} [options.offset] Offset
   * @param {number} [options.chunkSize] Chunk size
   * @param {string} [options.url] Destination URL to upload to
   * @param {string} [options.baseUrl] Base URL of uploads
   * @param {function} [options.onComplete] Callback for when upload is complete
   * @param {function} [options.onProgress] Callback for status for the in-progress upload
   * @param {function} [options.onError] Callback if upload fails
   */
  constructor(options) {
    var noop = function() {};
    this.file = options.file;
    this.contentType = options.contentType || this.file.type || 'application/octet-stream';
    this.metadata = options.metadata || {
      'title': this.file.name,
      'mimeType': this.contentType
    };
    this.token = options.token;
    this.onComplete = options.onComplete || noop;
    this.onProgress = options.onProgress || noop;
    this.onError = options.onError || noop;
    this.offset = options.offset || 0;
    this.chunkSize = options.chunkSize || 0;
    this.retryHandler = new RetryHandler();

    this.url = options.url;
    if (!this.url) {
      var params = options.params || {};
      params.uploadType = 'resumable';
      this.url = this.buildUrl(options.fileId, params, options.baseUrl);
    }
    this.httpMethod = options.fileId ? 'PUT' : 'POST';
  }

  /**
   * Initiate the upload.
   */
  upload() {
    var xhr = new XMLHttpRequest();

    xhr.open(this.httpMethod, this.url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Upload-Content-Length', toString(this.file.size, 10));
    xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

    xhr.onload = function(e) {
      if (e.target.status < 400) {
        this.url = e.target.getResponseHeader('Location');
        this.sendFile();
      } else {
        this.onUploadError(e);
      }
    }.bind(this);
    xhr.onerror = this.onUploadError.bind(this);
    xhr.send(JSON.stringify(this.metadata));
  }

  /**
   * Send the actual file content.
   *
   * @private
   */
  sendFile() {
    var content = this.file;
    var end = this.file.size;

    if (this.offset || this.chunkSize) {
      // Only bother to slice the file if we're either resuming or uploading in chunks
      if (this.chunkSize) {
        end = Math.min(this.offset + this.chunkSize, this.file.size);
      }
      content = content.slice(this.offset, end);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (end - 1) + "/" + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess.bind(this);
    xhr.onerror = this.onContentUploadError.bind(this);
    xhr.send(content);
  }

  /**
   * Query for the state of the file for resumption.
   *
   * @private
   */
  resume() {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Range', "bytes */" + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess.bind(this);
    xhr.onerror = this.onContentUploadError.bind(this);
    xhr.send();
  }

  /**
   * Extract the last saved range if available in the request.
   *
   * @param {XMLHttpRequest} xhr Request object
   */
  extractRange(xhr) {
    var range = xhr.getResponseHeader('Range');
    if (range) {
      this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }
  }

  /**
  * Handle successful responses for uploads. Depending on the context,
  * may continue with uploading the next chunk of the file or, if complete,
  * invokes the caller's callback.
  *
  * @private
  * @param {object} e XHR event
  */
  onContentUploadSuccess(e) {
    var statusCode = e.target.status;
    if (statusCode === 200 || statusCode === 201) {
      this.onComplete(e.target.response);
    } else if (statusCode === 308) {
      this.extractRange(e.target);
      this.retryHandler.reset();
      this.sendFile();
    } else {
      console.error("Unhandled code " + statusCode);
      console.error(e.target);
    }
  }

  /**
   * Handles errors for uploads. Either retries or aborts depending
   * on the error.
   *
   * @private
   * @param {object} e XHR event
   */
  onContentUploadError(e) {
    if (e.target.status && e.target.status < 500) {
      this.onError(e.target.response);
    } else {
      this.retryHandler.retry(this.resume.bind(this));
    }
  }

  /**
   * Handles errors for the initial request.
   *
   * @private
   * @param {object} e XHR event
   */
  onUploadError(e) {
    this.onError(e.target.response); // TODO - Retries for initial upload
  }

  /**
   * Construct a query string from a hash/object
   *
   * @private
   * @param {object} [params] Key/value pairs for query string
   * @return {string} query string
   */
  buildQuery(params) {
    params = params || {};
    return Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
  }

  /**
   * Build the drive upload URL
   *
   * @private
   * @param {string} [id] File ID if replacing
   * @param {object} [params] Query parameters
   * @param {string} baseUrl Base URL to build from
   * @return {string} URL
   */
  buildUrl(id, params, baseUrl) {
    var url = baseUrl || 'https://www.googleapis.com/upload/drive/v2/files/';
    if (id) {
      url += id;
    }
    var query = this.buildQuery(params);
    if (query) {
      url += '?' + query;
    }
    return url;
  }
}

export default MediaUploader;
