import React from "react";
import EventEmitter from "eventemitter2";

export default class DayEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      dayNr: null,
      day: {
        workout: {}
      }
    };
    //this.onButtonClick = this.onButtonClick.bind(this); // TODO phat arrow
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", ((menuItemName, dayNr) => {
      console.log("DayEditComponent: received MENU_CLICK_EVT " + dayNr);
      this.setState({
        dayNr: dayNr
      });
      if (menuItemName === this.props.from) {
        this.setState({
          isVisible: true
        });
      } else {
        this.setState({
          isVisible: false
        });
      }
      if (dayNr !== null) {
        console.log("DayEditComponent: sending DAY_LOAD_CMD " + dayNr);
        this.props.eventbus.emit("DAY_LOAD_CMD", dayNr);
      }
    }));

    this.props.eventbus.on("DAY_LOAD_EVT", ((day) => {
      console.log("DayEditComponent: received DAY_LOAD_EVT " + JSON.stringify(day));
      this.setState({
        day: day
      });
    }));
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
    let workoutName = "no workout selected";
    if (this.state.day !== null && this.state.day.workout !== undefined) {
      workoutName = this.state.day.workout.name;
    }
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>Day Edit Screen</p>
        </header>
        <div className="panel-body">
           {workoutName}
        </div>
      </section>
    );
  }
};