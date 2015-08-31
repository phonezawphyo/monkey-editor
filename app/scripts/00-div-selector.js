'use strict';
console.log('00-div-selector.js');
(function($) {
    var monkey = window.monkey;
    monkey.divSelector = {
        views: {
            makeSelectionBox: function () {
                return $('<div>').addClass('mk-selection-box hidden');
            },
        },
        klass: function(monkeyEditor) {
            var fn = monkey.divSelector.fn;
            this.monkeyEditor = monkeyEditor;
            this.target = null;
            this.makeSelectionBox = monkey.divSelector.views.makeSelectionBox;
            this.replaceSelectionBox = fn.replaceSelectionBox;
            this.toggleSelectionBox = fn.toggleSelectionBox;
            this.editor = monkeyEditor.editor;
            this.moveSelectionBox = fn.moveSelectionBox;
            this.triggerSelect = fn.triggerSelect;
            this.triggerUnselect = fn.triggerUnselect;
            this.removeTarget = fn.removeTarget;
            this.isSelected = fn.isSelected;
        },
        fn: {
            toggleSelectionBox: function(show) {
                if (!!this.$) {
                    this.$.toggleClass('hidden',!show);
                }
            },
            moveSelectionBox: function(target) {
                target = $(target);
                var pos = target.position();
                pos.left = pos.left + this.editor.scrollLeft();
                pos.top = pos.top + this.editor.scrollTop();

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
                // Replace a new box if it was accidentally deleted
                if (this.editor.find('.mk-selection-box').length === 0) {
                    this.$ = this.makeSelectionBox();
                    this.editor.append(this.$);
                }
            },
            isSelected: function() {
                return !!this.target;
            },
            triggerSelect: function(target) {
                this.target = target;
                this.editor.trigger({
                    type: 'monkey:selectDiv',
                    selectTarget: target,
                });
                this.editor.trigger({
                    type: 'monkey:afterSelectDiv',
                    selectTarget: target,
                });
            },
            triggerUnselect: function () {
                this.target = null;
                this.editor.trigger({
                    type: 'monkey:unselectDiv',
                    selectTarget: this.target,
                });
                this.editor.trigger({
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
                var target = e.target;
                var divSelector = $(this).data('div-selector');

                if (target !== this) {
                    if (target.tagName === 'DIV') {
                        divSelector.triggerSelect(target);
                    }
                } else {
                    divSelector.triggerUnselect();
                }
            },
        },
    };

    monkey.callbacks.afterInitialize.push(function divSelectorAfterInitialize() {
        var editor = this.editor;
        var divSelector = new monkey.divSelector.klass(this);
        this.divSelector = divSelector;

        editor.data('div-selector', divSelector);
            
        // Bindings
        editor.on('keydown', monkey.divSelector.bindings.editorKeydown);
        editor.on('monkey:afterSelectDiv', function (e) {
            setTimeout(function triggerSelectTimeout() {
                divSelector.moveSelectionBox(e.selectTarget);
                divSelector.toggleSelectionBox(true);
            });
        });
        editor.on('monkey:afterUnselectDiv', function () {
            divSelector.toggleSelectionBox(false);
        });
        editor.on('monkey:insertNode', function (e) {
            divSelector.triggerSelect(e.insertTarget);
            editor.focus();
        });
        editor.on('blur', function () {
            divSelector.triggerUnselect();
        });

        // Bindings
        editor.on('click', monkey.divSelector.bindings.editorClick);
    });

})(jQuery);
