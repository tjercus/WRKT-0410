import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";

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

  console.log("findDay days: " + JSON.stringify(_days));
  let found = null;  
  
  /*
  let found = _days.find((_day) => {
    console.log("looking at " + _day.nr + ", against " + dayNr);
    if (_day.nr === dayNr) return augmentDay(_day);
  });  
  */
    
  for (let i = 0, len = _days.length; i < len; i++) {
    if (_days[0] !== null && _days[i]["nr"] === dayNr) {    
      found = augmentDay(_days[i], _trainings);
    }
  }  
  return found;
}

/**
* lookup training for a day by uuid and add it to itself
*/
function augmentDay(day, trainings = []) {  
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = _day.workout;
  console.log("augmentDay: " + JSON.stringify(uuid));
  _day.workout = findTraining(uuid, _trainings);
  _day.workout.total = makeTrainingTotal(_day.workout.segments);
  return _day;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
