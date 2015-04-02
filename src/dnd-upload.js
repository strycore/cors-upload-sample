/* global document Polymer */

import MediaUploader from './MediaUploader.js';


class DNDUpload{

  /**
   * Connect component events
   */
  attached() {
    this.signedIn = false;
    this.accessToken = null;
    this.profile = null;
    this.addEventListener('dragover', this.onDragOver.bind(this), false);
    this.addEventListener('drop', this.onFilesSelected.bind(this), false);
  }

  /**
   * Sign in callback
   * @param {Event} ev Event data
   * @param {object} ev.detail.user.B Google user details
   * @param {object} ev.detail.user.UT Google auth details
   */
  signIn(ev) {
    this.signedIn = true;
    this.accessToken = ev.detail.user.UT.access_token;
    this.profile = ev.detail.user.B;
  }

  /**
   * Sign out callback
   */
  signOut() {
    this.signedIn = false;
    this.accessToken = null;
  }

  /**
   *
   * @param {File} file The file to upload
   */
  upload(file) {
    var self = this;
    var uploader = new MediaUploader({
      file: file,
      token: this.accessToken,
      onComplete: function (data) {
        var element = document.createElement("pre");
        element.appendChild(document.createTextNode(data));
        self.$.results.appendChild(element);
      }
    });
    uploader.upload();
  }

  /**
   * Called when files are dropped on to the drop target. For each file,
   * uploads the content to Drive & displays the results when complete.
   * @param {Event} evt The drop event
   * @param {DataTransfer} [evt.dataTransfer] Dropped info
   */
  onFilesSelected(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    for(var i = 0; i < files.length; i++) {
      var file = files[i];
      this.upload(file);
    }
  }

  /**
   * Dragover handler to set the drop effect.
   * @param {Event} evt The Drag event
   * @param {DataTransfer} [evt.dataTransfer] Drag event info
   */
  onDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }
}

Polymer('dnd-upload', new DNDUpload());
