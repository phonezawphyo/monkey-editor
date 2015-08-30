'use strict';
console.log('02-object-bar.js');
(function($) {
    var monkey = window.monkey;

    monkey.objectBar = {

        objects: {
            pageHeader: function () {
                return {
                    icon: 'header',
                    title: this.t.objectBar.pageHeader.title,
                    event: 'pageHeader',
                };
            },
            jumbotron: function () {
                return {
                    text: 'J',
                    title: this.t.objectBar.jumbotron.title,
                    event: 'jumbotron',
                };
            },
        },

        events: {
            pageHeader: function () {
                var title = this.t.objectBar.pageHeader.title;
                var smallText= this.t.objectBar.pageHeader.smallText;
                monkey.fn.insertAtCaret($('<div><h1>'+title+'<small>'+smallText+'</small></h1></div>')
                                        .addClass('page-header'));
            },
            jumbotron: function () {
                var title = this.t.objectBar.jumbotron.title;
                monkey.fn.insertAtCaret($('<div>'+title+'</div>')
                                        .addClass('jumbotron'));
            },
        },

        views: {
            makeObjectBar: function () {
                return $('<div>').addClass('mk-object-bar btn-toolbar').attr({role: 'toolbar'});
            },
            makeObjectGroup: function () {
                return $('<div>').addClass('btn-group');
            },
            makeObject: function (obj) {
                var btn = $('<button type=button>').addClass('btn btn-default')
                .attr({'data-event': obj.event});

                if (!!obj.icon) {
                    btn.append(monkey.views.makeIcon.call(this, obj.icon));
                }
                if (!!obj.text) {
                    btn.append(obj.text);
                }
                return btn;
            },
        },

        init: function () {
            var self = this;
            var objBar = monkey.objectBar.views.makeObjectBar.call(this);
            for (var k in this.options.objectBar) {
                var objs = this.options.objectBar[k];
                var objGroup= monkey.objectBar.views.makeObjectGroup.call(this);

                for (var idx in objs) {
                    var obj = objs[idx];
                    var objConfig = monkey.objectBar.objects[obj].call(self);
                    var $obj = monkey.objectBar.views.makeObject.call(self, objConfig);
                    $obj.addClass('mk-'+obj);
                    objGroup.append($obj);
                }
                    
                objBar.append(objGroup);

            }
            return objBar;
        },
    };

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        var self = this;

        // Extend options
        this.extendOptions({
            objectBar: {
                bootstrap: ['pageHeader', 'jumbotron'],
            },
        });

        // Make and add object bar
        var objBar = monkey.objectBar.init.call(this);
        this.after(objBar);
            
        // Bind events
        $('button', objBar).on('click', function objButtonOnclick() {
             var event = $(this).attr('data-event');
             monkey.objectBar.events[event].call(self);
        });
    });

    // Translations
    monkey.fn.extendLocales({
        en: {
            objectBar: {
                pageHeader: {
                    title: 'Page Header',
                    smallText: 'Small Text',
                },
                jumbotron: {
                    title: 'Jumbotron',
                },
            },
        },
    });
})(jQuery);
