import React from "react";
import EventEmitter from "eventemitter4";
import { EventsEnum as ee } from "../shell/constants";

import TrainingInstanceComponent from "./TrainingInstanceComponent";

export default class DayEditComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    name: React.PropTypes.string.isRequired, // panel name
    from: React.PropTypes.string.isRequired, // related menu item name
  };

  state = {
    isVisible: false,
    dayUuid: null,
    day: { trainings: [] },
    selectedNr: null,
    date: null,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, menuItemName => {
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        // this.setState({isVisible: false});
        console.log("TIC: wipe local state");
        this.setState({
          isVisible: false,
          dayUuid: null,
          day: { trainings: [] },
          selectedNr: 0,
          date: null,
        });
      }
    });

    this.props.eventbus.on(ee.DAY_LOAD_EVT, (day, date) => {
      console.log(`DayEditComponent caught DAY_LOAD_EVT for day [${day.uuid}] with ${day.trainings.length}`);
      this.setState({ day: day, date: date });
    });

    this.props.eventbus.on(ee.DAY_UPDATE_EVT, (day, date) => {
      console.log(`DayEditComponent caught DAY_UPDATE_EVT for day [${day.uuid}] with ${day.trainings.length} trainings`);
      this.setState({ day: day, date: date });
    });
  }

  /**
   * @param {SyntheticEvent} evt
   * @returns {void}
   */
  onLoadTrainingClick = (evt) => {
    const nr = evt.target.value;
    this.setState({ selectedNr: nr }); // TODO need to keep state for this?
    console.log(`DayEditComponent.onLoadTrainingClick ${JSON.stringify(this.state.day)}`);
    this.props.eventbus.emit(ee.INSTANCE_LOAD_CMD, this.state.day.trainings[nr]);
  };

  /**
   * @param {SyntheticEvent} evt
   * @returns {void} - emits on eventbus instead
   */
  onCloseButtonClick = (evt) => {
    this.props.eventbus.emit(ee.MENU_CLICK_EVT, "menu-item-timeline");
  };

  /**
   * Open a new training in the context of the day
   * @param {SyntheticEvent} evt
   * @returns {void} - emits on eventbus instead
   */
  onAddTrainingButtonClick = (evt) => {
    this.props.eventbus.emit(ee.INSTANCE_CREATE_CMD, this.state.day.uuid);
  };

  /**
  * React render
  */
  render() {
    const panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";

    let trainingButtonListItems = this.state.day.trainings.map((training, i) => {
      return (
        <li key={training.uuid}>
          <button onClick={this.onLoadTrainingClick} value={i} className="button-small">
            {training.name}
          </button>
        </li>
      );
    });

    // TODO print date for this day
    // {this.state.date.toString()} // can be null

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>
            {"Day Edit Screen "}
            <button onClick={this.onCloseButtonClick} className="button-flat">close</button>
          </p>
        </header>
        <div className="panel-body">
          <h3>{"Trainings"}</h3>
          <button onClick={this.onAddTrainingButtonClick} className="button-flat">add another training</button>
          <ul>
            {trainingButtonListItems}
          </ul>
          <TrainingInstanceComponent eventbus={this.props.eventbus} />
        </div>
      </section>
    );
  }
}