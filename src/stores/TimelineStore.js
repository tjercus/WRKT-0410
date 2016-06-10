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
      console.log("TimelineStore: received PLAN_LOAD_CMD for default plan");
      let plan = findPlan(this.uuid, plans, trainings);
      this.microcycles = plan.microcycles;
      console.log("PLAN_LOAD_CMD after findPlan nr of microcycles: " + this.microcycles.length);
      eventbus.emit("PLAN_LOAD_EVT", plan.microcycles);
    }));

    eventbus.on("DAY_LOAD_CMD", ((dayNr) => {
      console.log("TimelineStore: received DAY_LOAD_CMD for " + dayNr + ", currently holding " + this.days.length);
      let day = this.day;
      if (!this.day || this.day.nr !== dayNr) {
        this.day = findDay(dayNr, this.days, trainings);
      }
      eventbus.emit("DAY_LOAD_EVT", this.day);
    }));
  }    
}