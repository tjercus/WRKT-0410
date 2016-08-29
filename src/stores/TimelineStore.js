import EventEmitter from "eventemitter2";
import { findPlan, findDay, augmentDay, flattenDays, removeTrainingsFromDay, moveDay, cloneDay, deleteDay } from "./timelineUtil";
import { removeTrainingInstancesForDay } from "./trainingUtil";
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

    eventbus.on("PLANS_FETCHED_EVT", (plans) => {
      this.plans = plans;
    });
    eventbus.on("TRAININGINSTANCES_FETCHED_EVT", (traininginstances) => {
      this.traininginstances = traininginstances;
    });

    eventbus.on("PLAN_LOAD_CMD", ((planId) => {
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
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      this.days = removeTrainingsFromDay(oldDay, clone(this.days));      
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_EMPTY_EVT", modifiedPlan);
    }));

    eventbus.on("DAY_MOVE_CMD", ((dayUuid, positions) => {
      this.days = moveDay(dayUuid, this.days, positions);
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_MOVE_EVT", modifiedPlan);
    }));

    eventbus.on("DAY_CLONE_CMD", ((dayUuid) => {
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      const newDay = cloneDay(oldDay);
      this.traininginstances.push(newDay.training);
      this.days.push(newDay);
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_CLONE_EVT", modifiedPlan);
    }));

    eventbus.on("DAY_DELETE_CMD", ((dayUuid) => {      
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      this.days = deleteDay(dayUuid, this.days);      
      const modifiedPlan = this.updatePlans();
      eventbus.emit("DAY_DELETE_EVT", modifiedPlan);
    }));

    eventbus.on("TRAINING_CLONE_AS_INSTANCE_CMD", ((training) => {
      const newInstanceUuid = createUuid();
      training.uuid = newInstanceUuid;
      this.traininginstances.push(training);
      // TODO modify augmentDay to accept a training instead of trainings
      this.days.push(augmentDay({ uuid: createUuid(), instanceId: newInstanceUuid }, this.traininginstances));
      const modifiedPlan = this.updatePlans();
      eventbus.emit("TRAINING_TO_PLAN_EVT", modifiedPlan);
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
