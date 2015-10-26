'use strict';
(function($) {
    var monkey = window.monkey;
    monkey.divSelector = {
        options: {
            divSelector: {
                selectableTags: ['DIV','TABLE','IMG','TD','P','BLOCKQUOTE','CODE','H1','H2','H3','H4','H5','H6','H7','OL','UL','LI'],
                uneditableTags: ['TD','LI'],
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
            this.isTargetEditable = fn.isTargetEditable;

            /* Select and unselect methods*/
            this.triggerSelect = fn.triggerSelect;
            this.triggerUnselect = fn.triggerUnselect;

            this.selectableTags = this.options.divSelector.selectableTags;
            this.uneditableTags = this.options.divSelector.uneditableTags;
        },
        fn: {
            toggleSelectionBox: function(show) {
                if (!!this.$) {
                    this.$.toggleClass('hidden',!show);
                }
            },
            isTargetEditable: function() {
                return (this.uneditableTags.indexOf(this.target.tagName) === -1);
            },
            moveSelectionBox: function(target) {
                target = $(target);
                var pos = target.position();
                
                pos.left = pos.left + this.editor.$.scrollLeft();
                pos.top = pos.top + this.editor.$.scrollTop();

                var marginTop = target.css('margin-top'),
                    marginBottom = target.css('margin-bottom'),
                    marginLeft = target.css('margin-left'),
                    marginRight = target.css('margin-right');

                this.replaceSelectionBox();

                this.$.css({
                    left: pos.left + 'px',
                    top: pos.top + 'px',
                    width: target.outerWidth(true) + 'px',
                    height: target.outerHeight(true) + 'px',
                    'background-size':
                        marginLeft + ' 100%,' +
                        marginRight + ' 100%,' +
                        '100% ' + marginTop + ',' +
                        '100% ' + marginBottom,
                });

                if (!!this.$deleteButton) {
                    this.$deleteButton.toggle(this.isTargetEditable());
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
                var $target = $(this.target);

                this.triggerUnselect();
                $target.remove();
                /*
                return;
                editor.selectNode(target);
                if (target.tagName === 'H1') {
                    document.execCommand('formatBlock', false, '<div>');
                    editor.selectNode(target);
                }
                document.execCommand('delete', false);
               */
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
                    closest = $(e.target).closest(divSelector.selectableTags.join(',')),
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
        editor.$.on('monkey:insertNode', function (e) {
            divSelector.triggerSelect(e.insertTarget);
            editor.focus();
        });
        editor.$.on('blur', function () {
            divSelector.triggerUnselect();
        });
        this.$.on('monkey:beforeViewSwitch', function (e) {
            if (e.toView !== editor) {
                editor.$.find('.'+self.options.divSelector.selectionBoxClass).remove();
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
