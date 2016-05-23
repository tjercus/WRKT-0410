import React from "react";
import EventEmitter from "eventemitter2";

export default class MenuComponent extends React.Component {

  constructor(props) {
    super(props);    
    this.state = {
      activeName: ""
    }
    this.onButtonClick = this.onButtonClick.bind(this); // TODO phat arrow
  }
    
  onButtonClick(evt) {
    let name = evt.target.value;
    this.setState({activeName: name});
    this.props.eventbus.emit("MENU_CLICK_EVT", name);
  };
  
  render() {
    return (
      <ul className="menu">
        <li className="submenu">
          <button onClick={this.onButtonClick} className={this.state.activeName === 'menu-item-training' ? 'button-active button-flat' : 'button-flat'} value="menu-item-training">
            {"Training"}
          </button>
        </li>
        <li className="submenu">
          <button onClick={this.onButtonClick} className={this.state.activeName === 'menu-item-timeline' ? 'button-active button-flat' : 'button-flat'} value="menu-item-timeline">
            {"Timeline"}
          </button>
        </li>
        <li className="submenu">
          <button onClick={this.onButtonClick} className={this.state.activeName === 'menu-item-settings' ? 'button-active button-flat' : 'button-flat'} value="menu-item-settings">
            {"Settings"}
          </button>
        </li>
      </ul>
    );
  }
};
