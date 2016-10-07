import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import { clone, createUuid } from "../stores/miscUtil";

import WeekComponent from "./WeekComponent";

export default class TimelineComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      showEasyDays: true,
      days: [],
      name: "",
      startDate: "2016-01-01",
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
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
      this.setState({ isVisible: true });
    });
    // this.props.eventbus.on("DAY_EMPTY_EVT", (plan) => {
    //   console.log("TimelineComponent received DAY_EMPTY_EVT with a new plan as payload");
    //   this.setState({ days: plan.days });
    // });
    this.props.eventbus.on("DAY_CLONE_EVT", (plan) => {
     this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on("DAY_MOVE_EVT", (plan) => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on("DAY_DELETE_EVT", (plan) => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on("TRAINING_TO_PLAN_EVT", (plan) => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
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

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    let weekStartDate = moment(this.state.startDate);
    var weeks = [];
    for (var i = 0; i < this.state.days.length; i++) {
      weeks.push({"days": this.state.days.slice(i, i += 7), "weekStartDate": weekStartDate});
      weekStartDate = weekStartDate.clone().add(1, "week");
    }

    const ifNoWeeksMessage = (this.state.days.length === 0) ? "There are no days in this timeline ..." : null;

    /*
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="7">{"7 day cycle"}</button>
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="9">{"9 day cycle"}</button>
    <button className="button-small" onClick={this.onHideEasyRunsButtonClick}>{"de-emphasize easy days"}</button>
    */

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <em>{this.state.name}</em>&nbsp;          
          <button className="button-flat" onClick={this.onSaveButtonClick}>{"persist changes"}</button>
        </header>
        <div className="panel-body">
           <table className="days-table">
            <tbody>
              {weeks.map(week => <WeekComponent eventbus={this.props.eventbus} week={week} key={createUuid()} />)}
              {ifNoWeeksMessage}
            </tbody>
           </table>
        </div>
      </section>
    );
  }
}

