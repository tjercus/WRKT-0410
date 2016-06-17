import EventEmitter from "eventemitter2";
import { plans } from "./plans";
import { trainings } from "./trainings";
import { findPlan, findDay } from "./timelineUtil";

// TODO pass trainings as optional constructor param
const TimelineStore = eventbus => {

  // TODO allow input from a GUI-list (ex: 'PlansListComponent')
  const uuid = "acc3d1b8-33ae-4d70-dda3-d0e885f516f4";

  let microcycles = [];
  let day = {};

  eventbus.on("PLAN_LOAD_CMD", (() => {
    console.log("TimelineStore: received PLAN_LOAD_CMD for default plan");
    let plan = findPlan(uuid, plans, trainings);
    microcycles = plan.microcycles;
    eventbus.emit("PLAN_LOAD_EVT", plan.microcycles);
  }));

  eventbus.on("DAY_LOAD_CMD", ((dayNr) => {
    console.log(`TimelineStore: received DAY_LOAD_CMD for ${dayNr} number? ${!isNaN(dayNr)} currently holding cycles: ${microcycles.length}`);
    let day = day;
    if (!day || day.nr != dayNr) {
      day = findDay(dayNr, microcycles, trainings);
    }
    eventbus.emit("DAY_LOAD_EVT", day);
  }));

};

export default TimelineStore;
