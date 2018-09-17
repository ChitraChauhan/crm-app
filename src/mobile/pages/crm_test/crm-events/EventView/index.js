import React, { Component } from "react";
import {
  Page,
  ToolbarButton,
  Toolbar,
  Icon,
  Select,
  Input,
  Card,
  Row,
  Col,
  AlertDialog
} from "react-onsenui";
import ons from "onsenui";
import moment from "moment";
import Service from "../../../../../service";
import RestAPI from "../../../../../rest-api";
import "./index.css";
import classNames from "classnames";
import CardView from "../../../../components/CardView";
import EventFormView from "./../EventView";
import OpportunityView from "./../../crm-opportunity/OpportunityView";
import TabberView from "../../../../components/TabberView";
import SwiperView from "../../../../components/Swiper";
import debounce from "lodash.debounce";

const debounceCallback = debounce(func => {
  func();
}, 100);

const statusSelect = {
  1: "Planned",
  2: "Realized",
  3: "Canceled"
};

const callType = {
  1: "Incoming",
  2: "Outgoing"
};

const typeSelect = {
  1: "Call",
  2: "Meeting",
  3: "Task",
  0: "Event"
};

const RenderCustomer = ({ eventForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="user"
      title={fieldLabel}
      placeholder="select_customer"
      targetName="fullName"
      value={eventForm.partner}
      searchAPI={searchAPI}
      renderItem={(obj, i) => (
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{ padding: 0 }}
            className="field-input list-item list--inset__item list-item--chevron list-item--tappable"
          >
            <div key={i} className="many-to-one">
              {obj ? obj.fullName : "select_customer"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderLead = ({ eventForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="user"
      title={fieldLabel}
      placeholder="select_lead"
      targetName="fullName"
      value={eventForm.lead}
      searchAPI={searchAPI}
      renderItem={(obj, i) => (
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{ padding: 0 }}
            className="field-input list-item list--inset__item list-item--chevron list-item--tappable"
          >
            <div key={i} className="many-to-one">
              {obj ? obj.fullName : "select_lead"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderContactPartner = ({ eventForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="user"
      title={fieldLabel}
      placeholder="select_contact"
      targetName="fullName"
      value={eventForm.contactPartner}
      searchAPI={searchAPI}
      renderItem={(obj, i) => (
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{ padding: 0 }}
            className="field-input list-item list--inset__item list-item--chevron list-item--tappable"
          >
            <div key={i} className="many-to-one">
              {obj ? obj.fullName : "select_contact"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

class EventView extends Component {
  constructor(props) {
    super(props);
    const startDate = moment().format("YYYY-MM-DDTHH:mm");
    this.state = {
      event: this.props.route.data,
      eventForm: {
        typeSelect: 0,
        meeting_type: null,
        callTypeSelect: null,
        statusSelect: 1,
        subject: null,
        startDateTime: startDate,
        endDateTime: null,
        duration: 0,
        user: "",
        description: null,
        partner: null,
        contactPartner: null,
        lead: null
      },
      commentMessage: "",
      user: [],
      edit: false,
      isNew: false,
      recordList: [],
      all: [],
      submitError: {
        content: null,
        title: null
      },
      showErrorDialog: false,
      total: 0,
      limit: 4,
      offset: 0,
      overviewPanel: 2,
      secondTabber: 1,
      activeIndex: 0
    };
    this.service = new Service();
    this.restAPI = new RestAPI();
  }

  componentDidMount() {
    this.getUser();
    const { route } = this.props;
    const { data, getRecordsByIndex, record } = route;

    if (data && data.id !== undefined) {
      if (getRecordsByIndex) {
        const records = getRecordsByIndex(data, true);
        records.forEach(
          (r, i) => (
            (records[i].duration = (records[i].duration / 3600).toFixed(2)),
            records[i].user && (records[i].user = records[i].user.fullName)
          )
        );
        const targetIndex = records.findIndex(r => r.id === data.id);
        this.swiper.slideTo(targetIndex, 0, true);
        this.setState({ recordList: records, activeIndex: targetIndex });
        this.fetchNewData(data);
      } else {
        this.setState({ recordList: [data], event: data }, () => {});
        this.fetchNewData(data);
      }
    } else {
      let { eventForm } = this.state;
      if (record) {
        eventForm = { ...eventForm, ...record };
      }
      this.setState({ edit: true, isNew: true, eventForm });
    }
  }

  getUser() {
    this.service
      .getData("com.axelor.auth.db.User")
      .then(res => res.json())
      .then(result =>
        this.setState({
          user: result.data
        })
      );
  }

  fetchNewData(data) {
    this.setState({ isLoading: true }, () => {
      this.restAPI
        .fetch("com.axelor.apps.crm.db.Event", data.id)
        .then(res => res.json())
        .then(result => {
          const { data } = result;
          if (data && data.length > 0) {
            const event = Object.assign({}, data[0]);
            const { recordList } = this.state;
            const targetIndex = recordList.findIndex(r => r.id === event.id);
            recordList[targetIndex] = Object.assign({}, event);
            this.setState({ event, recordList, isLoading: false });
          }
        });
    });
  }

  changeField(field, value) {
    const { event, recordList, eventForm, isNew } = this.state;
    if (isNew) {
      eventForm[field] = value;
      this.setState({ eventForm });
    } else {
      const targetIndex = recordList.findIndex(r => r.id === event.id);
      const record = { ...recordList[targetIndex] };
      record[field] = value;
      recordList[targetIndex] = { ...record };
      this.setState({ recordList });
    }
  }

  getDuration(start, end) {
    return Number(moment.duration(end.diff(start)).asHours());
  }

  changeStartDate(value) {
    const { recordList, event, isNew } = this.state;
    const targetIndex = recordList.findIndex(r => r.id === event.id);
    const eventForm = isNew
      ? { ...this.state.eventForm }
      : { ...recordList[targetIndex] };

    let start = moment(value);
    let end = moment(value).add(eventForm.duration, "hours");
    eventForm.endDateTime = end.format("YYYY-MM-DDTHH:mm");
    eventForm.startDateTime = start.format("YYYY-MM-DDTHH:mm");

    if (isNew) {
      this.setState({ eventForm });
    } else {
      recordList[targetIndex] = { ...eventForm };
      this.setState({
        recordList
      });
    }
  }

  changeEndDate(value) {
    const { recordList, event, isNew } = this.state;
    const targetIndex = recordList.findIndex(r => r.id === event.id);
    const eventForm = isNew
      ? { ...this.state.eventForm }
      : { ...recordList[targetIndex] };

    let end = moment(value);
    let start = moment(eventForm.startDateTime);
    if (!end.isAfter(start)) {
      end = start;
    }
    const duration = this.getDuration(start, end);
    eventForm.endDateTime = end.format("YYYY-MM-DDTHH:mm");
    eventForm.duration = Number(duration.toFixed(2));
    eventForm.startDateTime = start.format("YYYY-MM-DDTHH:mm");

    if (isNew) {
      this.setState({ eventForm });
    } else {
      recordList[targetIndex] = { ...eventForm };
      this.setState({
        recordList
      });
    }
  }

  changeDuration(value) {
    const { recordList, event, isNew } = this.state;
    const targetIndex = recordList.findIndex(r => r.id === event.id);
    const eventForm = isNew
      ? { ...this.state.eventForm }
      : { ...recordList[targetIndex] };

    let end = moment(eventForm.startDateTime).add(value, "hours");
    eventForm.endDateTime = end.format("YYYY-MM-DDTHH:mm");
    eventForm.duration = value;

    if (isNew) {
      this.setState({ eventForm });
    } else {
      recordList[targetIndex] = { ...eventForm };
      this.setState({
        recordList
      });
    }
  }

  removeEvent(record) {
    ons.notification
      .confirm({ message: "Do you want to delete this record?" })
      .then(res => {
        if (res === 1) {
          this.restAPI
            .delete("com.axelor.apps.crm.db.Event", this.props.route.data.id)
            .then(res => {
              if (this.props.route.removeRecord) {
                this.props.route.removeRecord(record);
              }
              this.props.navigator.popPage();
            });
        }
      });
  }

  onBackButtonClick() {
    const { edit } = this.state;
    if (!edit) {
      this.props.navigator.popPage();
      return;
    }
    this.isRecordChanged(true).then(ok => {
      if (ok) {
        this.props.navigator.popPage();
      }
    });
  }

  onRecordSwipe(record) {
    const { getRecordsByIndex } = this.props.route;
    if (getRecordsByIndex) {
      const list = getRecordsByIndex(record);
      list.forEach(
        (r, i) => (list[i].duration = (list[i].duration / 3600).toFixed(2))
      );
      this.setState({ recordList: list, offset: 0, total: 0, all: [] }, () => {
        const { recordList } = this.state;
        const targetIndex = recordList.findIndex(r => r.id === record.id);
        this.fetchNewData(record);
        this.swiper.slideTo(targetIndex, 0, true);
      });
    } else {
      this.setState({ recordList: [record], event: record });
    }
    debounceCallback(() => {
      this.closeEvent().then(res => {
        this.fetchNewData(record);
      });
    });
  }

  validateData(record) {
    let isValid = true;
    const eventForm = record;
    if (eventForm.typeSelect === null) {
      isValid = false;
      this.setState({
        submitError: { title: "Save Error", content: "Event type required" }
      });
    }
    if (!eventForm.subject || !(eventForm.subject.length > 0)) {
      isValid = false;
      this.setState({
        submitError: {
          title: "Save Error",
          content: "Subject field required!!!"
        }
      });
    }
    if (!eventForm.startDateTime || !(eventForm.startDateTime.length > 0)) {
      isValid = false;
      this.setState({
        submitError: {
          title: "Save Error",
          content: "Start date time required!!!"
        }
      });
    }
    return isValid;
  }

  closeEvent(close) {
    const { recordList, event } = this.state;
    return new Promise((resolve, reject) => {
      const targetIndex = recordList.findIndex(
        record => record.id === event.id
      );
      this.isRecordChanged(close).then(ok => {
        if (ok) {
          recordList[targetIndex] = event;
          this.setState({ edit: false, event, recordList });
          resolve(true);
        }
      });
    });
  }

  editEvent() {
    this.setState({ edit: true });
  }

  isRecordChanged(close) {
    const { recordList, event } = this.state;
    return new Promise((resolve, reject) => {
      const targetIndex = recordList.findIndex(
        record => record.id === event.id
      );
      if (
        JSON.stringify(recordList[targetIndex]) !== JSON.stringify(event) &&
        close
      ) {
        ons.notification
          .confirm({
            message: "Are you sure you want to continue?"
          })
          .then(res => {
            if (res === 1) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
      } else {
        resolve(true);
      }
    });
  }

  mapObjectToList(object) {
    return Object.keys(object).map(key => {
      return { id: key, name: object[key] };
    });
  }

  createEvent() {
    const { event } = this.state;
    const record = {
      typeSelect: event.typeSelect,
      partner: event.partner && event.partner.fullName,
      contactPartner: event.contactPartner && event.contactPartner.fullName,
      user: event.user
    };
    this.props.navigator.pushPage(
      { component: EventFormView, path: "EventFormView_" + Date.now(), record },
      { animation: "none" }
    );
  }

  createOpportunity() {
    const { event } = this.state;
    const record = {
      lead: event.lead && event.lead.fullName,
      partner: event.partner && event.partner.fullName
    };
    this.props.navigator.pushPage(
      { component: OpportunityView, path: "OpportunityView", record },
      { animation: "none" }
    );
  }

  renderAlertBox() {
    const { showErrorDialog, submitError } = this.state;
    const onOk = () => this.setState({ showErrorDialog: false });
    return (
      <AlertDialog isOpen={showErrorDialog} isCancelable={false}>
        <div className="alert-dialog-title">{submitError.title}</div>
        <div className="alert-dialog-content">{submitError.content}</div>
        <div className="alert-dialog-footer">
          <button onClick={onOk} className="alert-dialog-button">
            button_ok
          </button>
        </div>
      </AlertDialog>
    );
  }

  saveEvent() {
    const { onUpdate, onNewUpdate } = this.props.route;
    const { event, recordList, eventForm, isNew, user } = this.state;

    if (isNew) {
      if (!this.validateData(eventForm)) {
        this.setState({ showErrorDialog: true });
        return;
      }
      let users = user.filter(x => x.fullName === eventForm.user);
      const eventFormPayload = {
        subject: eventForm.subject,
        typeSelect: eventForm.typeSelect,
        statusSelect: eventForm.statusSelect,
        callTypeSelect: eventForm.callTypeSelect,
        startDateTime: eventForm.startDateTime,
        endDateTime: eventForm.endDateTime,
        duration: Math.round(eventForm.duration * 3600),
        description: eventForm.description,
        partner: eventForm.partner,
        contactPartner: eventForm.contactPartner,
        lead: eventForm.lead,
        user: users[0]
      };
      this.restAPI
        .add("com.axelor.apps.crm.db.Event", eventFormPayload)
        .then(res => {
          const { data } = res;
          if (data && data.length > 0) {
            const newRecord = data[0];
            if (onNewUpdate) {
              onNewUpdate(newRecord);
            }
            this.setState({ isNew: false, edit: false }, () => {
              this.onRecordSwipe(newRecord);
            });
            this.setState({ isNew: false, edit: false, ...eventForm });
          }
        });
    } else {
      const record = recordList.find(r => r.id === event.id);
      if (!this.validateData(record)) {
        this.setState({ showErrorDialog: true });
        return;
      }
      if (record.id !== undefined) {
        let users =
          record.user &&
          user.filter(x => x.fullName === record.user || record.user.fullName);
        this.restAPI
          .update(
            "com.axelor.apps.crm.db.Event",
            {
              ...record,
              duration: Math.round(record.duration * 3600),
              user: users && users[0]
            },
            record.id
          )
          .then(res => res.json())
          .then(result => {
            const { data } = result;
            if (data && data.length > 0) {
              const newRecord = data[0];
              if (onUpdate) {
                onUpdate(data[0]);
              }
              this.setState({ edit: false });
              this.fetchNewData(newRecord);
            }
          });
      }
    }
    this.props.navigator.popPage();
  }

  renderToolbar() {
    const { recordList, eventForm, isNew, edit } = this.state;

    const original = this.state.event;
    let event = {};
    if (isNew) {
      event = { ...eventForm };
    } else {
      event = recordList.find(r => r.id === original.id) || {};
    }
    return (
      <Toolbar noshadow modifier="transparent" style={{ background: "#fff" }}>
        <div className="left ">
          <ToolbarButton
            onClick={() => this.onBackButtonClick()}
            style={{ color: "gray" }}
          >
            <Icon icon="chevron-left" />
          </ToolbarButton>
        </div>
        <div className="center " style={{ color: "#000" }}>
          <span
            onClick={() => this.onBackButtonClick()}
            style={{ display: "inline-block" }}
          >
            {event.subject}
          </span>
        </div>
        <div className="right right-icons">
          {isNew &&
            edit && (
              <div>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveEvent(e)} />
                </ToolbarButton>
              </div>
            )}
          {edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon icon="fa-close" onClick={() => this.closeEvent(true)} />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveEvent(e)} />
                </ToolbarButton>
              </div>
            )}
          {!edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon
                    icon="fa-trash"
                    onClick={() => this.removeEvent(event)}
                  />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon icon="fa-pencil" onClick={() => this.editEvent()} />
                </ToolbarButton>
              </div>
            )}
        </div>
      </Toolbar>
    );
  }

  renderView(eventForm) {
    const { user, isNew } = this.state;
    let disabled;
    if (!this.state.edit) {
      disabled = true;
    }
    return (
      <div>
        <div>
          {this.state.edit ? (
            <div>
              <Card>
                <label>Type Select</label>
                <p>
                  <Select
                    value={eventForm.typeSelect}
                    onChange={e =>
                      this.changeField("typeSelect", e.target.value)
                    }
                  >
                    {Object.keys(typeSelect).map((s, i) => (
                      <option key={i} value={s}>
                        {typeSelect[s]}
                      </option>
                    ))}
                  </Select>
                </p>
                {typeSelect[eventForm.typeSelect] === "Call" && (
                  <div>
                    <label>Call Type</label>
                    <p>
                      <Select
                        value={eventForm.callTypeSelect}
                        onChange={e =>
                          this.changeField("callTypeSelect", e.target.value)
                        }
                      >
                        {Object.keys(callType).map((s, i) => (
                          <option key={i} value={s}>
                            {callType[s]}
                          </option>
                        ))}
                      </Select>
                    </p>
                  </div>
                )}
                {typeSelect[eventForm.typeSelect] === "Meeting" && (
                  <div>
                    <label>Meeting Type</label>
                    <p>
                      <Select
                        value={eventForm.meeting_type}
                        onChange={e =>
                          this.changeField("meeting_type", e.target.value)
                        }
                      >
                        {Object.keys(callType).map((s, i) => (
                          <option key={i} value={s}>
                            {callType[s]}
                          </option>
                        ))}
                      </Select>
                    </p>
                  </div>
                )}
                <label>Status Select</label>
                <p>
                  <Select
                    value={eventForm.statusSelect}
                    onChange={e =>
                      this.changeField("statusSelect", e.target.value)
                    }
                  >
                    {Object.keys(statusSelect).map((s, i) => (
                      <option key={i} value={s}>
                        {statusSelect[s]}
                      </option>
                    ))}
                  </Select>
                </p>
                <label>Subject</label>
                <p>
                  <Input
                    type="text"
                    value={eventForm.subject}
                    onChange={e => this.changeField("subject", e.target.value)}
                  />
                </p>
              </Card>
            </div>
          ) : (
            <div>
              {!isNew &&
                eventForm && (
                  <Card>
                    <div style={{ textAlign: "center", padding: "10px" }}>
                      {eventForm.statusSelect && (
                        <span
                          className={classNames("tag-button")}
                          style={{ backgroundColor: "##228B22" }}
                        >
                          <h5>{statusSelect[eventForm.statusSelect]}</h5>
                        </span>
                      )}
                      <h5>{eventForm.subject}</h5>
                      <h5>
                        {typeSelect[eventForm.typeSelect]}
                        {callType[eventForm.callTypeSelect]}
                      </h5>
                      {(eventForm.partner ||
                        eventForm.contactPartner ||
                        eventForm.lead) && (
                        <div>
                          <div>Linked to : </div>
                          {eventForm.partner && (
                            <h5>
                              {eventForm.partner && eventForm.partner.fullName}(partner)
                            </h5>
                          )}
                          {eventForm.contactPartner && (
                            <h5>
                              {eventForm.contactPartner &&
                                eventForm.contactPartner.fullName}
                              (contact)
                            </h5>
                          )}
                          {eventForm.lead && (
                            <h5>
                              {eventForm.lead && eventForm.lead.fullName}
                              (lead)
                            </h5>
                          )}
                        </div>
                      )}
                      <div className={classNames("action-view")}>
                        <Row>
                          <Col>
                            <Icon
                              icon="md-calendar"
                              onClick={() => this.createEvent()}
                            />
                            <br />
                            New Event
                          </Col>
                          <Col>
                            >
                            <Icon
                              icon="fa-handshake-o"
                              onClick={() => this.createOpportunity()}
                            />
                            <br />
                            New Opportunity
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card>
                )}
            </div>
          )}
        </div>

        <div>
          <TabberView>
            <TabberView.Tab
              title="Event Details"
              active={this.state.overviewPanel === 2}
              onClick={() => this.setState({ overviewPanel: 2 })}
            />
            <TabberView.Tab
              title="Comments"
              {...this.state.total}
              active={this.state.overviewPanel === 1}
              onClick={() => this.setState({ overviewPanel: 1 })}
            />
          </TabberView>

          {this.state.overviewPanel === 2 ? (
            <div>
              <Card>
                <label>Start Date</label>

                <p>
                  <Input
                    disabled={disabled}
                    type={"datetime-local"}
                    value={
                      moment(eventForm.startDateTime).isValid()
                        ? moment(eventForm.startDateTime).format(
                            "YYYY-MM-DDTHH:mm"
                          )
                        : moment().format("YYYY-MM-DDTHH:mm")
                    }
                    onChange={e => this.changeStartDate(e.target.value)}
                  />
                </p>

                {(!isNew || eventForm.duration) && (
                  <div>
                    <label>End Date</label>
                    <p>
                      <Input
                        disabled={disabled}
                        type={"datetime-local"}
                        value={
                          moment(eventForm.endDateTime).isValid()
                            ? moment(eventForm.endDateTime).format(
                                "YYYY-MM-DDTHH:mm"
                              )
                            : moment().format("YYYY-MM-DDTHH:mm")
                        }
                        onChange={e => this.changeEndDate(e.target.value)}
                      />
                    </p>
                  </div>
                )}
                <label>Duration</label>
                <p>
                  <Input
                    disabled={disabled}
                    type="number"
                    value={eventForm.duration}
                    onChange={e => this.changeDuration(e.target.value)}
                  />
                </p>
              </Card>
              <Card>
                <label>Description</label>
                <p>
                  <Input
                    disabled={disabled}
                    type="text"
                    value={eventForm.description}
                    onChange={e =>
                      this.changeField("description", e.target.value)
                    }
                  />
                </p>
              </Card>
            </div>
          ) : (
            <Card>
              <Input
                type="text"
                placeholder="Write about it"
                disabled={disabled}
              />
            </Card>
          )}
          <TabberView>
            <TabberView.Tab
              title="Assigned To"
              active={this.state.secondTabber === 1}
              onClick={() => this.setState({ secondTabber: 1 })}
            />
            <TabberView.Tab
              title="Linked To"
              active={this.state.secondTabber === 2}
              onClick={() => this.setState({ secondTabber: 2 })}
            />
          </TabberView>
          {this.state.secondTabber === 1 ? (
            <Card>
              <label>Assigned To</label>
              <p>
                <Select
                  value={eventForm.user}
                  disabled={disabled}
                  onChange={e => this.changeField("user", e.target.value)}
                >
                  {user.map((s, i) => (
                    <option key={i} value={s.fullName}>
                      {s.fullName}
                    </option>
                  ))}
                </Select>
              </p>
            </Card>
          ) : (
            <Card>
              <RenderCustomer
                eventForm={eventForm}
                fieldLabel="Customer"
                displayField="fullName"
                onChange={e => this.changeField("partner", e.target.value)}
                edit={this.state.edit}
                navigator={this.props.navigator}
                searchAPI="com.axelor.apps.base.db.Partner"
              />
              <RenderContactPartner
                eventForm={eventForm}
                fieldLabel="Contact"
                displayField="fullName"
                onChange={e =>
                  this.changeField("contactPartner", e.target.value)
                }
                edit={this.state.edit}
                navigator={this.props.navigator}
                searchAPI="com.axelor.apps.base.db.Partner"
              />
              <RenderLead
                eventForm={eventForm}
                fieldLabel="Lead"
                displayField="fullName"
                onChange={e => this.changeField("lead", e.target.value)}
                edit={this.state.edit}
                navigator={this.props.navigator}
                searchAPI="com.axelor.apps.crm.db.Lead"
              />
            </Card>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { recordList, eventForm, isNew, event } = this.state;
    // const eventdata = recordList.find(r => r.id === event.id) || {};
    return (
      <Page
        {...this.props}
        renderToolbar={() => this.renderToolbar()}
        isRecordChanged={() => this.isRecordChanged(true)}
      >
        {this.renderAlertBox()}
        {isNew
          ? this.renderView(eventForm)
          : 
          // (this.renderView(eventdata),
            
              <SwiperView
                recordList={recordList}
                renderItem={record => this.renderView(record)}
                onActive={record => this.onRecordSwipe(record)}
                onInitSwiper={swiper => (this.swiper = swiper)}
              />
            }
      </Page>
    );
  }
}

export default EventView;
