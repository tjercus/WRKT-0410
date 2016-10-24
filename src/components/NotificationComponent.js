import React from "react";
import EventEmitter from "eventemitter2";
import {EventsEnum as ee} from "./constants";

/**
 * TODO slide up css transition
 * TODO timeout hide
 */
export default class NotificationComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { messages: [] };
    this.notificationTimeout = 0;
    this.createNotification = this.createNotification.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.removeLastMessage = this.removeLastMessage.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.onAny((type, data) => {
      if (type === "SET_NOTIFICATION_TIMEOUT") {
        this.notificationTimeout = data;
      }

      const typeParts = type.split("_");
      if (typeParts.pop() === "EVT") {
        const msg = this.createNotification(type, data);
        if (msg !== null) {
          this.addMessage(msg);
          setTimeout(() => {
            this.removeLastMessage();
          }, this.notificationTimeout);
        }
      }
    });
  }

  createNotification(type, data) {
    let msg = null;
    switch (type) {
      case ee.PLAN_LOAD_EVT:
        msg = `Plan '${data.uuid}' is loaded in store`;
        break;
      case ee.DAY_LOAD_EVT:
        msg = `Day '${data.uuid}' is loaded in DayStore`;
        break;
      case ee.TRAINING_LOAD_EVT:
        msg = `Training '${data.uuid}' is loaded in store`;
        break;
      case ee.TRAININGS_LOAD_ERROR_EVT:
        msg = `Error when trying to load training`;
        break;
      case ee.TRAININGS_PERSIST_EVT:
        msg = `All trainings persisted to disk`;
        break;
      case ee.TRAININGS_PERSIST_ERROR_EVT:
        msg = `Error when trying to persist to disk: ${data}. Is http://localhost:3333 running?`;
        break;
      case ee.PLAN_ADD_EVT:
        msg = `A new plan was created on disk`;
        break;
      case ee.PLAN_ADD_ERROR_EVT:
        msg = `Error when trying to create a new plan on disk`;
        break;
      case ee.PLAN_PERSIST_EVT:
        msg = `All plans persisted to disk`;
        break;
      case ee.PLAN_PERSIST_ERROR_EVT:
        msg = `Error when trying to persist to disk: ${data}. Is http://localhost:3333 running?`;
        break;
      case ee.TRAINING_TO_PLAN_EVT:
        msg = `TrainingInstance was added to plan`;
        break;
      case ee.DAY_EMPTY_EVT:
        msg = `TrainingInstances where removed from a day`;
        break;
      case ee.PLAN_FETCH_ERROR_EVT:
        msg = `Error getting a plan with: ${data}`;
        break;
      default:
        break;
    }
    return msg;
  }

  addMessage(msg) {
    const _messages = this.state.messages;
    _messages.push(msg);
    this.setState({ messages: _messages });
  }

  removeLastMessage() {
    const _messages = this.state.messages;
    _messages.splice(0, 1);
    this.setState({ messages: _messages });
  }

  render() {
    return (
      <div className="notification-panel">
        <ul>
          {
            this.state.messages.map((message, i) => {
              return <li key={message + i}>{message}</li>
            })
          }
        </ul>
      </div>
    );
  }
};

NotificationComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
}
