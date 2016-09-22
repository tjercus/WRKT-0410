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
    this.traininginstances = traininginstances;
    this.day = {};

    eventbus.on("PLANS_FETCHED_EVT", (plans) => {
      this.plans = plans;
    });
    eventbus.on("TRAININGINSTANCES_FETCHED_EVT", (traininginstances) => {
      this.traininginstances = traininginstances;
    });

    eventbus.on("DAY_LOAD_CMD", ((dayUuid) => {
      // caching
      let day = this.day;
      if (!this.day || this.day.uuid != dayUuid) {
        // TODO plan is hardcoded for now, but when multiple plans are supported, needs to be adjusted
        this.day = findDay(dayUuid, this.plans[0], this.traininginstances);
      }
      if (this.day) {
        eventbus.emit("DAY_LOAD_EVT", this.day);
      }
    }));
  }
}
