'use strict';
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
            var fn = monkey.copier.fn,
                views = monkey.copier.views;

            this.mk = monkeyEditor;
            this.options = monkeyEditor.options;
            this.copy = fn.copy;
            this.paste = fn.paste;
            this.insertable = fn.insertable;
            this.replaceable = fn.replaceable;
            this.copiedContent = null;

            // Views
            this.makeCopyButton = views.makeCopyButton;
            this.makePasteButton = views.makePasteButton;
        },

        views: {
            makeCopyButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-default btn-copy"><span class="fa fa-files-o"></span></a>');
            },
            makePasteButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-default btn-paste"><span class="fa fa-clipboard"></span></a>');
            },
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
            makeCutOrCopy: function(cutOrCopy) {
                return function(e) {
                    var mk = $(this).data('monkey-editor'),
                        editor = mk.editor,
                        divSelector = mk.divSelector,
                        copier = mk.copier,
                        stuff = divSelector.target,
                        isCaretCollapsed = document.getSelection().isCollapsed;

                    if (isCaretCollapsed) {
                        copier.copiedContent = stuff;
                        editor.selectNode(stuff);

                        if (cutOrCopy === 'cut') {
                            divSelector.triggerUnselect();
                        }

                        document.execCommand(cutOrCopy);

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    } else {
                        copier.copiedContent = null;
                    }
                };
            },
            paste: function(e) {
                var mk = $(this).data('monkey-editor'),
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
                            var $replacement = $(copied).clone();
                            // Replace
                            // Delete the selected target
                            divSelector.triggerUnselect();
                            $(target).replaceWith($replacement);
                            setTimeout(function() {
                                divSelector.triggerSelect($replacement[0]);
                            });
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
                            // Let it insert naturally
                            document.execCommand('insertHTML', false, copied.outerHTML);
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
            divSelector = this.divSelector,
            copier = new monkey.copier.klass(this),
            bindings = monkey.copier.bindings;

        this.copier = copier;

        editor.$.on('keydown', null, 'ctrl+c meta+c', bindings.makeCutOrCopy('copy'));
        editor.$.on('keydown', null, 'ctrl+x meta+x', bindings.makeCutOrCopy('cut'));
        editor.$.on('keydown', null, 'ctrl+v meta+v', bindings.paste);
        editor.$.on('monkey:selectionBoxReplaced', function() {
            var copy = bindings.makeCutOrCopy('copy'),
                savedRange = editor.getCurrentRange();

            copier.$pasteButton = copier.makePasteButton();
            copier.$copyButton = copier.makeCopyButton();
            divSelector.$toolbar.prepend(copier.$pasteButton).prepend(copier.$copyButton);

            copier.$copyButton.on('click', function(e) {
                editor.restoreSelection(savedRange);
                copy.call(editor.$, e);
            });

            copier.$pasteButton.on('click', function(e) {
                editor.restoreSelection(savedRange);
                bindings.paste.call(editor.$, e);
            });
        }).on('monkey:selectionBoxMoved', function() {
            var toggle = divSelector.isTargetEditable();
                
            if (!!copier.$pasteButton) {
                copier.$pasteButton.toggle(toggle);
            }

            if (!!copier.$copyButton) {
                copier.$copyButton.toggle(toggle);
            }
        });
    });

})(jQuery);
