import React from "react";
import EventEmitter from "eventemitter2";

import TrainingInstanceComponent from "./TrainingInstanceComponent";

export default class DayEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      dayUuid: null,
      day: null
    };
    //this.onButtonClick = this.onButtonClick.bind(this); // TODO phat arrow
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on("DAY_LOAD_EVT", (day) => {
      console.log(`DayEditComponent: received DAY_LOAD_EVT ${JSON.stringify(day)}`);
      this.setState({
        day: day
      });
    });
  }

  loadTrainingClick(evt) {
    const nr = evt.target.value;
    // TODO trigger re-render with TIC loaded for this training, use props?
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

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    let trainingName = "no training selected";
    let trainings = [
      {name: "none"}, 
      {name: "none"}
    ];
    if (this.state.day !== null && this.state.day.trainings) {
      trainings[0] = this.state.day.trainings[0];
      //trainingName = trainings[0].name;
      if (this.state.day.trainings.length === 2) { 
        trainings[1] = this.state.day.trainings[1];
      }
    }
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>Day Edit Screen</p>
        </header>
        <div className="panel-body">
          <h3>{"Trainings"}</h3>
          <ul>
            <li><a onClick={this.loadTrainingClick} value={0}>{trainings[0].name}</a></li>
            <li><a >{trainings[1].name}</a></li>
          </ul>
        </div>
      </section>
    );
  }
};

// <TrainingInstanceComponent eventbus={this.props.eventbus} />
