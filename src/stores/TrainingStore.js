import EventEmitter from "eventemitter2";
import {trainings} from "./trainings";
import {findTraining, makeTrainingTotal, isDirtySegment, augmentSegmentData, isValidSegment} from "./trainingUtil";
import {createUuid} from "./miscUtil";

export default class TrainingStore {
	
	constructor(eventbus) {
    this.eventbus = eventbus;
		this.uuid = null;
    this.name = "undefined";
    this.segments = [];
    this.total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00"
    };    

    eventbus.on("TRAINING_LIST_CMD", (() => {
      eventbus.emit("TRAINING_LIST_EVT", trainings);
    }));

    eventbus.on("TRAINING_LOAD_CMD", ((uuid) => {
      this.clearTraining();
      console.log("TrainingStore TRAINING_LOAD_CMD " + uuid);
      let training = findTraining(uuid, trainings);
      if (training !== null) {
        console.log("TrainingStore TRAINING_LOAD_CMD, segment 0: " + JSON.stringify(this.segments[0]));
        this.uuid = training.uuid;
        this.name = training.name;
        let _segments = training.segments.map((segment) => {
          return augmentSegmentData(segment);
        });
        this.segments = _segments;        
        console.log("TrainingStore.constructor TRAINING_LOAD_CMD calling makeTrainingTotal for, segment 0: " + JSON.stringify(this.segments[0]));
        this.total = makeTrainingTotal(this.segments);
        console.log("TRAINING_LOAD_EVT now emitted with " + ", segment 0: " + JSON.stringify(this.segments[0]));
        eventbus.emit("TRAINING_LOAD_EVT", {uuid: this.uuid, name: this.name, segments: this.segments, total: this.total});
      }
      // TODO handle else
      console.log("TrainingStore finished TRAINING_LOAD_CMD for: " + uuid + ", segment 0: " + JSON.stringify(this.segments[0]));
    }));

    eventbus.on("TRAINING_CLEAR_CMD", ((uuid) => {
      this.clearTraining();
      eventbus.emit("TRAINING_CLEAR_EVT", uuid);
    }));

		eventbus.on("SEGMENT_UPDATE_CMD", ((segment) => {
      //if (isDirtySegment(segment, this.segments)) {
        this.updateSegment(segment);
        console.log("TrainingStore: updated to " + JSON.stringify(segment));
      //}
    }));
    eventbus.on("SEGMENT_ADD_CMD", ((segment) => {
      this.addSegment(segment);
      console.log("TrainingStore: added " + JSON.stringify(segment));
    }));
    eventbus.on("SEGMENT_REMOVE_CMD", ((segment) => {
      this.removeSegment(segment);
      console.log("TrainingStore: removed " + JSON.stringify(segment));
    }));
    eventbus.on("SEGMENT_CLONE_CMD", ((segment) => {      
      this.addSegment(segment, true);
      console.log("TrainingStore: cloned " + JSON.stringify(segment));
    }));    
	}  

  addSegment(segment, overwriteUuid) {
    if (!segment.uuid || overwriteUuid === true) {      
      segment.uuid = createUuid();
    }
    segment = augmentSegmentData(segment);
    this.segments.push(segment);
    console.log("addSegment calling makeTrainingTotal for " + this.uuid);
    this.total = makeTrainingTotal(this.segments);
    this.eventbus.emit("SEGMENT_ADD_EVT", {segments: this.segments, total: this.total});
  }
  
  updateSegment(segment) {
    console.log("TrainingStore.updateSegment looking at segment: " + segment.uuid);
    segment = augmentSegmentData(segment);
    let i = 0;
    this.segments.some((_segment) => {
      if (_segment.uuid === segment.uuid) {
        console.log("TrainingStore.updateSegment found segment: " + segment.uuid);
        this.segments[i] = segment;
        console.log("updateSegment calling makeTrainingTotal for " + this.uuid);
        this.total = makeTrainingTotal(this.segments);
        return true;
      }
      i++;
    });
    console.log("TrainingStore.updateSegment: [" + i + "] " + JSON.stringify(this.segments[i]));
    this.eventbus.emit("SEGMENT_UPDATE_EVT", {segment: this.segments[i], total: this.total});
  }

  removeSegment(segment) {
    let i = 0;
    console.log("TrainingStore.removeSegment (1): " + this.segments.length);
    this.segments.some((segment) => {
      if (segment.uuid === segment.uuid) {
        this.segments.splice(i, 1);
        console.log("removeSegment calling makeTrainingTotal for " + this.uuid);
        this.total = makeTrainingTotal(this.segments);
        return true;
      }
      i++;      
    });
    this.eventbus.emit("SEGMENT_REMOVE_EVT", {segments: this.segments, total: this.total});
    console.log("TrainingStore.removeSegment (2): " + this.segments.length);
  }    

  clearTraining() {
    this.uuid = null;
    this.name = "undefined";
    this.segments = [];
    this.total = {};
  }
}