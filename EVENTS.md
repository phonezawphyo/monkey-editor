# Events

```
// Monkey Text Editor
monkey:beforeViewSwitch toView
monkey:afterViewSwitch toView
monkey:execCommand command, args, insertedElement
monkey:execAction action, param
monkey:toggleFullscreen fullscreen(bool)

// Editor
monkey:fileInserted insertedElement
monkey:selectionBoxMoved target
monkey:selectionBoxReplaced target
monkey:selectDiv selectTarget
monkey:afterSelectDiv selectTarget
monkey:unselectDiv selectTarget
monkey:afterUnselectDiv selectTarget
monkey:elementRemoved removedElement

// Input elements on update
// data-action=setCss
monkey:valueUpdated cssProperty, newValue
// Other data-action
monkey:valueUpdated keyword, newValue
```

# Setting up image autoupload to server

## Events to use

```
monkey:fileInserted
monkey:elementRemoved
```

## Example

```js
(function($) {
  var monkey = window.monkey;

  /* Helper to convert data URL to Blob type
   **/
  var dataURLtoBlob = function(dataUrl, callback)
  {
    var req = new XMLHttpRequest;
    req.open( 'GET', dataUrl );
    req.responseType = 'arraybuffer'; // Can't use blob directly because of https://crbug.com/412752
    req.onload = function fileLoaded(e)
    {
      // If you require the blob to have correct mime type
      var mime = this.getResponseHeader('content-type');
      callback( new Blob([this.response], {type:mime}) );
    };
    req.send();
  };

  var sendFile = function(img,callback) {
    dataURLtoBlob(img.src, function(file) {
      var data = new FormData();

      data.append("file",file);

      $.ajax({
        url: "/upload", // Your url
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: "POST",
        success: callback,
      });
    });
  };

  var removeFile = function(url, callback) {
    $.ajax({
      url: "/unupload?url="+escape(url), // Your url
      cache: false,
      contentType: false,
      processData: false,
      type: "DELETE",
      success: callback,
    });
  };

  // monkey initialize callback
  monkey.callbacks.afterInitialize.push(function () {
    var editor = this.editor,
        divSelector = this.divSelector;

    /* File inserted event */
    editor.$.on('monkey:fileInserted', function(e) {
      if (e.insertedElement.tagName==='IMG') {
        // Custom loading style/animation etc.
        var $loading = $('<div class=loading-image></div>'),
        $inserted = $(e.insertedElement);

        // Show loading
        $inserted.hide();
        $inserted.before($loading);

        setTimeout(function() {
          divSelector.triggerSelect($loading[0]);

          // Upload the image
          sendFile(e.insertedElement, function(data) {
            var url = data.scheme + "://" + data.host + data.path;

            $loading.remove();

            $inserted.attr('src', url).show();

            setTimeout(function() {
              // Select the image after upload
              divSelector.triggerSelect($inserted[0]);
            },100);
          });
        }, 100);

      }
    })
    .on('monkey:elementRemoved', function(e){
      if (!!e.removedElement && e.removedElement.tagName === 'IMG') {
        var src = e.removedElement.src;
        removeFile(src);
      }
    })
  });
})(jQuery);
```
