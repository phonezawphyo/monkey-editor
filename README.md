# Monkey Editor
WYSIWYG editor inspired by [Bootstrap wysiwyg](https://github.com/steveathon/bootstrap-wysiwyg) and [Summernote](http://summernote.org/)

# Usage
## Add CSS
OPTIONAL bootstrap and font-awesome styles

```html
<!-- Bootstrap (Optional) -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
<!-- Font awesome (Optional) -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
```

REQUIRED Monkey Editor css after vendor stylesheets.

```html
<!-- Monkey editor -->
<link rel="stylesheet" href="dist/styles/monkey-editor.css">
```

## Add Javascript
REQUIRED jQuery

```html
<script src="https://code.jquery.com/jquery-2.2.2.min.js"></script>
```

OPTIONAL Bootstrap

```html
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
```

REQUIRED monkey editor after vendor javascripts.

```html
<script src="bower_components/monkey_editor/dist/scripts/monkey-editor.js">
```

## Add Toolbar

```html
<div class="btn-toolbar" data-role="editor-toolbar" data-target="#monkey-editor">
  <div class="btn-group btn-group-sm">
    <!-- Code view -->
    <a class="btn btn-default" data-action="codeview" data-enable-codeview data-toggle=tooltip data-placement=bottom title="Code View"><i class="fa fa-code"></i></a>
    <!-- Fullscreen -->
    <a class="btn btn-default" data-action="fullscreen" data-enable-codeview data-toggle=tooltip data-placement=bottom title="Fullscreen"><i class="fa fa-arrows-alt"></i></a>
  </div>
  ...
  ...
  ...
</div>
```

For a more complete toolbar, refer to [toolbar](toolbars/default_toolbar.html)

## Render MonkeyEditor

There are two ways to render monkeyEditor().

### 1. Using data-monkey-editor with default options.

```html
<textarea class="form-control" id="monkey-editor" data-monkey-editor>
</textarea>
```

### 2. Using jQuery

```html
<textarea class="form-control" id="monkey-editor">
</textarea>
<script>
  /* Invoke monkeyEditor with options */
  $('#monkey-editor').monkeyEditor({
    "beautifyHtml":{
      "indent_size":2,
      "preserve_newlines": true,
    },
  });
</script>
```

# Options
```javascript
{
  /* Editor height */
  "height":450,

  /* Toggle textarea resize bar */
  "resizer":true,

  /* Options for js-beautify for code beautification.
   * For more js-beautify options,
   *    https://github.com/beautify-web/js-beautify
   */
  "beautifyHtml":{
    "indent_size":2,
    "preserve_newlines":true
  },
  
  /* Options for image */
  "image":{
    /* Save images as objectUrl. 
     * If set to false, images will be embedded into document as base64 format.
     * Set it to true if you intend to integrate image upload to an image server. */
    "objectUrl":true
  }

  /* Options for popup modals */
  "modal":{
    /* Attribute that identifies modal elements */
    "modalKey":"data-modal",
    
  	 /* Selector for all modals */
    "selector":"[data-role=editor-modals] > .modal",
  },
  
  /* Div inserter options */
  "spaceDivs":{
  
    /* Delay in milliseconds before moving div inserters */
    "moveDelay":0,
    
    /* Delay in milliseconds before hiding div inserters */
    "hideDelay":0,
    
    /* Do not show div inserters for the following tags. */
    "excludeTags":[
       "TD",
       "TH",
       "TR",
    ]
  },
  
  /* Toolbar options */
  "toolbar":{
    /* Attribute name for editor buttons */
    "commandKey":"data-edit",
    
    /* Attribute name for action buttons */
    "actionKey":"data-action",
    
    /* Selector for toolbar */
    "selector":"[data-role=editor-toolbar]",
    
    "activeClass":"active",
    "disabledClass":"disabled",
    
    /* Enable the buttons with the following attribute 
     * while codeview is toggled. 
     * If the attribute is absent, the button will be disabled. */
    "enableOnCodeviewSelector":"[data-enable-codeview]",
    
    /* Selector of all command buttons */
    "commandBtnSelector":"a[data-edit],button[data-edit],input[type=button][data-edit]",
    
    /* Selector for all action buttons */
    "actionBtnSelector": "a[data-action],button[data-action],input[type=button][data-action]",
    
    /* Selector for all input boxes that should trigger 
     * events when enter key is hit. */
    "keydownTriggerInputSelector": "input:not([type]),input[type=text],input[type=number]",
    
    /* Selector for all input elements that should trigger
     * events on value change. */
    "changeTriggerInputSelector": "input[type=color],[data-colorpicker]",
    
    /* File element selector */
    "fileSelector": "input[type=file]",
  },

  /* Options for selection box */
  "divSelector":{

    /* Tags that can be selected.
     * List of tagnames in capital letters. 
     */
    "selectableTags":[
      "DIV",
      "TABLE",
      "IMG",
      "TR",
      "TD",
      "P",
      "BLOCKQUOTE",
      "CODE",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "H7",
      "OL",
      "UL",
      "LI",
      "IFRAME",
      "EMBED",
      "VIDEO"
    ],

    /* Tags that cannot be removed.
     * List of tagnames in capital letters. 
     */
    "unremovableTags":[
      "TR",
      "TD",
      "LI"
    ],

	 /* Classes of selection box and selection box mini toolbar.
	  * Do not change if you don't know what you are doing */
    "selectionBoxClass":"mk-selection-box",
    "selectionBoxToolbarClass":"mk-selection-box-tools"
  },

  /* Options for copy/paste feature */
  "copier":{
    /* Tags that cannot be copied */
    "nonInsertableTags":[
      "TR",
      "TH",
      "TD",
      "LI"
    ],
    /* Tags that will be replaced on paste */
    "replaceableTags":[
      "TABLE",
      "IMG",
      "DIV"
    ]
  },
}
```


# Toolbar


# Development
## Installation

### 1. Ruby and Compass
Make sure [Ruby](https://github.com/rbenv/rbenv) is installed

Install compass

	gem install compass
	
### 2. Install nodejs and grunt

Make sure [Nodejs](https://nodejs.org/en/download/package-manager/) is installed

Install nodejs packages

	npm install
	
### 3. Install bower packages
	
	bower install && \
	cd test && \
	bower install && \
	cd ..
	
## Running

### 1. Development server

	grunt serve
	
### 2. Building distribution files

	grunt build
	
### 3. Test and build dist

	grunt