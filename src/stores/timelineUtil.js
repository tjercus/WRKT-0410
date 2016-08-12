import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";
import {
  clone,
  createUuid
} from "./miscUtil";

/**
 * Return a plan
 */
export function findPlan(uuid, plans = [], trainingInstances = []) {
  //console.log(`timelineUtil.findPlan: ${JSON.stringify(trainingInstances[0])}`);
  if (uuid === null || uuid.length !== 36) {
    throw new Error(`findPlan says uuid is not ok: ${uuid}`);
  }
  const _plans = clone(plans);
  const _trainings = clone(trainingInstances);
  console.log(`len: ${plans.length} plans[0].uuid: ${_plans[0].uuid}`);
  let plan = _plans.find((_plan) => {
    if (_plan.uuid == uuid) return _plan;
  });
  let _days = [];
  if (plan === null || plan === undefined) {
    throw new Error(`plan not found ${uuid}`);
  }
  console.log(`plan ${JSON.stringify(plan)}`);
  plan.days.forEach((_day, i) => {
    _days.push(augmentDay(_day, _trainings));
  });
  plan.days = _days;
  return plan;
}

export function findDay(dayUuid, plan, trainings) {
  if (trainings.length === 0) {
    throw new Error(`trainings should be provided!`);
  }
  const _days = clone(plan.days);
  const _trainings = clone(trainings);
  let found = null;
  _days.forEach((_day, j) => {
    console.log(`findDay ${JSON.stringify(_day)}`);
    if (_day["uuid"] == dayUuid) {
      found = augmentDay(_day, _trainings);
    }
  });
  console.log(`findDay ${JSON.stringify(found)}`);
  return found;
}

/**
 * lookup training for a day by uuid and add it to itself
 * @param { object } [day] [flattened day object with ref to inflated day]
 * @param { array<TrainingInstance> } [trainings] [list of augmented TrainingInstance ojects]
 * @return { array<Day> } [description]
 */
export function augmentDay(day, trainings) {
  if (trainings.length === 0) {
    throw new Error(`traininginstances should be provided!`);
  }
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.instanceId === "string") ? _day.instanceId : null;
  _day.training = findTraining(uuid, _trainings);
  if (_day.training === null) {
    throw new Error(`training not found ${uuid} for day ${day.uuid}`);
  }
  _day.training.total = makeTrainingTotal(_day.training.segments);
  return _day;
}

/**
 * Takes an array of augmented days and flattens it so there are only
 *  references to instances instead of full traininginstance.
 * @param  {array<Day>} augmented
 * @return {array<Day>} flattened
 */
export function flattenDays(days) {
  const _days = clone(days);
  const flattenedDays = [];
  _days.forEach((_day, j) => {
    flattenedDays.push({ uuid: _day.uuid, instanceId: _day.training.uuid });
  });
  return flattenedDays;
}

export function removeTrainingFromDay(dayUuid, days) {
  let _days = clone(days);
  const isDay = (_day) => {
    return _day.uuid == dayUuid;
  }
  const index = _days.findIndex(isDay);
  if (index > -1) {
    _days[index].training = {
      uuid: createUuid(),
      name: "No Run",
      distance: 0,
      duration: "00:00:00",
      pace: "00:00",
      type: "",
      total: { distance: 0, duration: "00:00:00", pace: "00:00" }
    };
  }
  return _days;
}
