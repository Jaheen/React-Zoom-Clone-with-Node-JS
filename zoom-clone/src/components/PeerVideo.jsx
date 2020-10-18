import React, { Component } from 'react'
import "./PeerVideo.scss"


/**
 * Peer Video Component
 */
class PeerVideo extends Component {
    constructor(props) {
        super(props)
        // Refs
        this.peerVideoRef = React.createContext()
        // props
        this.destPeerName = props.destPeerName
        this.destPeerID = props.destPeerID
        this.myPeer = props.myPeer
        this.myMediaStream = props.myMediaStream
    }
    componentDidMount() {
        // Call the destination peer with media stream
        this.myPeer.call(this.destPeerID, this.myMediaStream)
            .on("stream", destPeerStream => {
                this.peerVideoRef.current.srcObject = destPeerStream
                this.peerVideoRef.current.addEventListener("loadedmetadata", _ => this.peerVideoRef.current.play())
            })
        // When peer call arrives answer it with media stream
        this.myPeer.on("call", call => {
            call.answer(this.myMediaStream)
            call.on("stream", destPeerStream => {
                this.peerVideoRef.current.srcObject = destPeerStream
                this.peerVideoRef.current.addEventListener("loadedmetadata", _ => this.peerVideoRef.current.play())
            })
        })
    }
    render() {
        return (
            <div className="PeerVideoContainer" >
                <p className="peer__name">{this.destPeerName}</p>
                <video autoPlay controls playsInline ref={this.peerVideoRef} className="peer__video"></video>
            </div>
        )
    }
}

export default PeerVideo
