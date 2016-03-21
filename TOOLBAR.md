# Toolbar

__For sample toolbar, refer to [Default Toolbar](toolbars/default_toolbar.html)__

## ExecCommand tools (data-edit)

These are the tools that are available in HTML5 via `document.execCommand()` method.

__For a list of all available commands, refer to [Mozilla execCommand specifications](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)__

Specify the command with `data-edit` attribute.
For example,

```html
<!-- Convert the block into H1 tag -->
<a data-edit="formatBlock <h1>">H1</a>

<!-- Set the selection to Tahoma font -->
<a data-edit="fontName Tahoma">Tahoma</a>

<!-- Insert a HTML block -->
<a data-edit="insertHTML <div class='page-header'><h1>Page Header <small>Small Text</small></h1></div>">
  Page Header
</a>
```

## Actions provided by MonkeyEditor (data-action)

Specify the action with `data-action` attribute.

###Toggle codeview/fullscreen

```html
<!-- Toggle code view -->
<a class="btn btn-default" data-action="codeview" data-enable-codeview><i class="fa fa-code"></i></a>

<!-- Toggle fullscreen -->
<a class="btn btn-default" data-action="fullscreen" data-enable-codeview><i class="fa fa-arrows-alt"></i></a>
```

### Set CSS

```html
<!-- Set user input height -->
<input type=text placeholder="Custom height" class="form-control input-sm"data-action='setCss {"height":"%{value}"}'>

<!-- Remove padding -->
<a data-action='setCss {"padding":&quot;&quot;}'>Remove padding</a>
                
```

###Set fontSize in pixels

Font size cannot be set in pixels using `execCommand`. 

MonkeyEditor provides a way to achieve that using `data-action`.

```html
<!-- Set fontSize in pixels -->
<a data-action="fontSize 13px">13px</a>
```

###Presenting a modal

```html
<!-- Open link modal -->
<!-- Link modal is defined by yourself 
(Not included in MonkeyEditor) -->
<a class="btn btn-default" data-action="openModal link">Link</a>
```

### Add/remove links

Add/remove link to selection text or box. 

```html
<!-- Add Link -->
<input type=text data-action='addLink %{value}'>

<!-- Remove Link -->
<a data-action='removeLink'>RemoveLink</a>
```

###Delegating action

Sometimes, when a button is pressed, action of another input element is invoked.

This can be achieved by setting `data-action="delegate #target_input_element"`.

```html
<!-- Delegate example -->
<!-- Embed area -->
<textarea id=embed_field 
	placeholder="Paste your embed code here"
	class="form-control" 
	data-edit='insertHTML %{value}' 
	rows=5>
</textarea>
<!-- Execute action/command of #embed_field when clicked -->
<button type=button 
	class="btn btn-primary pull-right" 
	data-action="delegate #embed_field">
	Insert
</button>
```

# Helpers

## data-enable-codeview

Enables the button/input even in codeview.

Example

```html
<a class="btn btn-default" data-action="codeview" data-enable-codeview><i class="fa fa-code"></i></a>
```

## data-colorpicker

Helper for [Bootstrap Colorpicker](http://mjolnic.com/bootstrap-colorpicker/)

Example

```html
<input type=text 
  data-colorpicker
  data-format=hex 
  data-align=left 
  data-edit="foreColor %{value}" 
  value=success>
```

## data-monkey-table-picker

Opens up a table dropdown menu to insert a table.

Example

```html
<a data-monkey-table-picker>Table</a>
```

# Modals

Add Modals to toolbar. Modals must be placed inside a tag that has `data-role="editor-modals"` attribute.

Example

```html
<!-- Modals -->
<div class="" data-role="editor-modals">

  <!-- Embed modal -->
  <div class="modal fade" data-modal="embed">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class="btn-toolbar no-float" data-role="editor-toolbar" data-target="#monkey-editor">
            <!-- Embed area -->
            <textarea id=embed_field placeholder="Paste your embed code here" class="form-control"data-edit='insertHTML %{value}' rows=5></textarea>
            <br>
            <button type=button class="btn btn-primary pull-right" data-action="delegate #embed_field">Insert</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Link modal  -->
  <div class="modal fade" data-modal="link">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class="btn-toolbar no-float" data-role="editor-toolbar" data-target="#monkey-editor">
            <!-- Url field -->
            <div class="input-group input-group-sm">
              <span class="input-group-addon"><i class="fa fa-link"></i> URL</span>
              <input type=text placeholder="" class="form-control input-sm"data-action='addLink %{value}'>
              <span class="input-group-btn">
                <a class="btn btn-default" data-action='removeLink' data-toggle=tooltip data-placement=bottom title="Set width to auto"><span class="fa fa-times"></span></a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
