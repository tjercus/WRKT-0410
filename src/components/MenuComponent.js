import React from "react";
import EventEmitter from "eventemitter4";
import {EventsEnum as ee} from "../constants";

export default class MenuComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeName: ""
    };
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      this.setState({activeName: menuItemName});
    });
  }

  onButtonClick = (evt) => {
    let name = evt.target.value;
    this.setState({activeName: name});
    this.props.eventbus.emit(ee.MENU_CLICK_EVT, name);
  };

  // TODO refactor li into component
  render() {
    return (
      <ul className="menu">
        <li className="submenu">
          <button onClick={this.onButtonClick}
          className={this.state.activeName === 'menu-item-training' ? 'button-active button-flat' : 'button-flat'}
          value="menu-item-training">
            {"Training"}
          </button>
        </li>
        <li className="submenu">
          <button onClick={this.onButtonClick}
          className={this.state.activeName === 'menu-item-planlist' ? 'button-active button-flat' : 'button-flat'}
          value="menu-item-planlist">
            {"Plans"}
          </button>
        </li>
        <li className="submenu">
          <button onClick={this.onButtonClick}
          className={this.state.activeName === 'menu-item-timeline' ? 'button-active button-flat' : 'button-flat'}
          value="menu-item-timeline">
            {"Timeline"}
          </button>
        </li>
        <li className="submenu">
          <button onClick={this.onButtonClick}
          className={this.state.activeName === 'menu-item-settings' ? 'button-active button-flat' : 'button-flat'}
          value="menu-item-settings">
            {"Settings"}
          </button>
        </li>
      </ul>
    );
  }
};

