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

ViewBuilder.btn = function(name, clickFunction) {
    var btn = document.createElement("button");
    btn.appendChild(document.createTextNode(name));
    if (clickFunction) {
        btn.onclick = clickFunction;
    }

    return btn;
}

module.exports = ViewBuilder;