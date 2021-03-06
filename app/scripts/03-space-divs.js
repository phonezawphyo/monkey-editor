'use strict';
(function($) {
    var monkey = window.monkey;
    monkey.spaceDivs = {
        options: {
            spaceDivs: {
                moveDelay: 0,
                hideDelay: 0,
                excludeTags: ['TD','TH','TR'],
            },
        },

        klass: function(monkeyEditor) {
            this.mk = monkeyEditor;
            this.options = this.mk.options;
            this.editor = this.mk.editor;
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
            this.excludeTags = this.options.spaceDivs.excludeTags;
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
            clickSpace: function (e) {
                var $this = $(this),
                    spaceDivs = $this.data('space-divs'),
                    $target = $(spaceDivs.target),
                    $newDiv = $('<div>'),
                    isTop = $this.hasClass('mk-space-top');

                if (isTop) {
                    $target.before($newDiv);
                } else {
                    $target.after($newDiv);
                }

                e.preventDefault();
                e.stopPropagation();

                spaceDivs.mk.divSelector.triggerSelect($newDiv[0]);
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
                    }, this.options.spaceDivs.hideDelay);
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
                var self = this,
                    move = function () {
                        self.target = target;
                        self.mk.divSelector.$.append(self.top);
                        self.mk.divSelector.$.append(self.bottom);
                        self.resetBindings();
                    };

                if (!this.target) {
                    move();
                } else if (this.target !== target) {
                    this.clearMoveTimer();
                    this.moveTimer = setTimeout(move, this.options.spaceDivs.moveDelay);
                }
            },
        },

        bindings: {
            editorSelectDiv: function (e) {
                var target = e.selectTarget,
                    spaceDivs= $(this).data('space-divs');

                if (!target) {
                    return;
                }

                if (spaceDivs.excludeTags.indexOf(target.tagName) === -1) {
                    spaceDivs.clearHideTimer();

                    if (!target.classList.contains('mk-space')) {
                        spaceDivs.moveToTarget(target);
                    } else {
                        spaceDivs.clearMoveTimer();
                    }
                } else {
                    spaceDivs.hide();
                }

            },
            editorUnselectDiv: function () {
                var spaceDivs= $(this).data('space-divs');
                spaceDivs.hide();
            },
        },
    };

    monkey.callbacks.afterInitialize.push(function spaceDivsAfterInitialize() {
        /* Extend options */
        this.extendOptions(monkey.spaceDivs.options);

        var editor = this.editor,
            self = this,
            spaceDivs = new monkey.spaceDivs.klass(this);

        editor.$.data('space-divs', spaceDivs);

        // Bindings
        editor.$.on('monkey:afterSelectDiv', monkey.spaceDivs.bindings.editorSelectDiv);
        editor.$.on('monkey:unselectDiv', monkey.spaceDivs.bindings.editorUnselectDiv);

        if (!!this.divSelector) {
            this.$.on('monkey:execCommand', function (e) {
                if (e.command === 'insertHTML') {
                    try {
                        self.divSelector.triggerSelect(e.insertedElement);
                    } catch(e) {
                    }
                }
            });
        }
    });

})(jQuery);
