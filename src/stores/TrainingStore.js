import EventEmitter from "eventemitter2";
import {trainings} from "./trainings";
import {findTraining, makeTrainingTotal, isDirtySegment, augmentSegmentData, isValidSegment} from "./trainingUtil";
import {createUuid, clone} from "./miscUtil";

export default class TrainingStore {
	
	constructor(eventbus, _trainings = null) {
    this.eventbus = eventbus;
		this.uuid = null;
    this.name = "undefined";
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00"
    };
    // first look at optional constructor parameter then look at imported trainings.js
    this.trainings = _trainings || trainings;

    eventbus.on("TRAINING_LIST_CMD", () => {
      eventbus.emit("TRAINING_LIST_EVT", trainings);
    });

    eventbus.on("TRAINING_LOAD_CMD", (uuid) => {
      this.clearTraining();
      this.loadTraining(uuid, this.trainings);
    });

    eventbus.on("TRAINING_CLEAR_CMD", (uuid) => {
      this.clearTraining();
      eventbus.emit("TRAINING_CLEAR_EVT", uuid);
    });

		eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
        this.updateSegment(segment);
    });
    eventbus.on("SEGMENT_ADD_CMD", (segment) => {
      this.addSegment(segment);
    });
    eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
      this.removeSegment(segment);
    });
    eventbus.on("SEGMENT_CLONE_CMD", (segment) => {      
      this.addSegment(segment, true);
    });    
	}  

  addSegment(segment, overwriteUuid) {
    if (!segment.uuid || overwriteUuid === true) {      
      segment.uuid = createUuid();
    }
    segment = augmentSegmentData(segment);
    this.segments.push(segment);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", {segments: this.segments, total: this.total});
  }
  
  updateSegment(segment) {
    segment = augmentSegmentData(segment);
    let i = 0;
    this.segments.some((_segment) => {
      if (_segment.uuid === segment.uuid) {
        this.segments[i] = segment;
        this.total = makeTrainingTotal(this.segments);
        return true;
      }
      i++;
    });
    this.eventbus.emit("SEGMENT_UPDATE_EVT", {segment: this.segments[i], total: this.total});
  }

  removeSegment(segment) {    
    let originalLen = this.segments.length;
    let _segments = clone(this.segments);
    for (let i = 0, len = _segments.length; i < len; i++) {      
      if (_segments[i].uuid == segment.uuid) {        
        let deletedSegments = _segments.splice(i, 1);        
        break;
      }
    }
    this.segments = _segments;
    this.total = makeTrainingTotal(_segments);
    this.eventbus.emit("SEGMENT_REMOVE_EVT", {segments: _segments, total: this.total});
    console.log("TrainingStore.removeSegment SEGMENT_REMOVE_EVT: " + segment.uuid + ", len: " + this.segments.length + ", before: " + originalLen);
  }    

  clearTraining() {
    this.uuid = null;
    this.name = "undefined";
    this.segments = [];
    this.total = {};
  }

  loadTraining(uuid, trainings) {
    let training = findTraining(uuid, trainings);
    if (training !== null) {
      this.uuid = training.uuid;
      this.name = training.name;
      let _segments = training.segments.map((segment) => {
        return augmentSegmentData(segment);
      });
      this.segments = _segments;
      this.total = makeTrainingTotal(this.segments);
      this.eventbus.emit("TRAINING_LOAD_EVT", {
        uuid: this.uuid,
        name: this.name,
        segments: this.segments,
        total: this.total
      });
    }
  }
}