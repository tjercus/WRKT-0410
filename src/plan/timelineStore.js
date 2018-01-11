import {
  findDay,
  augmentDay,
  flattenDays,
  removeTrainingsFromDay,
  moveDay,
  cloneDay,
  deleteDay,
  cleanTrainingInstances
} from "./timelineUtil";
import {EventsEnum as ee} from "../shell/constants";
import {
  removeTrainingInstancesForDay,
  updateTraining,
  NotFoundException
} from "../training/trainingUtil";
import {clone, createUuid, hasProperty} from "object-utils-2";

let plan = {days: []};
let traininginstances = [];
let selectedWeekNr = 0;

/**
 * TODO perhaps rename to 'Plan(s)Store'
 *
 * @param {EventEmitter|Emitter} eventbus - decoupling
 * @returns {timelineStore} this - itself
 */
const timelineStore = eventbus => {

  eventbus.on(ee.PLAN_SELECT_WEEK_CMD, nr => {
    selectedWeekNr = nr;
  });

  // NOTE that is up to the emitter to fetch and combine both sets
  eventbus.on(ee.PLAN_FETCH_EVT, planAndTraininginstances => {
    console.time("PLAN_FETCH_EVT");
    if (!Array.isArray(planAndTraininginstances)) {
      throw new Error("PLAN_FETCH_EVT has no array with a plan and instances in it");
    }
    const _plan = planAndTraininginstances[0];
    if (!hasProperty(_plan, "uuid")) {
      throw new Error("PLAN_FETCH_EVT did not receive a proper day");
    }
    const _traininginstances = planAndTraininginstances[1];
    // TODO let a worker handle each augment
    _plan.days = _plan.days.map(_day => augmentDay(_day, _traininginstances));

    traininginstances = _traininginstances;
    plan = _plan;
    eventbus.emit(ee.PLAN_LOAD_EVT, plan);
    console.timeEnd("PLAN_FETCH_EVT");
    console.log("timelineStore loaded a plan:", JSON.stringify(plan));
  });

  eventbus.on(ee.PLAN_PERSIST_CMD, () => {
    const persistablePlan = {
      uuid: plan.uuid,
      name: plan.name,
      days: flattenDays(plan.days),
      startDate: plan.startDate,
    };
    eventbus.emit(ee.PLAN_AND_INSTANCES_PERSIST_CMD, persistablePlan,
      cleanTrainingInstances(traininginstances));
  });

  // thrown by DayStore
  eventbus.on(ee.DAY_UPDATE_EVT, day => {
    if (day === null || day === undefined) {
      console.error("timelineStore caught DAY_UPDATE_EVT with undefined day, returning ...");
      return null;
    }
    if (!hasProperty(day, "trainings")) {
      day.trainings = [];
    }

    console.log("timelineStore caught DAY_UPDATE_EVT: update local plan");
    const byUuid = _day => String(_day.uuid) === String(day.uuid);
    const index = plan.days.findIndex(byUuid);
    plan.days[index] = day;

    day.trainings.map(training => {
      // provide for the situation where a second training is added instead of updated
      try {
        traininginstances = updateTraining(training, clone(traininginstances));
      } catch (exc) {
        console.log(exc);
        if (exc instanceof NotFoundException) {
          traininginstances.push(training);
        }
      }
    });

    eventbus.emit(ee.PLAN_UPDATE_EVT, plan);
  });

  eventbus.on(ee.DAY_EMPTY_CMD, dayUuid => {
    const oldDay = findDay(dayUuid, plan, traininginstances);
    plan.days = removeTrainingsFromDay(oldDay, clone(plan.days));
    traininginstances = removeTrainingInstancesForDay(oldDay, clone(traininginstances));
    eventbus.emit(ee.DAY_EMPTY_EVT, plan);
  });

  eventbus.on(ee.DAY_MOVE_CMD, (dayUuid, positions) => {
    console.log(`TimelineStore on DAY_MOVE_CMD ${dayUuid}`);
    plan.days = moveDay(dayUuid, plan.days, positions);
    eventbus.emit(ee.DAY_MOVE_EVT, plan);
  });

  // TODO unit test this logic!
  eventbus.on(ee.DAY_CLONE_CMD, (dayUuid, position) => {
    const oldDay = findDay(dayUuid, plan, traininginstances);
    const newDay = cloneDay(oldDay);
    Array.prototype.push.apply(traininginstances, newDay.trainings);
    insertDayIntoPlan(position, newDay, selectedWeekNr);
    eventbus.emit(ee.DAY_CLONE_EVT, plan);
  });

  eventbus.on(ee.DAY_DELETE_CMD, dayUuid => {
    console.log(`TimelineStore on DAY_DELETE_CMD ${dayUuid}`);
    const oldDay = findDay(dayUuid, plan, traininginstances);
    traininginstances = removeTrainingInstancesForDay(oldDay, clone(traininginstances));
    plan.days = deleteDay(dayUuid, plan.days);
    eventbus.emit(ee.DAY_DELETE_EVT, plan);
  });

  eventbus.on(ee.TRAINING_CLONE_AS_INSTANCE_CMD, (training, position) => {
    // if (!hasProperty(this, "plan")) {
    //   throw new Error("Cloning a day before a plan was loaded in TimelineStore");
    // }
    // if (!hasProperty(plan, "days")) {
    //   throw new Error("Cloning a day before days are loaded in TimelineStore");
    // }
    const _training = clone(training);
    const newInstanceUuid = createUuid();
    _training.uuid = newInstanceUuid;
    traininginstances.push(_training);
    // TODO modify augmentDay to accept one training as well as multiple trainings
    const augmentedDay = augmentDay(
      {uuid: createUuid(), instanceId: newInstanceUuid},
      traininginstances,
    );
    insertDayIntoPlan(position, augmentedDay, selectedWeekNr);
    eventbus.emit(ee.TRAINING_TO_PLAN_EVT, plan);
  });

  /**
   * TODO move to timelineUtil
   * @param {number} position - where to insert
   * @param {Day} augmentedDay - what to insert
   * @param {number} weekNr - in which week to insert it
   * @returns {void} - modfies local state instead
   */
  const insertDayIntoPlan = (position, augmentedDay, weekNr) => {
    console.log(`TimelineStore insert day into plan @${position}`);
    if (position === undefined) {
      plan.days.push(augmentedDay);
    } else if (position === 0) {
      plan.days.unshift(augmentedDay);
    } else if (position === 0.5) {
      plan.days.splice(Math.round(traininginstances.length / 2), 0, augmentedDay);
    } else if (position === -1) {
      plan.days.splice(weekNr * 7 + 4, 0, augmentedDay);
    } else {
      plan.days.splice(position, 0, augmentedDay);
    }
  };

  return this;
};

export default timelineStore;
