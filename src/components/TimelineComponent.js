import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import { clone, createUuid } from "../stores/miscUtil";

const DAY_HEADER_DATE_FORMAT = "dddd, DD-MM-YYYY";
const DEFAULT_PLAN_ID = "a83a78aa-5d69-11e6-b3a3-1f76e6105d92";

export default class TimelineComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      showEasyDays: true,
      days: []
    };
    //this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onHideEasyRunsButtonClick = this.onHideEasyRunsButtonClick.bind(this);
    this.onSaveButtonClick = this.onSaveButtonClick.bind(this);
    this.onEmptyClick = this.onEmptyClick.bind(this);
    this.onCloneClick = this.onCloneClick.bind(this);
    this.onMoveLeftClick = this.onMoveLeftClick.bind(this);
    this.onMoveRightClick = this.onMoveRightClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({ isVisible: true });
      } else {
        this.setState({ isVisible: false });
      }
    });
    this.props.eventbus.on("PLAN_LOAD_EVT", (plan) => {
      console.log("TimelineComponent received DAY_LOAD_EVT with a new plan as payload");
      this.setState({ days: plan.days });
    });
    this.props.eventbus.on("DAY_EMPTY_EVT", (plan) => {
      console.log("TimelineComponent received DAY_EMPTY_EVT with a new plan as payload");
      this.setState({ days: plan.days });
    });
    this.props.eventbus.on("DAY_CLONE_EVT", (plan) => {
      console.log("TimelineComponent received DAY_CLONE_EVT with a new plan as payload");
      this.setState({ days: plan.days });
    });
    this.props.eventbus.on("DAY_MOVE_EVT", (plan) => {
      console.log("TimelineComponent received DAY_MOVE_EVT with a new plan as payload");
      this.setState({ days: plan.days });
    });
    this.props.eventbus.on("DAY_DELETE_EVT", (plan) => {
      this.setState({ days: plan.days });
    });
    this.props.eventbus.on("TRAINING_TO_PLAN_EVT", (plan) => {
      this.setState({ days: plan.days });
    });
    setTimeout(() => this.props.eventbus.emit("PLAN_LOAD_CMD", DEFAULT_PLAN_ID), 1500);
  }

  // TODO extract method
  // TODO days from config
  isNonWorkday(aDay) {
    return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  // onCycleLengthButtonClick(evt) {    
  //  this.setState({cycleLength: evt.target.value});
  // }

  onHideEasyRunsButtonClick(evt) {
    this.setState({ showEasyDays: false });
  }

  onEditClick(evt) {
    console.log(`TimelineComponent edit ${evt.target.value}`);
    this.props.eventbus.emit("MENU_CLICK_EVT", "menu-item-dayedit", evt.target.value);
  }

  onSaveButtonClick(evt) {
    this.props.eventbus.emit("PLAN_PERSIST_CMD");
  }

  onEmptyClick(evt) {
    console.log(`TimelineComponent onEmptyClick with ${evt.target.value}`);
    this.props.eventbus.emit("DAY_EMPTY_CMD", evt.target.value);
  }

  onCloneClick(evt) {
    console.log(`TimelineComponent clone cmd ${evt.target.value}`);
    this.props.eventbus.emit("DAY_CLONE_CMD", evt.target.value);
  }

  onMoveLeftClick(evt) {
    this.props.eventbus.emit("DAY_MOVE_CMD", evt.target.value, -1); 
  }

  onMoveRightClick(evt) {
    this.props.eventbus.emit("DAY_MOVE_CMD", evt.target.value, 1);
  }

  onDeleteClick(evt) {
    console.log(`TimelineComponent delete cmd ${evt.target.value}`);
    this.props.eventbus.emit("DAY_DELETE_CMD", evt.target.value);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    let aDay = moment("2016-12-03");

    let microcycleElements = [];
    let segmentTotalDistance = 0;

    this.state.days.forEach((day, i) => {
      if (!day.training) {
        throw new Error(`Day [${day.uuid}] should have a property 'training'`);
      }
      aDay.add(1, "days");
      let dateStr = aDay.format(DAY_HEADER_DATE_FORMAT);
      let sectionClassNames = [];
      this.isNonWorkday(aDay) ?
        sectionClassNames.push("day day-nowork") :
        sectionClassNames.push("day day-work");

      if (day.training.type) {
        if (this.state.showEasyDays === false && day.training.type === "easy") {
          sectionClassNames.push("day-easy");
        }
        if (day.training.type === "workout") {
          sectionClassNames.push("day-workout");
        }
      }

      if (aDay.isSame(moment(new Date()), "day")) {
        sectionClassNames.push("today");
      }

      // TODO support multiple trainings per day
      // TODO extract into MicrocycleRowComponent
      microcycleElements.push(
        <section key={i + "-" + createUuid()} className={sectionClassNames.join(" ")}>
            <h3>{i+1}. {dateStr}</h3>
            <p className="training-name">{day.training.name}</p>
            <p>{"("}{(day.training.total.distance).toFixed(2)} {" km)"}</p>
            <button className="button-small button-flat" onClick={this.onMoveRightClick} value={day.uuid}>&rarr;</button>
            <button className="button-small button-flat" onClick={this.onDeleteClick} value={day.uuid}>del</button>            
            <button className="button-small button-flat" onClick={this.onCloneClick} value={day.uuid}>clone</button>
            <button className="button-small button-flat" onClick={this.onEditClick} value={day.uuid}>edit</button>
            <button className="button-small button-flat" onClick={this.onMoveLeftClick} value={day.uuid}>&larr;</button>
          </section>
      );

      segmentTotalDistance += day.training.total.distance;

      // TODO, change to html table
      if (i % 7 === 6) {
        microcycleElements.push(<section key={"section" + "-" + i + "-" + createUuid()} className="segment-total">{"total: "}{segmentTotalDistance}{"km"}</section>);
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
