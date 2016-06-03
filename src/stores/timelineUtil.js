import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";
import {clone} from "./miscUtil";

export function findPlan(uuid, plans = [], trainings = []) {
  const _plans = clone(plans);
  const _trainings = clone(trainings);

  console.dir(_plans);
  
  let plan = _plans.find((_plan) => {
    //console.log("looking at " + _plan.uuid + ", against " + uuid);
    if (_plan.uuid === uuid) return _plan;
  });  

  //console.log("plan: " + JSON.stringify(plan));
  //console.log("plan.days: " + JSON.stringify(plan.days));

  let augmentedDays = [];
  plan.days.forEach((day) => {
    console.log("findPlan.day: " + JSON.stringify(day));
    augmentedDays.push(augmentDay(day, trainings));
  });  
  plan.days = augmentedDays;

  return plan; 
}

export function findDay(dayNr, days = [], trainings = []) {
  const _days = clone(days);
  const _trainings = clone(trainings);  
  let found = null;    
  for (let i = 0, len = _days.length; i < len; i++) {
    console.log("findDay comparing: " + _days[i].nr + " with " + dayNr);
    if (_days[0] !== null && _days[i]["nr"] == dayNr) {    
      found = augmentDay(_days[i], _trainings);
    }
  }
  console.log("findDay found: " + JSON.stringify(found));
  return found;
}

/**
* lookup training for a day by uuid and add it to itself
*/
function augmentDay(day, trainings = []) {  
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.workout === "string") ? _day.workout : _day.workout.uuid;  
  console.log("augmentDay: " + JSON.stringify(uuid));
  _day.workout = findTraining(uuid, _trainings);
  // TODO catch when not found
  console.log("augmentDay calling makeTrainingTotal for " + uuid);
  _day.workout.total = makeTrainingTotal(_day.workout.segments);
  return _day;
}
