import React from "react";
import EventEmitter from "eventemitter4";
import SegmentComponent from "./SegmentComponent";
import {EventsEnum as ee, DEFAULT_TOTAL, DEFAULT_TRAINING} from "../constants";

export default class TrainingComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = DEFAULT_TRAINING;
    // TODO remove this with phat arrow method declarations
    this.exportTraining = this.exportTraining.bind(this);
    this.emitClearTraining = this.emitClearTraining.bind(this);
    this.emitPersistChanges = this.emitPersistChanges.bind(this);
    this.clearTrainingFromLocalState = this.clearTrainingFromLocalState.bind(this);
    this.addEmptySegment = this.addEmptySegment.bind(this);
    this.loadTraining = this.loadTraining.bind(this);
    this.cloneTraining = this.cloneTraining.bind(this);
    this.removeTraining = this.removeTraining.bind(this);
    this.onEditNameButtonClick = this.onEditNameButtonClick.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onNameBlur = this.onNameBlur.bind(this);
    this.onTypeClick = this.onTypeClick.bind(this);
    this.emitAddToBeginOfPlan = this.emitAddToBeginOfPlan.bind(this);
    this.emitAddToMiddleOfPlan = this.emitAddToMiddleOfPlan.bind(this);
    this.emitAddToSelectedWeekOfPlan = this.emitAddToSelectedWeekOfPlan.bind(this);
    this.emitAddToPlan = this.emitAddToPlan.bind(this);
    this.makeTraining = this.makeTraining.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on(ee.TRAINING_LOAD_EVT, (training) => {
      console.log(`TrainingComponent received TRAINING_LOAD_EVT with ${training.uuid}`);
      this.loadTraining(training);
    });
    // this.props.eventbus.on(ee.TRAINING_UPDATE_EVT, (training) => {
    //   this.loadTraining(training);
    // });

    this.props.eventbus.on(ee.SEGMENT_ADD_EVT, (training) => {
      this.setState({ segments: training.segments, total: training.total });
    });

    // TODO temp disabled to see if this is a problem with race condition on refreshing segments too early
    //
    this.props.eventbus.on(ee.SEGMENT_UPDATE_EVT, (data) => {
      console.log("TrainingComponent caught SEGMENT_UPDATE_EVT, only updating total, not segment");
      if (data.uuid === this.state.uuid) {
        this.setState({ total: data.total });
      } else {
        // console.log(`TrainingComponent NOT equal ${data.uuid}/${this.state.uuid}`);
      }
    });

    this.props.eventbus.on(ee.SEGMENT_REMOVE_EVT, (training) => {
      this.setState({ segments: training.segments, total: training.total }, function() {
        console.log("TrainingComponent finished updating state with new segments");
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
    console.log(`TrainingComponent componentDidUpdate ${this.state.uuid} emitting TRAINING_RENDER_EVT`);
    this.props.eventbus.emit(ee.TRAINING_RENDER_EVT, this.state.uuid);
  }

  loadTraining(training) {
    this.setState(this.makeTraining(training), () => {
      console.log(`TrainingComponent loadTraining setSate as: ${JSON.stringify(this.state)}`);
    });
  }

  // TODO unit test this!
  addEmptySegment() {
    this.props.eventbus.emit(ee.SEGMENT_ADD_CMD,
      Object.assign({}, DEFAULT_TOTAL, {trainingUuid: this.state.uuid}));
  }

  emitPersistChanges() {
    this.props.eventbus.emit(ee.TRAININGS_PERSIST_CMD, null);
  }

  exportTraining() {
    console.log(JSON.stringify({
      uuid: this.state.uuid,
      name: this.state.name,
      type: this.state.type,
      segments: this.state.segments
    }));
  }

  emitClearTraining() {
    this.props.eventbus.emit(ee.TRAINING_CLEAR_CMD, this.state.uuid);
  }

  onEditNameButtonClick(evt) {
    //const inverseState =
    this.setState({ isNameEditable: !this.state.isNameEditable });
  }

  onNameChange(evt) {
    this.setState({ name: evt.target.value });
  }

  onNameBlur(evt) {
    console.log(`onNameBlur ${this.state.name}`);
    this.props.eventbus.emit(ee.TRAINING_UPDATE_CMD, this.makeTraining(this.state));
  }

  cloneTraining() {
    // TODO custom alert
    console.log("Training cloned and selected");
    this.props.eventbus.emit(ee.TRAINING_CLONE_CMD);
  }

  removeTraining() {
    this.props.eventbus.emit(ee.TRAINING_REMOVE_CMD);
  }

  emitAddToBeginOfPlan() {
    console.log("TrainingComponent.emitAddToBeginOfPlan TRAINING_TO_PLAN_CMD with zero");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, 0);
  }

  emitAddToMiddleOfPlan() {
    console.log("TrainingComponent.emitAddToMiddleOfPlan TRAINING_TO_PLAN_CMD with middle");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, 0.5);
  }

  emitAddToPlan() {
    console.log("TrainingComponent.emitAddToPlan TRAINING_TO_PLAN_CMD without zero");
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD);
  }

  emitAddToSelectedWeekOfPlan() {
    this.props.eventbus.emit(ee.TRAINING_TO_PLAN_CMD, -1);
  }

  clearTrainingFromLocalState() {
    this.setState(DEFAULT_TRAINING);
  }

  onTypeClick(evt) {
    this.setState({ type: evt.target.value }, () => {
      this.props.eventbus.emit(ee.TRAINING_UPDATE_CMD, this.makeTraining(this.state));
      // TODO test: 'should emit event when button clicked'
    });
  }

  /**
   * Create training object by selectively copying properties from another obj
   * @param  {Object} obj - training-like object
   * @returns {Training} training
   */
  makeTraining(obj) {
    return {
      uuid: obj.uuid,
      name: obj.name,
      type: obj.type,
      segments: obj.segments,
      total: obj.total
    }
  }

  render() {
    let panelClassName = "panel";

    let nameComponent = "";
    if (this.state.isNameEditable) {
      nameComponent = <input type="text"
                             id="edit-name-textfield"
                             name="edit-name-textfield"
                             value={this.state.name}
                             onChange={this.onNameChange}
                             onBlur={this.onNameBlur} />
    } else {
      nameComponent = <span id="name-label">{this.state.name}</span>;
    }

    let segments = this.state.segments || [];
    let segmentComponents = [];
    segments.forEach((segment, i) => {
      segmentComponents.push(<SegmentComponent key={i}
                                               eventbus={this.props.eventbus}
                                               uuid={segment.uuid}
                                               trainingUuid={this.state.uuid} />);
    });

    let totalDistance = 0;
    if (this.state.total && this.state.total.distance) {
      totalDistance = (this.state.total.distance).toFixed(3);
    }

    // TODO refactor to ButtonChoiceComponent
    const type1ButtonClassName = (this.state.type === "workout")
      ? "button-choice button-choice-selected" : "button-choice";
    const type2ButtonClassName = (this.state.type === "easy")
      ? "button-choice button-choice-selected" : "button-choice";

    if (this.state.uuid) {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {nameComponent}
            <button id="edit-name-button" onClick={this.onEditNameButtonClick}
                    className="button-small button-flat">{"edit"}</button>
          </header>
          <div className="panel-body">
            <fieldset name="type">
              Type of training &nbsp;
              <button onClick={this.onTypeClick} value="workout"
                      className={type1ButtonClassName}>{"workout"}</button>
              <button onClick={this.onTypeClick} value="easy"
                      className={type2ButtonClassName}>{"easy run"}</button>
            </fieldset>
            <table summary="training segments">
              <thead>
                <tr><th>Distance</th><th>Duration</th><th>Pace</th><th>Actions</th><th>Info</th></tr>
              </thead>
              <tbody>
                {segmentComponents}
              </tbody>
            </table>
            <output name="totals">
              <p>
                {"Total distance:"} <em>{totalDistance}</em> {"km, "}
                {"duration:"} <em>{this.state.total.duration}</em> {", "}
                {"average pace:"} <em><time>{this.state.total.pace}</time></em>
              </p>
              <p>UUID: {this.state.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">add empty segment</button>
            </menu>
            <menu>
              <button onClick={this.emitAddToBeginOfPlan} value="add-to-plan" className="button-flat">add to begin of plan</button>
              <button onClick={this.emitAddToMiddleOfPlan} value="add-to-plan" className="button-flat">add to middle of plan</button>
              <button onClick={this.emitAddToPlan} value="add-to-plan" className="button-flat">add to end of plan</button>
              <button onClick={this.emitAddToSelectedWeekOfPlan} value="add-to-plan" className="button-flat">add to selected week</button>
            </menu>
            <menu>
              <button onClick={this.exportTraining} className="button-flat">export training</button>
              <button onClick={this.emitClearTraining} className="button-flat button-warning">clear training</button>
              <button onClick={this.cloneTraining} className="button-flat">clone training</button>
              <button onClick={this.removeTraining} className="button-flat">remove training</button>
            </menu>
            <menu>
              <button onClick={this.emitPersistChanges} className="button-flat" id="persist-button">persist changes</button>
            </menu>
          </div>
        </section>
      );
    } else {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {this.state.name} {this.state.uuid}
          </header>
          <div className="panel-body">
            {"Please choose a training from the left-hand list"}
          </div>
        </section>
      );
    }
  }
};

TrainingComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
};
