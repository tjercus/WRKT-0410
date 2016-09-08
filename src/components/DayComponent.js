import React from "react";
import moment from "moment";
import { clone, createUuid } from "../stores/miscUtil";

/**
 * TODO use eventbus to implement buttonclicks
 * TODO extract day component
 * 
 * @param  {[type]} props [description]
 * @return {[type]}       [description]
 */

const DAY_HEADER_DATE_FORMAT = "dddd, DD-MM-YYYY";

export default class MicrocycleRowComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    //this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    //this.onEmptyClick = this.onEmptyClick.bind(this);
    this.onCloneClick = this.onCloneClick.bind(this);
    this.onMoveLeftClick = this.onMoveLeftClick.bind(this);
    this.onMoveRightClick = this.onMoveRightClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onEditClick(evt) {
    console.log(`TimelineComponent edit ${evt.target.value}`);
    this.props.eventbus.emit("MENU_CLICK_EVT", "menu-item-dayedit", evt.target.value);
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

  // TODO days from config
  isNonWorkday(aDay) {
    return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  render() {
  	const day = this.props.day;
    if (!day.trainings) {
      throw new Error(`Day [${day.uuid}] should have a plural property 'trainings'`);
    }    
    
    let dateStr = this.props.dateForDay.format(DAY_HEADER_DATE_FORMAT);
    let dayClassNames = [];
    this.isNonWorkday(this.props.dateForDay) ?
      dayClassNames.push("day day-nowork") :
      dayClassNames.push("day day-work");

    if (this.props.dateForDay.isSame(moment(new Date()), "day")) {
      dayClassNames.push("today");
    }

    let dayElements = [];
    let dayTotal = 0;

    day.trainings.forEach((training, j) => {
      let trainingClassNames = ["training"];

      if (training.type) {
        if (this.state.showEasyDays === false && training.type === "easy") {
          trainingClassNames.push("training-easy");
        }
        if (training.type === "workout") {
          trainingClassNames.push("training-workout");
        }
      }

      // TODO extract DayTrainingComponent
      dayElements.push(
        <section key={j + "-" + createUuid()} className={trainingClassNames.join(" ")}>
          <p className="training-name">{training.name}</p>
        	<p>{"("}{(training.total.distance).toFixed(2)} {" km)"}</p>
        </section>
      );

      dayTotal += training.total.distance;      
    });

    return (
      <section key={createUuid()} className={dayClassNames.join(" ")}>
		    <h3>{this.props.dayNr + 1}. {dateStr}</h3>
		    {dayElements}
		    <div className="day-total">{dayTotal.toFixed(2)} km today</div>
		    <button className="button-small button-flat" onClick={this.onMoveRightClick} value={day.uuid}>&rarr;</button>
		    <button className="button-small button-flat" onClick={this.onDeleteClick} value={day.uuid}>del</button>            
		    <button className="button-small button-flat" onClick={this.onCloneClick} value={day.uuid}>clone</button>
		    <button className="button-small button-flat" onClick={this.onEditClick} value={day.uuid}>edit</button>
		    <button className="button-small button-flat" onClick={this.onMoveLeftClick} value={day.uuid}>&larr;</button>
	    </section>
    );
  }

}
