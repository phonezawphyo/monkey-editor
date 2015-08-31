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
                activeClass: 'active',
                btnSelector: 'a[data-edit],button[data-edit],input[type=button][data-edit]'
            },
        },
        klass: function (monkeyEditor) {
            this.monkeyEditor = monkeyEditor;
            this.editor = monkeyEditor.editor;
            this.options = monkeyEditor.options;
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

        events: {
            edit: function (edit) {
                document.execCommand(edit);
            },
        },

        bindings: {
            toolClick: function () {
                var mk = $(this).data('monkey-editor');
                var editor = mk.editor;
                editor.restoreSelection();
                editor.focus();
                editor.execCommand($(this).attr(mk.options.toolbar.commandKey));
                editor.saveSelection();
            },
        },

        fn: {
            update: function () {
                var options = this.options.toolbar;
                if (options.activeClass) {
                    $(options.selector).find(options.btnSelector).each(function () {
                        var command = $(this).attr(options.commandKey);
                        if (document.queryCommandState(command)) {
                            $(this).addClass(options.activeClass);
                        } else {
                            $(this).removeClass(options.activeClass);
                        }
                    });
                }
            },
        },
    };

    $.fn.monkeyToolbar = function (monkeyEditor) {
        var fn = monkey.toolbar.fn;
        this.monkeyEditor = monkeyEditor;
        this.editor = monkeyEditor.editor;
        this.options = monkeyEditor.options;
        this.execCommand = fn.execCommand;
        this.update = fn.update;
        return this;
    };

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        var editor = this.editor;

        // Extend options
        this.extendOptions(monkey.toolbar.options);

        var toolbar = $(this.options.toolbar.selector).monkeyToolbar(this);
        this.toolbar = toolbar;
            
        // Bind events
        // Toolbar buttons
        this.toolbar.find(this.options.toolbar.btnSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.toolClick);

        // Editor
        editor.on('mouseup keyup mouseout', function() {
            editor.saveSelection();
            toolbar.update();
        });

        // Monkey on command execute
        this.on('monkey:execCommand', function(e) {
            toolbar.update();
        });
    });

    // Translations
    monkey.fn.extendLocales({
    });
})();
