import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";
import {
  clone
} from "./miscUtil";

/**
 * Return a plan as an array of microcycles.
 * For now fix a microcycle to 7 days
 */
export function findPlan(uuid, plans = [], trainings = []) {
  const _plans = clone(plans);
  const _trainings = clone(trainings);

  let plan = _plans.find((_plan) => {
    if (_plan.uuid === uuid) return _plan;
  });
  let _days = [];
  let _microcycles = [];
  if (plan === null || plan === undefined) {
    throw new Error(`plan not found ${uuid}`);
  }
  plan.microcycles.forEach((_microcycle, i) => {
    _days = [];
    _microcycle.days.forEach((_day, j) => {
      _days.push(augmentDay(_day, _trainings));
    });
    _microcycle.days = _days;
    _microcycles.push(_microcycle);
  });
  plan.microcycles = _microcycles;
  return plan;
}

export function findDay(dayNr, microcycles = [], trainings = []) {
  const _microcycles = clone(microcycles);
  const _trainings = clone(trainings);
  let found = null;
  _microcycles.map(_microcycle => {
    _microcycle.days.forEach((_day, j) => {
      if (_day["nr"] == dayNr) {
        found = augmentDay(_day, _trainings);
      }
    });
  });
  return found;
}

/**
 * lookup training for a day by uuid and add it to itself
 */
function augmentDay(day, trainings = []) {
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.instanceId === "string") ? _day.instanceId : null;
  _day.training = findTraining(uuid, _trainings);  
  if (_day.training === null) {
    throw new Error(`training not found ${uuid}`);
  }
  _day.training.total = makeTrainingTotal(_day.training.segments);
  return _day;
}