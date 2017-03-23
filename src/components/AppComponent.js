import React from "react";
import EventEmitter from "eventemitter4";
import MenuComponent from "./MenuComponent";
import PanelComponent from "./PanelComponent";
import TrainingPanelComponent from "./TrainingPanelComponent";
import TrainingListComponent from "./TrainingListComponent";
import TimelineComponent from "./TimelineComponent";
import DayEditComponent from "./DayEditComponent";
import NotificationComponent from "./NotificationComponent";
import PlanListComponent from "./PlanListComponent";

import TrainingStore from "../stores/TrainingStore";
import DayStore from "../stores/DayStore";
import TimelineStore from "../stores/TimelineStore";
import { clone, hasProperty } from "../stores/miscUtil";
import packageJSON from "../../package.json";
import RemoteDataService from "../stores/RemoteDataService";

import {EventsEnum as ee} from "../constants";

const trainings = [];

export default class AppComponent extends React.Component {

  constructor(props) {
    super(props);
    if (hasProperty(this.props, "eventbus")) {
      this.eventbus = this.props.eventbus;
    } else {
      this.eventbus = new EventEmitter();
    }

    // initially will receive data as empty TODO remove props so all data comes from eventbus
    new DayStore(this.eventbus);
    new TrainingStore(this.eventbus, clone(trainings));
    new TimelineStore(this.eventbus);

    new RemoteDataService(this.eventbus);
  }

  componentDidMount() {
    this.eventbus.emit(ee.SET_NOTIFICATION_TIMEOUT_CMD, 20000);
    this.eventbus.emit(ee.MENU_CLICK_EVT, "menu-item-training");
    this.eventbus.emit(ee.PLANLIST_FETCH_CMD);
    this.eventbus.emit(ee.TRAININGS_FETCH_CMD);
    if (this.props.startWithDefaultTraining) {
      setTimeout(() => this.eventbus.emit(ee.TRAINING_LOAD_CMD, "new-training"),
        500);
    }
  }

  render() {
    const version = packageJSON.version;

    return (
      <div>
        <header id="app-header">
          <h1>WRKT-0410 {version}</h1>
          <MenuComponent eventbus={this.eventbus} />
        </header>
        <article id="container">
          <aside id="container-aside">
            <TrainingListComponent eventbus={this.eventbus} name="Traininglist" from="menu-item-training" />
          </aside>
          <main>
            <NotificationComponent eventbus={this.eventbus} />
            <TrainingPanelComponent eventbus={this.eventbus} name="Training" from="menu-item-training" />
            <TimelineComponent eventbus={this.eventbus} name="Timeline" from="menu-item-timeline" />
            <PanelComponent eventbus={this.eventbus} name="Settings" from="menu-item-settings" />
            <DayEditComponent eventbus={this.eventbus} name="DayEdit" from="menu-item-dayedit" />
            <PlanListComponent eventbus={this.eventbus} name="PlanList" from="menu-item-planlist" />
          </main>
        </article>
      </div>
    )
  }
};

AppComponent.propTypes = {
  eventbus: React.PropTypes.object,
  startWithDefaultTraining: React.PropTypes.bool
};

