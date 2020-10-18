import React, { Component } from 'react'
import { Grid, Badge, IconButton, Drawer, Tooltip } from "@material-ui/core"
import { Close, Chat, MicOff, Mic, Videocam, VideocamOff } from "@material-ui/icons"
import { withRouter } from "react-router-dom"
import socketIO from "socket.io-client"
import Peer from "peerjs"
import querystring from "querystring"
import "./Room.scss"
import PeerVideo from "../components/PeerVideo"
import Chatbox from "../components/Chatbox"


// Global Context for Room
export const RoomContext = React.createContext()
RoomContext.displayName = "Room's Global Context"

/**
 * Room Component for the Call.
 */
class Room extends Component {
    constructor(props) {
        super(props)
        // States
        this.state = {
            ROOM_ID: this.props.match.params.ROOM_ID,
            query: querystring.parse(this.props.location.search.substr(1)),
            isDrawerOpen: false,
            isMicOn: false,
            isCameraOn: false,
            peerData: {},
            messages: [],
            unreadMessages: 0
        }
        // Refs
        this.myVideoRef = React.createRef()
        this.myMediaStreamRef = React.createRef()
        this.socketRef = React.createRef()
        this.peerRef = React.createRef()
        // Bind methods
        this.toggleCamera = this.toggleCamera.bind(this)
        this.toggleMicrophone = this.toggleMicrophone.bind(this)
    }
    componentDidMount() {
        // Get user media stream and add it to our videostream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.myMediaStreamRef.current = stream
                this.myVideoRef.current.srcObject = stream
            })
        // Initialize SocketIO
        this.socketRef.current = socketIO.connect("/")
        // Initialize PeerJS
        this.peerRef.current = new Peer({ host: "/", port: 8081 })
        // When connected to PeerJS Server and got a peerID
        this.peerRef.current.on("open", peerID => {
            // Send peerID to server
            this.socketRef.current.emit("myPeerID", { name: this.state.query.name, peerID })
            // Join the room
            this.socketRef.current.emit("joinRoom", { roomID: this.ROOM_ID })
            // When room sends active members list append it to state
            this.socketRef.current.on("peersList", peers => {
                const peerData = {}
                peers.forEach(peer => {
                    peerData[peer.socketID] = { name: peer.name, peerID: peer.peerID }
                })
                this.setState({ peerData })
            })
            // When new user joins add him to state
            this.socketRef.current.on("userJoined", newPeer => {
                if (newPeer.socketID !== this.socketRef.current.id) {
                    const peerData = this.state.peerData
                    peerData[newPeer.socketID] = { name: newPeer.name, peerID: newPeer.peerID }
                    this.setState({ peerData })
                }
            })
            // When user leaves the meeting remove him from state
            this.socketRef.current.on("userLeft", user => {
                const peerData = this.state.peerData
                delete peerData[user.socketID]
                this.setState({ peerData })
            })
            // When group chat is made update state
            this.socketRef.current.on("groupChat", message => {
                if (!this.state.isDrawerOpen) {
                    this.setState({
                        unreadMessages: this.state.unreadMessages + 1,
                        messages: [...this.state.messages, message]
                    })
                } else
                    this.setState({ messages: [...this.state.messages, message] })
            })
        })
    }
    toggleCamera() {
        // Toggle Webcam on/off
        this.myMediaStreamRef.current.getVideoTracks()[0].enabled = !this.myMediaStreamRef.current.getVideoTracks()[0].enabled
        this.setState({ isCameraOn: !this.state.isCameraOn })
    }
    toggleMicrophone() {
        // Toggle Mic on/off
        this.myMediaStreamRef.current.getAudioTracks()[0].enabled = !this.myMediaStreamRef.current.getAudioTracks()[0].enabled
        this.setState({ isMicOn: !this.state.isMicOn })
    }
    render() {
        return (
            <RoomContext.Provider value={{ roomID: this.state.ROOM_ID, myName: this.state.query.name, socket: this.socketRef.current }}>
                {/* Root Container */}
                <Grid container direction="column" justify="center" alignItems="center" className="Room">
                    {/* Header */}
                    <Grid container justify="space-evenly" alignItems="center" className="Room__header">
                        <p className="title">Welcome {this.state.query.name}</p>
                        <p className="roomID">Room ID: {this.state.ROOM_ID}</p>
                    </Grid>
                    {/* Video Grid */}
                    <section className="Room__videoGrid">
                        <div className="MyVideoContainer">
                            <p className="myName">{this.state.query.name}</p>
                            <video playsInline autoPlay controls ref={this.myVideoRef} className="myVideo"></video>
                        </div>
                        {/* Render PeerVideo for all peers */}
                        {Object.keys(this.state.peerData).map((socketID, index) => {
                            const peer = this.state.peerData[socketID]
                            return <PeerVideo destPeerName={peer.name} destPeerID={peer.peerID} myPeer={this.peerRef.current} myMediaStream={this.myMediaStreamRef.current} key={index} />
                        })}
                    </section>
                    {/* Room Controls */}
                    <Grid container justify="center" alignItems="center" className="Room__controls">
                        <div className="Room__actions">
                            <IconButton onClick={this.toggleMicrophone}>
                                {this.state.isMicOn ?
                                    (
                                        <Tooltip title="UnMute Mic">
                                            <MicOff />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Mute Mic">
                                            <Mic />
                                        </Tooltip>
                                    )}
                            </IconButton>
                            <IconButton onClick={this.toggleCamera}>
                                {this.state.isCameraOn ?
                                    (
                                        <Tooltip title="Turn On Camera">
                                            <VideocamOff />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Turn Off Camera">
                                            <Videocam />
                                        </Tooltip>
                                    )}
                            </IconButton>
                            <IconButton onClick={_ => this.setState({ isDrawerOpen: true, unreadMessages: 0 })}>
                                <Tooltip title="Open Chats">
                                    <Badge badgeContent={this.state.unreadMessages} color="secondary">
                                        <Chat />
                                    </Badge>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                {/* Side Drawer for showing Chats */}
                <Drawer open={this.state.isDrawerOpen} anchor="right" className="ChatDrawer">
                    {/* Close Drawer Button */}
                    <IconButton onClick={_ => this.setState({ isDrawerOpen: false })} className="drawer__closeBtn">
                        <Tooltip title="Close">
                            <Close />
                        </Tooltip>
                    </IconButton>
                    {/* Chatbox for chatting */}
                    <Chatbox messages={this.state.messages} />
                </Drawer>
            </RoomContext.Provider>
        )
    }
}

export default withRouter(Room);
