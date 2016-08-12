import React from "react";
import EventEmitter from "eventemitter2";

export default class DayEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      dayUuid: null,
      day: {
        training: {}
      }
    };
    //this.onButtonClick = this.onButtonClick.bind(this); // TODO phat arrow
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", ((menuItemName, dayUuid) => {
      this.setState({
        dayUuid: dayUuid
      });
      (menuItemName === this.props.from) ? this.setState({ isVisible: true }): this.setState({ isVisible: false });
      if (dayUuid !== null) {
        console.log(`DayEditComponent: sending DAY_LOAD_CMD ${dayUuid}`);
        this.props.eventbus.emit("DAY_LOAD_CMD", dayUuid);
      }
    }));

    this.props.eventbus.on("DAY_LOAD_EVT", ((day) => {
      console.log(`DayEditComponent: received DAY_LOAD_EVT ${JSON.stringify(day)}`);
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
    let trainingName = "no training selected";
    if (this.state.day !== null && this.state.day.training !== undefined) {
      trainingName = this.state.day.training.name;
    }
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <p>Day Edit Screen</p>
        </header>
        <div className="panel-body">
           {trainingName}
        </div>
      </section>
    );
  }
};
