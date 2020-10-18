import React, { useState } from 'react';
import { Grid, Button, Tabs, Tab, TextField } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import "./Welcome.scss";


/**
 * TabPanel that acts as parent to tab content
 * @param {*} props 
 */
function TabPanel(props) {
    if (props.value === props.index)
        return props.children;
    else
        return null;
}


/**
 * Welcome component, this is the landing component.
 */
function Welcome() {

    const history = useHistory();
    const [tabIndex, updateTabIndex] = useState(0);

    let name = "";
    let roomID = "";

    // Event Handlers
    function joinRoom() {
        if (name.trim() !== "" && roomID.trim() !== "")
            history.push(`/room/${roomID}?name=${name}&action=join`);
    }
    function createRoom() {
        const ROOM_ID = Math.random().toString().substr(2, 6);
        if (name.trim() !== "")
            history.push(`/room/${ROOM_ID}?name=${name}&action=create`);
    }
    return (
        // Root Flex Container
        <Grid container justify="center" alignItems="center" className="Welcome">
            {/* Dialog Flex Container */}
            <Grid container direction="column" justify="center" alignItems="center" className="Welcome__dialog">
                {/* Tab bar */}
                <Tabs value={tabIndex} onChange={(event, newIndex) => updateTabIndex(newIndex)}>
                    <Tab label="Join Meeting" />
                    <Tab label="Create Meeting" />
                </Tabs>
                {/* Tab 1 (Join Meeting tab) */}
                <TabPanel value={tabIndex} index={0}>
                    <Grid container direction="column" justify="center" alignItems="stretch" className="MeetingForm">
                        <TextField onChange={event => name = event.target.value} className="MeetingForm__Fields" variant="outlined" label="Enter Name" />
                        <TextField onChange={event => roomID = event.target.value} className="MeetingForm__Fields" variant="outlined" label="Enter Room ID" />
                        <Button onClick={joinRoom} variant="contained" className="MeetingForm__Action">Join Meeting</Button>
                    </Grid>
                </TabPanel>
                {/* Tab 2 (Create Meeting tab) */}
                <TabPanel value={tabIndex} index={1}>
                    <Grid container direction="column" justify="center" alignItems="stretch" className="MeetingForm">
                        <TextField onChange={event => name = event.target.value} className="MeetingForm__Fields" variant="outlined" label="Enter Name" />
                        <Button onClick={createRoom} variant="contained" className="MeetingForm__Action">Create Meeting</Button>
                    </Grid>
                </TabPanel>
            </Grid>
        </Grid>
    )
}

export default Welcome; 
