export class ExternalData {
    constructor(statusLine, time) {
        this.statusLine = statusLine;
        this.time = time;
    }

    getStatusLine() { 
        if (this.statusLine === "" || this.statusLine === undefined) {
            return "";
        }
        return this.statusLine;
    }

    getTime() {
        if (this.time === null || this.time === undefined) {
            return -1;
        }
        return this.time;
    }

    static createEmpty() {
        return new ExternalData("", null);
    }
}