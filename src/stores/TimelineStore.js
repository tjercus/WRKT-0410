import EventEmitter from "eventemitter2";
import { plans } from "./plans";
import { findPlan, findDay } from "./timelineUtil";

export default class TimelineStore {

  constructor(eventbus, trainings) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')  
    this.uuid = "acc3d1b8-33ae-4d70-dda3-d0e885f516f4";
    this.microcycles = [];
    this.day = {};

    eventbus.on("PLAN_LOAD_CMD", (() => {
      console.log("TimelineStore: received PLAN_LOAD_CMD for default plan");
      // TODO move plans from import to constructor
      let plan = findPlan(this.uuid, plans, trainings);
      this.microcycles = plan.microcycles;
      eventbus.emit("PLAN_LOAD_EVT", plan.microcycles);
    }));

    eventbus.on("DAY_LOAD_CMD", ((dayNr) => {      
      let day = this.day;
      if (!this.day || this.day.nr != dayNr) {
        this.day = findDay(dayNr, this.microcycles, trainings);
      }
      eventbus.emit("DAY_LOAD_EVT", this.day);
    }));
  }

};
