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
                    this.mk.switchView(this.mk.codeview);
                } else {
                    this.mk.switchView(this.mk.editor);
                }
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
                    $codeviewBtn = $('[' + options.actionKey + '=codeview]', this),
                    $enableBtn = $(options.enableOnCodeviewSelector, this);

                if (toView === mk.codeview) {
                    $codeviewBtn.addClass(options.activeClass);
                    $('.btn', this).addClass('disabled');
                    $enableBtn.removeClass('disabled');
                } else {
                    $codeviewBtn.removeClass(options.activeClass);
                    $('.btn', this).removeClass('disabled');
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

        /* Monkey on command execute */
        this.$.on('monkey:execCommand', function() {
            toolbar.update();
        });

        this.$.on('monkey:afterViewSwitch', function (e) {
            toolbar.switchView(e.toView);
        });
    });

    // Translations
    monkey.fn.extendLocales({
    });
})();
