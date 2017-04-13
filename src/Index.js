import React from "react";
import { render } from "react-dom";
import AppComponent from "./shell/AppComponent";

window.React = React;

render(<AppComponent startWithDefaultTraining={true} />
	, document.getElementById("app"));
