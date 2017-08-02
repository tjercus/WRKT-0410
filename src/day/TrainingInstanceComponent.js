import React from "react";
import EventEmitter from "eventemitter4";
import SegmentContainer from "../training/SegmentContainer";
import { EventsEnum as ee, TRAINING_SHAPE, DEFAULT_TOTAL, DEFAULT_TRAINING } from "../shell/constants";
import { createUuid } from "../shell/objectUtil";

/**
 * Is used in DayEditComponent to display segments and totals for an instance
 * NOTE: local events are emitted and do not setState directly.
 * The DayStore processes the state when the TrainingInstance (loaded in the GUI) changes.
*/
export default class TrainingInstanceComponent extends React.Component {

  static propTypes = {
    eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      training: DEFAULT_TRAINING,
      isNameEditable: false,
    };
  }

  componentDidMount() {
    this.props.eventbus.on(ee.INSTANCE_LOAD_CMD, training => {
      console.log(`TrainingInstanceComponent received INSTANCE_LOAD_CMD with ${training.uuid}`);
      console.log(`TrainingInstanceComponent received: ${JSON.stringify(training)}`);
      this.setState({training: training});
    });

    // this.props.eventbus.on(ee.DAY_LOAD_EVT, day => {
    //   this.setDayInLocalState(day);
    // });
    //
    // // TODO perhaps not catch this event
    // this.props.eventbus.on(ee.DAY_UPDATE_EVT, day => {
    //   console.log(`TIC on DAY_UPDATE_EVT with day ${JSON.stringify(day)}`);
    //   this.setDayInLocalState(day);
    // });

    // this.props.eventbus.on(ee.INSTANCE_CREATE_CMD, dayUuid => {
    //   if (this.state.day.uuid === dayUuid) {
    //     // create a new training and add it to the day
    //     // const training = DEFAULT_TRAINING;
    //     // training.uuid = createUuid();
    //     // const day = this.state.day;
    //     // day.trainings.push(training);
    //     // this.setDayInLocalState(day);
    //     this.setState(DEFAULT_TRAINING);
    //   }
    // });
  }

  /**
   * React built-in function called after 'render' phase. Notify the world.
   */
  componentDidUpdate() {
    console.log(`TrainingInstanceComponent componentDidUpdate ${this.state.training.uuid}`);
    this.props.eventbus.emit(ee.TRAINING_RENDER_EVT, this.state.training.uuid);
  }

  onPropagateChangesClick = () => {
    // TODO propagate instance id instead of complete training, but only for updates
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.state.training);
    // TODO how to differentiate between update and insert?
    //this.props.eventbus.emit(ee.INSTANCE_ADD_CMD, this.state.training);
  };

  // TODO use from segmentUtils
  addEmptySegment = () => {
    this.props.eventbus.emit(ee.SEGMENT_ADD_CMD, {
      uuid: createUuid(),
      trainingUuid: this.state.training.uuid,
      distance: 0,
      duration: "00:00:00",
      pace: "00:00",
    });
  };

  exportTraining = () => {
    console.log(JSON.stringify(this.state.training));
  };

  onClearTrainingClick = () => {
    this.setState(DEFAULT_TRAINING);
  };

  onEditNameButtonClick = (evt) => {
    this.setState({
      isNameEditable: !this.state.isNameEditable,
    });
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.state.training);
  };

  onNameChange = (evt) => {
    const _training = this.state.training;
    _training.name = evt.target.value;
    this.setState({ training: _training });
    // TODO is this smart?
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.state.training);
  };

  onNameBlur = (evt) => {
    const _training = this.state.training;
    _training.name = evt.target.value;
    this.setState({ name: evt.target.value });
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.state.training);
  };

  // TODO test: 'should emit event when button clicked'
  onTrainingTypeClick = (evt) => {
    const _training = this.state.training;
    _training.type = evt.target.value;
    this.setState({ training: _training });
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.state.training);
  };

  removeTraining = () => {
    this.props.eventbus.emit(ee.INSTANCE_REMOVE_CMD, this.state.training.uuid);
  };

  /**
   *
   * @param {Day} day - contains date and 1 or 2 trainings
   * @returns {void}
   */
  /*
  setDayInLocalState = (day) => {
    day.trainings.map(training => {
      if (training.uuid === this.state.training.uuid) {
        this.setState({training: training});
      }
    });
  };
  */

  render() {
    let panelClassName = "panel";
    console.log(`TrainingInstanceComponent rendered with ${this.state.training.uuid}`);

    let nameComponent = "";
    if (this.state.isNameEditable) {
      nameComponent = (
        <input
          type="text"
          id="edit-name-textfield"
          name="edit-name-textfield"
          value={this.state.training.name}
          onChange={this.onNameChange}
          onBlur={this.onNameBlur}
        />
      );
    } else {
      nameComponent = <span id="name-label">{this.state.training.name}</span>;
    }

    let segments = [];
    if (this.state.training.segments !== null) {
      segments = this.state.training.segments;
    }
    let segmentComponents = segments.map(segment => {
      console.log(`TrainingInstanceComponent rendering segment: ${JSON.stringify(segment)}`);
      return (
        <SegmentContainer
          key={segment.uuid}
          eventbus={this.props.eventbus}
          uuid={segment.uuid}
          trainingUuid={this.state.training.uuid}
        />
      );
    });

    let totalDistance = 0;
    if (this.state.training.total && this.state.training.total.distance) {
      totalDistance = this.state.training.total.distance.toFixed(3);
    }

    // TODO refactor to ButtonChoiceComponent
    const type1ButtonClassName = this.state.training.type === "workout"
      ? "button-choice button-choice-selected"
      : "button-choice";
    const type2ButtonClassName = this.state.training.type === "easy"
      ? "button-choice button-choice-selected"
      : "button-choice";

    if (this.state.training.uuid === null) {
      return <div>{"Click on a training to see or edit ..."}</div>;
    } else {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {nameComponent}
            <button
              id="edit-name-button"
              onClick={this.onEditNameButtonClick}
              className="button-small button-flat"
            >
              {"edit"}
            </button>
          </header>
          <div className="panel-body">
            <fieldset name="type">
              Type of training

              <button
                onClick={this.onTrainingTypeClick}
                value="workout"
                className={type1ButtonClassName}
              >
                {"workout"}
              </button>
              <button
                onClick={this.onTrainingTypeClick}
                value="easy"
                className={type2ButtonClassName}
              >
                {"easy run"}
              </button>
            </fieldset>
            <table summary="training segments">
              <thead>
                <tr>
                  <th>Distance</th>
                  <th>Duration</th>
                  <th>Pace</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {segmentComponents}
              </tbody>
            </table>
            <output name="totals">
              <p>
                {"Total distance:"} <em>{totalDistance}</em> {"km, "}
                {"duration:"} <em>{this.state.training.total.duration}</em> {", "}
                {"average pace:"} <em>
                  <time>{this.state.training.total.pace}</time>
                </em>
              </p>
              <p>UUID: {this.state.training.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">
                add empty segment
              </button>
            </menu>
            <menu>
              <button onClick={this.exportTraining} className="button-flat">
                export training
              </button>
              <button onClick={this.onPropagateChangesClick} className="button-flat button-primary">
                propagate changes
              </button>
            </menu>
            <menu>
              <button onClick={this.onClearTrainingClick} className="button-flat button-warning">
                clear training
              </button>
              <button onClick={this.removeTraining} className="button-flat">
                remove training
              </button>
            </menu>
          </div>
        </section>
      );
    }
  }
}

