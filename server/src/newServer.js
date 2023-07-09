import ObjectId, { jsonFind, db, connectToCluster } from './config/initDB.js';
import express from "express"; // Express
// import cors from "cors"; // CORS
// import { jsonFind, connectToCluster } from './config/initDB.js'; // Initialize a DataBase
// import * as routes from "./api/v1/routes/index.js"; // Route
import http from "http";
import app from './app.js';
import { Server } from "socket.io";
import * as routes from "./api/v1/routes/index.js"; // Route



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
    },
});

app.set('socketio', io);

http.globalAgent.maxHeaderSize = 16 * 1024 * 1024;




io.on('connect', (socket) => {
    console.log(`${socket.id} connect`);


    socket.on('joinGame', (data) => {
        routes.joinGame(data, io, socket);
    });


    socket.on('pingIo', (data) => {
        io.emit('pong')
    });

    socket.on('pingSocket', (data) => {
        console.log("Socket ping")
        socket.emit('pong')
    });

    socket.on('roomPing', (data) => {
        io.in(data.roomId).emit("ping");
    });

    socket.on('ready', (data) => {
        routes.ready(data, io, socket);
    });

    socket.on('answerGame', (data) => {
        socket.emit("pong")
        // const dataAnswerGame = await routes.answerGame(data, socket, io);
        // console.log(dataAnswerGame)
        // if (dataAnswerGame !== null) {
        //     console.log("EMITTING....;")
        //     // socket.emit("pong")
        //     // socket.emit("answerReturnIndex", dataAnswerGame);
        //     // socket.emit("pong")
        //     // io.emit("pong")
        // }
    });


    socket.on('chat', async (data) => {

        console.log(data)

        console.log("CHAT");

        const {token, chat, id} = data;

        // Verify the validity of the token
        const userInfoQuery = await db.collection("users").findOne({token: token}, {projection: {name: 1, chat: 1}});

        // In the case that the user doesn't exists
        if (userInfoQuery === null) {
            console.log("User doesn't exist")
            return;
        }

        const userInfo = jsonFind(userInfoQuery);

        // Get the information about the game and verify that it exists
        const gameInfo = await db.collection("game").findOne({_id: new ObjectId(id)}, {projection: {_id: 0}});
        // const gameInfo = await db.collection("game").findOne({_id: new ObjectId(id), over: false}, {projection: {_id: 0}});

        // If the game doesn't exists
        if (gameInfo === null) {
            console.log("Game doesn't exist");
            return;
        }

        // If the user doesn't have the chat that it wants to send
        if (!userInfo.chat.includes(chat)) {
            console.log("User doesn't have this chat");
            return;
        }

        // If everything from the start seems to be correct, emit the data to all the users
        io.to(""+id).emit("chat", {fromUser: userInfo.name, chat: chat});
    });


    socket.on("handleTie", (data) => {
        routes.handleTie(data, io);
    });
  
    socket.on('ping', (data) => {
        console.log('Receive ping');
    
        io.emit('pong', {});  
        console.log('Send pong');
    });

    // socket.on('testPing', routes.testPing);

    socket.on('join', (room) => {
        console.log("<=== ROOM ===>")
        console.log("Joined room: " + room)
        socket.join(room);
        console.log("<============>")
    });
  
    socket.on('disconnect', (reason) => {
        console.log(`${socket.id} disconnected. Reason ${reason}`);
        socket.disconnect(0);
    });
});

server.listen(5000, () => {
    console.log("Server is running on port 5000.");
});
