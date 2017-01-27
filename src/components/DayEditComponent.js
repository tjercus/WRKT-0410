import React from "react";
import EventEmitter from "eventemitter2";
import {EventsEnum as ee} from "../constants";

import TrainingInstanceComponent from "./TrainingInstanceComponent";

export default class DayEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      dayUuid: null,
      day: {trainings: []},
      selectedNr: 0,
    };
    this.onLoadTrainingClick = this.onLoadTrainingClick.bind(this); // TODO phat arrow
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on(ee.DAY_LOAD_EVT, (day) => {
      console.log(`DayEditComponent caught DAY_LOAD_EVT for day [${day.uuid}]`);
      this.setState({ day });
    });

    // this.props.eventbus.on(ee.SEGMENT_UPDATE_EVT, (segment) => {
    //   // TODO update total in the right day.trainings[x]
    //   // this.day.trainings etc.
    // });
  }

  /**
   * @param {SyntheticEvent} evt
   * @returns {void}
   */
  onLoadTrainingClick(evt) {
    const nr = evt.target.value;
    this.setState({ selectedNr: nr });
    this.props.eventbus.emit(ee.INSTANCE_LOAD_CMD, this.state.day.trainings[nr]);
  }

  /**
   * @param {SyntheticEvent} evt
   * @returns {void} - emits on eventbus instead
   */
  onCloseButtonClick(evt) {
    this.props.eventbus.emit(ee.MENU_CLICK_EVT, "menu-item-timeline");
    this.props.eventbus.emit(ee.DAY_UPDATE_CMD, this.state.day);
  }

  /**
  * React render
  */
  render() {
    const panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";

    let selectedTrainingComponent = "none";
    if (this.state.day !== null && this.state.day.trainings && this.state.day.trainings.length > 0) {
      console.log(`DayEditComponent render with a new TrainingInstanceComponent ${this.state.day.trainings.map((t) => {t.uuid + "|"} )}`);
      selectedTrainingComponent = <TrainingInstanceComponent
        eventbus={this.props.eventbus} training={this.state.day.trainings[this.state.selectedNr]} />;
    } else {
      console.log(`DayEditComponent render NOT with a new TrainingInstanceComponent`);
    }

    let trainingButtonListItems = this.state.day.trainings.map((training, i) => {
      return <li key={i}>
        <button onClick={this.onLoadTrainingClick} value={i}
                className="button-small">{training.name}</button>
      </li>;
    });

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>{"Day Edit Screen"} <button onClick={this.onCloseButtonClick} className="button-flat">close</button></p>
        </header>
        <div className="panel-body">
          <h3>{"Trainings"}</h3>
          <ul>
            {trainingButtonListItems}
          </ul>
          {selectedTrainingComponent}
        </div>
      </section>
    );
  }
};

DayEditComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  name: React.PropTypes.string.isRequired, // panel name
  from: React.PropTypes.string.isRequired, // related menu item name
};
