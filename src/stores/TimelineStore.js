import EventEmitter from "eventemitter2";
import {plans} from "./plans";
import {trainings} from "./trainings";
import {findPlan, findDay} from "./timelineUtil";

export default class TimelineStore {
	
	constructor(eventbus) {
    this.eventbus = eventbus;
    this.days = [];
    this.day = {};

    // TODO allow input from a GUI-list (ex: 'PlansListComponent')
    this.uuid = "acc3d1b8-33ae-4d70-dda3-d0e885f516f4";

    eventbus.on("PLAN_LOAD_CMD", (() => {
      let plan = findPlan(this.uuid, plans, trainings);
      this.days = plan.days;
      console.log("PLAN_LOAD_CMD after findPlan set days to: " + JSON.stringify(this.days));
      eventbus.emit("PLAN_LOAD_EVT", plan.days);
    }));

    eventbus.on("DAY_LOAD_CMD", ((dayNr) => {
      let day = findDay(dayNr, this.days, trainings);
      this.day = day;
      eventbus.emit("DAY_LOAD_EVT", this.day);
    }));
  }    
}