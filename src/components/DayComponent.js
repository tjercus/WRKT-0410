import React from "react";
import EventEmitter from "eventemitter4";
import {EventsEnum as ee} from "../constants";
import moment from "moment";
import { createUuid, hasProperty} from "../stores/objectUtil";
import {DEFAULT_TRAINING} from "../constants";

/**
 * TODO use eventbus to implement buttonclicks
 */
const DAY_HEADER_DATE_FORMAT = "dddd, DD-MM-YYYY";

export default class DayComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    day: React.PropTypes.object.isRequired,
    dayNr: React.PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      secondaryMenuHidden: true,
    };
  }

  onEditClick = (evt) => {
    const uuid = evt.target.attributes[1].nodeValue;
    this.props.eventbus.emit(ee.MENU_CLICK_EVT, "menu-item-dayedit");
    console.log(`DayComponent.onEditClick: emit DAY_LOAD_CMD for day [${uuid}]`);
    // TODO pass 'date' for day as third argument
    this.props.eventbus.emit(ee.DAY_LOAD_CMD, this.props.day);
  }

  onCloneToBeginClick = (evt) => {
    const uuid = evt.target.attributes[1].nodeValue;
    this.props.eventbus.emit(ee.DAY_CLONE_CMD, uuid, 0);
  }

  onCloneToMiddleClick = (evt) => {
    const uuid = evt.target.attributes[1].nodeValue;
    this.props.eventbus.emit(ee.DAY_CLONE_CMD, uuid, 0.5);
  }

  onCloneClick = (evt) =>{
    const uuid = evt.target.attributes[1].nodeValue;
    this.props.eventbus.emit(ee.DAY_CLONE_CMD, uuid);
  }

  onCloneToSelectedWeekClick = (evt) => {
    const uuid = evt.target.attributes[1].nodeValue;
    this.props.eventbus.emit(ee.DAY_CLONE_CMD, uuid, -1);
  }

  onMoveLeftClick = (evt) => {
    this.props.eventbus.emit(ee.DAY_MOVE_CMD, evt.target.value, -1);
  }

  onMoveRightClick = (evt) => {
    this.props.eventbus.emit(ee.DAY_MOVE_CMD, evt.target.value, 1);
  }

  onDeleteClick = (evt) => {
    const uuid = evt.target.attributes[1].nodeValue;
    console.log(`DayComponent.onDeleteClick ${uuid}`);
    this.props.eventbus.emit(ee.DAY_DELETE_CMD, uuid);
  }

  onSecondaryMenuClick = (evt) => {
    this.setState({secondaryMenuHidden: !this.state.secondaryMenuHidden});
  }

  // TODO days from config
  isNonWorkday(aDay) {
    return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  // TODO less naive implementation
  // TODO move to util
  isNonRunDay(aDay) {
    return aDay.trainings[0].total.distance === 0;
  }

  render() {
  	let day = this.props.day;
    //console.log(`DayComponent timestamp ${day.dfd}`);
    if (!day.trainings) {
      throw new Error(`Day [${day.uuid}] should have a plural property 'trainings'`);
    }
    if (!day.trainings[0] || !hasProperty(day.trainings[0], "uuid")) {
      console.error(`DayComponent render without a proper training for day ${day.uuid}`);
      day.trainings.push(DEFAULT_TRAINING);
    }

    let dateStr = moment(day.dfd).format(DAY_HEADER_DATE_FORMAT);
    let dayClassNames = [];
    this.isNonWorkday(day.dfd) ?
      dayClassNames.push("day day-nowork") :
      dayClassNames.push("day day-work");

    this.isNonRunDay(day) ? dayClassNames.push("day day-norun") : "";

    const isToday = moment(day.dfd).isSame(moment(new Date()), "day");
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
        <section key={j + "-" + training.uuid} className={trainingClassNames.join(" ")}>
          <p className="training-name">{training.name}</p>
        	{trainingTotal}
        </section>
      );

      dayTotal += training.total.distance;
    });

    return (
      <td key={createUuid()} id={isToday ? "today" : ""} className={dayClassNames.join(" ")}>
		    <h3>{this.props.dayNr + 1}. {dateStr}</h3>
		    {dayElements}
		    <div className="day-total">{dayTotal.toFixed(2)} km today</div>
        <menu className="day-actions-menu" role="menubar">
          <button className="button-small button-flat" onClick={this.onSecondaryMenuClick} value={day.uuid}>{"..."}</button>
          <button className="button-small button-flat" onClick={this.onMoveRightClick} value={day.uuid}>&rarr;</button>
  		    <button className="button-small button-flat" onClick={this.onMoveLeftClick} value={day.uuid}>&larr;</button>
          <menu className="day-secondary-actions-menu" role="menu" aria-hidden={this.state.secondaryMenuHidden}>
            <ul>
              <li><button className="button-small button-flat" onClick={this.onCloneToBeginClick} value={day.uuid} title="clone to begin">c &larr;</button></li>
              <li><button className="button-small button-flat" onClick={this.onCloneToMiddleClick} value={day.uuid} title="clone to middle">c</button></li>
              <li><button className="button-small button-flat" onClick={this.onCloneClick} value={day.uuid} title="clone to end">&rarr; c</button></li>
              <li><button className="button-small button-flat" onClick={this.onCloneToSelectedWeekClick} value={day.uuid} title="clone to selected week">cs</button></li>
              <li><button className="button-small button-flat" onClick={this.onDeleteClick} value={day.uuid}>delete</button></li>
              <li><button className="button-small button-flat" onClick={this.onEditClick} value={day.uuid}>edit</button></li>
            </ul>
          </menu>
        </menu>
	    </td>
    );
  }
}
