'use strict';
console.log('04-modals.js');
(function() {
    var monkey = window.monkey;

    // Set toolbars to be displayed
    monkey.modals = {
        options: {
            modal: {
                selector: '[data-role=editor-modals] > .modal',
                settingsModalSelector: '[data-role=editor-modals] > [data-modal=settings]',
            },
        },

        callbacks: {
        },

        bindings: {
        },

        fn: {
        },
    };

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        //var editor = this.editor;

        /* Extend options */
        this.extendOptions(monkey.modals.options);

        /* Parse modals */
        if (!!this.options.modal.selector) {
            $(this.options.modal.selector).modal({
                show: false,
            })
            .data('monkey-editor', this)
            .on('show.bs.modal', function() {
            })
            .on('hide.bs.modal', function() {
                var $this = $(this),
                    mk = $this.data('monkey-editor'),
                    selector = mk.divSelector;
                selector.triggerSelect(selector.lastSelectedTarget);
            });

        }
    });

    // Translations
    monkey.fn.extendLocales({
    });
})();
