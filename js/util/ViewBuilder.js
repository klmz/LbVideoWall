ViewBuilder = function() {
    this.btn = function(name, clickFunction) {
        var btn = document.createElement("button");
        btn.appendChild(document.createTextNode(name));
        if (clickFunction) {
            btn.onclick = clickFunction;
        }

        return btn;
    }
}

ViewBuilder.btn = function(name, clickFunction, options) {

    var btn = document.createElement("button");
    btn.classList.add('btn')
    if (options) {
        if (options.type) {
            btn.classList.add(options.type);
        }
        if (options.classes) {
            btn.classList.add(options.classes);
        }
    }
    btn.appendChild(document.createTextNode(name));
    if (clickFunction) {
        btn.onclick = clickFunction;
    }

    return btn;
}

module.exports = ViewBuilder;