import EventEmitter from "eventemitter2";
import {
  findTraining,
  updateTraining,
  makeTrainingTotal,
  isDirtySegment,
  augmentSegmentData,
  isValidSegment,
  addSegment,
  removeSegment
} from "./trainingUtil";
import { createUuid, clone } from "./miscUtil";

/*
let fetch;
if (typeof(fetch) === 'undefined') {
  fetch = function(url, options){ 
    function then() {}
  };
}
*/

export default class TrainingStore {

  constructor(eventbus, trainings) {
    this.eventbus = eventbus;
    this.trainings = trainings;
    this.uuid = null;
    this.name = "undefined";
    this.type = null;
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00"
    };

    eventbus.on("TRAININGS_FETCHED_EVT", (trainings) => {
      this.trainings = trainings;
    });

    eventbus.on("TRAININGS_PERSIST_CMD", () => {
      // TODO check if currently loaded training should be updated to this.trainings first
      this.updateTrainingInStore(this.getCurrentlyLoadedTraining(), this.trainings);
      this.persistTrainings(this.trainings);
    });
    eventbus.on("TRAINING_LIST_CMD", () => {
      eventbus.emit("TRAINING_LIST_EVT", this.trainings);
    });
    eventbus.on("TRAINING_LOAD_CMD", (uuid) => {
      this.clearTraining();
      this.loadTraining(uuid, this.trainings);
    });
    eventbus.on("TRAINING_CLEAR_CMD", (uuid) => {
      this.clearTraining();
      eventbus.emit("TRAINING_CLEAR_EVT", uuid);
    });
    eventbus.on("TRAINING_CLONE_CMD", () => {
      console.log(`TrainingStore caught TRAINING_CLONE_CMD`);
      const clonedTraining = this.cloneTrainingInStore(this.trainings);            
      eventbus.emit("TRAINING_LOAD_CMD", clonedTraining.uuid);
    });
    eventbus.on("TRAINING_UPDATE_CMD", (training) => {
      // currently only 'name' and 'type' can be updated (besides 'segments')
      this.name = training.name;
      this.type = training.type;      
      console.log("TrainingStore.UPDATE: " + JSON.stringify(training) + ", and this.type: " + this.type);
      this.updateTrainingInStore(training, this.trainings);
    });

    eventbus.on("TRAINING_TO_PLAN_CMD", () => {
      this.eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", this.getCurrentlyLoadedTraining());
    });

    eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
      console.log(`TrainingStore caught SEGMENT_UPDATE_CMD`);
      this.updateSegment(segment, this.segments);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      console.log(`TrainingStore caught SEGMENT_ADD_CMD`);
      this.addSegmentToStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      console.log(`TrainingStore caught SEGMENT_REMOVE_CMD`);
      this.removeSegmentFromStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
      console.log(`TrainingStore caught SEGMENT_CLONE_CMD`);
      this.addSegmentToStore(segment, this.segments, true);
    });
  }

  // TODO move to trainingUtil
  persistTrainings(trainings) {
    console.log(`TrainingStore.persistTrainings: this.name: ${this.name} this.segments[0]: ${this.segments[0].distance}`);
    const trainingsStr = JSON.stringify(trainings, null, "\t");
    console.log(`last training in trainings before persist: ${JSON.stringify(trainings[trainings.length - 1])}`);    
    
    if (typeof fetch == 'function') {
      fetch("http://localhost:3333/trainings", {
        method: "PUT",
        body: trainingsStr
      }).then((response) => {
        this.eventbus.emit("TRAININGS_PERSIST_EVT");
      }).catch((error) => {
        this.eventbus.emit("TRAININGS_PERSIST_ERROR_EVT", error);
      });
    }    
  }

  cloneTrainingInStore(trainings) {
    console.log(`TrainingStore.cloneTrainingInStore`);
    const _trainings = clone(trainings);
    const _training = {};
    _training.uuid = createUuid();
    _training.name = `${this.name} (clone)`;
    _training.type = clone(this.type);
    _training.segments = clone(this.segments);
    _training.total = makeTrainingTotal(_training.segments);
    _trainings.push(_training);    
    this.trainings = _trainings;
    this.eventbus.emit("TRAINING_ADD_EVT", _trainings);
    return _training;
  }
  
  updateTrainingInStore(training, trainings) {
    console.log(`TrainingStore.updateTrainingInStore: ${JSON.stringify(training)}`);
    this.trainings = updateTraining(training, trainings);
    this.eventbus.emit("TRAINING_UPDATE_EVT", {training: training, trainings: this.trainings});
  }

  /**
   * @param {[type]}
   * @param {[type]}
   * @param {[type]}
   */
  addSegmentToStore(segment, segments, overwriteUuid) {
    this.segments = addSegment(segment, segments, overwriteUuid);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", { segments: this.segments, total: this.total });
  }  

  // TODO move to trainingUtil
  updateSegment(segment, segments) {
    const segmentClone = augmentSegmentData(segment);
    let i = 0;
    segments.some((_segment) => {
      if (_segment.uuid === segmentClone.uuid) {
        this.segments[i] = segmentClone;
        this.total = makeTrainingTotal(this.segments);
        return true;
      }
      i++;
    });
    console.log(`TrainingStore sent SEGMENT_UPDATE_EVT with total ${JSON.stringify(this.total)}`);
    this.eventbus.emit("SEGMENT_UPDATE_EVT", { segment: this.segments[i], total: this.total });
  }

  removeSegmentFromStore(segment, segments) {
    this.segments = removeSegment(segment, segments);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_REMOVE_EVT", { segments: this.segments, total: this.total });
    console.log(`TrainingStore.removeSegment SEGMENT_REMOVE_EVT: ${segment.uuid}`);
  }

  clearTraining() {
    this.uuid = null;
    this.name = null;
    this.type = null;
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00"
    };
  }

  loadTraining(uuid, trainings) {
    const training = findTraining(uuid, trainings);
    if (training !== null) {
      this.uuid = training.uuid;
      this.name = training.name;
      this.type = training.type;
      let _segments = training.segments.map((segment) => {
        return augmentSegmentData(segment);
      });
      this.segments = _segments;
      this.total = makeTrainingTotal(_segments);
      this.eventbus.emit("TRAINING_LOAD_EVT", this.getCurrentlyLoadedTraining());
    }
  }

  getCurrentlyLoadedTraining() {
      return {
        uuid: this.uuid,
        name: this.name,
        type: this.type,
        segments: this.segments,
        total: this.total
      }
  }
}
