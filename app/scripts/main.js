'use strict';
console.log('main.js');
(function($) {
    var monkey = $.extend(true, {
        callbacks: {
            afterInitialize: [],
            afterEditorKeydown: [],
            onReturn: [function(e) {
                if (!e.shiftKey) {
                    document.execCommand('insertHTML', false, '<br><br>');
                    //monkey.fn.moveCaret(window,1);
                    return false;
                    return true;
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
            extendLocales: function (extLocales) {
                monkey.locales = $.extend(true, extLocales, monkey.locales);
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
                    if (sel.type != "Control") {
                        range = sel.createRange();
                        range.move("character", charCount);
                        range.select();
                    }
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
                
                // IE 11 && Firefox, Opera .....
                } else if (document.getSelection){
                    range = doc.getSelection().getRangeAt(0);
                    //range.surroundContents(html);
                    range.insertNode(html);
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
            setCaretPosition: function (elem, pos) {
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
            insertAtCaret2: function (html, selectPastedContent) {
                var sel, range;
                if (window.getSelection) {
                    // IE9 and non-IE
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
            
                        // Range.createContextualFragment() would be useful here but is
                        // only relatively recently standardized and is not supported in
                        // some browsers (IE9, for one)
                        var el = document.createElement('div');
                        el.innerHTML = html;
                        var frag = document.createDocumentFragment(), node, lastNode;
                        while ( (node = el.firstChild) ) {
                            lastNode = frag.appendChild(node);
                        }
                        var firstNode = frag.firstChild;
                        range.insertNode(frag);
            
                        // Preserve the selection
                        if (lastNode) {
                            range = range.cloneRange();
                            range.setStartAfter(lastNode);
                            if (selectPastedContent) {
                                range.setStartBefore(firstNode);
                            } else {
                                range.collapse(true);
                            }
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } else if ( (sel = document.selection) && sel.type !== 'Control') {
                    // IE < 9
                    var originalRange = sel.createRange();
                    originalRange.collapse(true);
                    sel.createRange().pasteHTML(html);
                    if (selectPastedContent) {
                        range = sel.createRange();
                        range.setEndPoint('StartToStart', originalRange);
                        range.select();
                    }
                }
            },
        },
        bindings: {
            editorKeydown: function (e) {
                //var editor = $(this).data("monkey-editor");
                if (e.keyCode === 13) {
                    // insert 2 br tags 
                    // (if only one br tag is inserted the cursor won't go to the next line)
                    return monkey.fn.execCallbacks.call(this, monkey.callbacks.onReturn, e);
                }
                // Allow extension of editor keydown event
                monkey.fn.execCallbacks.call(this, monkey.callbacks.afterEditorKeydown);
            },
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

        var editor = monkey.views.makeEditor.call(this);
                
        editor.attr({contenteditable: true});
        editor.data('monkey-editor', this);

        this.extendOptions = function(extOptions) {
            this.options = $.extend(true, extOptions, this.options, this.options);
        };
        
        var initialize = function () {
            editor.css({
                height: self.options.height + 'px',
            });
            self.after(editor);

            // Set translations
            this.t = monkey.locales[this.options.locale];

            // Bindings
            editor.on('keydown', monkey.bindings.editorKeydown);
           
            // Allow extension of initialize via callback
            monkey.fn.execCallbacks.call(self, monkey.callbacks.afterInitialize);

            this.data('options', options);
        };

        initialize.call(this);

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
