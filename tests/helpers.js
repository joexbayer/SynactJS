function flushMicrotasks() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function resetDOM() {
    document.body.innerHTML = "";
}

module.exports = { flushMicrotasks, resetDOM };
