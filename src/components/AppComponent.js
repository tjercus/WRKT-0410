import React from "react";
import packageJSON from "../../package.json";
import EventEmitter from "eventemitter2";
import MenuComponent from "./MenuComponent";
import PanelComponent from "./PanelComponent";
import TrainingComponent from "./TrainingComponent";
import TrainingListComponent from "./TrainingListComponent";
import TrainingStore from "../stores/TrainingStore";
import TimelineComponent from "./TimelineComponent";
import TimelineStore from "../stores/TimelineStore";
import DayStore from "../stores/DayStore";
import DayEditComponent from "./DayEditComponent";
import NotificationComponent from "./NotificationComponent";
import PlanListComponent from "./PlanListComponent";

import { clone } from "../stores/miscUtil";

import RemoteDataService from "../stores/RemoteDataService";

const plans = [];
const trainings = [];
const traininginstances = [];

export default class AppComponent extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.hasOwnProperty("eventbus")) {
      this.eventbus = this.props.eventbus;
    } else {
      this.eventbus = new EventEmitter({wildcard: true, maxListeners: 999999});
    }   

    // initially will receive data as empty
    new DayStore(this.eventbus, clone(plans), clone(traininginstances));
    new TrainingStore(this.eventbus, clone(trainings));
    new TimelineStore(this.eventbus, clone(plans), clone(traininginstances));

    new RemoteDataService(this.eventbus);    
  }
  
  componentDidMount() {
    this.eventbus.emit("SET_NOTIFICATION_TIMEOUT", 20000);
    this.eventbus.emit("MENU_CLICK_EVT", "menu-item-training");
    this.eventbus.emit("PLANLIST_FETCH_CMD");
    this.eventbus.emit("TRAININGS_FETCH_CMD");
    setTimeout(() => this.eventbus.emit("TRAINING_LOAD_CMD", "new-training"), 1500);
    // TODO remove this, it is used in test
    //this.eventbus.emit("PLAN_FETCH_CMD", "a83a78aa-5d69-11e6-b3a3-1f76e6105d92");    
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
            <TrainingComponent eventbus={this.eventbus} name="Training" from="menu-item-training" />
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
