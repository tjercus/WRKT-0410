import React from "react";
import EventEmitter from "eventemitter2";

export default class NotificationComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {messages: []};
  }
  
  componentDidMount() {
    this.props.eventbus.onAny((type, data) => {
      const _messages = this.state.messages;
      _messages.push(type);
      this.setState({messages: _messages});
    });
  }
  
  render() {    
    return (
      <div className="notification-panel">
        <ul>
          {
            this.state.messages.map(function(message) {
              return <li key={message}>{message}</li>
            })
          }
        </ul>
      </div>
    );
  }
};
