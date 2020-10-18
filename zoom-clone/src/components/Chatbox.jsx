import React, { useContext, useRef } from 'react'
import { Grid, IconButton, Tooltip } from "@material-ui/core"
import { Send } from "@material-ui/icons";
import "./Chatbox.scss"
import { RoomContext } from "../pages/Room"


/**
 * Chat Message Component for each message
 */
function ChatMessage(props) {
    return (
        <div className={`ChatMessage ${props.isSentMessage ? "sentMessage" : null}`}>
            <p className="message__senderName">{props.senderName}</p>
            <p className="message__content">{props.messageContent}</p>
        </div>
    )
}

/**
 * Chatbox for Chatting
 */
function Chatbox(props) {
    const context = useContext(RoomContext)
    // Refs
    const inputRef = useRef()
    // functions
    function sendMessage() {
        const messageContent = inputRef.current.value
        if (messageContent.trim() !== "")
            context.socket.emit("groupChat", { roomID: context.ROOM_ID, senderName: context.myName, messageContent })
        inputRef.current.value = ""
    }
    return (
        <Grid container direction="column" className="Chatbox">
            <Grid container justify="center" alignItems="center" className="Chatbox__header">
                <p className="header__title">Chatbox</p>
            </Grid>
            <Grid container direction="column" className="Chatbox__content">
                {/* For each message render Messages */}
                {props.messages.map((message, index) => {
                    const isSentMessage = message.senderName === context.myName
                    return <ChatMessage key={index} isSentMessage={isSentMessage} senderName={message.senderName} messageContent={message.messageContent} />
                })}
            </Grid>
            <Grid container className="Chatbox__action">
                <input type="text" ref={inputRef} className="chat__input" placeholder="Type here ..." />
                <IconButton onClick={sendMessage}>
                    <Tooltip title={"Send to everyone"}>
                        <Send />
                    </Tooltip>
                </IconButton>
            </Grid>
        </Grid>
    )
}

export default Chatbox
