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

