'use strict';
(function($) {
    var monkey = window.monkey;


    monkey.callbacks.afterInitialize.push(function () {
        var mk = this;

        /* Initialize color picker*/
        $('[data-colorpicker]').colorpicker({
            colorSelectors: {
                transparent: 'transparent',
                black: 'black',
                white: 'white',
                red: 'red',
                green: 'green',
                blue: 'blue'
            },
        })
        .on('changeColor.colorpicker', function(e) {
            $(this).css('background-color', e.color.toHex());
        })
        .on('monkey:valueUpdated', function(e) {
            if (!!e.newValue) {
                $(this).colorpicker('setValue', e.newValue);
            } else {
                $(this).colorpicker('setValue', 'transparent');
            }
        })
        .on('hidePicker.colorpicker', function() {
            $(this).trigger('change');
        });

        this.$.on('monkey:afterViewSwitch', function (e) {
            if (e.toView===mk.editor) {
                $('[data-colorpicker]').colorpicker('enable');
            } else {
                $('[data-colorpicker]').colorpicker('disable');
            }
        });
    });
})(jQuery);
