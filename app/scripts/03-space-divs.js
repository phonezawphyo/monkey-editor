'use strict';
console.log('03-space-divs.js');
(function($) {
    var monkey = window.monkey;
    monkey.spaceDivs = {
        moveDelay: 0,
        hideDelay: 0,

        klass: function(monkeyEditor) {
            this.monkeyEditor = monkeyEditor;
            this.editor = this.monkeyEditor.editor;
            var spaceDivs = monkey.spaceDivs;
            this.top = spaceDivs.views.makeTop.call(this);
            this.bottom = spaceDivs.views.makeBottom.call(this);
            this.target = null;
            this.hideTimer = null;
            this.clearHideTimer = spaceDivs.fn.clearHideTimer;
            this.moveTimer = null;
            this.clearMoveTimer = spaceDivs.fn.clearMoveTimer;
            this.moveToTarget = spaceDivs.fn.moveToTarget;
            this.hide = spaceDivs.fn.hide;
            this.resetBindings = spaceDivs.fn.resetBindings;
        },
        views: {
            makeTop: function() {
                return $('<div class="mk-space mk-space-top"><br></div>');
            },
            makeBottom: function () {
                return $('<div class="mk-space mk-space-bottom"><br></div>');
            },
        },
        events: {
            clickSpace: function () {
                var $this = $(this);
                var spaceDivs = $this.data('space-divs');
                var isTop = $this.hasClass('mk-space-top');
                $this.removeClass('mk-space mk-space-top mk-space-bottom');
                $this.off('click');

                if (isTop) {
                    spaceDivs.top = monkey.spaceDivs.views.makeTop();
                } else {
                    spaceDivs.bottom = monkey.spaceDivs.views.makeBottom();
                }
            },
        },
        fn: {
            clearHideTimer: function () {
                var timer = this.hideTimer;
                if (!!timer) {
                    clearTimeout(timer);
                    this.hideTimer = null;
                }
            },
            clearMoveTimer: function () {
                var timer = this.moveTimer;
                if (!!timer) {
                    clearTimeout(timer);
                    this.moveTimer = null;
                }
            },
            hide: function () {
                var self = this;
                if (!!this.target && !this.hideTimer) {
                    this.clearHideTimer();
                    this.hideTimer = setTimeout(function hideTimer() {
                        self.top.remove();
                        self.bottom.remove();
                        self.target = null;
                        self.hideTimer = null;
                    }, monkey.spaceDivs.hideDelay);
                }
            },
            resetBindings: function () {
                this.top.data('space-divs', this);
                this.bottom.data('space-divs', this);
                this.top.off('click');
                this.bottom.off('click');
                this.top.on('click', monkey.spaceDivs.events.clickSpace);
                this.bottom.on('click', monkey.spaceDivs.events.clickSpace);
            },
            moveToTarget: function(target) {
                var self = this;
                var move = function () {
                    self.target = target;

                    var $target = $(target);
                    $target.before(self.top);
                    $target.after(self.bottom);
                    self.resetBindings();
                };

                if (!this.target) {
                    move();
                } else if (this.target !== target) {
                    this.clearMoveTimer();
                    this.moveTimer = setTimeout(move, monkey.spaceDivs.moveDelay);
                }
            },
        },

        bindings: {
            editorSelectDiv: function (e) {
                var target = e.selectTarget;
                var spaceDivs= $(this).data('space-divs');

                spaceDivs.clearHideTimer();

                if (!target.classList.contains('mk-space')) {
                    spaceDivs.moveToTarget(target);
                } else {
                    spaceDivs.clearMoveTimer();
                }
            },
            editorUnselectDiv: function () {
                var spaceDivs= $(this).data('space-divs');
                spaceDivs.hide();
            },
        },
    };

    monkey.callbacks.afterInitialize.push(function spaceDivsAfterInitialize() {
        var editor = this.editor;

        editor.data('space-divs', new monkey.spaceDivs.klass(this));

        // Bindings
        editor.on('monkey:selectDiv', monkey.spaceDivs.bindings.editorSelectDiv);
        editor.on('monkey:unselectDiv', monkey.spaceDivs.bindings.editorUnselectDiv);
    });

})(jQuery);
