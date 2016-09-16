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

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    const planStartDate = moment("2016-12-03");
    const dateForDay = planStartDate;
    const microcycleElements = [];
    let segmentTotalDistance = 0;

    this.state.days.forEach((day, dayNr) => {
      dateForDay.add(1, "days");
      segmentTotalDistance += this.calcDayTotal(day);

      microcycleElements.push(
        <DayComponent
          key={"day" + "-" + dayNr + "-" + createUuid()} 
          eventbus={this.props.eventbus} 
          day={day} 
          dayNr={dayNr}
          dateForDay={dateForDay}
         />
      );

      // TODO, change to html table
      if (dayNr % 7 === 6) {
        microcycleElements.push(<section key={"section" + "-" + dayNr + "-" + createUuid()} 
          className="segment-total">{"total: "}{segmentTotalDistance.toFixed(2)}{"km"}</section>);
        microcycleElements.push(<br key={createUuid()} />);
        segmentTotalDistance = 0;
      }
    });

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
           <div className="days-list">
            {microcycleElements}
           </div>
        </div>
      </section>
    );
  }
}
