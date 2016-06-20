import EventEmitter from "eventemitter2";
import {
  findTraining,
  makeTrainingTotal,
  isDirtySegment,
  augmentSegmentData,
  isValidSegment,
  addSegment,
  removeSegment
} from "./trainingUtil";
import { createUuid, clone } from "./miscUtil";

export default class TrainingStore {

  constructor(eventbus, trainings) {
    this.eventbus = eventbus;
    this.trainings = trainings;
    this.uuid = null;
    this.name = "undefined";
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00"
    };

    eventbus.on("TRAINING_LIST_CMD", () => {
      eventbus.emit("TRAINING_LIST_EVT", this.trainings);
    });

    eventbus.on("TRAINING_LOAD_CMD", (uuid) => {
      this.clearTraining();
      this.loadTraining(uuid, this.trainings);
    });

    eventbus.on("TRAINING_CLEAR_CMD", (uuid) => {
      this.clearTraining();
      this.eventbus.emit("TRAINING_CLEAR_EVT", uuid);
    });

    eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
      this.updateSegment(segment, this.segments);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      console.log(`SEGMENT_ADD_CMD ${segment.uuid}`);
      this.addSegmentToStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      this.removeSegmentFromStore(segment, this.segments);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
      console.log(`SEGMENT_CLONE_CMD ${segment.uuid}`);
      this.addSegmentToStore(segment, this.segments, true);
    });
  }

  addSegmentToStore(segment, segments, overwriteUuid) {
    console.log(`addSegmentToStore (${segments.length}) ${segment.uuid} overwrite? ${overwriteUuid}`);
    this.segments = addSegment(segment, segments, overwriteUuid);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", { segments: this.segments, total: this.total });
  }

  updateSegment(segment, segments) {
    segment = augmentSegmentData(segment);
    let i = 0;
    segments.some((_segment) => {
      if (_segment.uuid === segment.uuid) {
        this.segments[i] = segment;
        this.total = makeTrainingTotal(segments);
        return true;
      }
      i++;
    });
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
    this.name = "undefined";
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
      let _segments = training.segments.map((segment) => {
        return augmentSegmentData(segment);
      });
      this.segments = _segments;
      this.total = makeTrainingTotal(_segments);
      this.eventbus.emit("TRAINING_LOAD_EVT", {
        uuid: this.uuid,
        name: this.name,
        segments: _segments,
        total: this.total
      });
    }
  }
}
