'use strict';
console.log('02-object-bar.js');
(function($) {
    var monkey = window.monkey;

    monkey.objectBar = {
        options: {
            objectBar: {
                bootstrap: ['pageHeader', 'jumbotron', 'panel'],
            },
        },

        objects: {
            pageHeader: function () {
                return {
                    text: 'H',
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
            panel: function () {
                return {
                    text: 'P',
                    title: this.t.objectBar.jumbotron.title,
                    event: 'panel',
                };
            },
        },

        events: {
            pageHeader: function () {
                var title = this.t.objectBar.pageHeader.title;
                var smallText= this.t.objectBar.pageHeader.smallText;
                var elem = $('<div><h1>'+title+'<small>'+smallText+'</small></h1></div>')
                .addClass('page-header');

                this.editor.insertAtCaret(elem);
            },
            jumbotron: function () {
                var title = this.t.objectBar.jumbotron.title;
                var elem = $('<div>'+title+'</div>').addClass('jumbotron');

                this.editor.insertAtCaret(elem);
            },
            panel: function () {
                var title = this.t.objectBar.panel.title;
                var body = this.t.objectBar.panel.body;
                var elem = $('<div class="panel panel-default"></div>')
                .append($('<div class="panel-heading">').append(title))
                .append($('<div class="panel-body">').append(body));

                this.editor.insertAtCaret(elem);
            },
        },

        views: {
            makeObjectBar: function () {
                return $('<div>').addClass('mk-object-bar btn-toolbar').attr({role: 'toolbar'});
            },
            makeObjectGroup: function () {
                return $('<div>').addClass('btn-group btn-group-sm');
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
        this.extendOptions(monkey.objectBar.options);

        // Make and add object bar
        var objBar = monkey.objectBar.init.call(this);
        this.editor.before(objBar);
            
        // Bind events
        $('button', objBar).on('click', function objButtonOnclick() {
            if (!!self.divSelector) {
                self.divSelector.triggerUnselect();
            }

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
                panel: {
                    title: 'Panel Heading',
                    body: 'Panel Body',
                },
            },
        },
    });
})(jQuery);
