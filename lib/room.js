module.exports = class Room {

    constructor(id, name) {
    
        if (id === undefined || id === '') {
            throw 'room id required';
        } else if (!/^[a-z]+$/.test(id)) {
            throw 'room id must contain only lowercase letters';
        }
        this.id = id;
        if (name === undefined) {
            let firstLetter = id.substring(0, 1);
            this.name = firstLetter.toUpperCase() + id.substring(1);
        } else {
            this.name = name;
        }

        this.messages = [];
    }

    messageCount() {
        return this.messages.length;
    } 

    sendMessage(message) {
        this.messages.push(message);
    }

    messagesSince(time) {
        return this.messages.filter(message => {
            //return message.when >= time;  (this works too)
            return new Date(message.when) >= time;
        });
    }
}