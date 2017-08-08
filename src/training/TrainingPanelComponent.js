import React from "react";
import EventEmitter from "eventemitter4";
import {EventsEnum as ee} from "../shell/constants";
import TrainingContainer from "./TrainingContainer";

export default class TrainingPanelComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    name: React.PropTypes.string.isRequired,
    from: React.PropTypes.string.isRequired,
  };

  constructor(props) {
    console.log(`TrainingPanelComponent constructor`);
    super(props);
    this.state = {isVisible: false};
    this.eventbus = props.eventbus;
  }

  componentDidMount() {
    console.log(`TrainingPanelComponent did mount`);
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      console.log(`TrainingPanelComponent caught MENU_CLICK_EVT with ${menuItemName}`);
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    return (
      <div className={panelClassName}>
        <TrainingContainer eventbus={this.eventbus} />
      </div>
    );
  }
};
