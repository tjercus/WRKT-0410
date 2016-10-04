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

/**
 * Holds data for a training loaded in a view(s)
 */
export default class TrainingStore {

  /**
   * @param  {EventEmitter2} eventbus - shared
   * @param  {Array<Training>} trainings - optionally passable data,
   *  can also be received via eventbus
   */
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
        this.updateTrainingInStore(this.getCurrentlyLoadedTraining());
        // note re-emit event but now with payload
        eventbus.emit("TRAININGS_PERSIST_CMD", this.trainings);
      }
    });
    eventbus.on("TRAININGS_UPDATE_CMD", () => {
      eventbus.emit("TRAININGS_UPDATE_EVT", this.trainings);
    });
    eventbus.on("TRAINING_LOAD_CMD", (uuid) => {
      this.clearTraining();
      this.loadTraining(uuid);
    });
    eventbus.on("TRAINING_CLEAR_CMD", (uuid) => {
      this.clearTraining();
      eventbus.emit("TRAINING_CLEAR_EVT", uuid);
    });
    eventbus.on("TRAINING_CLONE_CMD", () => {
      this.cloneLoadedTrainingInStore();
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
      this.updateTrainingInStore(training);
    });

    eventbus.on("TRAINING_TO_PLAN_CMD", (position) => {
      console.log(`TrainingStore caught TRAINING_TO_PLAN_CMD ${position}`);
      this.eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", this.getCurrentlyLoadedTraining(), position);
    });

    eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
      this.updateSegmentInStore(segment);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      this.addSegmentToStore(segment);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      this.removeSegmentFromStore(segment);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
      this.addSegmentToStore(segment, true);
    });
  }

  /**
   * Clone currently loaded training in the collection which is
   *  currently loaded in store and then emit some events
   * @returns {Void} - emit events instead
   */
  cloneLoadedTrainingInStore() {
    const _trainings = clone(this.trainings);
    const _training = {};
    _training.uuid = createUuid();
    _training.name = `${this.name} (clone)`;
    _training.type = clone(this.type);
    _training.segments = clone(this.segments);
    _training.total = makeTrainingTotal(_training.segments);
    _trainings.push(_training);
    this.trainings = _trainings;
    this.eventbus.emit("TRAINING_ADD_EVT", _trainings);
    this.eventbus.emit("TRAINING_LOAD_CMD", _training.uuid);
  }

  /**
   * Update given training in list of trainings
   * @param {Training} training - updatable
   * @returns {Void} - emit event instead
   */
  updateTrainingInStore(training) {
    this.trainings = updateTraining(training, this.trainings);
    this.eventbus.emit("TRAINING_UPDATE_EVT", {
      training,
      trainings: this.trainings,
    });
  }

 /**
  * Add a segment to class scoped segments, optionally overwriting it's uuid
  * @param {Segment} segment - data object
  * @param {boolean} overwriteUuid - new uuid or keep old?
  * @returns {Void} - emit event instead
  */
  addSegmentToStore(segment, overwriteUuid) {
    this.segments = addSegment(segment, this.segments, overwriteUuid);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", {
      segments: this.segments,
      total: this.total,
    });
  }

  /**
   * Remove segment from local collection of segments
   * @param {Segment} segment - data object
   * @returns {Void} - emit event instead
   */
  removeSegmentFromStore(segment) {
    this.segments = removeSegment(segment, this.segments);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_REMOVE_EVT", {
      segments: this.segments,
      total: this.total,
    });
  }

  /**
   * Update segment in local collection of segments
   * @param {Segment} segment - data object
   * @returns {Void} - emit event instead
   */
  updateSegmentInStore(segment) {
    const _segment = augmentSegmentData(segment);
    this.segments = updateSegment(_segment, this.segments);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_UPDATE_EVT", {
      segment: _segment,
      total: this.total,
    });
  }

  /**
   * Empty class scoped variables containing data for the currently loaded training
   * @returns {Void} - purely work on class data
   */
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

  /**
   * Lookup by uuid from param trainings and load in store
   * @param  {string} uuid - to lookup with
   * @returns {Void} - emit event instead
   */
  loadTraining(uuid) {
    if (this.trainings.length === 0) {
      throw new Error("TrainingStore.loadTraining needs a list of trainings");
    }
    const training = findTraining(uuid, this.trainings);
    if (training !== null) {
      this.uuid = training.uuid;
      this.name = training.name;
      this.type = training.type;
      const _segments = training.segments.map(segment => augmentSegmentData(
        segment));
      this.segments = _segments;
      this.total = makeTrainingTotal(_segments);
      this.eventbus.emit("TRAINING_LOAD_EVT", this.getCurrentlyLoadedTraining());
    } else {
      this.eventbus.emit("TRAINING_LOAD_ERROR_EVT", "Training could not be found");
    }
  }

  /**
   *
   * @return {Training} training - compose the class scoped data into one training
   */
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

