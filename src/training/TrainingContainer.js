import React from "react";
import EventEmitter from "eventemitter4";
import SegmentContainer from "./SegmentContainer";
import {EventsEnum as ee, DEFAULT_TOTAL, DEFAULT_TRAINING} from "../shell/constants";
import TrainingView from "./TrainingView";

export default class TrainingContainer extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
    handlesTrainingInstance: React.PropTypes.boolean,
  };

  constructor(props) {
    super(props);
    this.state = DEFAULT_TRAINING;
  }

  componentDidMount() {
    // supports loading one Training and one TrainingInstance at the same time in memory
    if (this.props.handlesTrainingInstance && this.props.handlesTrainingInstance === true) {
      this.props.eventbus.on(ee.INSTANCE_LOAD_CMD, instance => {
        console.log(`TrainingContainer received INSTANCE_LOAD_CMD with ${instance.uuid}`);
        console.log(`TrainingContainer received: ${JSON.stringify(instance)}`);
        this.loadTraining(instance);
      });
      this.props.eventbus.on(ee.INSTANCE_REMOVE_EVT, instance => {
        console.log(`TrainingContainer received INSTANCE_REMOVE_EVT with ${instance.uuid}`);
        if (instance.uuid === this.state.uuid) {
          this.loadTraining(instance);
        }
      });
      this.props.eventbus.on(ee.DAY_UPDATE_EVT, day => {
        console.log(`TrainingContainer received DAY_UPDATE_EVT`);
        day.trainings.map(_instance => {
          if (_instance.uuid === this.state.uuid) {
            this.loadTraining(_instance);
          }
        });
      });
    } else {
      // TODO support multiple instances of this by making them unique in some way
      this.props.eventbus.on(ee.TRAINING_LOAD_EVT, training => {
        console.log(`TrainingContainer received TRAINING_LOAD_EVT with ${training.uuid}`);
        this.loadTraining(training);
      });
    }

    this.props.eventbus.on(ee.SEGMENT_ADD_EVT, (training) => {
      console.log("TrainingContainer received a SEGMENT_ADD_EVT");
      this.setState({ segments: training.segments, total: training.total });
    });

    // TODO temp disabled to see if this is a problem with race condition on refreshing segments too early
    //
    this.props.eventbus.on(ee.SEGMENT_UPDATE_EVT, (data) => {
      console.log("TrainingContainer caught SEGMENT_UPDATE_EVT, updating total AND segment");
      if (data.uuid === this.state.uuid) {
        this.setState({ segments: data.segments, total: data.total });
      } else {
        console.log(`TrainingContainer NOT equal ${data.uuid}/${this.state.uuid}`);
      }
    });

    this.props.eventbus.on(ee.SEGMENT_REMOVE_EVT, (training) => {
      this.setState({ segments: training.segments, total: training.total }, function() {
        console.log("TrainingContainer finished updating state with new segments");
      });
    });
    this.props.eventbus.on(ee.TRAINING_CLEAR_EVT, (uuid) => {
      this.clearTrainingFromLocalState();
    });
  }

  /**
   * React built-in function called after 'render' phase. Notify the world.
   */
  componentDidUpdate() {
  }

  loadTraining = (training) => {
    this.setState(this.makeTraining(training), () => {
      console.log(`TrainingComponent loadTraining setSate as: ${JSON.stringify(this.state)}`);
    });
  };

  // TODO unit test this!
  addEmptySegment = () => {
    this.props.eventbus.emit(ee.SEGMENT_ADD_CMD,
      Object.assign({}, DEFAULT_TOTAL, {trainingUuid: this.state.uuid}));
  };

  emitPersistChanges = () => {
    this.props.eventbus.emit(ee.TRAININGS_PERSIST_CMD, null);
  };

  exportTraining = () => {
    console.log(JSON.stringify({
      uuid: this.state.uuid,
      name: this.state.name,
      type: this.state.type,
      segments: this.state.segments,
    }));
  };

  emitClearTraining = () => {
    this.props.eventbus.emit(ee.TRAINING_CLEAR_CMD, this.state.uuid);
  };

  onNameChange = (evt) => {
    this.setState({ name: evt.target.value });
  };

  onNameBlur = (evt) => {
    console.log(`onNameBlur ${this.state.name}`);
    this.props.eventbus.emit(ee.TRAINING_UPDATE_CMD, this.makeTraining(this.state));
  };

  cloneTraining = () => {
    // TODO custom alert
    console.log("TrainingContainer sending a clone request, uuid:", this.state.uuid);
    this.props.eventbus.emit(ee.TRAINING_CLONE_CMD, this.state.uuid);
  };

  /* TODO check if this works in both dayStore and trainingStore */
  removeTraining = () => {
    this.props.eventbus.emit(ee.TRAINING_REMOVE_CMD, this.state.uuid);
  };

  emitAddToBeginOfPlan = () => {
    console.log("TrainingContainer.emitAddToBeginOfPlan TRAINING_TO_PLAN_CMD with zero");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, 0);
  };

  emitAddToMiddleOfPlan = () => {
    console.log("TrainingContainer.emitAddToMiddleOfPlan TRAINING_TO_PLAN_CMD with middle");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, 0.5);
  };

  /* TODO check if this works in both dayStore and trainingStore */
  emitAddToPlan = () => {
    console.log("TrainingContainer.emitAddToPlan TRAINING_TO_PLAN_CMD without zero");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD);
  };

  /* TODO check if this works in both dayStore and trainingStore */
  emitAddToSelectedWeekOfPlan = () => {
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, -1);
  };

  clearTrainingFromLocalState = () => {
    this.setState(DEFAULT_TRAINING);
  };

  onTypeClick = (evt) => {
    this.setState({ type: evt.target.value }, () => {
      this.props.eventbus.emit(ee.TRAINING_UPDATE_CMD, this.makeTraining(this.state));
      // TODO test: 'should emit event when button clicked'
    });
  };

  /**
   * Create training object by selectively copying properties from another obj
   * @param  {Object} obj - training-like object
   * @returns {Object<Training|TrainingInstance>} training
   */
  makeTraining = (obj) => {
    return {
      uuid: obj.uuid,
      name: obj.name,
      type: obj.type,
      segments: obj.segments,
      total: obj.total,
    }
  };

  render() {
    console.log("TrainingContainer.render:", JSON.stringify(this.makeTraining(this.state)));
    return <TrainingView training={this.makeTraining(this.state)}
                         handlesTrainingInstance={this.props.handlesTrainingInstance}
                         onNameChange={this.onNameChange}
                         onNameBlur={this.onNameBlur}
                         onEditNameButtonClick={this.onEditNameButtonClick}
                         onTypeClick={this.onTypeClick}
                         addEmptySegment={this.addEmptySegment}
                         emitAddToBeginOfPlan={this.emitAddToBeginOfPlan}
                         emitAddToMiddleOfPlan={this.emitAddToMiddleOfPlan}
                         emitAddToPlan={this.emitAddToPlan}
                         emitAddToSelectedWeekOfPlan={this.emitAddToSelectedWeekOfPlan}
                         exportTraining={this.exportTraining}
                         emitClearTraining={this.emitClearTraining}
                         cloneTraining={this.cloneTraining}
                         removeTraining={this.removeTraining}
                         emitPersistChanges={this.emitPersistChanges}
                         eventbus={this.props.eventbus} />
  }
};

