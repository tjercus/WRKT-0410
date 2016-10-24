import React from "react";
import EventEmitter from "eventemitter2";
import {EventsEnum as ee} from "./constants";

export default class PanelComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isVisible: false};
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          {this.props.name}
        </header>
        <div className="panel-body">
           {`This panel listens to menu item: ${this.props.from}`}
        </div>
      </section>
    );
  }
};

PanelComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  name: React.PropTypes.string.isRequired,
  from: React.PropTypes.string.isRequired,
};
