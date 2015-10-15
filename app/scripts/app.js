'use strict';
$(function() {
    $('.colorpicker').spectrum({
        beforeShow: function () {
            var $this = $(this);
            $this.spectrum('set', $this.val());
        },
        preferredFormat: 'hex',
        showInput: true,
        showInitial: true,
        showAlpha: false,
        localStorageKey: 'colorpicker',
        showPalette: true,
        showSelectionPalette: true,
        palette: [],
        allowEmpty: false,
        showButtons: true,
        appendTo: 'body',
        chooseText: 'Pick',
        cancelText: 'Cancel',
        replacerClassName: 'btn btn-default',
    });

    $('.colorpicker-forecolor')
    .on('change monkey:valueUpdated', function(e) {
        var $this = $(this),
            color;
        if (!!e.newValue) {
            color = e.newValue;
        } else {
            color = $this.spectrum('get').toString();
        }
        $this
        .css({'color': color})
        .val(color);
    });

    $('.colorpicker-backcolor')
    .on('change monkey:valueUpdated', function(e) {
        var $this = $(this),
            color;
        if (!!e.newValue) {
            color = e.newValue;
        } else {
            color = $this.spectrum('get').toString();
        }
        $this.val(color);
        $('.highlighter', this)
        .css({'background-color': color});
    });
});
