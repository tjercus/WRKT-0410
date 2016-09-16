import {
  findTraining,
  updateTraining,  
  removeTrainingInstance,
} from "./trainingUtil";
import {
  addSegment,
  removeSegment,
  augmentSegmentData,
  updateSegment,
  makeTrainingTotal,
} from "./segmentUtil";
import {
  createUuid,
  clone,
} from "./miscUtil";

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
      pace: "00:00",
    };

    eventbus.on("TRAININGS_FETCHED_EVT", (trainingsFromServer) => {
      this.trainings = trainingsFromServer;
    });

    eventbus.on("TRAININGS_PERSIST_CMD", (_trainings) => {
      if (_trainings === null) {
        // TODO check if currently loaded training should be updated to this.trainings first
        this.updateTrainingInStore(this.getCurrentlyLoadedTraining(),
          this.trainings);
        // note re-emit event but now with payload
        eventbus.emit("TRAININGS_PERSIST_CMD", this.trainings);
      }
    });
    eventbus.on("TRAININGS_UPDATE_CMD", () => {
      eventbus.emit("TRAININGS_UPDATE_EVT", this.trainings);
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
      const clonedTraining = this.cloneTrainingInStore(this.trainings);
      eventbus.emit("TRAINING_LOAD_CMD", clonedTraining.uuid);
    });

    eventbus.on("TRAINING_REMOVE_CMD", () => {
      // TODO rename like removeTrainingOrInstance
      this.trainings = removeTrainingInstance(this.uuid, this.trainings);
      eventbus.emit("TRAINING_LOAD_CMD", "new-training");
      eventbus.emit("TRAINING_REMOVE_EVT", this.trainings);
    });

    eventbus.on("TRAINING_UPDATE_CMD", (training) => {
      // currently only 'name' and 'type' can be updated (besides 'segments')
      this.name = training.name;
      this.type = training.type;
      this.updateTrainingInStore(training, this.trainings);
    });

    eventbus.on("TRAINING_TO_PLAN_CMD", () => {
      this.eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", this.getCurrentlyLoadedTraining());
    });

    eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
      this.updateSegmentInStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      this.addSegmentToStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      this.removeSegmentFromStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
      this.addSegmentToStore(segment, this.segments, true);
    });
  }

  cloneTrainingInStore(trainings) {
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
    this.trainings = updateTraining(training, trainings);
    this.eventbus.emit("TRAINING_UPDATE_EVT", {
      training,
      trainings: this.trainings,
    });
  }

  /**
   * @param {[type]}
   * @param {[type]}
   * @param {[type]}
   */
  addSegmentToStore(segment, segments, overwriteUuid) {
    this.segments = addSegment(segment, segments, overwriteUuid);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", {
      segments: this.segments,
      total: this.total,
    });
  } 

  removeSegmentFromStore(segment, segments) {
    this.segments = removeSegment(segment, segments);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_REMOVE_EVT", {
      segments: this.segments,
      total: this.total,
    });
  }

  updateSegmentInStore(segment, segments) {
    this.segments = updateSegment(segment, this.segments);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_UPDATE_EVT", {
      segment: segment,
      total: this.total,
    });
  }

  clearTraining() {
    this.uuid = null;
    this.name = null;
    this.type = null;
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00",
    };
  }

  loadTraining(uuid, trainings) {
    if (trainings.length === 0) {
      throw new Error("TrainingStore.loadTraining needs a list of trainings");
    }
    const training = findTraining(uuid, trainings);
    if (training !== null) {
      this.uuid = training.uuid;
      this.name = training.name;
      this.type = training.type;
      const _segments = training.segments.map(segment => augmentSegmentData(
        segment));
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
      total: this.total,
    };
  }
}

