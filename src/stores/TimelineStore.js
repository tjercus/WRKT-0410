import EventEmitter from "eventemitter2";
import { findDay, augmentDay, flattenDays, removeTrainingsFromDay, moveDay, cloneDay, deleteDay } from "./timelineUtil";
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
      if (!Array.isArray(planAndTraininginstances)) {
        throw new Error("PLAN_FETCHED_EVT did not receive an array with a plan and instances in it");
      }
      const plan = planAndTraininginstances[0];
      if (!plan.hasOwnProperty("uuid")) {
        throw new Error("PLAN_FETCHED_EVT did not receive a proper day");
      }      
      console.log(`TimelineStore PLAN_FETCHED_EVT ${plan.uuid}`);
      const traininginstances = planAndTraininginstances[1];      
      plan.days = plan.days.map((_day) => {
        return augmentDay(_day, traininginstances);
      });

      console.log("plan: --------------------------------------------------------------------------------------");
      console.dir(plan);
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
      console.log(`TimelineStore PLAN_AND_INSTANCES_PERSIST_CMD with ${this.traininginstances.length} instances`);
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

    // TODO unit test this logic!
    eventbus.on("DAY_CLONE_CMD", (dayUuid) => {
      console.log(`TimelineStore received DAY_CLONE_CMD ${dayUuid} poolsize ${this.traininginstances.length}`);
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      const newDay = cloneDay(oldDay);
      // TODO still support singular training property?
      Array.prototype.push.apply(this.traininginstances, newDay.trainings);
      this.plan.days.push(newDay);
      console.log(`TimelineStore AFTER CLONING poolsize ${this.traininginstances.length}`);
      eventbus.emit("DAY_CLONE_EVT", this.plan);
    });

    eventbus.on("DAY_DELETE_CMD", (dayUuid) => {      
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      this.plan.days = deleteDay(dayUuid, this.plan.days);
      eventbus.emit("DAY_DELETE_EVT", this.plan);
    });

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
