'use strict';
(function($) {
    /* Core methods */
    var monkey = $.extend(true, {
        klass: function (elem, options) {
            options = options || {};

            this.$ = elem;

            /** Default options */
            this.options = $.extend(true, {
                // Set height of editable area
                height: 450,

                // Icon prefix
                iconPrefix: 'glyphicon glyphicon-',

                // Resize bar
                resizer: true,

                // Beautify-html options
                beautifyHtml: {
                    'indent_size': 2,
                    'preserve_newlines': true,
                },

            }, options);

            /* Utilities */
            this.applyChanges = monkey.fn.applyChanges;
            this.execCallbacks = monkey.fn.execCallbacks;
            this.extendOptions = monkey.fn.extendOptions;
            this.switchView = monkey.fn.switchView;
            this.toggleFullscreen = monkey.fn.toggleFullscreen;
            this.tidyHtml = monkey.fn.tidyHtml;
            
            /* Init wrapper with resizer */
            this.wrapper = new monkey.wrapper.klass(this);

            /* Init editor */
            this.editor = new monkey.editor.klass(this);

            /* Init codeview */
            this.codeview = new monkey.codeview.klass(this);
            
            /* Allow extension of initialize via callback */
            this.execCallbacks(monkey.callbacks.afterInitialize);
        },

        callbacks: {
            afterInitialize: [],
        },

        fn: {
            applyChanges: function (val) {
                this.$.val(val);
            },
            execCallbacks: function (callbacks, e) {
                if (!!callbacks) {
                    if (callbacks instanceof Array) {
                        var self = this;
                        var res = true;
                        callbacks.forEach(function execCallbacksEach(fn) {
                            res = monkey.fn.execCallbacks.call(self, fn, e) && res;
                        });
                        return res;
                    } else if (typeof callbacks==='function') {
                        return callbacks.call(this, e);
                    }
                }
            },
            extendOptions: function(extOptions) {
                this.options = $.extend(true, extOptions, this.options);
            },
            switchView: function(toView) {
                this.$.trigger({
                    type: 'monkey:beforeViewSwitch',
                    toView: toView,
                });

                this.previousView = this.activeView;
                this.activeView = toView;

                this.$.trigger({
                    type: 'monkey:afterViewSwitch',
                    toView: toView,
                });
            },
            toggleFullscreen: function(fullscreen) {
                this.wrapper.$.toggleClass('mk-fullscreen', fullscreen);
                this.fullscreen = fullscreen;
                this.$.trigger({
                    type: 'monkey:toggleFullscreen',
                    fullscreen: fullscreen,
                });
            },
            /* jshint ignore:start */
            tidyHtml: function (code) {
                if (window.html_beautify) {
                    return window.html_beautify(code, this.options.beautifyHtml);
                } else {
                    return code;
                }
            },
            /* jshint ignore:end */
        },
        bindings: {
        },
    }, (window.monkey || {}));

    /* Views wrapper and resizer */
    monkey.wrapper= {
        klass: function (mk) {
            this.$ = monkey.wrapper.views.makeWrapper(mk);
            this.$.insertAfter(mk.$);

            if (mk.options.resizer) {
                this.$resizer = monkey.wrapper.views.makeResizer(mk, this).insertAfter(this.$);

                /* Bindings */
                this.$resizer.on('mousedown', monkey.wrapper.bindings.resizeBarMousedown);
            }

        },
        views: {
            makeWrapper: function(monkeyEditor) {
                return $('<div class="mk-wrapper">')
                .css({height: monkeyEditor.options.height });
            },
            makeResizer: function(monkeyEditor, wrapper) {
                wrapper.$.addClass('mk-resizable');

                return $('<div class="mk-resize">')
                .data('monkey-editor', monkeyEditor)
                .append($('<span class="icon-bar">'))
                .append($('<span class="icon-bar">'))
                .append($('<span class="icon-bar">'));
            },
        },
        bindings: {
            resizeBarMousedown: function (e) {
                var $this = $(this),
                    $document = $(document),
                    mk = $this.data('monkey-editor'),
                    $wrapper = mk.wrapper.$,
                    minHeight = 13,
                    top = $wrapper.offset().top - $document.scrollTop(),
                    paddings = $wrapper.outerHeight() - $wrapper.height();

                e.preventDefault();
                e.stopPropagation();

                $wrapper.addClass('mk-resizing');

                $document.on('mousemove', function (e) {
                    var newHeight = e.clientY - top - paddings;
                    $wrapper.height(Math.max(newHeight, minHeight));
                }).one('mouseup', function () {
                    $document.off('mousemove');
                    $wrapper.removeClass('mk-resizing');
                });
            },
        },
    };

    /* Editor related methods */
    monkey.editor = {
        klass: function (monkeyEditor) {
            var self = this;
            this.mk = monkeyEditor;
            this.$ = monkey.editor.views.makeEditor(this.mk);
            this.$.appendTo(this.mk.wrapper.$);
            this.options = this.mk.options;

            var fn = monkey.editor.fn;
            this.code = fn.code;
            this.execCommand = fn.execCommand;
            this.cleanEditingLayers = fn.cleanEditingLayers;

            this.nextInsertId = fn.nextInsertId;
            this.insertAtCaret = fn.insertAtCaret;

            this.triggerUnfocus = fn.triggerUnfocus;
            this.triggerInsertNode = fn.triggerInsertNode;

            this.saveSelection = fn.saveSelection;
            this.restoreSelection = fn.restoreSelection;
            this.isSelectionCollapsed = fn.isSelectionCollapsed;
            this.getCurrentRange = fn.getCurrentRange;
            this.selectNode = fn.selectNode;

            this.handleDroppedContent = fn.handleDroppedContent;

            /* Bindings */
            var bindings = monkey.editor.bindings;
            this.$.on('dragover', false);
            this.$.on('dragenter ', function() {
                $(this).addClass('dragover');
            });
            this.$.on('dragleave dragend drop', function() {
                $(this).removeClass('dragover');
            });
            this.$.on('blur', function() {
                self.mk.applyChanges(self.code());
            });
            this.$.on('drop', bindings.fileDrop);
            this.mk.$.on('monkey:beforeViewSwitch', bindings.beforeViewSwitch);
            this.mk.$.on('monkey:afterViewSwitch', bindings.afterViewSwitch);
        },
        views: {
            makeEditor: function(monkeyEditor) {
                return $('<div class="mk-editable form-control">')
                .data('monkey-editor', monkeyEditor)
                .attr({contenteditable: true});
            },
        },
        callbacks: {
            cleanEditingLayers: [],
        },
        fn: {
            cleanEditingLayers: function () {
                var self = this;
                monkey.editor.callbacks.cleanEditingLayers.forEach(function execCallbacksEach(fn) {
                    fn.call(self);
                });
            },
            code: function () {
                this.cleanEditingLayers();
                return this.$.html();
            },
            execCommand: function (commandAndArgs, value) {
                var arr = commandAndArgs.split(' '),
                    command = arr.shift(),
                    insertId,
                    insertedElement,
                    argsWithMonkeyId,
                    args= arr.join(' ') + (value || '');

                if (command.indexOf('insert') === 0 && !!args) {
                    insertId = this.nextInsertId();
                    if (command === 'insertImage') {
                        argsWithMonkeyId = $('<img>').attr({src: args}).css({width: '100%'});
                        command = 'insertHTML';
                    } else {
                        argsWithMonkeyId = $(args);
                    }
                    argsWithMonkeyId = argsWithMonkeyId.attr({ 'data-monkey-id': insertId })[0].outerHTML;
                    document.execCommand(command, 0, argsWithMonkeyId);
                } else {
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand(command, 0, args);
                }

                if (!!insertId) {
                    insertedElement = $('[data-monkey-id="'+insertId+'"]');
                    insertedElement.attr('data-monkey-id', null);
                    insertedElement = insertedElement[0];
                }

                this.mk.$.trigger({
                    type: 'monkey:execCommand',
                    command: command,
                    args: args,
                    insertedElement: insertedElement,
                });

                return insertedElement;
            },
            nextInsertId: function() {
                if (!this.insertId) {
                    this.insertId = 1;
                }
                return 'monkey' + (this.insertId++);
            },
            extendViews: function (extViews) {
                monkey.views = $.extend(true, extViews, monkey.views);
            },
            extendBindings: function (extBindings) {
                monkey.bindings = $.extend(true, extBindings, monkey.bindings);
            },
            triggerInsertNode: function (target) {
                this.$.trigger({
                    type: 'monkey:insertNode',
                    insertTarget: target,
                });
            },
            getCurrentRange: function () {
                var sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    return sel.getRangeAt(0);
                }
            },
            selectNode: function (elem) {
                var range = document.createRange();
                range.selectNode(elem);
                try {
                    window.getSelection().removeAllRanges();
                } catch (ex) {
                    document.body.createTextRange().select();
                    document.selection.empty();
                }
                window.getSelection().addRange(range);
            },
            saveSelection: function () {
                this.selectedRange = this.getCurrentRange();
            },
            isSelectionCollapsed: function () {
                if (!!this.selectedRange) {
                    return this.selectedRange.collapsed;
                } else {
                    return true;
                }
            },
            restoreSelection: function (to) {
                var selection = window.getSelection();
                to = to || this.selectedRange;
                if (!!to) {
                    try {
                        selection.removeAllRanges();
                    } catch (ex) {
                        document.body.createTextRange().select();
                        document.selection.empty();
                    }
                    selection.addRange(to);
                }
            },
            insertAtCaret: function (html) {
                var doc = document;
                var range;
                if (html instanceof $) {
                    html = html[0];
                }
                // IE <= 10
                if (document.selection){
                    range = doc.selection.createRange();
                    range.pasteHTML(html);
                    this.triggerInsertNode(html);
                
                // IE 11 && Firefox, Opera .....
                } else if (document.getSelection){
                    range = doc.getSelection().getRangeAt(0);
                    //range.surroundContents(html);
                    range.insertNode(html);
                    this.triggerInsertNode(html);
                }
            },
            moveCaret: function (win, charCount) {
                var sel, range;
                if (win.getSelection) {
                    sel = win.getSelection();
                    if (sel.rangeCount > 0) {
                        var textNode = sel.focusNode;
                        var newOffset = sel.focusOffset + charCount;
                        sel.collapse(textNode, Math.min(textNode.length, newOffset));
                    }
                } else if ( (sel = win.document.selection) ) {
                    if (sel.type !== 'Control') {
                        range = sel.createRange();
                        range.move('character', charCount);
                        range.select();
                    }
                }
            },
            handleDroppedContent: function(dataTransfer) {
                // Dropped from another website 
                //console.log('org.chromium.image-html',e.originalEvent.dataTransfer.getData('org.chromium.image-html'));
                var textHtml = dataTransfer.getData('text/html'),
                    textPlain = dataTransfer.getData('text/plain'), // Safari
                    dataUrl;

                if (!!textHtml) {
                    dataUrl = $(textHtml).filter('img').attr('src');
                    if (!dataUrl) {
                        dataUrl = $(textHtml).find('img').attr('src');
                    }
                } else {
                    dataUrl = textPlain;
                }

                if (!!dataUrl) {
                    var inserted = this.execCommand('insertImage ' + dataUrl);
                    this.$.trigger({
                        type: 'monkey:contentDropped',
                        insertedElement: inserted,
                    });
                    return true;
                }
                return false;
            },
        },
        bindings: {
            fileDrop: function(e) {
                var mk = $(this).data('monkey-editor'),
                    editor = mk.editor;

                if (editor.handleDroppedContent(e.originalEvent.dataTransfer)) {
                    e.stopPropagation();
                    e.preventDefault();
                } else {
                }
            },
            beforeViewSwitch: function (e) {
                var $mk = $(this),
                    mk = $mk.data('monkey-editor');
                    
                if (e.toView !== mk.editor) {
                    mk.editor.$.hide();
                }
            },
            afterViewSwitch: function (e) {
                var $mk = $(this),
                    mk = $mk.data('monkey-editor');

                if (e.toView === mk.editor) {
                    mk.editor.$.show();
                    if (!!mk.previousView) {
                        mk.editor.$.html(mk.previousView.code());
                    }
                }
            },
        },
    };

    monkey.codeview = {
        klass: function (monkeyEditor) {
            var self = this;
            this.mk = monkeyEditor;
            this.options = this.mk.options;
            this.$ = monkey.codeview.views.makeCodeview(monkeyEditor).appendTo(this.mk.wrapper.$);
            this.code = monkey.codeview.fn.code;

            /* Bindings */
            this.mk.$.on('monkey:beforeViewSwitch', monkey.codeview.bindings.beforeViewSwitch);
            this.mk.$.on('monkey:afterViewSwitch', monkey.codeview.bindings.afterViewSwitch);
            this.$.on('blur', function() {
                self.mk.applyChanges(self.code());
            });
        },
        views: {
            makeCodeview: function(monkeyEditor) {
                return $('<textarea class="mk-codeview form-control">')
                .data('monkey-editor', monkeyEditor)
                .attr({contenteditable: true});
            },
        },
        fn: {
            code: function () {
                return this.$.val();
            },
        },
        bindings: {
            beforeViewSwitch: function (e) {
                var $mk = $(this),
                    mk = $mk.data('monkey-editor');
                    
                if (e.toView !== mk.codeview) {
                    mk.codeview.$.hide();
                }
            },
            afterViewSwitch: function (e) {
                var $mk = $(this),
                    mk = $mk.data('monkey-editor');

                if (e.toView === mk.codeview) {
                    mk.codeview.$.show();
                    if (!!mk.previousView) {
                        var tidied = mk.tidyHtml(mk.previousView.code());
                        mk.codeview.$.val(tidied);
                    }
                }
            },
        },
    };

    window.monkey = monkey;

    $.fn.monkeyEditor = function (options) {
        options = options || {};
        this.css({height:'0px',width:'0px',opacity: 0, position: 'absolute'});
        this.mk = new monkey.klass(this, options);
        this.data('monkey-editor', this.mk);
        this.data('options', this.mk.options);

        this.mk.editor.$.html(this.val());

        /* Set default view */
        this.mk.switchView(this.mk.editor);

        /* Set no fullscreen by default */
        this.mk.toggleFullscreen(false);
            
        /* Bindings */
        //editor.on('keydown', monkey.bindings.editorKeydown);

        /* Render tooltips */
        $('[data-toggle="tooltip"]').tooltip({
            container: 'body',
            viewport: 'body',
        });

        window.mk = this.mk;

        return this;
    };

    /* Make attribute initializer.
     * */
    $(function() {
        $('[data-monkey-editor]').each(function() {
            var $this = $(this).attr('data-monkey-editor',null);
            // Set custom options here
            var options = {
            };
            $this.monkeyEditor(options);
        });
    });
})(jQuery);
