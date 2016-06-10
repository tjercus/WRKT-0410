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

export function findDay(dayNr, days = [], trainings = []) {
  const _days = clone(days);
  const _trainings = clone(trainings);
  let found = null;
  // TODO use higher order function like find/map whatever
  for (let i = 0, len = _days.length; i < len; i++) {
    if (_days[0] !== null && _days[i]["nr"] == dayNr) {
      found = augmentDay(_days[i], _trainings);
    }
  }
  return found;
}

/**
 * lookup training for a day by uuid and add it to itself
 */
function augmentDay(day, trainings = []) {
  JSON.stringify("augmentDay: " + JSON.stringify(day));
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.trainingId === "string") ? _day.trainingId : null;
  _day.training = findTraining(uuid, _trainings);  
  if (_day.training === null) {
    throw new Error(`training not found ${uuid}`);
  }
  _day.training.total = makeTrainingTotal(_day.training.segments);
  return _day;
}