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
  makeSegmentsTotal,
  findSegment,
} from "activity-segment";
import {
  createUuid,
  clone,
  hasProperty,
} from "object-utils-2";
import {EventsEnum as ee} from "../shell/constants";

let trainings = {};

// TODO rewrite as: let training = {};
//  perhaps Immutable.Record
let name = "undefined";
let uuid = null;
let type = null;
let segments = [];
let total = {
  distance: 0,
  duration: "00:00:00",
  pace: "00:00",
};

/**
 * Holds data for a training loaded in a view(s)
 * @param  {EventEmitter} eventbus - shared
 * @param  {Array<Training>} trainings - optionally passable data,
 *  can also be received via eventbus
 * @returns {timelineStore} this - itself
 */
const trainingStore = eventbus => {
  eventbus.on(ee.TRAININGS_FETCH_EVT, (trainingsFromServer) => {
    trainings = trainingsFromServer;
  });

  eventbus.on(ee.TRAININGS_PERSIST_CMD, _trainings => {
    if (_trainings === null) {
      // TODO check if currently loaded training should be updated to this.trainings first
      updateTrainingInStore(getCurrentlyLoadedTraining());
      // note re-emit event but now with payload
      eventbus.emit(ee.TRAININGS_PERSIST_CMD, trainings);
    }
  });
  eventbus.on(ee.TRAININGS_UPDATE_CMD, () => {
    eventbus.emit(ee.TRAININGS_UPDATE_EVT, trainings);
  });
  eventbus.on(ee.TRAINING_LOAD_CMD, _uuid => {
    console.log(`trainingStore on TRAINING_LOAD_CMD with ${_uuid} comparing to ${uuid}`);
    clearTraining();
    loadTraining(_uuid);
  });
  eventbus.on(ee.TRAINING_CLEAR_CMD, _uuid => {
    if (_uuid === uuid) {
      clearTraining();
      eventbus.emit(ee.TRAINING_CLEAR_EVT, _uuid);
    }
  });
  eventbus.on(ee.TRAINING_CLONE_CMD, _uuid => {
    if (_uuid === uuid) {
      cloneLoadedTrainingInStore();
    }
  });

  eventbus.on(ee.TRAINING_REMOVE_CMD, _uuid => {
    if (_uuid === uuid) {
      // TODO rename like removeTrainingOrInstance
      trainings = removeTrainingInstance(uuid, trainings);
      eventbus.emit(ee.TRAINING_LOAD_CMD, "new-training");
      eventbus.emit(ee.TRAINING_REMOVE_EVT, trainings);
    }
  });

  eventbus.on(ee.TRAINING_UPDATE_CMD, training => {
    if (training.uuid === uuid) {
      // currently only 'name' and 'type' can be updated (besides 'segments')
      name = training.name;
      type = training.type;
      updateTrainingInStore(training);
    }
  });

  eventbus.on(ee.TRAINING_TO_PLAN_CMD, (position) => {
    // console.log(`TrainingStore caught TRAINING_TO_PLAN_CMD ${position}`);
    eventbus.emit(ee.TRAINING_CLONE_AS_INSTANCE_CMD,
      getCurrentlyLoadedTraining(), position);
  });

  eventbus.on(ee.SEGMENT_GET_CMD, (segmentUuid, trainingUuid) => {
    emitSegment(segmentUuid, trainingUuid, uuid, segments);
  });

  eventbus.on(ee.SEGMENT_UPDATE_CMD, segment => {
    updateSegmentInStore(segment);
  });
  eventbus.on(ee.SEGMENT_ADD_CMD, segment => {
    addSegmentToStore(segment);
  });
  eventbus.on(ee.SEGMENT_REMOVE_CMD, (segment) => {
    removeSegmentFromStore(segment);
  });
  eventbus.on(ee.SEGMENT_CLONE_CMD, (segment) => {
    // console.log(`TrainingStore caught SEGMENT_CLONE_CMD with ${JSON.stringify(segment)}`);
    addSegmentToStore(segment, true);
  });

  /**
   * Clone currently loaded training in the collection which is
   *  currently loaded in store and then emit some events
   * @returns {void} - emit events instead
   */
  const cloneLoadedTrainingInStore = () => {
    const _trainings = clone(trainings);
    const _training = {};
    _training.uuid = createUuid();
    _training.name = `${name} (clone)`;
    _training.type = clone(type);
    _training.segments = clone(segments);
    _training.total = makeSegmentsTotal(_training.segments);
    _trainings.push(_training);
    trainings = _trainings;
    eventbus.emit(ee.TRAINING_ADD_EVT, _trainings);
    eventbus.emit(ee.TRAINING_LOAD_CMD, _training.uuid);
  };

  /**
   * Update given training in list of trainings
   * @param {Training} training - updatable
   * @returns {void} - emit event instead
   */
  const updateTrainingInStore = training => {
    trainings = updateTraining(training, trainings);
    eventbus.emit(ee.TRAINING_UPDATE_EVT, {
      training,
      trainings,
    });
  };

  /**
   * Add a segment to class scoped segments, optionally overwriting it's uuid
   * @param {Segment} segment - data object
   * @param {boolean} overwriteUuid - new uuid or keep old?
   * @returns {void} - emit event instead
   */
  const addSegmentToStore = (segment, overwriteUuid = false) => {
    if (hasProperty(segment, "trainingUuid") && segment.trainingUuid === uuid) {
      console.log(`TrainingStore.addSegmentToStore(); segment.trainingUuid was 
      EQUAL to the loaded training ${segment.trainingUuid}`);
      segments = addSegment(segment, segments, overwriteUuid);
      total = makeSegmentsTotal(segments);
      eventbus.emit(ee.SEGMENT_ADD_EVT, {
        uuid: segment.trainingUuid,
        segments,
        total,
      });
    } else {
      console.log(`TrainingStore.addSegmentToStore(); segment.trainingUuid was NOT 
      EQUAL to the loaded training ${segment.trainingUuid}`);
    }
  };

  /**
   * Remove segment from local collection of segments
   * @param {Segment} segment - data object
   * @returns {void} - emit event instead
   */
  const removeSegmentFromStore = segment => {
    if (segment.trainingUuid !== uuid) return;
    segments = removeSegment(segment, segments);
    total = makeSegmentsTotal(segments);
    eventbus.emit(ee.SEGMENT_REMOVE_EVT, {
      uuid: segment.trainingUuid,
      segments,
      total,
    });
  };

  /**
   * Update segment in local collection of segments
   * @param {Segment} segment - data object
   * @returns {void} - emit event instead
   */
  const updateSegmentInStore = segment => {
    if (hasProperty(segment, "trainingUuid") && segment.trainingUuid === uuid) {
      console.log("trainingStore: update segment in store", JSON.stringify(segment));
      const _segment = augmentSegmentData(segment);
      segments = updateSegment(_segment, segments);
      total = makeSegmentsTotal(segments);
      eventbus.emit(ee.SEGMENT_UPDATE_EVT, {
        uuid: segment.trainingUuid,
        segment: _segment,
        segments,
        total,
      });
      console.log("trainingStore: update segment in store, AFTER:", JSON.stringify(segments));
    } else {
       console.log(`TrainingStore.updateSegmentInStore IGNORING ${segment.trainingUuid} versus ${uuid}`);
    }
  };

  /**
   * Empty class scoped variables containing data for the currently loaded training
   * @returns {void} - purely work on module scoped data
   */
  const clearTraining = () => {
    uuid = null;
    name = null;
    type = null;
    segments = [];
    total = {
      distance: 0,
      duration: "00:00:00",
      pace: "00:00",
    };
  };

  /**
   * Lookup by uuid from param trainings and load in store
   * @param  {string} _uuid - to lookup with
   * @returns {void} - emit event instead
   */
  const loadTraining = (_uuid) => {
    if (trainings.length === 0) {
      throw new Error("TrainingStore.loadTraining needs a list of trainings");
    }
    const training = findTraining(_uuid, trainings);
    if (training !== null) {
      uuid = training.uuid;
      name = training.name;
      type = training.type;

      // TODO use trainingUtil.augmentTraining
      const _segments = training.segments.map(segment => augmentSegmentData(segment));
      segments = _segments;
      total = makeSegmentsTotal(_segments);

      eventbus.emit(ee.TRAINING_LOAD_EVT, getCurrentlyLoadedTraining());
    } else {
      eventbus.emit(ee.TRAINING_LOAD_ERROR_EVT, "Training could not be found");
    }
  };

  /**
   * TODO move to segmentUtils
   * Lookup/Get a segment by uuid from a loaded training (which has one or more segments)
   * @param {string} segmentUuid - uuid
   * @param {string} trainingUuid - uuid
   * @param {string} loadedTrainingUuid - uuid
   * @param {Array<Segment>} _segments - all available segments for a training
   * @returns {void} - emits event instead
   */
  const emitSegment = (segmentUuid, trainingUuid, loadedTrainingUuid, _segments) => {
    if (trainingUuid === loadedTrainingUuid) {
      const segment = findSegment(segmentUuid, _segments);
      if (segment !== undefined && segment !== null) {
        segment.trainingUuid = trainingUuid;
        eventbus.emit(ee.SEGMENT_GET_EVT, segment);
      }
    }
  };

  /**
   *
   * @return {Training} training - compose the class scoped data into one training
   */
  const getCurrentlyLoadedTraining = () => {
    return {
      uuid,
      name,
      type,
      segments,
      total,
    };
  };

  return this;
};

export default trainingStore;

