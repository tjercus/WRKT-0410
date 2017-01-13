import {
  findDay,
  augmentDay,
  flattenDays,
  removeTrainingsFromDay,
  moveDay,
  cloneDay,
  deleteDay,
} from "./timelineUtil";
import {EventsEnum as ee} from "../constants";
import { removeTrainingInstancesForDay, updateTraining } from "./trainingUtil";
import { clone, createUuid } from "./miscUtil";

/**
 * Supports the 'Timeline' aka the 'Default plan', currently only one plan is
 *  supported.
 *
 * TODO perhaps rename to 'Plan(s)Store'
 */
export default class TimelineStore {

  /**
   * @param {EventEmitter} eventbus - decoupling
   */
  constructor(eventbus) {
    // TODO allow input from a GUI-list (ex: 'PlansListComponent')
    this.eventbus = eventbus;
    this.plan = [];
    this.traininginstances = [];

    // NOTE that is up to the emitter to fetch and combine both sets
    eventbus.on(ee.PLAN_FETCH_EVT, (planAndTraininginstances) => {
      console.time("PLAN_FETCH_EVT");
      if (!Array.isArray(planAndTraininginstances)) {
        throw new Error("PLAN_FETCH_EVT has no array with a plan and instances in it");
      }
      const plan = planAndTraininginstances[0];
      if (!Object.prototype.hasOwnProperty.call(plan, "uuid")) {
        throw new Error("PLAN_FETCH_EVT did not receive a proper day");
      }
      const traininginstances = planAndTraininginstances[1];
      // TODO let a worker handle each augment
      plan.days = plan.days.map(_day => augmentDay(_day, traininginstances));

      this.traininginstances = traininginstances;
      this.plan = plan;
      eventbus.emit(ee.PLAN_LOAD_EVT, plan);
      console.timeEnd("PLAN_FETCH_EVT");
    });

    eventbus.on(ee.PLAN_PERSIST_CMD, () => {
      const persistablePlan = {
        uuid: this.plan.uuid,
        name: this.plan.name,
        days: flattenDays(this.plan.days),
        startDate: this.plan.startDate,
      };
      eventbus.emit(ee.PLAN_AND_INSTANCES_PERSIST_CMD, persistablePlan, this.traininginstances);
    });

    eventbus.on(ee.DAY_UPDATE_CMD, (day) => {
      console.log("TimelineStore caught DAY_UPDATE_CMD: update local plan");
      const byUuid = _day => String(_day.uuid) === String(day.uuid);
      const index = this.plan.days.findIndex(byUuid);
      this.plan.days[index] = day;

      day.trainings.map(training => {
        this.traininginstances = updateTraining(training, clone(this.traininginstances));
      });

      eventbus.emit(ee.DAY_UPDATE_EVT, this.plan);
    });

    eventbus.on(ee.DAY_EMPTY_CMD, ((dayUuid) => {
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      this.plan.days = removeTrainingsFromDay(oldDay, clone(this.plan.days));
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      eventbus.emit(ee.DAY_EMPTY_EVT, this.plan);
    }));

    eventbus.on(ee.DAY_MOVE_CMD, ((dayUuid, positions) => {
      console.log(`TimelineStore on DAY_MOVE_CMD ${dayUuid}`);
      this.plan.days = moveDay(dayUuid, this.plan.days, positions);
      eventbus.emit(ee.DAY_MOVE_EVT, this.plan);
    }));

    // TODO unit test this logic!
    eventbus.on(ee.DAY_CLONE_CMD, (dayUuid, position) => {
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      const newDay = cloneDay(oldDay);
      Array.prototype.push.apply(this.traininginstances, newDay.trainings);
      this.insertDayIntoPlan(position, newDay);
      eventbus.emit(ee.DAY_CLONE_EVT, this.plan);
    });

    eventbus.on(ee.DAY_DELETE_CMD, (dayUuid) => {
      console.log(`TimelineStore on DAY_DELETE_CMD ${dayUuid}`);
      const oldDay = findDay(dayUuid, this.plan, this.traininginstances);
      this.traininginstances = removeTrainingInstancesForDay(oldDay, clone(this.traininginstances));
      this.plan.days = deleteDay(dayUuid, this.plan.days);
      eventbus.emit(ee.DAY_DELETE_EVT, this.plan);
    });

    eventbus.on(ee.TRAINING_CLONE_AS_INSTANCE_CMD, (training, position) => {
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
      // TODO modify augmentDay to accept one training as well as multiple trainings
      const augmentedDay = augmentDay({ uuid: createUuid(), instanceId: newInstanceUuid },
        this.traininginstances);
      this.insertDayIntoPlan(position, augmentedDay);
      eventbus.emit(ee.TRAINING_TO_PLAN_EVT, this.plan);
    });
  }

  /**
   * TODO move to timelineUtil
   * @param {number} position - where to insert
   * @param {Day} augmentedDay - what to insert
   */
  insertDayIntoPlan(position, augmentedDay) {
    console.log(`TimelineStore insert day into plan @${position}`);
    if (position === undefined) {
      this.plan.days.push(augmentedDay);
    } else if (position === 0) {
      this.plan.days.unshift(augmentedDay);
    } else if (position === 0.5) {
      this.plan.days.splice(Math.round(this.traininginstances.length / 2), 0, augmentedDay);
    } else {
      this.plan.days.splice(position, 0, augmentedDay);
    }
  }
}
