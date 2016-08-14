import EventEmitter from "eventemitter2";
import { findPlan, findDay, augmentDay, flattenDays, removeTrainingFromDay } from "./timelineUtil";
import { removeTrainingInstance } from "./trainingUtil";
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
    this.days = [];

    eventbus.on("PLAN_LOAD_CMD", ((planId) => {
      console.log(`TimelineStore: received PLAN_LOAD_CMD for default plan ${planId}`);
      let plan = findPlan(planId, this.plans, this.traininginstances);
      this.uuid = planId;
      this.name = plan.name;
      this.days = plan.days;
      eventbus.emit("PLAN_LOAD_EVT", plan);
    }));

    eventbus.on("PLAN_PERSIST_CMD", (() => {
      this.plans = [{ uuid: this.uuid, name: this.name, days: flattenDays(this.days) }];
      this.persistInstances(this.traininginstances);
      this.persistPlans(this.plans);
      eventbus.emit("PLAN_PERSIST_EVT");
    }));

    eventbus.on("DAY_EMPTY_CMD", ((dayUuid) => {
      console.log(`TimelineStore received DAY_EMPTY_CMD with a dayUuid ${dayUuid}`);      
      this.days = removeTrainingFromDay(dayUuid, clone(this.days));
      this.traininginstances = removeTrainingInstance(dayUuid, clone(this.traininginstances));
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_EMPTY_EVT", modifiedPlan);
    }));

    eventbus.on("DAY_CLONE_CMD", ((dayUuid) => {
      console.log(`TimelineStore received DAY_CLONE_CMD with a dayUuid ${dayUuid}`);      
      //TODO locate day by uuid, clone it, push training to instances
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      console.log(`Day found: ${JSON.stringify(oldDay)}`);
      const newInstanceUuid = createUuid();
      const newTraining = oldDay.training;
      newTraining.uuid = newInstanceUuid;
      const newDay = {uuid: createUuid(), instanceId: newInstanceUuid};
       console.log(`TimelineStore creating new day: ${JSON.stringify(newDay)}`); 
      this.traininginstances.push(augmentDay(newTraining, this.traininginstances));
      this.days.push(newDay);
      console.log(`TimelineStore creating new training: ${JSON.stringify(newTraining)}`); 
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_CLONE_EVT", modifiedPlan);
    }));

    eventbus.on("TRAINING_CLONE_AS_INSTANCE_CMD", ((training) => {
      console.log(`TimelineStore: 1. days: ${this.plans[0].days.length}`);
      const newInstanceUuid = createUuid();
      training.uuid = newInstanceUuid;
      console.log(`training added to instances ${JSON.stringify(training)}`);
      this.traininginstances.push(training);
      this.days.push({ uuid: createUuid(), instanceId: newInstanceUuid });
      const modifiedPlan = this.updatePlans();
      eventbus.emit("TRAINING_TO_PLAN_EVT", modifiedPlan);
      console.log(`TimelineStore: 2. days: ${this.plans[0].days.length}`);
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

  updatePlans() {
    const modifiedPlan = { uuid: this.uuid, name: this.name, days: this.days };
    this.plans = [];
    // add plan to this.plans, for now override since there is only one plan
    this.plans.push(modifiedPlan);
    return modifiedPlan;
  }
};
