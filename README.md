# Monkey Editor
WYSIWYG editor inspired by [Bootstrap wysiwyg](https://github.com/steveathon/bootstrap-wysiwyg) and [Summernote](http://summernote.org/)

[Demo](http://editor.pzp.rocks/)

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

__For a more complete toolbar, refer to [Default Toolbar](toolbars/default_toolbar.html)__

__For details, refer to [TOOLBAR.md](TOOLBAR.md)__

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


## Render MonkeyEditor

There are two ways to render monkeyEditor().

### 1. Using data-monkey-editor with default options.

```html
<textarea class="form-control" id="monkey-editor" data-monkey-editor>
</textarea>
```

### 2. Using jQuery

__To see all available options, refer to [OPTIONS.md](OPTIONS.md)__

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

## Events

__To see available events and callbacks, refer to [EVENTS.md](EVENTS.md)__

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
