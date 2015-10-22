'use strict';
console.log('06-copier.js');
(function($) {
    var monkey = window.monkey;
    monkey.copier = {
        options: {
            copier: {
                nonInsertableTags: ['TR','TH','TD','LI'],
                replaceableTags: ['TABLE','IMG','DIV'],
            },
        },
        klass: function(monkeyEditor) {
            var fn = monkey.copier.fn;
            this.mk = monkeyEditor;
            this.options = monkeyEditor.options;
            this.copy = fn.copy;
            this.paste = fn.paste;
            this.insertable = fn.insertable;
            this.replaceable = fn.replaceable;
            this.copiedContent = null;
        },

        fn: {
            insertable: function(elem) {
                if (elem instanceof HTMLElement) {
                    return this.options.copier.nonInsertableTags.indexOf(elem.tagName) === -1;
                } else {
                    return true;
                }
            },
            replaceable: function(replaceElem, withElem) {
                var replaceableTags = this.options.copier.replaceableTags;
                console.log(this.options);
                if (!replaceElem || !withElem) {
                    return false;
                }
                if (replaceElem.tagName === withElem.tagName) {
                    return true;
                } else if (replaceableTags.indexOf(replaceElem.tagName) > -1 && replaceableTags.indexOf(withElem.tagName) > -1) {
                    return true;
                }
                return false;
            },
        },
            
        bindings: {
            copy: function(e) {
                var mk = $(this).data('monkey-editor'),
                    editor = mk.editor,
                    divSelector = mk.divSelector,
                    copier = mk.copier,
                    stuff = divSelector.target,
                    isCaretCollapsed = document.getSelection().isCollapsed;

                if (isCaretCollapsed) {
                    copier.copiedContent = stuff;
                    editor.selectNode(stuff);
                    console.log('copy', document.execCommand('copy'));
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else {
                    copier.copiedContent = null;
                }
            },
            paste: function(e) {
                var mk = $(this).data('monkey-editor'),
                    editor = mk.editor,
                    copier = mk.copier,
                    divSelector = mk.divSelector,
                    copied = copier.copiedContent,
                    isElementCopied = (copied instanceof HTMLElement),
                    target = divSelector.target;

                // Selected
                if (!!target) {
                    // Element copied
                    if (isElementCopied) {
                        // Replace if replaceable
                        if (copier.replaceable(target, copied)) {
                            // Replace
                            // Delete the selected target
                            divSelector.removeTarget();
                            // Let it insert naturally
                            return;
                        }
                        // Element not copied
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    } else {
                        divSelector.triggerUnselect();
                    }
                } else {
                    // Element copied?
                    if (isElementCopied) {
                        // insert if insertable
                        if (copier.insertable(copied)) {
                            //console.log('paste', document.execCommand('paste'));
                            // Let it insert naturally
                            return;
                            //mk.editor.insertAtCaret(copied);
                        }
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    } else {
                        // default
                    }
                }
            },
        },
    };

    monkey.callbacks.afterInitialize.push(function copyAfterInitialize() {
        /* Extend options */
        this.extendOptions(monkey.copier.options);

        var editor = this.editor,
            self = this,
            copier = new monkey.copier.klass(this),
            fn = monkey.copier.fn,
            bindings = monkey.copier.bindings;

        this.copier = copier;

        editor.$.on('keydown', null, 'ctrl+c, meta+c', bindings.copy);
        editor.$.on('keydown', null, 'ctrl+v, meta+v', bindings.paste);
    });

})(jQuery);
