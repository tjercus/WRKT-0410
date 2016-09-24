import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import DayComponent from "./DayComponent";

import { clone, createUuid } from "../stores/miscUtil";

export default class TimelineComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      showEasyDays: true,
      days: [],
      name: ""
    };
    //this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
    this.onHideEasyRunsButtonClick = this.onHideEasyRunsButtonClick.bind(this);
    this.onSaveButtonClick = this.onSaveButtonClick.bind(this);
    //this.onEmptyClick = this.onEmptyClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });
    this.props.eventbus.on("PLAN_LOAD_EVT", (plan) => {
      console.log(`TimelineComponent received PLAN_LOAD_EVT with a new plan [${plan.uuid}] as payload`);
      this.setState({ days: plan.days, name: plan.name });
      this.setState({ isVisible: true });
    });
    // this.props.eventbus.on("DAY_EMPTY_EVT", (plan) => {
    //   console.log("TimelineComponent received DAY_EMPTY_EVT with a new plan as payload");
    //   this.setState({ days: plan.days });
    // });
    this.props.eventbus.on("DAY_CLONE_EVT", (plan) => {
      console.log("TimelineComponent received DAY_CLONE_EVT with a new plan as payload");
     this.setState({ days: plan.days, name: plan.name });
    });
    this.props.eventbus.on("DAY_MOVE_EVT", (plan) => {
      console.log("TimelineComponent received DAY_MOVE_EVT with a new plan as payload");
      this.setState({ days: plan.days, name: plan.name });
    });
    this.props.eventbus.on("DAY_DELETE_EVT", (plan) => {
      this.setState({ days: plan.days, name: plan.name });
    });
    this.props.eventbus.on("TRAINING_TO_PLAN_EVT", (plan) => {
      this.setState({ days: plan.days, name: plan.name });
    });
  }

  // onCycleLengthButtonClick(evt) {
  //  this.setState({cycleLength: evt.target.value});
  // }

  onHideEasyRunsButtonClick(evt) {
    this.setState({ showEasyDays: false });
  }

  onSaveButtonClick(evt) {
    this.props.eventbus.emit("PLAN_PERSIST_CMD");
  }

  // onEmptyClick(evt) {
  //   console.log(`TimelineComponent onEmptyClick with ${evt.target.value}`);
  //   this.props.eventbus.emit("DAY_EMPTY_CMD", evt.target.value);
  // }
  //

  calcDayTotal(day)  {
    if (day.trainings.length === 1) {
      return day.trainings[0].total.distance;
    } else {
      return (day.trainings[0].total.distance + day.trainings[1].total.distance);
    }
  }

  // TODO into WeekComponent
  renderWeek(week, weekStartDate) {
    //console.log("week: " + JSON.stringify(week[0]));
    let weekTotalDistance = 0;
    return (<tr key={createUuid()}>
      {week.map((day, dayNr) => {
          let dfd = weekStartDate.add(1, "days");
          weekTotalDistance += this.calcDayTotal(day);

          return (<DayComponent
            key={"day" + "-" + dayNr + "-" + createUuid()}
            eventbus={this.props.eventbus}
            day={day}
            dayNr={dayNr}
            dateForDay={dfd} />);
        })
      }
      <td>{"Weektotal: "}{weekTotalDistance} km</td>
    </tr>);
    //return(<tr>wobble</tr>);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    const planStartDate = moment("2016-12-03");
    let dateForDay = planStartDate;

    var weeks = [];
    for (var i = 0; i < this.state.days.length; i++) {
      weeks.push(this.state.days.slice(i, i += 7));
    }
    //   
    

    /*
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="7">{"7 day cycle"}</button>
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="9">{"9 day cycle"}</button>
    */

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <em>{this.state.name}</em>&nbsp;
          <button className="button-small" onClick={this.onHideEasyRunsButtonClick}>{"de-emphasize easy days"}</button>
          <button className="button-flat" onClick={this.onSaveButtonClick}>{"persist changes"}</button>
        </header>
        <div className="panel-body">
           <table className="days-table">
            <tbody>
              {weeks.map((week) => {return this.renderWeek(week, dateForDay)})}
            </tbody>
           </table>
        </div>
      </section>
    );
  }
}

