let Room = require('./room.js');
let Message = require('./message.js');

module.exports = class House {

    constructor() {
        this.rooms = {};
    }

    roomWithId(id) {
        if (!(id in this.rooms)) {
            let newRoom = new Room(id);
            this.rooms[id] = newRoom;
            return newRoom;
        } else {
            return this.rooms[id];
        }
    }

    sendMessageToRoom(roomId, messageOptions) {
        let room = this.roomWithId(roomId);
        let message = new Message(messageOptions);
        room.sendMessage(message);
    }

    allRoomIds() {
        return Object.keys(this.rooms);
    }

};