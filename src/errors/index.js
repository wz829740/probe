export default class Errors {
    constructor() {
        this.errorBuff = [];
    }
    collect(event) {
        const srcElement = event.srcElement;
        if (srcElement === window) { // js运行错误
            let newMsg = event.message;
            if (event.error && event.error.stack) {
                newMsg = this.processStackMsg(event.error);
            }
            if (this.isOBJByType(newMsg, "Event")) {
                newMsg += newMsg.type ?
                    ("--" + newMsg.type + "--" + (newMsg.target ?
                        (newMsg.target.tagName + "::" + newMsg.target.src) : "")) : "";
            }
            this.errorBuff.push({
                msg: newMsg,
                target: event.filename,
                rowNum: event.lineno,
                colNum: event.colno,
                _orgMsg: event.message,
                timeStamp: event.timeStamp
            });
        }
        else { // 静态资源加载错误
            this.errorBuff.push({
                path: event.path.reverse(),
                target: event.target,
                timeStamp: event.timeStamp,
                filename: event.srcElement.baseURI,
                src: event.srcElement.src,
                html: event.srcElement.outerHTML
            });
        }
    }
    
    /**
     * 处理错误栈信息
     */
    processStackMsg (error){
        var stack = error.stack
            .replace(/\n/gi, "")
            .split(/\bat\b/)
            .slice(0, 9)
            .join("@")
            .replace(/\?[^:]+/gi, "");
        var msg = error.toString();
        if (stack.indexOf(msg) < 0) {
            stack = msg + "@" + stack;
        }
        return stack;
    }
    isOBJByType (o, type) {
        return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]";
    } 
}
