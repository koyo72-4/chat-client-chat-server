const http = require('http');     
const mime = require('mime-types');
const port = process.env.PORT || 5000; 

const Assistant = require('./lib/assistant');
const House = require('./lib/house');

let chatHouse = new House();
chatHouse.roomWithId('general').name = 'General';

http.createServer(handleRequest).listen(port);
console.log('Listening on port ' + port);

function handleRequest(request, response) {
    let assistant = new Assistant(request, response);
    let path = assistant.path;

    let pathParams = parsePath(path);
    console.log({ pathParams });

    try {
        if (path === '/') {
            assistant.sendFile('./public/index.html');
        } else if (pathParams.action === 'room') {
            if (request.method === 'POST') {
                assistant.parsePostParams(params => {
                    console.log('params returned from parsePostParams:', params);
                    chatHouse.roomWithId(params.roomId).name = params.roomName;
                    let data = JSON.stringify(params);
                    console.log('data:', data);
                    let type = mime.lookup('json');
                    assistant.finishResponse(type, data);
                });
            } else if (request.method === 'GET') {
                let allRooms = chatHouse.rooms;
                let roomIdArray = Object.values(allRooms).map(room => room.id);
                let roomNameArray = Object.values(allRooms).map(room => room.name);
                let roomObject = { idArray: roomIdArray, nameArray: roomNameArray };
                let data = JSON.stringify(roomObject);
                let type = mime.lookup('json');
                assistant.finishResponse(type, data);
            }
        } else if (pathParams.action === 'chat') {
            if (request.method === 'GET') {
                console.log('assistant.url.search:', assistant.url.search);
                let previousTime;
                if (assistant.url.search && assistant.url.search !== '?since=allTime') {
                    let queryParts = assistant.url.search.split('=');
                    previousTime = calculatePreviousTime(queryParts);
                } else {
                    previousTime = 0;
                }
                let { data, type } = prepareGetResponse(pathParams, previousTime);
                assistant.finishResponse(type, data);
            } else if (request.method === 'POST') {
                let room = pathParams.roomId;
                assistant.parsePostParams(params => {
                    console.log('params returned from parsePostParams:', params);
                    chatHouse.sendMessageToRoom(room, params);
                    let dataArray = chatHouse.roomWithId(room).messages;
                    let data = JSON.stringify(dataArray);
                    console.log('data:', data);
                    let type = mime.lookup('json');
                    assistant.finishResponse(type, data);
                });
            }
        } else {
            let fileName = path.slice(1);
            assistant.sendFile(fileName);
        }
    } catch (error) {
        assistant.sendError(404, 'Error: ' + error.toString());
    }
}

function parsePath(path) {
    console.log('in parsePath. path is', path);
    let pathParts = path.slice(1).split('/');
    let [action, roomId] = pathParts;
    let pathParams = { action: action, roomId: roomId };
    return pathParams;
}

function calculatePreviousTime(queryParts) {
    let sinceValue = queryParts[1];
    let millisecondDiff;
    if (sinceValue === '10s') millisecondDiff = 10000;
    if (sinceValue === '1min') millisecondDiff = 60000;
    if (sinceValue === '5min') millisecondDiff = 300000;
    console.log('millisecondDiff:', millisecondDiff);
    let now = Date.now();
    let previousTime = now - millisecondDiff;
    return previousTime;
}

function prepareGetResponse(pathParams, previousTime) {
    let room = pathParams.roomId;
    let messages = chatHouse.roomWithId(room).messagesSince(previousTime);
    console.log('messages:', messages);
    let dataObject = { room: room, messages: messages };
    let data = JSON.stringify(dataObject);
    console.log('data:', data);
    let type = mime.lookup('json');
    return { data: data, type: type };
}
