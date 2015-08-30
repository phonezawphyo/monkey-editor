'use strict';
console.log('01-toolbar.js');
(function() {
    var monkey = window.monkey;

    // Set toolbars to be displayed
    monkey.toolbar = {
        style: ['bold','italic','strikethrough','underline'],
        list: ['ul','ol','indentLeft','indentRight'],
        alignment: ['alignLeft','alignCenter','alignRight','alignJustify'],
        link: ['linkInsert','linkRemove'],
        media: ['image','video'],
    };

    monkey.callbacks.afterInitialize.push(function () {
        // Extend options
        this.extendOptions({
            toolbar: monkey.toolbar,
        });
    });

    // Translations
    monkey.fn.extendLocales({
        en: {
            toolbar: {
                title: 'Toolbar',
            },
        },
    });
})();
