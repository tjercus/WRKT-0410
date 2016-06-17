import EventEmitter from "eventemitter2";
import { 
  findTraining,
  makeTrainingTotal, 
  isDirtySegment, 
  augmentSegmentData, 
  isValidSegment, 
  removeSegment 
} from "./trainingUtil";
import { createUuid, clone } from "./miscUtil";

const TrainingStore = (eventbus, trainings) => {
  let uuid = null;
  let name = "undefined";
  let segments = [];
  let total = {
    distance: 0,
    duration: "00:00:00",
    pace: "00:00"
  };    

  eventbus.on("TRAINING_LIST_CMD", () => {
    eventbus.emit("TRAINING_LIST_EVT", trainings);
  });

  eventbus.on("TRAINING_LOAD_CMD", (uuid) => {
    clearTraining();
    loadTraining(uuid, trainings);
  });

  eventbus.on("TRAINING_CLEAR_CMD", (uuid) => {
    clearTraining();
    eventbus.emit("TRAINING_CLEAR_EVT", uuid);
  });

  eventbus.on("SEGMENT_UPDATE_CMD", (segment) => {
    updateSegment(segment);
  });
  eventbus.on("SEGMENT_ADD_CMD", (segment) => {
    addSegment(segment);
  });
  eventbus.on("SEGMENT_REMOVE_CMD", (segment) => {
    removeSegmentFromStore(segment);
  });
  eventbus.on("SEGMENT_CLONE_CMD", (segment) => {
    console.log(`SEGMENT_CLONE_CMD ${segment.uuid}`);
    addSegment(segment, true);
  });

  const addSegment = (segment, overwriteUuid) => {
    if (!segment.uuid || overwriteUuid === true) {
      segment.uuid = createUuid();
    }
    console.log(`addSegment ${segment.uuid}`);
    segment = augmentSegmentData(segment);
    segments.push(segment);
    total = makeTrainingTotal(segments);
    eventbus.emit("SEGMENT_ADD_EVT", { segments: segments, total: total });
  }

  const updateSegment = (segment) => {
    segment = augmentSegmentData(segment);
    let i = 0;
    segments.some((_segment) => {
      if (_segment.uuid === segment.uuid) {
        segments[i] = segment;
        total = makeTrainingTotal(segments);
        return true;
      }
      i++;
    });
    eventbus.emit("SEGMENT_UPDATE_EVT", { segment: segments[i], total: total });
  }

  const removeSegmentFromStore = (segment) => {    
    segments = removeSegment(segment, segments);
    total = makeTrainingTotal(segments);
    eventbus.emit("SEGMENT_REMOVE_EVT", { segments: segments, total: total });
    console.log(`TrainingStore.removeSegment SEGMENT_REMOVE_EVT: ${segment.uuid}`);
  }

  const clearTraining = () => {
    uuid = null;
    name = "undefined";
    segments = [];
    total = {};
  }

  const loadTraining = (uuid, trainings) => {
    let training = findTraining(uuid, trainings);
    if (training !== null) {
      uuid = training.uuid;
      name = training.name;
      let _segments = training.segments.map((segment) => {
        return augmentSegmentData(segment);
      });
      segments = _segments;
      total = makeTrainingTotal(segments);
      eventbus.emit("TRAINING_LOAD_EVT", {
        uuid: uuid,
        name: name,
        segments: segments,
        total: total
      });
    }
  }

  // public properties
  return {
    segments: segments    
  }
}

export default TrainingStore;
