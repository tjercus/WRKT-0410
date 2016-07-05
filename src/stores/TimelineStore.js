import EventEmitter from "eventemitter2";
import { findPlan, augmentDay } from "./timelineUtil";
import { clone } from "./miscUtil";

/**
 * Supports the 'Timeline' aka the 'Default plan', currently only one plan is 
 *  supported.
 * 
 * TODO perhaps rename to 'Plan(s)Store'
 */
export default class TimelineStore {

  /**
   * TODO when traininginstances works, the 'trainings' parameter is probably not needed
   * 
   * @param  {EventEmitter}
   * @param  {Array}
   * @param  {Array}
   * @param  {Array}   
   */
  constructor(eventbus, plans, trainings, traininginstances) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')  
    this.plans = plans;
    this.trainings = trainings;

    this.name = "";
    this.uuid = null;
    this.microcycles = [];

    eventbus.on("PLAN_LOAD_CMD", ((planId) => {
      console.log("TimelineStore: received PLAN_LOAD_CMD for default plan");
      // TODO move plans from import to constructor
      let plan = findPlan(planId, this.plans, this.trainings);
      this.uuid = planId;
      this.name = plan.name;
      this.microcycles = plan.microcycles;
      eventbus.emit("PLAN_LOAD_EVT", plan.microcycles);
    }));

    eventbus.on("PLAN_PERSIST_CMD", (() => {
      this.plans = [{ uuid: this.uuid, name: this.name, microcycles: this.microcycles }];
      this.persistPlans(this.plans);
      eventbus.emit("PLAN_PERSIST_EVT");
    }));

    // DATA migration, remove when needed
    eventbus.on("PLAN_CONVERT_CMD", (() => {
      const _microcycles = [];
      const _trainings = [];
      this.microcycles.forEach((_microcycle, i) => {
        _days = [];
        _microcycle.days.forEach((_day, j) => {
          let newDay = augmentDay(_day, _trainings);
          let newTraining = newDay.training;

          newTraining.uuid = createUuid();
          _trainings.push(newTraining);
          _days.push({nr: _day.nr, instanceId: newTraining.uuid});
        });
        _microcycle.days = _days;
        _microcycles.push(_microcycle);
      });
      // TODO write _microcycles to plans.js
      // TODO write _trainings to traininginstances.js
    }));
  }

  // TODO move to timelineUtil
  persistPlans(plans) {
    // TODO when multiple plans are supported, do a lookup of one plan first
    const plansStr = JSON.stringify(plans, null, "\t");
    if (typeof fetch == 'function') {
      fetch("http://localhost:3333/plans", {
        method: "PUT",
        body: plansStr
      }).then((response) => {
        this.eventbus.emit("PLANS_PERSIST_EVT");
      }).catch((error) => {
        this.eventbus.emit("PLANS_PERSIST_ERROR_EVT", error);
      });
    }
  }
};
