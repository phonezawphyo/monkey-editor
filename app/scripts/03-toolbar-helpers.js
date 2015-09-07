'use strict';
console.log('03-toolbar-helpers.js');
(function($) {
    var monkey = window.monkey;
    

    monkey.toolbarHelpers = {
        tablePicker: function () {
            var mk = this,
                makeTable = function (row,col, hasData) {
                var $table = $('<table class="table table-bordered">');
                for (var r = 0; r < row; r++) {
                    var $tr = $('<tr>');
                    for (var c = 0; c < col; c++) {
                        var $td = $('<td>&nbsp;</td>')
                        .appendTo($tr);

                        if (hasData) {
                            $td.attr({'data-row': r+1, 'data-col': c+1});
                        }
                    }
                    $table.append($tr);
                }
                return $table;
            };

            $('[data-monkey-table-picker]').each(function() {
                var $this = $(this),
                    $table = makeTable(10,10, true),
                    $status = $('<div class="mk-table-picker-status">');

                $this.attr('data-monkey-table-picker',null);

                $this.addClass('mk-table-picker').append($table).append($status);

                $('td', $table).on('click', function() {
                    var $this = $(this),
                        row = parseInt($this.attr('data-row')),
                        col = parseInt($this.attr('data-col')),
                        command = 'insertHTML '+makeTable(row,col,false)[0].outerHTML;
                    mk.toolbar.processCommandOrAction(command);
                }).on('mouseenter', function () {
                    var $this = $(this),
                        row = parseInt($this.attr('data-row')),
                        col = parseInt($this.attr('data-col'));
                    $status.html(row + '&times;' + col);
                });

                $table.on('mouseleave', function () {
                    $status.html('');
                });
            });

            /* For firefox, disable default table row editors. They are buggy. */
            setTimeout(function() {
                document.execCommand('enableInlineTableEditing', null, false);
            },1000);
        },
    };

    for (var k in monkey.toolbarHelpers) {
        monkey.toolbar.callbacks.beforeInitialize.push(monkey.toolbarHelpers[k]);
    }
})(jQuery);
