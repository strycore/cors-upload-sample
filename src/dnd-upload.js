/* global document Polymer */

import MediaUploader from './MediaUploader.js';


Polymer({
  is: 'dnd-upload',

  properties: {
    uploadUrl: {
      type: String,
      value: 'https://www.googleapis.com/upload/drive/v2/files/'
    },
    accessToken: String,
    profile: String
  },

  listeners: {
    dragover: 'onDragOver',
    drop: 'onFilesSelected'
  },

  /**
   *
   * @param {File} file The file to upload
   */
  upload: function(file) {
    var self = this;
    var uploader = new MediaUploader({
      file: file,
      baseUrl: this.uploadUrl,
      token: this.accessToken,
      onComplete: function (data) {
        var element = document.createElement("pre");
        element.appendChild(document.createTextNode(data));
        self.$.results.appendChild(element);
      },
      onError: function(response) {
        var responseData;
        var errorMessage;
        try {
          responseData = JSON.parse(response);
          errorMessage = responseData.error.message;
        } catch (e) {
          errorMessage = response;
        }
        if (!errorMessage) {
          errorMessage = "Unhandled error while uploading document";
        }
        var toast = self.$['error-message'];
        toast.text = errorMessage;
        toast.show();
      },
      onProgress: function (ev) {
        var percent = (ev.loaded / ev.total) * 100;
        var progressBar = self.$['upload-progress'];
        progressBar.value = percent;
      }
    });
    uploader.upload();
  },

  /**
   * Called when files are dropped on to the drop target. For each file,
   * uploads the content to Drive & displays the results when complete.
   * @param {Event} evt The drop event
   * @param {DataTransfer} [evt.dataTransfer] Dropped info
   */
  onFilesSelected: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    for(var i = 0; i < files.length; i++) {
      var file = files[i];
      this.upload(file);
    }
  },

  /**
   * Dragover handler to set the drop effect.
   * @param {Event} evt The Drag event
   * @param {DataTransfer} [evt.dataTransfer] Drag event info
   */
  onDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }
});
