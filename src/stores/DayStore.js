import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";

export default class DayStore {

  /**
   *
   * @param  {EventEmitter2}
   * @param  {Array}
   * @param  {Array}
   */
  constructor(eventbus) {
    this.eventbus = eventbus;
    this.day = {};

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
