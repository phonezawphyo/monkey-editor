'use strict';
console.log('main.js');
(function($) {
    var monkey = $.extend(true, {
        callbacks: {
            afterInitialize: [],
            afterExecCommand: [],
            onReturn: [function(e) {
                if (!e.shiftKey) {
                    document.execCommand('insertHTML', false, '<div><br></div><br>');
                    return false;
                } else {
                    return true;
                }
            }],
        },

        views: {
            makeIcon: function(icon) {
                return $('<span>').addClass(this.options.iconPrefix + icon);
            },
            makeEditor: function() {
                return $('<div>').addClass('mk-editable form-control');
            },
        },
        fn: {
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
            execCommand: function (commandAndArgs, value) {
                var arr = commandAndArgs.split(' '),
                    command = arr.shift(),
                    args = arr.join(' ') + (value || '');
                document.execCommand(command, 0, args);
                this.mk.execCallbacks(monkey.callbacks.afterExecCommand);
            },
            extendLocales: function (extLocales) {
                monkey.locales = $.extend(true, extLocales, monkey.locales);
            },
            extendViews: function (extViews) {
                monkey.views = $.extend(true, extViews, monkey.views);
            },
            extendBindings: function (extBindings) {
                monkey.bindings = $.extend(true, extBindings, monkey.bindings);
            },
            extendOptions: function(extOptions) {
                this.options = $.extend(true, extOptions, this.options);
            },
            triggerInsertNode: function (target) {
                this.trigger({
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
            saveSelection: function () {
                this.selectedRange = this.getCurrentRange();
            },
            restoreSelection: function () {
                var selection = window.getSelection();
                if (!!this.selectedRange) {
                    try {
                        selection.removeAllRanges();
                    } catch (ex) {
                        document.body.createTextRange().select();
                        document.selection.empty();
                    }
                    selection.addRange(this.selectedRange);
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
            getCaretPosition: function (elem) {
                if (elem instanceof $) {
                    elem = elem[0];
                }
                elem.focus();
                var range1 = window.getSelection().getRangeAt(0),
                    range2 = range1.cloneRange();
                range2.selectNodeContents(elem);
                range2.setEnd(range1.endContainer, range1.endOffset);
                return range2.toString().length;
            },
            setCaretPosition: function (elem, caretPos) {
                var range;
                if (elem instanceof $) {
                    elem = elem[0];
                }

                if (elem.createTextRange) {
                    range = elem.createTextRange();
                    range.move('character', caretPos);
                    range.select();
                } else {
                    elem.focus();
                    if (elem.selectionStart !== undefined) {
                        elem.setSelectionRange(caretPos, caretPos);
                    }
                }
            },
        },
        bindings: {
        },
    }, (window.monkey || {}));

    window.monkey = monkey;


    $.fn.monkeyEditor = function (options) {
        options = options || {};
        var self = this;
        this.hide();

        /** Default options */
        self.options = $.extend(true, {
            // Set locale
            locale: 'en',

            // Set height of editable area
            height: 450,

            // Icon prefix
            iconPrefix: 'glyphicon glyphicon-',

        }, options);

        this.execCallbacks = monkey.fn.execCallbacks;
        var editor = monkey.views.makeEditor.call(this);

        this.editor = editor;
        this.editor.mk = this;
        this.editor.options = options;
        this.editor.insertAtCaret = monkey.fn.insertAtCaret;
        this.editor.triggerInsertNode = monkey.fn.triggerInsertNode;
        this.editor.triggerUnfocus = monkey.fn.triggerUnfocus;
        this.editor.getCurrentRange = monkey.fn.getCurrentRange;
        this.editor.saveSelection = monkey.fn.saveSelection;
        this.editor.restoreSelection = monkey.fn.restoreSelection;
        this.editor.execCommand = monkey.fn.execCommand;
                
        editor.attr({contenteditable: true});
        editor.data('monkey-editor', this);

        this.extendOptions = monkey.fn.extendOptions;
        
        var initialize = function () {
            editor.css({
                height: self.options.height + 'px',
            });
            self.after(editor);

            // Set translations
            this.t = monkey.locales[this.options.locale];

            // Bindings
            //editor.on('keydown', monkey.bindings.editorKeydown);
           
            // Allow extension of initialize via callback
            this.execCallbacks(monkey.callbacks.afterInitialize);

            this.data('options', options);

            // Render tooltips
            $('body').tooltip({
                selector: '[rel=tooltip]',
            });
        };

        initialize.call(this);

        console.log(this);
        window.mk = this;

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
