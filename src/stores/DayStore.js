import EventEmitter from "eventemitter2";
import { findDay } from "./timelineUtil";

export default class DayStore {

  /**
   * * TODO when traininginstances works, the 'trainings' parameter is probably not needed
   * 
   * @param  {EventEmitter}
   * @param  {Array}
   * @param  {Array}
   * @param  {Array}   
   */
  constructor(eventbus, plans, traininginstances) {

    this.eventbus = eventbus;
    this.plans = plans;
    this.traininginstances = traininginstances;
    this.day = {};

    eventbus.on("DAY_LOAD_CMD", ((dayNr) => {
      // caching
      let day = this.day;
      if (!this.day || this.day.nr != dayNr) {
        this.day = findDay(dayNr, this.microcycles, this.trainings);
      }
      eventbus.emit("DAY_LOAD_EVT", this.day);
    }));
  }
}
