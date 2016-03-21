'use strict';
(function($) {
    var monkey = window.monkey;
    monkey.divSelector = {
        options: {
            divSelector: {
                selectableTags: ['DIV','TABLE','IMG','TR','TD','P','BLOCKQUOTE','CODE','H1','H2','H3','H4','H5','H6','H7','OL','UL','LI','IFRAME','EMBED','VIDEO'],
                unremovableTags: ['TR','TD','LI'],
                selectionBoxClass: 'mk-selection-box',
                selectionBoxToolbarClass: 'mk-selection-box-tools',
            },
        },
        views: {
            makeSelectionBox: function () {
                return $('<div>').addClass(this.options.divSelector.selectionBoxClass+' hidden');
            },
            makeToolbar: function () {
                return $('<div class="'+this.options.divSelector.selectionBoxToolbarClass+'">');
            },
            makeDeleteButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-danger btn-delete"><span class="fa fa-trash"></span></a>');
            },
        },
        klass: function(monkeyEditor) {
            var fn = monkey.divSelector.fn;
            this.monkeyEditor = monkeyEditor;
            this.mk = monkeyEditor;
            this.options = monkeyEditor.options;
            this.target = null;
            this.makeSelectionBox = monkey.divSelector.views.makeSelectionBox;
            this.makeDeleteButton = monkey.divSelector.views.makeDeleteButton;
            this.makeSettingButton = monkey.divSelector.views.makeSettingButton;
            this.makeToolbar = monkey.divSelector.views.makeToolbar;
            this.replaceSelectionBox = fn.replaceSelectionBox;
            this.toggleSelectionBox = fn.toggleSelectionBox;
            this.editor = monkeyEditor.editor;
            this.moveSelectionBox = fn.moveSelectionBox;
            this.removeTarget = fn.removeTarget;
            this.isSelected = fn.isSelected;
            this.isTargetRemovable = fn.isTargetRemovable;

            /* Select and unselect methods*/
            this.triggerSelect = fn.triggerSelect;
            this.triggerUnselect = fn.triggerUnselect;

            this.selectableTags = this.options.divSelector.selectableTags;
            this.unremovableTags = this.options.divSelector.unremovableTags;
        },
        fn: {
            toggleSelectionBox: function(show) {
                if (!!this.$) {
                    this.$.toggleClass('hidden',!show);
                }
            },
            isTargetRemovable: function() {
                return (this.unremovableTags.indexOf(this.target.tagName) === -1);
            },
            moveSelectionBox: function(target) {
                target = $(target);
                var pos = target.position();

                if (!pos) {
                    return;
                }
                
                pos.left = pos.left + this.editor.$.scrollLeft();
                pos.top = pos.top + this.editor.$.scrollTop();

                var marginTop = target.css('margin-top'),
                    marginBottom = target.css('margin-bottom'),
                    marginLeft = target.css('margin-left'),
                    marginRight = target.css('margin-right'),
                    paddingTop = target.css('padding-top'),
                    paddingBottom = target.css('padding-bottom'),
                    paddingLeft = target.css('padding-left'),
                    paddingRight = target.css('padding-right'),
                    innerWidth = target.innerWidth(),
                    innerHeight = target.innerHeight(),
                    width = target.outerWidth(true),
                    height = target.outerHeight(true),
                    /* (margin) left, right, top, bottom, (padding) left, right, top, bottom */
                    bgPosition =
                        'left center, right center, center top, center bottom, ' +
                        marginLeft + ' ' + marginTop + ', ' +
                        (parseInt(marginLeft)+innerWidth-parseInt(paddingRight)) + 'px ' + marginTop + ', ' +
                        marginLeft + ' ' + marginTop + ', ' +
                        marginLeft + ' ' + (parseInt(marginTop)+innerHeight-parseInt(paddingBottom)) + 'px',
                    /* (margin) left, right, top, bottom, (padding) left, right, top, bottom */
                    bgSize = 
                        marginLeft + ' 100%,' +
                        marginRight + ' 100%,' +
                        '100% ' + marginTop + ',' +
                        '100% ' + marginBottom + ',' +
                        paddingLeft + ' ' + innerHeight + 'px,' +
                        paddingRight + ' ' + innerHeight + 'px,' +
                        innerWidth + 'px ' + paddingTop + ',' +
                        innerWidth + 'px ' + paddingBottom;

                this.replaceSelectionBox();

                this.$.css({
                    left: pos.left + 'px',
                    top: pos.top + 'px',
                    width: width + 'px',
                    height: height + 'px',
                    'background-position': bgPosition,
                    'background-size': bgSize,
                });

                if (!!this.$deleteButton) {
                    this.$deleteButton.toggle(this.isTargetRemovable());
                }
                
                this.editor.$.trigger({
                    type: 'monkey:selectionBoxMoved',
                    target: this.target,
                });
            },
            replaceSelectionBox: function () {
                var $box = this.editor.$.find('.'+this.options.divSelector.selectionBoxClass);
                // Replace a new box if it was accidentally deleted
                if ($box.length === 0 || $('.'+this.options.divSelector.selectionBoxToolbarClass, $box).length === 0) {
                    $box.remove();
                    var self = this;
                    this.$ = this.makeSelectionBox();
                    this.$toolbar = this.makeToolbar();
                    this.$.append(this.$toolbar);
                    this.editor.$.append(this.$);

                    /* Bindings */
                    this.$deleteButton = this.makeDeleteButton();
                    this.$toolbar.append(this.$deleteButton);
                    this.$deleteButton.on('click', function (e) {
                        self.removeTarget(self.target);
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    });

                    /* Trigger event for extension */
                    this.editor.$.trigger({
                        type: 'monkey:selectionBoxReplaced',
                        $toolbar: self.$toolbar,
                        target: self.target,
                    });

                }
            },
            isSelected: function() {
                return !!this.target;
            },
            triggerSelect: function(target) {
                this.target = target;
                this.editor.$.trigger({
                    type: 'monkey:selectDiv',
                    selectTarget: target,
                });
                this.editor.$.trigger({
                    type: 'monkey:afterSelectDiv',
                    selectTarget: target,
                });
            },
            triggerUnselect: function () {
                if (!!this.target) {
                    this.lastSelectedTarget = this.target;
                }
                this.target = null;
                this.editor.$.trigger({
                    type: 'monkey:unselectDiv',
                    selectTarget: this.target,
                });
                this.editor.$.trigger({
                    type: 'monkey:afterUnselectDiv',
                    selectTarget: this.target,
                });
            },
            removeTarget: function () {
                var $target = $(this.target),
                    mk = this.mk,
                    editor = mk.editor;

                editor.$.trigger({
                    type: 'monkey:elementRemoved',
                    removedElement: this.target,
                });

                this.triggerUnselect();
                $target.remove();
            },
        },
        bindings: {
            editorKeydown: function(e) {
                var divSelector = $(this).data('div-selector');
                // Delete
                if (e.keyCode === 8 && e.shiftKey && divSelector.isSelected()) {
                    divSelector.removeTarget();
                    return false;
                } else
                // 16 = Shift key
                if (e.keyCode !== 16 && !e.ctrlKey && !e.metaKey) {
                    divSelector.triggerUnselect();
                }
            },
            editorClick: function (e) {
                var target = e.target,
                    divSelector = $(this).data('div-selector'),
                    sel = window.getSelection(),
                    isEditor,
                    closest;
                    
                if (!sel.isCollapsed) {
                    var common = sel.getRangeAt(0).commonAncestorContainer;
                    if (!!common) {
                        target = common;
                    }
                }

                closest = $(target).closest(divSelector.selectableTags.join(','));
                isEditor = (closest[0] === this);

                if (!isEditor && target !== this) {
                    /* Target is selectable */
                    if (divSelector.selectableTags.indexOf(target.tagName) > -1) {
                        divSelector.triggerSelect(target);
                    }
                    /* Closest is selectable */
                    else if (divSelector.selectableTags.indexOf(closest[0].tagName) > -1) {
                        divSelector.triggerSelect(closest[0]);
                    }
                } else {
                    divSelector.triggerUnselect();
                }
            },
        },
    };

    monkey.callbacks.afterInitialize.push(function divSelectorAfterInitialize() {
        var editor = this.editor,
            self = this;

        /* Extend options */
        this.extendOptions(monkey.divSelector.options);

        var divSelector = new monkey.divSelector.klass(this);
        this.divSelector = divSelector;

        editor.$.data('div-selector', divSelector);
            
        // Bindings
        editor.$.on('keydown', monkey.divSelector.bindings.editorKeydown);
        editor.$.on('monkey:afterSelectDiv', function (e) {
            divSelector.moveSelectionBox(e.selectTarget);
            divSelector.toggleSelectionBox(true);
        });
        editor.$.on('monkey:afterUnselectDiv', function () {
            divSelector.toggleSelectionBox(false);
        });
        editor.$.on('blur', function () {
            divSelector.triggerUnselect();
        })
        .on('monkey:fileInserted', function(e) {
            setTimeout(function() {
                divSelector.triggerSelect(e.insertedElement);
            },100);
        });
        this.$.on('monkey:beforeViewSwitch', function (e) {
            if (e.toView !== editor) {
                editor.$.find('.'+self.options.divSelector.selectionBoxClass).remove();
            }
        })
        .on('monkey:execCommand', function(e) {
            if (e.command === 'insertHTML' && !!e.insertedElement) {
                setTimeout(function() {
                    divSelector.triggerSelect(e.insertedElement);
                });
            }
        });

        // Bindings
        editor.$.on('click', monkey.divSelector.bindings.editorClick);
    });

    monkey.editor.callbacks.cleanEditingLayers.push(function() {
        var $box = this.mk.divSelector.$;

        if (!!$box) {
            $box.remove();
        }
    });

})(jQuery);
