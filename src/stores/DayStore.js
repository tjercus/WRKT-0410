import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";

export default class DayStore {

  /**
   * Holds data for editing a day and it's one or more trainings
   * 
   * @param  {EventEmitter2}   
   */
  constructor(eventbus) {
    this.eventbus = eventbus;
    this.day = {};

    // TODO handle:
    // INSTANCE_LOAD_EVT

    eventbus.on("PLAN_LOAD_EVT", (plan) => {
      this.plan = plan;
    });

    eventbus.on("DAY_LOAD_CMD", (dayUuid) => {
      // caching
      let day = this.day;
      if (!this.day || this.day.uuid != dayUuid) {
        this.day = findDay(dayUuid, this.plan);
      }
      if (this.day) {
        eventbus.emit("DAY_LOAD_EVT", this.day);
      }
    });
  }
}
