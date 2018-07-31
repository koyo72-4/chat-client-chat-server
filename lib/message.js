module.exports = class Message {
    constructor(options = {}) {
        // if (!options) {
        //     let options = {};
        // }
        this.when = new Date();
        // if (author in options) {
        //     this.author = options.author;
        // } else {
        //     this.author = 'anonymous';
        // }
        this.author = options.author || 'anonymous';
        this.body = options.body || '';
    }
}