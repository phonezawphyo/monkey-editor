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
        klass: function(editor) {
            this.target = null;
            this.selectionBox = monkey.divSelector.views.makeSelectionBox.call(this);
            this.editor = editor;
            this.moveSelectionBox = monkey.divSelector.fn.moveSelectionBox;
            this.triggerSelect = monkey.divSelector.fn.triggerSelect;
            this.triggerUnselect = monkey.divSelector.fn.triggerUnselect;
            editor.append(this.selectionBox);
        },
        fn: {
            moveSelectionBox: function(target) {
                target = $(target);
                var pos = target.position();
                pos.left = pos.left + this.editor.scrollLeft();
                pos.top = pos.top + this.editor.scrollTop();

                var marginTop = target.css('margin-top');
                var marginBottom = target.css('margin-bottom');
                var marginLeft = target.css('margin-left');
                var marginRight = target.css('margin-right');

                this.selectionBox.css({
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
            triggerSelect: function(target) {
                var self = this;
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
                this.editor.trigger({
                    type: 'monkey:unselectDiv',
                    selectTarget: this.target,
                });
                this.editor.trigger({
                    type: 'monkey:afterUnselectDiv',
                    selectTarget: this.target,
                });
            },
        },
        bindings: {
            editorKeydown: function(e) {
                // 16 = Shift key
                if (!e.ctrlKey && e.keyCode != 16) {
                    $(this).data('div-selector').triggerUnselect();
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
        var divSelector = new monkey.divSelector.klass(editor);
        this.divSelector = divSelector;

        editor.data('div-selector', divSelector);
            
        // Bindings
        editor.on('keydown', monkey.divSelector.bindings.editorKeydown);
        editor.on('monkey:afterSelectDiv', function (e) {
            setTimeout(function triggerSelectTimeout() {
                divSelector.moveSelectionBox(e.selectTarget);
                divSelector.selectionBox.removeClass('hidden');
            });
        });
        editor.on('monkey:afterUnselectDiv', function () {
            divSelector.selectionBox.addClass('hidden');
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
