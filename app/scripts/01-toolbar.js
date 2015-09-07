'use strict';
console.log('01-toolbar.js');
(function() {
    var monkey = window.monkey;

    // Set toolbars to be displayed
    monkey.toolbar = {
        options: {
            toolbar: {
                selector: '[data-role=editor-toolbar]',
                commandKey: 'data-edit',
                actionKey: 'data-action',
                activeClass: 'active',
                disabledClass: 'disabled',
                enableOnCodeviewSelector: '[data-enable-codeview]',
                commandBtnSelector: 'a[data-edit],button[data-edit],input[type=button][data-edit]',
                actionBtnSelector: 'a[data-action],button[data-action],input[type=button][data-action]',
            },
        },
        tools: {
            bold: function () {
                return {
                    icon: 'bold',
                    title: this.t.toolbar.bold,
                    edit: 'bold',
                };
            },
        },

        actions: {
            codeview: function () {
                var mk = this.mk;
                if (mk.activeView === mk.editor) {
                    mk.switchView(mk.codeview);
                } else {
                    mk.switchView(mk.editor);
                }
            },
            fullscreen: function () {
                this.mk.toggleFullscreen(!this.mk.fullscreen);
            },
        },

        bindings: {
            btnClick: function () {
                var mk = $(this).data('monkey-editor'),
                    command = $(this).attr(mk.options.toolbar.commandKey),
                    action = $(this).attr(mk.options.toolbar.actionKey),
                    editor = mk.editor;

                editor.restoreSelection();
                editor.$.focus();

                if (!!command) {
                    editor.execCommand(command);
                }
                if (!!action) {
                    mk.toolbar.processAction(action);
                }

                editor.saveSelection();
            },
        },

        fn: {
            processAction: function (action) {
                monkey.toolbar.actions[action].call(this);
                this.mk.$.trigger({
                    type: 'monkey:execAction',
                    action: action,
                });
            },
            update: function () {
                var options = this.options.toolbar;
                if (options.activeClass) {
                    $(options.selector).find(options.commandBtnSelector).each(function () {
                        var command = $(this).attr(options.commandKey);
                        if (document.queryCommandState(command)) {
                            $(this).addClass(options.activeClass);
                        } else {
                            $(this).removeClass(options.activeClass);
                        }
                    });
                }
            },
            switchView: function (toView) {
                var mk = this.mk,
                    options = this.options.toolbar,
                    activeClass = options.activeClass,
                    disabledClass = options.disabledClass,
                    $codeviewBtn = $('[' + options.actionKey + '=codeview]', this),
                    $enableBtn = $(options.enableOnCodeviewSelector, this);

                if (toView === mk.codeview) {
                    $codeviewBtn.addClass(activeClass);
                    $('.btn', this).addClass(disabledClass);
                    $enableBtn.removeClass(disabledClass);
                } else {
                    $codeviewBtn.removeClass(activeClass);
                    $('.btn', this).removeClass(disabledClass);
                }
            },
            resetFullscreenWrapperTop: function () {
                var mk = this.mk;
                setTimeout(function () {
                    mk.wrapper.$.css({
                        'top': mk.toolbar.outerHeight(),
                    });
                });
            },
            toggleFullscreen: function (fullscreen) {
                var mk = this.mk,
                    options = this.options.toolbar,
                    $fullscreenBtn = $('['+ options.actionKey+'=fullscreen]', this);

                mk.toolbar.toggleClass('mk-toolbar-float', fullscreen);
                $fullscreenBtn.toggleClass(options.activeClass, fullscreen);

                /* Set top space for toolbar */
                if (fullscreen) {
                    setTimeout(this.resetFullscreenWrapperTop);
                } else {
                    mk.wrapper.$.css({ 'top': '' });
                }
            },
        },
    };

    $.fn.monkeyToolbar = function (monkeyEditor) {
        var fn = monkey.toolbar.fn;
        this.mk = monkeyEditor;
        this.editor = this.mk.editor;
        this.options = this.mk.options;
        this.processAction = fn.processAction;
        this.update = fn.update;
        this.switchView = fn.switchView;
        this.toggleFullscreen = fn.toggleFullscreen;
        this.resetFullscreenWrapperTop = fn.resetFullscreenWrapperTop;
        this.addClass('mk-toolbar');
        return this;
    };

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        var editor = this.editor;

        /* Extend options */
        this.extendOptions(monkey.toolbar.options);

        var toolbar = $(this.options.toolbar.selector).monkeyToolbar(this);
        this.toolbar = toolbar;
            
        /* Bind events */
        // Command buttons
        this.toolbar.find(this.options.toolbar.commandBtnSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.btnClick);

        // Action buttons
        this.toolbar.find(this.options.toolbar.actionBtnSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.btnClick);

        // Editor
        editor.$.on('mouseup keyup mouseout', function() {
            editor.saveSelection();
            toolbar.update();
        });

        /* Monkey events */
        this.$.on('monkey:execCommand', function() {
            toolbar.update();
        });

        this.$.on('monkey:afterViewSwitch', function (e) {
            toolbar.switchView(e.toView);
        });

        this.$.on('monkey:toggleFullscreen', function (e) {
            toolbar.toggleFullscreen(e.fullscreen);
        });

        /* Window events */
        $(window).on('resize', toolbar.resetFullscreenWrapperTop);
    });

    // Translations
    monkey.fn.extendLocales({
    });
})();
