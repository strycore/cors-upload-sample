/* global document Polymer */

import MediaUploader from './MediaUploader.js';


Polymer({
  is: 'dnd-upload',

  listeners: {
    dragover: 'onDragOver',
    drop: 'onFilesSelected'
  },

  properties: {
    signedIn: {
      type: Boolean,
      value: false
    },
    accessToken: String,
    profile: String
  },

  /**
   * Sign in callback
   * @param {object} response Response from Google signin
   */
  signIn: function(response) {
    this.accessToken = response.detail.access_token;
    this.signedIn = true;
  },

  /**
   * Sign out callback
   */
  signOut: function() {
    this.signedIn = false;
    this.accessToken = null;
  },

  /**
   *
   * @param {File} file The file to upload
   */
  upload: function(file) {
    var self = this;
    var uploader = new MediaUploader({
      file: file,
      token: this.accessToken,
      onComplete: function (data) {
        var element = document.createElement("pre");
        element.appendChild(document.createTextNode(data));
        self.$.results.appendChild(element);
      },
      onError: function(response) {
        var responseData = JSON.parse(response);
        var toast = document.querySelector('#error-message');
        toast.text = responseData.error.message;
        toast.show();
      },
      onProgress: function(ev) {
        var percent = (ev.loaded / ev.total) * 100;
        var progressBar = document.querySelector("#upload-progress");
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
