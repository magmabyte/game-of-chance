function isFunction(that) {
    return typeof(that) === 'function';
}

export class ResizeHandler {
    millisCheckForResizeEnd = 200;
    onResizeStart;
    onResizeEnd;
    newResizeCycle = true;
    timeoutHandler;

    constructor() {
        $(window).resize(() => this.onResize());
    }

    onResize() {
        if (this.timeoutHandler)
            clearTimeout(this.timeoutHandler);
        this.timeoutHandler = setTimeout(() => {
            this.newResizeCycle = true;
            if (isFunction(this.onResizeEnd))
                this.onResizeEnd();
        }, this.millisCheckForResizeEnd);

        if (this.newResizeCycle) {
            this.newResizeCycle = false;
            if (isFunction(this.onResizeStart))
                this.onResizeStart();
        }
    }
}

