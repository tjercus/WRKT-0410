import {
  findDay,
  augmentDay,
  flattenDays,
  removeTrainingsFromDay,
  moveDay,
  cloneDay,
  deleteDay,
} from "./timelineUtil";
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
   * @param  {EventEmitter2} eventbus - decoupling
   */
  constructor(eventbus) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')
    this.eventbus = eventbus;
    this.plan = [];
    this.traininginstances = [];

    // NOTE that is up to the emitter to fetch and combine both sets
    eventbus.on("PLAN_FETCHED_EVT", (planAndTraininginstances) => {
      console.time("PLAN_FETCHED_EVT");
      if (!Array.isArray(planAndTraininginstances)) {
        throw new Error("PLAN_FETCHED_EVT has no array with a plan and instances in it");
      }
      const plan = planAndTraininginstances[0];
      if (!Object.prototype.hasOwnProperty.call(plan, "uuid")) {
        throw new Error("PLAN_FETCHED_EVT did not receive a proper day");
      }
      const traininginstances = planAndTraininginstances[1];
      // TODO let a worker handle each augment
      plan.days = plan.days.map(_day => augmentDay(_day, traininginstances));

      this.traininginstances = traininginstances;
      this.plan = plan;
      eventbus.emit("PLAN_LOAD_EVT", plan);
      console.timeEnd("PLAN_FETCHED_EVT");
    });

    eventbus.on("PLAN_PERSIST_CMD", () => {
      const persistablePlan = {
        uuid: this.plan.uuid,
        name: this.plan.name,
        days: flattenDays(this.plan.days),
      };
      eventbus.emit("PLAN_AND_INSTANCES_PERSIST_CMD", persistablePlan, this.traininginstances);
    });

    eventbus.on("DAY_UPDATE_CMD", (day) => {
      console.log("TimelineStore caught DAY_UPDATE_CMD: update local plan");
      const byUuid = (_day) => String(_day.uuid) === String(day.uuid);
      const index = this.plan.days.findIndex(byUuid);
      this.plan.days[index] = day;
      eventbus.emit("DAY_UPDATE_EVT", this.plan);
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
    eventbus.on("DAY_CLONE_CMD", (dayUuid, position) => {
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      const newDay = cloneDay(oldDay);
      // TODO still support singular training property?
      Array.prototype.push.apply(this.traininginstances, newDay.trainings);
      if (position === undefined) {
        console.log(`DAY_CLONE_CMD 1. ${position}`);
        this.plan.days.push(newDay);
      } else if (position === 0) {
        console.log(`DAY_CLONE_CMD 2. ${position}`);
        this.plan.days.unshift(newDay);
      }
      eventbus.emit("DAY_CLONE_EVT", this.plan);
    });

    eventbus.on("DAY_DELETE_CMD", (dayUuid) => {
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      this.plan.days = deleteDay(dayUuid, this.plan.days);
      eventbus.emit("DAY_DELETE_EVT", this.plan);
    });

    eventbus.on("TRAINING_CLONE_AS_INSTANCE_CMD", (training, position) => {
      if (!Object.prototype.hasOwnProperty.call(this, "plan")) {
        throw new Error("Cloning a day before a plan was loaded in TimelineStore");
      }
      if (!Object.prototype.hasOwnProperty.call(this.plan, "days")) {
        throw new Error("Cloning a day before days are loaded in TimelineStore");
      }
      const _training = clone(training);
      const newInstanceUuid = createUuid();
      _training.uuid = newInstanceUuid;
      this.traininginstances.push(_training);
      // TODO modify augmentDay to accept a training instead of trainings
      const augmentedDay = augmentDay({ uuid: createUuid(), instanceId: newInstanceUuid },
        this.traininginstances);
      if (position === undefined) {
        console.log(`TimelineStore caught TRAINING_CLONE_AS_INSTANCE_CMD 1. ${position}`);
        this.plan.days.push(augmentedDay);
      } else if (position === 0) {
        console.log(`TimelineStore caught TRAINING_CLONE_AS_INSTANCE_CMD 2. ${position}`);
        this.plan.days.unshift(augmentedDay);
      }
      eventbus.emit("TRAINING_TO_PLAN_EVT", this.plan);
    });
  }
}
