import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";

export default class DayStore {

  /**
   * 
   * @param  {EventEmitter2}
   * @param  {Array}
   * @param  {Array}
   */
  constructor(eventbus, plans, traininginstances) {
    this.eventbus = eventbus;
    this.plans = plans;

    // TODO hardcoded for now, but when multiple plans are supported, needs to be adjusted
    this.microcycles = this.plans[0].microcycles;
    
    this.traininginstances = traininginstances;
    this.day = {};

    eventbus.on("DAY_LOAD_CMD", ((dayNr) => {
      // caching
      let day = this.day;
      if (!this.day || this.day.nr != dayNr) {
        this.day = findDay(dayNr, this.microcycles, this.traininginstances);
      }
      if (this.day) {
        eventbus.emit("DAY_LOAD_EVT", this.day);
      }
    }));
  }
}
