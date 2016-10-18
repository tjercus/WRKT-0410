import React from "react";
import EventEmitter from "eventemitter2";

import TrainingInstanceComponent from "./TrainingInstanceComponent";

export default class DayEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      dayUuid: null,
      day: null,
      selectedNr: 0,
    };
    this.onLoadTrainingClick = this.onLoadTrainingClick.bind(this); // TODO phat arrow
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on("DAY_LOAD_EVT", (day) => {
      this.setState({ day });
    });

    this.props.eventbus.on("SEGMENT_UPDATE_EVT", (segment) => {
      // TODO update total in the right day.trainings[x]
      // this.day.trainings etc.
    });
  }

  /**
   * @param evt
   */
  onLoadTrainingClick(evt) {
    const nr = evt.target.value;
    this.setState({ selectedNr: nr });
    this.props.eventbus.emit("INSTANCE_LOAD_CMD", this.day.trainings[nr]);
  }

  /*
  onButtonClick(evt) {
    let name = evt.target.value;
    this.setState({
      activeName: name
    });
    this.props.eventbus.emit("MENU_CLICK_EVT", name);
  };
  */

  /**
  * React render
  */
  render() {
    const panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    const trainings = [
      { name: "none" },
      { name: "none" },
    ];
    let selectedTrainingComponent = "none";
    // TODO replace this crap!
    if (this.state.day !== null && this.state.day.trainings) {
      trainings[0] = this.state.day.trainings[0];
      if (this.state.day.trainings.length === 2) {
        trainings[1] = this.state.day.trainings[1];
      }
      selectedTrainingComponent = <TrainingInstanceComponent eventbus={this.props.eventbus} training={trainings[this.state.selectedNr]} />;
    }

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>{"Day Edit Screen"}</p>
        </header>
        <div className="panel-body">
          <h3>{"Trainings"}</h3>
          <ul>
            <li><button onClick={this.onLoadTrainingClick} value={0}>{trainings[0].name}</button></li>
            <li><button onClick={this.onLoadTrainingClick} value={1}>{trainings[1].name}</button></li>
          </ul>
          {selectedTrainingComponent}
        </div>
      </section>
    );
  }
};

DayEditComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  name: React.PropTypes.string.isRequired,
  from: React.PropTypes.string.isRequired,
};
