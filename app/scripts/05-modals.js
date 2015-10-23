'use strict';
console.log('05-modals.js');
(function() {
    var monkey = window.monkey;
                
    // Set toolbars to be displayed
    monkey.modals = {
        options: {
            modal: {
                selector: '[data-role=editor-modals] > .modal',
                modalKey: 'data-modal',
            },
        },
        views: {
            makeSettingButton: function () {
                return $('<a href="javascript:;" class="btn btn-xs btn-default"><span class="fa fa-cog"></span></a>');
            },
        },

        bindings: {
        },

        fn: {
        },
    };

    /* Extend toolbar */
    monkey.toolbar = $.extend(true, {
        actions: {
            openModal: function (modalName) {
                var mk = this.mk,
                    options = mk.options.modal;
                $(options.selector+'['+options.modalKey+'='+modalName+']').modal('show');
            },
        },
    }, monkey.toolbar || {});

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        var editor = this.editor,
            divSelector = this.divSelector,
            self = this;

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

            editor.$.on('monkey:selectionBoxReplaced', function() {
                var $settingButton = monkey.modals.views.makeSettingButton();

                divSelector.$toolbar.prepend($settingButton);

                $settingButton.on('click', function(e) {
                    var options = self.options.modal;
                    $(options.selector+'['+options.modalKey+'=settings]').modal('show');
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            }).on('monkey:selectionBoxMoved', function() {
            });
        }
    });

    // Translations
    monkey.fn.extendLocales({
    });
})();
