import React from "react";
import EventEmitter from "eventemitter2";
import DayComponent from "./DayComponent";
import {EventsEnum as ee} from "../constants";
import { createUuid } from "../stores/miscUtil";

export default class WeekComponent extends React.Component {

  constructor(props) {
    super(props);
    this.onSelectButtonClick = this.onSelectButtonClick.bind(this);
  }

  // TODO move to timelineUtil
  calcDayTotal(day)  {
    if (day.trainings.length === 1) {
      return day.trainings[0].total.distance;
    } else {
      return (day.trainings[0].total.distance + day.trainings[1].total.distance);
    }
  }

  render() {
    let weekTotalDistance = 0;
    let dayComponents = [];
    let weekStartDate = this.props.week.weekStartDate.clone();

    this.props.week.days.forEach((day, dayNr) => {
      weekTotalDistance += this.calcDayTotal(day);
      day.dfd = weekStartDate;
      dayComponents.push(<DayComponent
        key={"day" + "-" + dayNr + "-" + createUuid()}
        eventbus={this.props.eventbus}
        day={day}
        dayNr={dayNr} />);
        weekStartDate = weekStartDate.clone().add(1, "days");
      });

    let rowClassName = (this.props.week.weekNr === this.props.selectedWeekNr) ? "week-selected": "";

    return (
      <tr key={createUuid()} className={rowClassName}>
        {dayComponents}
        <td>
          {"Total: "} {weekTotalDistance.toFixed(2)} {"km"} <br />
          <button onClick={this.onSelectButtonClick} className="button button-small">{"select"}</button>
        </td>
      </tr>);
  }

  onSelectButtonClick(evt) {
    this.props.eventbus.emit(ee.PLAN_SELECT_WEEK_CMD, this.props.week.weekNr);
  }
}

WeekComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  week: React.PropTypes.object.isRequired,
  selectedWeekNr: React.PropTypes.number.isRequired,
};
