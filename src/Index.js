import React from "react";
import { render } from "react-dom";
import AppComponent from "./components/AppComponent";

window.React = React;

render(<AppComponent />, document.getElementById("app"));
