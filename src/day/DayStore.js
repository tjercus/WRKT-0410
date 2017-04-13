import { updateTrainingInstanceInDay, NotFoundException} from "../training/trainingUtil";
import {EventsEnum as ee, DEFAULT_TRAINING} from "../shell/constants";
import {
  addSegment,
  removeSegment,
  augmentSegmentData,
  updateSegment,
  makeTrainingTotal,
} from "../training/segmentUtil";
import {clone, hasProperty, createUuid} from "../shell/objectUtil";

/**
 * Holds data for editing a day
*/
export default class DayStore {

  /**
   * Holds data for editing a day and it's one or more trainings
   * @constructor
   * @param {EventEmitter} eventbus
   */
  constructor(eventbus) {
    this.eventbus = eventbus;
    this.day = {};

    eventbus.on(ee.DAY_LOAD_CMD, (day, date) => {
      console.log(`DayStore caught DAY_LOAD_CMD and loads day [${day.uuid}] locally`);
      this.day = day;
      eventbus.emit(ee.DAY_LOAD_EVT, day, date);
    });

    eventbus.on(ee.INSTANCE_CREATE_CMD, dayUuid => {
      console.log(`DayStore caught INSTANCE_CREATE_CMD`);
      if (this.day.uuid === dayUuid) {
        console.log(`DayStore pushing a new training to local day ${this.day.uuid}`);
        const training = DEFAULT_TRAINING;
        training.uuid = createUuid();
        this.day.trainings.push(training);

        eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
        eventbus.emit(ee.INSTANCE_LOAD_CMD, training);
      } else {
        console.log(`DayStore COULD NOT UPDATE local day since uuids are not equal ${this.day.uuid}/${dayUuid}`);
      }
    });

    /**
     * emitted by TrainingInstanceComponent when user clicks 'save' button
     */
    eventbus.on(ee.INSTANCE_UPDATE_CMD, instance => {
      console.log(`DayStore caught INSTANCE_UPDATE_CMD, trying to update local day ${this.day.uuid}`);
      try {
        this.day = updateTrainingInstanceInDay(this.day, instance);
      } catch (exc) {
        // TODO or:
        if (exc instanceof NotFoundException) {
          this.day = this.day.trainings.push(instance);
        }
      }
      this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
    });

    // eventbus.on(ee.INSTANCE_ADD_CMD, instance => {
    //   console.log(`DayStore caught INSTANCE_ADD_CMD, trying to update day ${this.day.uuid}`);
    //   this.day = this.day.trainings.push(instance);
    //   this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
    // });

    eventbus.on(ee.SEGMENT_GET_CMD, (segmentUuid, trainingUuid) => {
      this.getSegment(segmentUuid, this.day.trainings);
    });

    // TODO decide if this logic should be here ...
    eventbus.on(ee.SEGMENT_UPDATE_CMD, segment => {
      console.log(`DayStore caught SEGMENT_UPDATE_CMD`);
      this.updateSegmentInStore(segment);
    });
    eventbus.on(ee.SEGMENT_ADD_CMD, segment => {
      console.log(`DayStore caught SEGMENT_ADD_CMD`);
      this.addSegmentToStore(segment, false);
    });
    eventbus.on(ee.SEGMENT_REMOVE_CMD, (segment) => {
      this.removeSegmentFromStore(segment);
    });
    eventbus.on(ee.SEGMENT_CLONE_CMD, (segment) => {
      this.addSegmentToStore(segment, true);
    });
  }

  // TODO replace this with better code
  getSegment(segmentUuid, trainings) {
    if (!Array.isArray(trainings) || trainings.length === 0 ||
      !hasProperty(trainings[0], "segments")) {
      console.log("DayStore.getSegment has a problem with trainings");
      return;
    }
    let _segments = trainings[0].segments;

    if (trainings[1]) {
      _segments = _segments.concat(trainings[1].segments);
    }
    console.log(`DayStore.getSegment segments: ${JSON.stringify(_segments)}`);
    const isSeg = _segment => String(_segment.uuid) === String(segmentUuid);
    const index = _segments.findIndex(isSeg);
    // TODO add trainingUuid to found segment
    if (index !== -1 && index > -1) {
      this.eventbus.emit(ee.SEGMENT_GET_EVT, _segments[index]);
    }
  }

  /**
   * Update given segment in list of segments
   * @param {Segment} segment - updatable
   * @returns {void} - emit event instead
   */
  updateSegmentInStore(segment) {
    if (hasProperty(this.day, "uuid")) {
      const _segment = augmentSegmentData(segment);
      console.log(`DayStore.updateSegmentInStore after augmenting: ${JSON.stringify(_segment)}`);
      let updatedLocalTrainings = [];
      this.day.trainings.map(training => {
        if (training.uuid === segment.trainingUuid) {
          console.log(`DayStore.updateSegmentInStore training before updating segment: ${JSON.stringify(training)}`);
          training.segments = updateSegment(_segment, clone(training.segments));
          training.total = makeTrainingTotal(clone(training.segments));
          console.log(`DayStore.updateSegmentInStore training after updating segment: ${JSON.stringify(training)}`);          
        } else {
          console.log(`DayStore.updateSegmentInStore no-op: training.uuid [${training.uuid}] !== segment.trainingUuid [${segment.trainingUuid}]`);
        }
        updatedLocalTrainings.push(training);
      });
      // console.log(`DayStore.updateSegmentInStore trainings: ${JSON.stringify(updatedLocalTrainings)}`);
      if (updatedLocalTrainings.length > 0) {
        this.day.trainings = updatedLocalTrainings;
        this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
      }
    }
  }

  /**
   * Add a segment to class scoped segments, optionally overwriting it's uuid
   * @param {Segment} segment - data object
   * @param {boolean} overwriteUuid - new uuid or keep old?
   * @returns {void} - emit event instead
   */
  addSegmentToStore(segment, overwriteUuid) {
    if (hasProperty(this.day, "uuid")) {
      console.log(`DayStore.addSegmentToStore ${JSON.stringify(segment)}`);
      const _segment = augmentSegmentData(segment);
      let updatedLocalTrainings = [];
      this.day.trainings.map(training => {
        // TODO found the bug! it only adds one training 
        if (training.uuid === segment.trainingUuid) {
          training.segments = addSegment(_segment, clone(training.segments), overwriteUuid);
          training.total = makeTrainingTotal(clone(training.segments));
          console.log(`DayStore.addSegmentInStore training after adding segment: ${JSON.stringify(training)}`);          
        } else {
          console.log(`DayStore.addSegmentInStore trainingUuid was NOT equal: ${training.uuid}`);
        }
        updatedLocalTrainings.push(training);
      });
      console.log(`DayStore.addSegmentToStore trainings: ${JSON.stringify(updatedLocalTrainings)}`);
      this.day.trainings = updatedLocalTrainings;
      this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
    }
  }

   /**
    * Remove segment from local collection of segments
    * @param {Segment} segment - data object
    * @returns {void} - emit event instead
    */
   removeSegmentFromStore(segment) {
     if (hasProperty(this.day, "uuid")) {
       const _segment = augmentSegmentData(segment);

       let updatedLocalTrainings = [];
       this.day.trainings.map(training => {
         if (training.uuid === segment.trainingUuid) {
           training.segments = removeSegment(_segment, clone(training.segments));
           training.total = makeTrainingTotal(clone(training.segments));
         }
         updatedLocalTrainings.push(training);
       });
       console.log(`DayStore.removeSegmentFromStore trainings: ${JSON.stringify(updatedLocalTrainings)}`);
       this.day.trainings = updatedLocalTrainings;
       this.eventbus.emit(ee.DAY_UPDATE_EVT, this.day);
     }
   }


}
