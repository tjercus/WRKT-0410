import React from "react";
import moment from "moment";
import { clone, createUuid } from "../stores/miscUtil";

/**
 * TODO use eventbus to implement buttonclicks
 */
const DAY_HEADER_DATE_FORMAT = "dddd, DD-MM-YYYY";

export default class DayComponent extends React.Component {

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
    console.log(`DayComponent edit ${evt.target.value}`);
    this.props.eventbus.emit("MENU_CLICK_EVT", "menu-item-dayedit", evt.target.value);
  }

  onCloneClick(evt) {
    const uuid = evt.target.attributes[1].nodeValue;
    console.log(`DayComponent clone cmd ${uuid}`);
    this.props.eventbus.emit("DAY_CLONE_CMD", uuid);
  }

  onMoveLeftClick(evt) {
    this.props.eventbus.emit("DAY_MOVE_CMD", evt.target.value, -1);
  }

  onMoveRightClick(evt) {
    this.props.eventbus.emit("DAY_MOVE_CMD", evt.target.value, 1);
  }

  onDeleteClick(evt) {
    console.log(`DayComponent delete cmd ${evt.target.value}`);
    this.props.eventbus.emit("DAY_DELETE_CMD", evt.target.value);
  }

  // TODO days from config
  isNonWorkday(aDay) {
    return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  render() {
  	let day = this.props.day;
    //console.log(`DayComponent timestamp ${day.dfd}`);
    console.log(`DayComponent day ${JSON.stringify(day)}`);
    if (!day.trainings) {
      throw new Error(`Day [${day.uuid}] should have a plural property 'trainings'`);
    }

    let dateStr = moment(day.dfd).format(DAY_HEADER_DATE_FORMAT);
    let dayClassNames = [];
    this.isNonWorkday(day.dfd) ?
      dayClassNames.push("day day-nowork") :
      dayClassNames.push("day day-work");

    if (moment(day.dfd).isSame(moment(new Date()), "day")) {
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

      let trainingTotal = "";
      if (day.trainings.length > 1) {
        <p>{"("}{(training.total.distance).toFixed(2)} {" km)"}</p>;
      }

      // TODO extract DayTrainingComponent
      dayElements.push(
        <section key={j + "-" + createUuid()} className={trainingClassNames.join(" ")}>
          <p className="training-name">{training.name}</p>
        	{trainingTotal}          
        </section>
      );

      dayTotal += training.total.distance;
    });

    return (
      <td key={createUuid()} className={dayClassNames.join(" ")}>
		    <h3>{this.props.dayNr + 1}. {dateStr}</h3>
		    {dayElements}
		    <div className="day-total">{dayTotal.toFixed(2)} km today</div>
		    <button className="button-small button-flat" onClick={this.onMoveRightClick} value={day.uuid}>&rarr;</button>
		    <button className="button-small button-flat" onClick={this.onDeleteClick} value={day.uuid}>del</button>
		    <button className="button-small button-flat" onClick={this.onCloneClick} value={day.uuid}>clone</button>
		    <button className="button-small button-flat" onClick={this.onEditClick} value={day.uuid}>edit</button>
		    <button className="button-small button-flat" onClick={this.onMoveLeftClick} value={day.uuid}>&larr;</button>
	    </td>
    );
  }

}

/*
DayComponent.propTypes = {
  dateForDay: React.PropTypes.number
}
*/
