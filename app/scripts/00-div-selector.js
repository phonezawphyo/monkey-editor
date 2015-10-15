'use strict';
console.log('00-div-selector.js');
(function($) {
    var monkey = window.monkey;
    monkey.divSelector = {
        options: {
            divSelector: {
                selectableTags: 'div,table,img',
            },
        },
        views: {
            makeSelectionBox: function () {
                return $('<div>').addClass('mk-selection-box hidden');
            },
            makeToolbar: function () {
                return $('<div class="mk-selection-box-tools">');
            },
            makeDeleteButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-danger"><span class="fa fa-trash"></span></a>');
            },
            makeSettingButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-default"><span class="fa fa-cog"></span></a>');
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

            /* Select and unselect methods*/
            this.triggerSelect = fn.triggerSelect;
            this.triggerUnselect = fn.triggerUnselect;

            this.setSelectableTags = fn.setSelectableTags;
            this.setSelectableTags();
        },
        fn: {
            setSelectableTags: function () {
                this.selectableTags = this.options.divSelector.selectableTags
                .split(',')
                .map(function(o) { return o.toUpperCase(); });
            },
            toggleSelectionBox: function(show) {
                if (!!this.$) {
                    this.$.toggleClass('hidden',!show);
                }
            },
            moveSelectionBox: function(target) {
                target = $(target);
                var pos = target.position();
                pos.left = pos.left + this.editor.$.scrollLeft();
                pos.top = pos.top + this.editor.$.scrollTop();

                var marginTop = target.css('margin-top');
                var marginBottom = target.css('margin-bottom');
                var marginLeft = target.css('margin-left');
                var marginRight = target.css('margin-right');

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
            },
            replaceSelectionBox: function () {
                var $box = this.editor.$.find('.mk-selection-box');
                // Replace a new box if it was accidentally deleted
                if ($box.length === 0 || $('.mk-selection-box-tools', $box).length === 0) {
                    $box.remove();
                    var self = this,
                        options = this.monkeyEditor.options;
                    this.$ = this.makeSelectionBox();
                    this.$toolbar = this.makeToolbar();
                    this.$deleteButton = this.makeDeleteButton();
                    this.$settingButton = this.makeSettingButton();
                    this.$toolbar.append(this.$deleteButton);
                    this.$.append(this.$toolbar);
                    this.editor.$.append(this.$);

                    /* Bindings */
                    this.$deleteButton.on('click', function (e) {
                        self.removeTarget(self.target);
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    });

                    if (!!options.modal && !!options.modal.settingsModalSelector) {
                        this.$toolbar.append(this.$settingButton);
                        this.$settingButton.on('click', function (e) {
                            $(options.modal.settingsModalSelector).modal('show');
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        });
                    }

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
                if (e.keyCode !== 16 && !e.ctrlKey) {
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
        var editor = this.editor;

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
                editor.$.find('.mk-selection-box').remove();
            }
        });

        // Bindings
        editor.$.on('click', monkey.divSelector.bindings.editorClick);
    });

})(jQuery);
