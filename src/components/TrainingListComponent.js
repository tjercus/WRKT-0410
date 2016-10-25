import React from "react";
import EventEmitter from "eventemitter2";
import {EventsEnum as ee} from "../constants";

export default class TrainingListComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      selectedUid: null,
      trainings: []
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on(ee.TRAININGS_FETCH_EVT, (trainings) => {
      this.setState({ trainings: trainings });
    });

    this.props.eventbus.on(ee.TRAININGS_UPDATE_EVT, (trainings) => {
      if (trainings === undefined || trainings === null) {
        throw new Error("TRAININGS_UPDATE_EVT was caught without a list of trainings");
      }
      this.setState({ trainings: trainings });
    });

    this.props.eventbus.on(ee.TRAINING_LOAD_EVT, (training) => {
      this.setState({ selectedUid: training.uuid });
    });

    this.props.eventbus.on(ee.TRAINING_UPDATE_EVT, (obj) => {
      this.setState({ trainings: obj.trainings });
    });

    this.props.eventbus.on(ee.TRAINING_REMOVE_EVT, (trainings) => {
      this.setState({ trainings: trainings });
    });
  }

  onClick(evt) {
    evt.preventDefault();
    const uuid = evt.target.attributes[1].nodeValue;
    // TODO find out why evt.target.value does not work anymore?
    this.setState({ selectedUid: uuid });
    console.log(`Selecting item [${uuid}] in list`);
    this.props.eventbus.emit(ee.TRAINING_LOAD_CMD, uuid);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    return (
      <section className={panelClassName}>
        <div className="panel-body">
           <ul className="selection-list">
            {this.state.trainings.map(function(training, i) {
              let itemClassName = (this.state.selectedUid === training.uuid) ? "menu-item-selected" : "";
              return <li key={i} className={itemClassName}>
                <a href="#" onClick={this.onClick} value={training.uuid}>{training.name}</a>
              </li>;
            }.bind(this))}
           </ul>
        </div>
      </section>
    );
  }
};
TrainingListComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  name: React.PropTypes.string.isRequired,
  from: React.PropTypes.string.isRequired,
};
