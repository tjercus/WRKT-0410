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
  constructor(eventbus) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')      
    this.eventbus = eventbus;

    this.plan = [];
    this.traininginstances = [];    

    // NOTE that is up to the emitter to fetch and combine both sets
    eventbus.on("PLAN_FETCHED_EVT", (planAndTraininginstances) => {      
      const plan = planAndTraininginstances[0][0];
      console.log(`TimelineStore PLAN_FETCHED_EVT ${plan.uuid}`);
      const traininginstances = planAndTraininginstances[1];
      plan.days = plan.days.map((_day) => {
        return augmentDay(_day, traininginstances);
      });
      this.traininginstances = traininginstances;
      this.plan = plan;
      eventbus.emit("PLAN_LOAD_EVT", plan);
    });
    
    eventbus.on("PLAN_PERSIST_CMD", () => {
      const persistablePlan = { 
        uuid: this.plan.uuid, 
        name: this.plan.name, 
        days: flattenDays(this.plan.days)
      };      
      eventbus.emit("PLAN_AND_INSTANCES_PERSIST_CMD", persistablePlan, this.traininginstances);
    });

    eventbus.on("DAY_EMPTY_CMD", ((dayUuid) => {
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      this.plan.days = removeTrainingsFromDay(oldDay, clone(this.plan.days));      
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));      
      eventbus.emit("DAY_EMPTY_EVT", this.plan);
    }));

    eventbus.on("DAY_MOVE_CMD", ((dayUuid, positions) => {
      this.plan.days = moveDay(dayUuid, this.plan.days, positions);      
      eventbus.emit("DAY_MOVE_EVT", this.plan);
    }));

    eventbus.on("DAY_CLONE_CMD", ((dayUuid) => {
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      const newDay = cloneDay(oldDay);
      this.traininginstances.push(newDay.training);
      this.plan.days.push(newDay);
      eventbus.emit("DAY_CLONE_EVT", this.plan);
    }));

    eventbus.on("DAY_DELETE_CMD", ((dayUuid) => {      
      const oldDay = findDay(dayUuid, this.plans[0], this.traininginstances);
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      this.plan.days = deleteDay(dayUuid, this.plan.days);
      eventbus.emit("DAY_DELETE_EVT", this.plan);
    }));

    eventbus.on("TRAINING_CLONE_AS_INSTANCE_CMD", ((training) => {
      if (!this.hasOwnProperty("plan")) {
        throw new Error("Cloning a day before a plan was loaded in TimelineStore");
      }
      if (!this.plan.hasOwnProperty("days")) {
        throw new Error("Cloning a day before days are loaded in TimelineStore");
      }
      const newInstanceUuid = createUuid();
      training.uuid = newInstanceUuid;
      this.traininginstances.push(training);
      // TODO modify augmentDay to accept a training instead of trainings
      this.plan.days.push(augmentDay({ uuid: createUuid(), instanceId: newInstanceUuid }, this.traininginstances));
      eventbus.emit("TRAINING_TO_PLAN_EVT", this.plan);
    }));
  }  
};
