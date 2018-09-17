import React, { Component } from "react";
import {
  Page,
  Card,
  Toolbar,
  ToolbarButton,
  Icon,
  Select,
  Input,
  AlertDialog
} from "react-onsenui";
import ons from "onsenui";
import RestAPI from "../../../../../rest-api";
import CardView from "../../../../components/CardView";
import "./index.css";
import TabberView from "../../../../components/TabberView";
import classNames from "classnames";
import SwiperView from "../../../../components/Swiper";
import debounce from 'lodash.debounce'

const debounceCallback = debounce(func => {
  func();
}, 100);

const salesStageSelect = {
  1: "New",
  2: "Qualification",
  3: "Proposition",
  4: "Negotiation",
  5: "Closed won",
  6: "Closed lost"
};

const RenderType = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="opportunity_type"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select opportunity type"
      targetName="name"
      value={opportunityForm.opportunityType}
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
              {obj ? obj.name : "select opportunity type"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderSource = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="source"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select source"
      targetName="name"
      value={opportunityForm.source}
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
              {obj ? obj.name : "select source"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderCurrency = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="currency"
      className="inline select-control"
      title={fieldLabel}
      placeholder="selectcurrency"
      targetName="name"
      value={opportunityForm.currency}
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
              {obj ? obj.name : "select currency"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderAssignedTo = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="user"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select_user"
      targetName="fullName"
      value={opportunityForm.user}
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
              {obj ? obj.fullName : "select user"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderCompany = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="company"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select company"
      targetName="name"
      value={opportunityForm.company}
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
              {obj ? obj.name : "select company"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderPartner = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="Customer"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select_customer"
      targetName="fullName"
      value={opportunityForm.partner}
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
              {obj ? obj.fullName : "select customer"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

const RenderLead = ({ opportunityForm, ...props }) => {
  const { fieldLabel, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      name="user"
      className="inline select-control"
      title={fieldLabel}
      placeholder="select lead"
      targetName="fullName"
      value={opportunityForm.lead}
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
              {obj ? obj.fullName : "select lead"}
            </div>
          </div>
        </div>
      )}
    />
  );
};

class OpportunitView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opportunity: this.props.route.data,
      opportunityForm: {
        opportunityType: null,
        name: null,
        salesStageSelect: 1,
        nextStep: null,
        expectedCloseDate: null,
        description: null,
        partner: null,
        lead: null,
        user: "",
        currency: null,
        amount: "0.00",
        probability: "0.00",
        source: null,
        company: null
      },
      submitError: {
        title: null,
        content: null
      },
      recordList: [],
      secondTabber: 1,
      overviewPanel: 2,
      commentMessage: "",
      edit: false,
      isNew: false,
      all: [],
      total: 0,
      limit: 4,
      offset: 0,
      activeIndex: 0
    };
    this.recordId = null;
    this.restAPI = new RestAPI();
  }

  componentDidMount() {
    const { route } = this.props;
    const { data, getRecordsByIndex, record } = route;
    if (data && data.id !== undefined) {
      if (getRecordsByIndex) {
        const records = getRecordsByIndex(data, true);
        const targetIndex = records.findIndex(r => r.id === data.id);
        this.swiper.slideTo(targetIndex, 0, true);
        this.setState({ recordList: [...records] });
        this.fetchNewData(data)
      }
    } else {
      let { opportunityForm } = this.state;
      if (record) {
        opportunityForm = { ...opportunityForm, ...record };
      }
      this.setState({ isNew: true, edit: true, opportunityForm });
    }
  }

  changeField(field, value) {
    const { opportunity, recordList, isNew, opportunityForm } = this.state;
    if (isNew) {
      opportunityForm[field] = value;
      this.setState({ opportunityForm });
    } else {
      const targetIndex = recordList.findIndex(r => r.id === opportunity.id);
      const record = { ...recordList[targetIndex] };
      record[field] = value;
      recordList[targetIndex] = { ...record };
      this.setState({ recordList });
    }
  }

  fetchNewData(data) {
    this.setState({ isLoading: true }, () => {
      this.restAPI
        .fetch("com.axelor.apps.crm.db.Opportunity", data.id)
        .then(res => res.json())
        .then(result => {
          const { data } = result;
          if (data && data.length > 0) {
            const opportunity = Object.assign({}, data[0]);
            const { recordList } = this.state;
            const targetIndex = recordList.findIndex(
              r => r.id === opportunity.id
            );
            recordList[targetIndex] = Object.assign({}, opportunity);
            this.setState({ opportunity, recordList, isLoading: false });
          }
        });
    });
  }

  editOpportunity() {
    this.setState({ edit: true });
  }

  isRecordChanged(close) {
    const { recordList, opportunity } = this.state;
    return new Promise(resolve => {
      const targetIndex = recordList.findIndex(
        record => record.id === opportunity.id
      );
      if (
        JSON.stringify(recordList[targetIndex]) !==
          JSON.stringify(opportunity) &&
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

  closeOpportunity(close) {
    const { recordList, opportunity } = this.state;
    return new Promise(resolve => {
      const targetIndex = recordList.findIndex(
        record => record.id === opportunity.id
      );
      this.isRecordChanged(close).then(ok => {
        if (ok) {
          recordList[targetIndex] = opportunity;
          this.setState({ edit: false, opportunity, recordList });
          resolve(true);
        }
      });
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

  validateData(record) {
    let isValid = true;
    if (!record.name || !(record.name.length > 0)) {
      isValid = false;
      this.setState({
        submitError: { title: "Save Error", content: "name field required!!!" }
      });
    }
    return isValid;
  }

  removeOpportunity(record) {
    ons.notification
      .confirm({ message: "Do u want to delete this record?" })
      .then(res => {
        if (res === 1) {
          this.restAPI
            .delete(
              "com.axelor.apps.crm.db.Opportunity",
              this.props.route.data.id
            )
            .then(res => {
              if (this.props.route.removeRecord) {
                this.props.route.removeRecord(record);
              }
              this.props.navigator.popPage();
            });
        }
      });
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
        this.swiper.slideTo(targetIndex, 0, true);
      });
    } else {
      this.setState({ recordList: [record], event: record });
    }
    debounceCallback(() => {
      this.closeOpportunity().then(res => {
        this.fetchNewData(record);
      });
    });
  }

  saveOpportunity() {
    const { onUpdate, onNewUpdate } = this.props.route;
    const { opportunity, recordList, isNew, opportunityForm } = this.state;
    if (isNew) {
      if (!this.validateData(opportunityForm)) {
        this.setState({ showErrorDialog: true });
        return;
      }
      this.restAPI
        .add("com.axelor.apps.crm.db.Opportunity", opportunityForm)
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
            this.setState(
              { isNew: false, edit: false, ...opportunityForm },
              () => {}
            );
          }
        });
    } else {
      const record = recordList.find(r => r.id === opportunity.id);
      if (!this.validateData(record)) {
        this.setState({ showErrorDialog: true });
        return;
      }
      if (record.id !== undefined) {
        this.restAPI
          .update("com.axelor.apps.crm.db.Opportunity", record, record.id)
          .then(res => {
            const { data } = res;
            if (data && data.length > 0) {
              const newRecord = data[0];
              if (onUpdate) {
                onUpdate(data[0]);
              }
              this.closeOpportunity().then(res => {
                this.fetchNewData(newRecord)
              });
              this.setState({ edit: false });
            }
          });
      }
    }
    this.props.navigator.popPage();
  }

  renderView(opportunityForm) {
    const { isNew, edit } = this.state;
    let disabled;
    if (!this.state.edit) {
      disabled = true;
    }
    return (
      <div>
        {edit ? (
          <div>
            <Card>
              <label>Sales Stage</label>
              <p>
                <Select
                  value={opportunityForm.salesStageSelect}
                  onChange={e =>
                    this.changeField("salesStageSelect", e.target.value)
                  }
                >
                  {Object.keys(salesStageSelect).map((s, i) => (
                    <option key={i} value={s}>
                      {salesStageSelect[s]}
                    </option>
                  ))}
                </Select>
              </p>
              <RenderType
                opportunityForm={opportunityForm}
                fieldLabel="Opportunity Type"
                displayField="name"
                onChange={e =>
                  this.changeField("opportunityType", e.target.value)
                }
                edit={this.state.edit}
                navigator={this.props.navigator}
                searchAPI="com.axelor.apps.crm.db.OpportunityType"
              />
              <RenderSource
                opportunityForm={opportunityForm}
                fieldLabel="source"
                displayField="name"
                onChange={e => this.changeField("source", e.target.value)}
                edit={this.state.edit}
                navigator={this.props.navigator}
                searchAPI="com.axelor.apps.base.db.Source"
              />
              <label>Subject</label>
              <p>
                <Input
                  type="text"
                  value={opportunityForm.name}
                  onChange={e => this.changeField("name", e.target.value)}
                />
              </p>
            </Card>
          </div>
        ) : (
          !isNew &&
          opportunityForm && (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <Card>
                <div style={{ textAlign: "center", padding: "10px" }}>
                  {opportunityForm.salesStageSelect && (
                    <span
                      className={classNames("tag-button")}
                      style={{ backgroundColor: "##228B22" }}
                    >
                      {salesStageSelect[opportunityForm.salesStageSelect]}
                    </span>
                  )}
                  <h5>{opportunityForm.name}</h5>
                  <h5>
                    {opportunityForm.opportunityType &&
                      opportunityForm.opportunityType.name}
                  </h5>
                  <h5>
                    {opportunityForm.source && opportunityForm.source.name}
                  </h5>
                  {(opportunityForm.partner || opportunityForm.lead) && (
                    <div>
                      <div>Linked to : </div>
                      {opportunityForm.partner && (
                        <h5>{opportunityForm.partner.fullName} (partner)</h5>
                      )}
                      {opportunityForm.lead && (
                        <h5>
                          {opportunityForm.lead.fullName}
                          (lead)
                        </h5>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )
        )}

        <TabberView>
          <TabberView.Tab
            title="Follow-up"
            active={this.state.overviewPanel === 2}
            onClick={() => this.setState({ overviewPanel: 2 })}
          />
          <TabberView.Tab
            title="Financial Terms"
            active={this.state.overviewPanel === 3}
            onClick={() => this.setState({ overviewPanel: 3 })}
          />
          <TabberView.Tab
            title="Comments"
            active={this.state.overviewPanel === 1}
            onClick={() => this.setState({ overviewPanel: 1 })}
          />
        </TabberView>

        {this.state.overviewPanel === 2 && (
          <Card>
            <label>Next Step</label>
            <p>
              <Input
                type="text"
                disabled={disabled}
                value={opportunityForm.nextStep}
                onChange={e => this.changeField("nextStep", e.target.value)}
              />
            </p>
            <label>Due Date</label>
            <p>
              <Input
                type="date"
                disabled={disabled}
                value={opportunityForm.expectedCloseDate}
                onChange={e =>
                  this.changeField("expectedCloseDate", e.target.value)
                }
              />
            </p>
            <label>Probability</label>
            <p>
              <Input
                type="number"
                disabled={disabled}
                value={opportunityForm.probability}
                onChange={e => this.changeField("probability", e.target.value)}
              />
            </p>
          </Card>
        )}
        {this.state.overviewPanel === 3 && (
          <Card>
            <label>Amount</label>
            <p>
              <Input
                type="tel"
                disabled={disabled}
                value={opportunityForm.amount}
                onChange={e => this.changeField("amount", e.target.value)}
              />
            </p>
            <RenderCurrency
              opportunityForm={opportunityForm}
              fieldLabel="currency"
              displayField="name"
              onChange={e => this.changeField("currency", e.target.value)}
              edit={this.state.edit}
              navigator={this.props.navigator}
              searchAPI="com.axelor.apps.base.db.Currency"
            />
          </Card>
        )}
        {this.state.overviewPanel === 1 && (
          <Card>
            <Input type="text"  disabled={disabled}  placeholder="Write about it" />
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
            <RenderAssignedTo
              opportunityForm={opportunityForm}
              fieldLabel="user"
              displayField="fullName"
              onChange={e => this.changeField("user", e.target.value)}
              edit={this.state.edit}
              navigator={this.props.navigator}
              searchAPI="com.axelor.auth.db.User"
            />
            <RenderCompany
              opportunityForm={opportunityForm}
              fieldLabel="company"
              displayField="name"
              onChange={e => this.changeField("company", e.target.value)}
              edit={this.state.edit}
              navigator={this.props.navigator}
              searchAPI="com.axelor.apps.base.db.Company"
            />
          </Card>
        ) : (
          <Card>
            <RenderPartner
              opportunityForm={opportunityForm}
              fieldLabel="Customer"
              displayField="fullName"
              onChange={e => this.changeField("partner", e.target.value)}
              edit={this.state.edit}
              navigator={this.props.navigator}
              searchAPI="com.axelor.apps.base.db.Partner"
            />
            <RenderLead
              opportunityForm={opportunityForm}
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
    );
  }

  renderToolbar() {
    const { edit, isNew, opportunityForm, recordList } = this.state;
    const original = this.state.opportunity;
    let opportunity = {};
    if (isNew) {
      opportunity = opportunityForm;
    } else {
      opportunity = recordList.find(r => r.id === original.id) || {};
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
          <h5
            onClick={() => this.onBackButtonClick()}
            style={{ display: "inline-block" }}
          >
            Opportunity
          </h5>
        </div>
        <div className="right right-icons">
          {isNew &&
            edit && (
              <div>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveOpportunity(e)} />
                </ToolbarButton>
              </div>
            )}
          {edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon
                    icon="fa-close"
                    onClick={() => this.closeOpportunity(true)}
                  />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveOpportunity(e)} />
                </ToolbarButton>
              </div>
            )}
          {!edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon
                    icon="fa-trash"
                    onClick={() => this.removeOpportunity(opportunity)}
                  />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon
                    icon="fa-pencil"
                    onClick={() => this.editOpportunity()}
                  />
                </ToolbarButton>
              </div>
            )}
        </div>
      </Toolbar>
    );
  }

  render() {
    const { opportunityForm, isNew, recordList } = this.state;
    // const opportunitydata = recordList.find(r => r.id === opportunity.id) || {};
    return (
      <Page {...this.props} renderToolbar={() => this.renderToolbar()}>
        {this.renderAlertBox()}
        {isNew
          ? this.renderView(opportunityForm)
          : 
          // (this.renderView(opportunitydata),
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

export default OpportunitView;
