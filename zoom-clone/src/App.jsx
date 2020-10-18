import React from 'react';
import "./App.scss";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Room from "./pages/Room";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          {/* Welcome Page */}
          <Route path="/" exact>
            <Welcome />
          </Route>
          {/* Room Page */}
          <Route path="/room/:ROOM_ID">
            <Room />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
