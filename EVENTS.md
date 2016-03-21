# Events

```
// Monkey Text Editor
monkey:beforeViewSwitch toView
monkey:afterViewSwitch toView
monkey:execCommand command, args, insertedElement
monkey:execAction action, param
monkey:toggleFullscreen fullscreen(bool)

// Editor
monkey:fileInserted insertedElement
monkey:selectionBoxMoved target
monkey:selectionBoxReplaced target
monkey:selectDiv selectTarget
monkey:afterSelectDiv selectTarget
monkey:unselectDiv selectTarget
monkey:afterUnselectDiv selectTarget
monkey:elementRemoved removedElement

// Input elements on update
// data-action=setCss
monkey:valueUpdated cssProperty, newValue
// Other data-action
monkey:valueUpdated keyword, newValue
```

# Setting up image autoupload to server

```
monkey:fileInserted
monkey:elementRemoved
```