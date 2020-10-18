const express = require("express");
const https = require("https");
const socketIO = require("socket.io");
const fs = require("fs");
const peer = require("peer");

// App
const app = express();

const SSL_KEY = fs.readFileSync("./key.pem");
const SSL_CERT = fs.readFileSync("./cert.pem");
const SSL_PASSPHRASE = "mypassphrase";

// PeerJS Server for WebRTC Handling
const peerJsServer = peer.PeerServer({
    port: 8081,
    ssl: {
        cert: SSL_CERT,
        key: SSL_KEY,
        passphrase: SSL_PASSPHRASE
    }
})

// HTTP Server
const httpServer = https.createServer({
    cert: SSL_CERT,
    key: SSL_KEY,
    passphrase: SSL_PASSPHRASE
}, app)

const io = socketIO(httpServer);

app.use(express.static("public"));

// Routes
app.get("*", (req, res) => {
    res.sendFile("public/index.html");
});

const rooms = {};
const peerData = {};

// Socket IO handlers
io.on("connection", clientSocket => {
    // Record PeerID and map with socket id
    clientSocket.on("myPeerID", data => {
        peerData[clientSocket.id] = { name: data.name, peerID: data.peerID, rooms: [] }
        console.log("Socket Peer Data", peerData)
    })

    // Client asks to join to a specific room
    clientSocket.on("joinRoom", data => {

        // join this client to roomID
        clientSocket.join(data.roomID)

        // if room not exist create one else append to array
        if (rooms[data.roomID])
            rooms[data.roomID].push({ socketID: clientSocket.id })
        else
            rooms[data.roomID] = [{ socketID: clientSocket.id }]

        // Send Peers list to joinee
        const clients = rooms[data.roomID].filter(client => client.socketID !== clientSocket.id)
        const peers = []
        clients.forEach(client => {
            if (peerData[client.socketID])
                peers.push({ socketID: client.socketID, name: peerData[client.socketID].name, peerID: peerData[client.socketID] })
        });
        console.log(peers)
        clientSocket.emit("peersList", peers)

        // Inform the room about this new joined client
        io.to(data.roomID).emit("userJoined", { socketID: clientSocket.id, name: peerData[clientSocket.id].name, peerID: peerData[clientSocket.id].peerID })

        // Add roomID to respective peer's data
        peerData[clientSocket.id].rooms.push(data.roomID)
    })

    clientSocket.on("groupChat", data => {
        console.log(data)
        const message = {
            roomID: data.roomID,
            senderName: data.senderName,
            messageContent: data.messageContent,
            senderSocket: clientSocket.id
        }
        io.to(data.roomID).emit("groupChat", message)
    })

    // when client disconnects remove from peer list and room list
    clientSocket.on("disconnect", _ => {
        for (let room in rooms) {
            // delete the room if no client is present after removing this client else remove this only
            if (rooms[room].length === 1)
                delete rooms[room]
            peerData[clientSocket.id].rooms.forEach(room => io.to(room).emit("userLeft", { socketID: clientSocket.id }))
        }
        delete peerData[clientSocket.id]
    })
});

httpServer.listen(8080, _ => console.log("Listenting on PORT: 8080"));
