import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";
import { EventsEnum as ee } from "../constants";
import { createUuid } from "../stores/miscUtil";

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
      selectedWeekNr: 0,
    };
    //this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
    this.onHideEasyRunsButtonClick = this.onHideEasyRunsButtonClick.bind(this);
    this.onSaveButtonClick = this.onSaveButtonClick.bind(this);
    //this.onEmptyClick = this.onEmptyClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, menuItemName => {
      this.setState({ isVisible: menuItemName === this.props.from });
    });
    this.props.eventbus.on(ee.PLAN_LOAD_EVT, plan => {
      this.setState({
        days: plan.days,
        name: plan.name,
        startDate: plan.startDate,
        isVisible: true,
      });
    });
    // this.props.eventbus.on(ee.DAY_UPDATE_EVT, day => {
    //   // TODO get local plan, update it and set back in state
    //   this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    // });
    this.props.eventbus.on(ee.PLAN_UPDATE_EVT, plan => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on(ee.DAY_CLONE_EVT, plan => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on(ee.DAY_MOVE_EVT, plan => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on(ee.DAY_DELETE_EVT, plan => {
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on(ee.TRAINING_TO_PLAN_EVT, plan => {
      console.log(`TimelineComponent caught TRAINING_TO_PLAN_EVT`);
      this.setState({ days: plan.days, name: plan.name, startDate: plan.startDate });
    });
    this.props.eventbus.on(ee.PLAN_SELECT_WEEK_CMD, nr => {
      this.setState({ selectedWeekNr: nr });
    });
  }

  // onCycleLengthButtonClick(evt) {
  //  this.setState({cycleLength: evt.target.value});
  // }
  onHideEasyRunsButtonClick(evt) {
    this.setState({ showEasyDays: false });
  }

  onSaveButtonClick(evt) {
    this.props.eventbus.emit(ee.PLAN_PERSIST_CMD);
  }

  // onEmptyClick(evt) {
  //   console.log(`TimelineComponent onEmptyClick with ${evt.target.value}`);
  //   this.props.eventbus.emit(ee.DAY_EMPTY_CMD, evt.target.value);
  // }
  //
  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    let weekStartDate = moment(this.state.startDate);
    let weeks = [];
    console.log(`TimelineComponent render ${this.state.days.length} days`);
    let weekNr = 0;
    weeks = this.state.days.map(day => {
      let startIndex = weekNr * 7;
      let week = {
        days: this.state.days.slice(startIndex, startIndex + 7),
        weekStartDate: weekStartDate,
        weekNr: weekNr,
      };
      weekNr++;
      weekStartDate = weekStartDate.clone().add(1, "week");
      return week;
    });

    const ifNoWeeksMessage = this.state.days.length === 0
      ? "There are no days in this timeline ..."
      : null;

    /*
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="7">{"7 day cycle"}</button>
    <button className="button-small" onClick={this.onCycleLengthButtonClick} value="9">{"9 day cycle"}</button>
    <button className="button-small" onClick={this.onHideEasyRunsButtonClick}>{"de-emphasize easy days"}</button>
    */
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <em>{this.state.name}</em>
          <button className="button-flat" onClick={this.onSaveButtonClick}>
            {"persist changes"}
          </button>
        </header>
        <div className="panel-body">
          <table className="days-table">
            <tbody>
              {weeks.map(week => (
                <WeekComponent
                  eventbus={this.props.eventbus}
                  week={week}
                  selectedWeekNr={this.state.selectedWeekNr}
                  key={Math.random()}
                />
              ))}
            </tbody>
          </table>
          {ifNoWeeksMessage}
        </div>
      </section>
    );
  }
}

TimelineComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  name: React.PropTypes.string.isRequired,
  from: React.PropTypes.string.isRequired,
};
