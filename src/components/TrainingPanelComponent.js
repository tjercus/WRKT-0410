import React from "react";
import EventEmitter from "eventemitter2";

import TrainingComponent from "./TrainingComponent";

export default class TrainingPanelComponent extends React.Component {

  constructor(props) {
    console.log(`TrainingPanelComponent constructor`);
    super(props);
    this.state = {isVisible: false};
    this.eventbus = props.eventbus;
  }

  componentDidMount() {
    console.log(`TrainingPanelComponent did mount`);
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      console.log(`TrainingPanelComponent caught MENU_CLICK_EVT with ${menuItemName}`);
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    return (
      <div className={panelClassName}>
        <TrainingComponent eventbus={this.eventbus} />
      </div>
    );
  }
};
