import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import DayComponent from "./DayComponent";

import { clone, createUuid } from "../stores/miscUtil";

export default class WeekComponent extends React.Component {

  constructor(props) {
    super(props);
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

    return (
      <tr key={createUuid()}>
        {dayComponents}
        <td>{"Total: "} {weekTotalDistance.toFixed(2)} {"km"}</td>
      </tr>);
  }

}
