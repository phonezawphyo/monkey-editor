'use strict';
(function($) {
    String.prototype.parseValue = function(value) {
        return this.replace(/%{value}/,value);
    };

    var monkey = window.monkey;

    // Set toolbars to be displayed
    monkey.toolbar = {
        options: {
            toolbar: {
                selector: '[data-role=editor-toolbar]',
                commandKey: 'data-edit',
                actionKey: 'data-action',
                activeClass: 'active',
                disabledClass: 'disabled',
                enableOnCodeviewSelector: '[data-enable-codeview]',
                commandBtnSelector: 'a[data-edit],button[data-edit],input[type=button][data-edit]',
                keydownTriggerInputSelector: 'input:not([type]),input[type=text],input[type=number]',
                changeTriggerInputSelector: 'input[type=color],[data-colorpicker]',
                fileSelector: 'input[type=file]',
                actionBtnSelector: 'a[data-action],button[data-action],input[type=button][data-action]',
            },
        },

        callbacks: {
            beforeInitialize: [],
        },

        actions: {
            codeview: function () {
                var mk = this.mk;
                if (mk.activeView === mk.editor) {
                    mk.switchView(mk.codeview);
                } else {
                    mk.switchView(mk.editor);
                }
            },

            delegate: function(selector) {
                this.triggerInputAction($(selector));
            },

            setCss: function (cssStr) {
                var mk = this.mk,
                    target = mk.divSelector.lastSelectedTarget;

                $(mk.divSelector.lastSelectedTarget).css(JSON.parse(cssStr));

                mk.divSelector.triggerSelect(target);
            },
            fullscreen: function () {
                this.mk.toggleFullscreen(!this.mk.fullscreen);
            },
            addLink: function (url) {
                var mk = this.mk,
                    editor = mk.editor,
                    target = mk.divSelector.lastSelectedTarget,
                    $target = $(target);

                if (editor.isSelectionCollapsed()) {
                    if ($target.parent().is('a')) {
                        $target.parent().attr({href: url});
                    } else {
                        $(target).wrap($('<a>').attr({href: url}));
                    }
                    mk.divSelector.triggerSelect(target);
                } else {
                    this.processCommandOrAction('createLink '+url);
                }
            },
            removeLink: function () {
                var mk = this.mk,
                    editor = mk.editor,
                    target = mk.divSelector.lastSelectedTarget,
                    $target = $(target);

                if (editor.isSelectionCollapsed()) {
                    if ($target.parent().is('a')) {
                        $(target).unwrap();
                    }
                    mk.divSelector.triggerSelect(target);
                } else {
                    this.processCommandOrAction('unlink');
                }

            },
            fontSize: function (size) {
                var sel= window.getSelection(),
                    text = sel.toString(),
                    rng = sel.getRangeAt(0),
                    parent = rng.commonAncestorContainer;

                if (parent.nodeType !== 1) {
                    parent = parent.parentNode;
                }

                if (!sel.isCollapsed) {
                    var $parent = $(parent);
                    if ($parent.text().trim() === text.trim()) {
                        $parent.css({
                            'font-size': size,
                        });
                        $parent.children('span').each(function() {
                            var $this = $(this);
                            $this.css({'font-size': ''});
                            if ($this.styles.length === 0) {
                                $this.after($this.contents());
                                $this.remove();
                            }
                        });
                    } else {
                        var $span = $('<span>')
                        .append(text)
                        .css({'font-size': size});

                        rng.deleteContents();
                        rng.insertNode($span[0]);
                    }
                }
            },
        },

        bindings: {
            btnClick: function () {
                var $this = $(this),
                    mk = $this.data('monkey-editor'),
                    command = $this.attr(mk.options.toolbar.commandKey),
                    action = $this.attr(mk.options.toolbar.actionKey);

                mk.toolbar.processCommandOrAction(command,action);
            },
            inputClick: function(e) {
                e.preventDefault();
                return false;
            },
            inputBlur: function() {
                var $this = $(this),
                    mk = $this.data('monkey-editor'),
                    editor = mk.editor;
                editor.restoreSelection();
            },
            inputChange: function() {
                var $this = $(this),
                    mk = $this.data('monkey-editor'),
                    command = $this.attr(mk.options.toolbar.commandKey),
                    action = $this.attr(mk.options.toolbar.actionKey);

                if (!!command) {
                    command = command.parseValue($this.val());
                }
                if (!!action) {
                    action = action.parseValue($this.val());
                }
                mk.toolbar.processCommandOrAction(command, action);
            },
            inputKeydown: function(e) {
                var $this = $(this),
                    mk = $this.data('monkey-editor');

                /* Return key */
                if (e.keyCode === 13) {
                    mk.toolbar.triggerInputAction($this);
                    e.preventDefault();
                }
            },
            fileDrop: function (e) {
                var $this = $(this),
                    mk = $this.data('monkey-editor'),
                    editor = mk.editor;

                e.stopPropagation();
                e.preventDefault();

                editor.handleDroppedContent(e.originalEvent.dataTransfer);

                $(this).val('');
            },
            fileChange: function() {
                var $this = $(this),
                    mk = $this.data('monkey-editor');
                if (this.type === 'file' && this.files && this.files.length > 0) {
                    mk.insertFiles(this.files);
                    $(this).val('');
                }
            },
        },

        fn: {
            processCommandOrAction: function (command,action) {
                var editor = this.mk.editor;

                editor.restoreSelection();
                editor.$.focus();

                if (!!command) {
                    editor.execCommand(command);
                }
                if (!!action) {
                    this.processAction(action);
                }

                editor.saveSelection();
            },
            processAction: function (actionAndArgs) {
                var arr = actionAndArgs.split(' '),
                    action = arr.shift(),
                    param = arr.join(' ');

                monkey.toolbar.actions[action].apply(this, [param]);

                this.mk.$.trigger({
                    type: 'monkey:execAction',
                    action: action,
                });
            },
            triggerInputAction: function($input) {
                var mk = this.mk,
                    command = $input.attr(mk.options.toolbar.commandKey),
                    action = $input.attr(mk.options.toolbar.actionKey);

                if (!!command) {
                    command = command.parseValue($input.val());
                }
                if (!!action) {
                    action = action.parseValue($input.val());
                }
                mk.toolbar.processCommandOrAction(command, action);
            },
            storeCssActions: function () {
                var options = this.options.toolbar;

                $(options.selector).find('['+options.actionKey+'^=setCss]').each(function () {
                    var $this =$(this),
                        actions = $this.attr('data-action').split(' ')[1];

                    try {
                        var cssProps = Object.keys(JSON.parse(actions));
                        $this.data('css-actions', cssProps);
                    } catch (e) {
                        console.error('Failed to parse cssProperty', actions);
                    }

                });
            },
            updateCssActions: function () {
                var options = this.options.toolbar,
                    divSelector = this.mk.divSelector;

                $(options.selector).find('['+options.actionKey+'^=setCss]').each(function () {
                    var $this =$(this),
                        cssProps = $this.data('css-actions');

                    for (var k in cssProps) {
                        var prop = cssProps[k],
                            newValue = (!!divSelector.target) ? divSelector.target.style[prop] : '';

                        $this.val((newValue || ''));
                        $(this).trigger({
                            type: 'monkey:valueUpdated',
                            cssProperty: prop,
                            newValue: newValue,
                        });
                    }
                });
            },
            updateAddLink: function () {
                var options = this.options.toolbar,
                    mk = this.mk,
                    editor = mk.editor,
                    keyword = 'addLink',
                    divSelector = this.mk.divSelector,
                    $target = $(divSelector.target),
                    newValue = '',
                    $selector = $(options.selector).find('['+options.actionKey+'^='+keyword+']');

                $selector.each(function () {
                    var $this =$(this),
                        $parent = $target.parent();

                    if (editor.isSelectionCollapsed()) {
                        if (!!$parent && $parent.is('a')) {
                            newValue = $parent.attr('href');
                        }
                    } else {
                        var node = document.getSelection().anchorNode.parentNode,
                            $node = $(node);
                        if ($node.is('a')) {
                            newValue = $node.attr('href');
                        }
                    }

                    $this.val(newValue);
                    $this.trigger({
                        type: 'monkey:valueUpdated',
                        keyword: keyword,
                        newValue: newValue,
                    });
                });
            },

            update: function () {
                var options = this.options.toolbar;
                if (options.activeClass) {
                    $(options.selector).find(options.commandBtnSelector).each(function () {
                        var command = $(this).attr(options.commandKey);
                        $(this).toggleClass(options.activeClass, document.queryCommandState(command));
                    });
                }
                $(options.selector).find(options.changeTriggerInputSelector).each(function () {
                    var command = $(this).attr(options.commandKey),
                        keyword = !!command ? command.split(' ') : null,
                        newValue = !!keyword ? document.queryCommandValue(keyword[0]) : null;
                    $(this).val(newValue);
                    $(this).trigger({
                        type: 'monkey:valueUpdated',
                        keyword: !!keyword ? keyword : command,
                        newValue: newValue,
                    });
                });

                this.updateCssActions();
                this.updateAddLink();
            },
            switchView: function (toView) {
                var mk = this.mk,
                    options = this.options.toolbar,
                    activeClass = options.activeClass,
                    disabledClass = options.disabledClass,
                    $codeviewBtn = $('[' + options.actionKey + '=codeview]', this),
                    $enableBtn = $(options.enableOnCodeviewSelector, this);

                if (toView === mk.codeview) {
                    $codeviewBtn.addClass(activeClass);
                    $('.btn,input', this).addClass(disabledClass);
                    $enableBtn.removeClass(disabledClass);
                } else {
                    $codeviewBtn.removeClass(activeClass);
                    $('.btn,input', this).removeClass(disabledClass);
                }
            },
            resetFullscreenWrapperTop: function () {
                var mk = this.mk;
                setTimeout(function () {
                    mk.wrapper.$.css({
                        'top': mk.toolbar.outerHeight(),
                    });
                });
            },
            toggleFullscreen: function (fullscreen) {
                var mk = this.mk,
                    options = this.options.toolbar,
                    $fullscreenBtn = $('['+ options.actionKey+'=fullscreen]', this);

                mk.toolbar.toggleClass('mk-toolbar-float', fullscreen);
                $fullscreenBtn.toggleClass(options.activeClass, fullscreen);

                /* Set top space for toolbar */
                if (fullscreen) {
                    setTimeout(this.resetFullscreenWrapperTop);
                } else {
                    mk.wrapper.$.css({ 'top': '' });
                }
            },
            convertFileIntoUrl: function (fileInfo) {
                var loader = $.Deferred(),
                    fReader = new FileReader();

                fReader.onload = function (e) {
                    loader.resolve(e.target.result);
                };
                fReader.onerror = loader.reject;
                fReader.onprogress = loader.notify;
                fReader.readAsDataURL(fileInfo);
                return loader.promise();
            },
        },
    };

    $.fn.monkeyToolbar = function (monkeyEditor) {
        var fn = monkey.toolbar.fn;
        this.mk = monkeyEditor;
        this.editor = this.mk.editor;
        this.options = this.mk.options;
        this.processAction = fn.processAction;
        this.triggerInputAction = fn.triggerInputAction;
        this.storeCssActions = fn.storeCssActions;
        this.update = fn.update;
        this.updateCssActions = fn.updateCssActions;
        this.updateAddLink = fn.updateAddLink;
        this.switchView = fn.switchView;
        this.toggleFullscreen = fn.toggleFullscreen;
        this.resetFullscreenWrapperTop = fn.resetFullscreenWrapperTop;
        this.processCommandOrAction = fn.processCommandOrAction;
        this.addClass('mk-toolbar');
        this.storeCssActions();
        return this;
    };

    monkey.callbacks.afterInitialize.push(function objectBarAfterInitialize() {
        var editor = this.editor;

        /* Make dropdowns interactive */
        $('[data-toggle=dropdown]').dropdown();

        /* BeforeToolbarInitialize callback */
        this.execCallbacks(monkey.toolbar.callbacks.beforeInitialize);

        /* Extend options */
        this.extendOptions(monkey.toolbar.options);

        var toolbar = $(this.options.toolbar.selector).monkeyToolbar(this);
        this.toolbar = toolbar;
            
        /* Bind events */
        // Command buttons
        this.toolbar.find(this.options.toolbar.commandBtnSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.btnClick);
       
        // Text inputs
        this.toolbar.find(this.options.toolbar.keydownTriggerInputSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.inputClick)
        .blur(monkey.toolbar.bindings.inputBlur)
        .keydown(monkey.toolbar.bindings.inputKeydown);

        // Change trigger inputs
        this.toolbar.find(this.options.toolbar.changeTriggerInputSelector)
        .data('monkey-editor', this)
        .blur(monkey.toolbar.bindings.inputBlur)
        .change(monkey.toolbar.bindings.inputChange);

        // File inputs
        this.toolbar.find(this.options.toolbar.fileSelector)
        .data('monkey-editor', this)
        .change(monkey.toolbar.bindings.fileChange)
        .on('dragenter dragover', false)
        .on('drop',monkey.toolbar.bindings.fileDrop);

        // Action buttons
        this.toolbar.find(this.options.toolbar.actionBtnSelector)
        .data('monkey-editor', this)
        .click(monkey.toolbar.bindings.btnClick);

        // Editor
        // editor.$.on('mouseup keyup mouseout', function() {
        //     editor.saveSelection();
        //     toolbar.update();
        // });
        editor.$
        .on('mouseup monkey:afterSelectDiv', function() {
            toolbar.update();
        })
        .on('blur', function() {
            editor.saveSelection();
        });

        /* Monkey events */
        this.$.on('monkey:execCommand', function() {
            toolbar.update();
        });

        this.$.on('monkey:afterViewSwitch', function (e) {
            toolbar.switchView(e.toView);
        });

        this.$.on('monkey:toggleFullscreen', function (e) {
            toolbar.toggleFullscreen(e.fullscreen);
        });

        /* Window events */
        $(window).on('resize', toolbar.resetFullscreenWrapperTop);
    });
})(jQuery);
