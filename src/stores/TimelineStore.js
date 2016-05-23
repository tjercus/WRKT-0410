import EventEmitter from "eventemitter2";
import {findTraining, makeTrainingTotal} from "./trainingUtil";
import {plans} from "./plans";
import {trainings} from "./trainings";

export default class TimelineStore {
	
	constructor(eventbus) {
    this.eventbus = eventbus;
    this.days = [];

    eventbus.on("PLAN_LOAD_CMD", (() => {
      this.loadPlan();
      eventbus.emit("PLAN_LOAD_EVT", this.days);
    }));
  }  

  loadPlan() {
    plans[0].days.map((day) => {
      let workoutId = day.workout;
      day.workout = findTraining(workoutId, trainings);
      day.workout.total = makeTrainingTotal(day.workout.segments);
    });
    this.days = plans[0].days;
  }
  
}