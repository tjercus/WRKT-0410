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
    }));

    this.props.eventbus.on("DAY_LOAD_EVT", ((day) => {
      this.day = day;
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
     return (
      <section className={panelClassName}>
        <header className="panel-header">
          <h2>Day Edit Screen</h2>
        </header>
        <div className="panel-body">
           {this.state.day.workout.name}
        </div>
      </section>
    );
  }
};