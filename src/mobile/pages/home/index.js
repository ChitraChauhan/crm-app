import React, { Component } from "react";
import {
  Icon,
  Page,
  Toolbar,
  ToolbarButton,
  BottomToolbar,
  Row,
  Col
} from "react-onsenui";
import Logo from "./logo.png";
import EventList from "../crm_test/crm-events/EventList";
import OpportunityList from "../crm_test/crm-opportunity/OpportunityList";
import './style.css'
import CustomerList from "../crm_test/customers/list";

class Home extends Component {
  openEventList() {
    this.props.navigator.pushPage(
      {
        component: EventList,
        path: `EventList_${0}`,
        navigator: this.props.navigator
      },
      { animation: "none" }
    );
  }

  openOpportunityList() {
    this.props.navigator.pushPage(
      {
        component: OpportunityList,
        path: `OpportunityList_${0}`,
        navigator: this.props.navigator
      },
      { animation: "none" }
    );
  }

  openCustomerList(){
    this.props.navigator.pushPage(
      {
        component: CustomerList,
        path: `CustomerList_${0}`,
        navigator: this.props.navigator
      },
      { animation: "none" }
    );
  }
  
  renderToolbar() {
    return (
      <Toolbar className="ax-toolbar" noshadow>
        <div className="left">
          <ToolbarButton>
            <Icon icon="fa-th-large" />
          </ToolbarButton>
        </div>
        <div className="center">Axelor</div>
      </Toolbar>
    );
  }

  renderBottomToolbar() {
    return (
      <BottomToolbar style={{ height: "80px" }}>
        <Row style={{ paddingLeft: "30px", marginTop: "15px" }}>
          <Col className="left">
            <ToolbarButton>
              <Icon icon="fa-users" onClick={() => this.openCustomerList()} />
            </ToolbarButton>
            <div>customer</div>
          </Col>
          <Col className="center">
            <ToolbarButton>
              <Icon icon="fa-bell-o" onClick={() => this.openEventList()} />
            </ToolbarButton>
            <div>Event</div>
          </Col>
          <Col className="right">
            <ToolbarButton>
              <Icon
                icon="fa-handshake-o"
                onClick={() => this.openOpportunityList()}
              />
            </ToolbarButton>
            <div>Opportunity</div>
          </Col>
        </Row>
      </BottomToolbar>
    );
  }

  render() {
    return (
      <Page
        renderToolbar={() => this.renderToolbar()}
        renderBottomToolbar={() => this.renderBottomToolbar()}
      >
        <div className="home-content">
          <h1 style={{ textAlign: "center", marginTop: 50, marginBottom: -10 }}>
            Welcome
          </h1>
          <div className="home-img">
            <img style={{ marginTop: "10%" }} src={Logo} alt="Axelor Logo" />
          </div>
        </div>
      </Page>
    );
  }
}

export default Home;
