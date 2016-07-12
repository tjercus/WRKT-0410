import EventEmitter from "eventemitter2";
import { findPlan, augmentDay, flattenMicrocycles } from "./timelineUtil";
import { clone, createUuid } from "./miscUtil";

/**
 * Supports the 'Timeline' aka the 'Default plan', currently only one plan is 
 *  supported.
 * 
 * TODO perhaps rename to 'Plan(s)Store'
 */
export default class TimelineStore {

  /**   
   * 
   * @param  {EventEmitter}   
   * @param  {Array<Plan>}
   * @param  {Array<TrainingInstance>}
   */
  constructor(eventbus, plans, traininginstances) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')  
    this.plans = plans;
    this.traininginstances = traininginstances;
    this.eventbus = eventbus;

    this.name = "";
    this.uuid = null;
    this.microcycles = [];

    eventbus.on("PLAN_LOAD_CMD", ((planId) => {
      console.log(`TimelineStore: received PLAN_LOAD_CMD for default plan ${planId}`);
      let plan = findPlan(planId, this.plans, this.traininginstances);
      this.uuid = planId;
      this.name = plan.name;
      this.microcycles = plan.microcycles;
      eventbus.emit("PLAN_LOAD_EVT", plan.microcycles);
    }));

    eventbus.on("PLAN_PERSIST_CMD", (() => {
      this.plans = [{ uuid: this.uuid, name: this.name, microcycles: flattenMicrocycles(this.microcycles) }];
      this.persistInstances(this.traininginstances);
      this.persistPlans(this.plans);
      eventbus.emit("PLAN_PERSIST_EVT");
    }));

    eventbus.on("TRAINING_CLONE_AS_INSTANCE_CMD", ((training) => {
      console.log(`TimelineStore: 1. ${this.plans[0].microcycles.length}`);
      const newInstanceUuid = createUuid();
      training.uuid = newInstanceUuid;
      this.traininginstances.push(training);
      this.microcycles = this.addTrainingToMicrocycles(newInstanceUuid, this.microcycles, this.traininginstances);      
      const modifiedPlan = { uuid: this.uuid, name: this.name, microcycles: this.microcycles };
      this.plans = [];
      // add plan to this.plans, for now override since there is only one plan
      this.plans.push(modifiedPlan);
      eventbus.emit("TRAINING_TO_PLAN_EVT", modifiedPlan);
      console.log(`TimelineStore: 2. ${this.plans[0].microcycles.length}`);
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

  // TODO move to timelineUtil
  persistInstances(instances) {
    const instancesStr = JSON.stringify(instances, null, "\t");
    if (typeof fetch == 'function') {
      fetch("http://localhost:3333/traininginstances", {
        method: "PUT",
        body: instancesStr
      }).then((response) => {
        this.eventbus.emit("INSTANCES_PERSIST_EVT");
      }).catch((error) => {
        this.eventbus.emit("INSTANCES_PERSIST_ERROR_EVT", error);
      });
    }
  }

  // Add a day the last microcycles and add the new instance to the new day
  // if there are are allready 7 days in the microcycle, add a new cycle first
  addTrainingToMicrocycles(newInstanceUuid, microcycles, traininginstances) {
    console.log(`TimelineStore: 3. ${microcycles.length}`);
    const _microcycles = clone(microcycles);
    let currentMicrocycle = _microcycles.slice(-1)[0];
    let lastDay = currentMicrocycle.days.slice(-1)[0];
    let nextNr = parseInt(lastDay.nr, 10) + 1;
    let newDay = { nr: nextNr, instanceId: newInstanceUuid };
    let augmentedNewDay = augmentDay(newDay, traininginstances);
    console.log(`currentMicrocycle.days.length ${currentMicrocycle.days.length}`);
    if (currentMicrocycle.days.length === 7) {
      currentMicrocycle = { "days": [augmentedNewDay] };
      _microcycles.push(currentMicrocycle);
    } else {
      currentMicrocycle.days.push(augmentedNewDay);
      _microcycles[_microcycles.length - 1] = currentMicrocycle;
    }
    console.log(`TimelineStore: 4. ${_microcycles.length}`);
    return _microcycles;
  }
};
