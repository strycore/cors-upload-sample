/* global document */
import MediaUploader from './MediaUploader.js';

class DNDropHandler {
  /**
   * Wire up drag & drop listeners once page loads
   * @param accessToken
   */
  constructor(accessToken) {
    this.accessToken = accessToken;
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', this.onDragOver.bind(this), false);
    dropZone.addEventListener('drop', this.onFilesSelected.bind(this), false);
  }

  /**
   *
   * @param file
   */
  upload(file) {
    var uploader = new MediaUploader({
      file: file,
      token: this.accessToken,
      onComplete: function (data) {
        var element = document.createElement("pre");
        element.appendChild(document.createTextNode(data));
        document.getElementById('results').appendChild(element);
      }
    });
    uploader.upload();
  }

  /**
   * Called when files are dropped on to the drop target. For each file,
   * uploads the content to Drive & displays the results when complete.
   * @param {Event} evt
   * @param {object} evt.dataTransfer
   */
  onFilesSelected(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    for(let i = 0; i < files.length; i++) {
      var file = files[i];
      this.upload(file);
    }
  }

  /**
   * Dragover handler to set the drop effect.
   * @param {Event} evt
   * @param {object} evt.dataTransfer
   */
  onDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }
}

export default DNDropHandler;