import React, { Component } from "react";
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  Card,
  Select,
  Input,
  Row,
  Col
} from "react-onsenui";
import ons from "onsenui";
import TextareaAutosize from "react-autosize-textarea";
import CardView from "../../../../components/CardView";
import TabberView from "../../../../components/TabberView";
import ManyToMany from "../../../../components/ManyToMany";
import SwiperView  from "../../../../components/Swiper"
import RestAPI from "../../../../../rest-api";
import classNames from "classnames";
import debounce from "lodash.debounce";
import "./index.css";

const debounceCallback = debounce(func => {
  func();
}, 100);


const partnerTypeSelect = {
  1: "Company",
  2: "Individual"
};

const titleSelect = {
  1: "Mr",
  2: "Ms",
  3: "Dr",
  4: "Prof"
};

const RenderManyToOne = props => {
  const { name, fieldLabel, placeholder, targetName, value, searchAPI } = props;
  return (
    <CardView.ManyToOne
      {...props}
      style={{ width: "100%" }}
      name={name}
      className="inline select-control"
      title={fieldLabel}
      placeholder={placeholder}
      targetName={targetName}
      value={value}
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
              {obj ? obj[targetName] : placeholder}
            </div>
          </div>
        </div>
      )}
      onChange={e => props.onChange(e)}
    />
  );
};

const RenderManyToMany = props => {
  const { name, fieldLabel, placeholder, targetName, value, searchAPI } = props;
  return (
    <CardView.ManyToMany
      {...props}
      style={{ width: "100%" }}
      name={name}
      className="inline select-control"
      title={fieldLabel}
      placeholder={placeholder}
      targetName={targetName}
      value={value}
      searchAPI={searchAPI}
      renderItem={(obj, i) => (
        <ManyToMany
          key={i}
          value={obj ? [obj] : placeholder}
          onDelete={() => {
            const values = props.value;
            values.splice(i, 1);
            props.onChange({ target: { name, value: [...values] } });
          }}
        />
      )}
      onChange={e => props.onChange(e)}
    />
  );
};

class CustomerView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab1: 1,
      activeTab2: 1,
      activeTab3: 1,
      customer: this.props.route.data,
      customerForm: {
        partnerTypeSelect: 1,
        titleSelect: 1,
        isCustomer: true,
        isProspect: false,
        currency: null,
        companySet: null,
        team: null,
        // name: null,
        // firstName: null,
        // fixedPhone: null,
        // emailAddress: null,
        // contactPartnerSet: null,
        // partnerAddressList: null,
        // description: null,
        // partnerCategory: null,
        // parentPartner: null,
        // nbrEmployees: 0,
        // registrationCode: null,
        // saleTurnover: 0,
        // taxNbr: null,
        // industrySector: null,
        // source: null,
        // website: null,
        language: {
          id: 1,
          name: "English"
        },
        user: ""
      },
      recordList: [],
      isLoading: false,
      edit: false,
      isNew: false,
      showErrorDialog: false,
      submitError: {
        title: null,
        content: null
      },
      commentMessage: "",
      all: [],
      total: 0,
      limit: 4,
      offset: 0,
      activeIndex: 0
    };
    this.restAPI = new RestAPI();
  }

  componentDidMount() {
    const { route } = this.props;
    const { data, getRecordsByIndex } = route;
    if (data && data.id !== undefined) {
      if (getRecordsByIndex) {
        const records = getRecordsByIndex(data, true);
        const targetIndex = records.findIndex(r => r.id === data.id);
        this.swiper.slideTo(targetIndex, 0, true);
        this.fetchNewData(data);
        this.setState({ recordList: [...records] });
      }
    } else {
      const { customerForm } = this.state;
      this.setState({ isNew: true, edit: true, customerForm });
    }
  }

  fetchNewData(data) {
    this.setState({ isLoading: true }, () => {
      this.restAPI
        .fetch("com.axelor.apps.base.db.Partner", data.id)
        .then(res => res.json())
        .then(result => {
          const { data } = result;
          if (data && data.length > 0) {
            const customer = Object.assign({}, data[0]);
            const { recordList } = this.state;
            const targetIndex = recordList.findIndex(r => r.id === customer.id);
            recordList[targetIndex] = Object.assign({}, customer);
            this.setState({ customer, recordList, isLoading: false });
          }
        });
    });
  }

  changeField(field, value) {
    let { customer, recordList, isNew, customerForm } = this.state;
    if (field === "isCustomer" && value === true) {
      customerForm = { ...customerForm, isProspect: false };
    } else if (field === "isProspect" && value === true) {
      customerForm = { ...customerForm, isCustomer: false };
    }
    if (isNew) {
      customerForm[field] = value;
      this.setState({ customerForm });
    } else {
      const targetIndex = recordList.findIndex(r => r.id === customer.id);
      const record = { ...recordList[targetIndex] };
      record[field] = value;
      recordList[targetIndex] = { ...record };
      this.setState({ recordList });
    }
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

  isRecordChanged(close) {
    const { recordList, customer } = this.state;
    return new Promise(resolve => {
      const targetIndex = recordList.findIndex(
        record => record.id === customer.id
      );
      if (
        JSON.stringify(recordList[targetIndex]) !== JSON.stringify(customer) &&
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

  onRecordSwipe(record) {
    const { getRecordsByIndex } = this.props.route;
    if (getRecordsByIndex) {
      const list = getRecordsByIndex(record);
      this.setState({ recordList: list, offset: 0, total: 0, all: [] }, () => {
        const { recordList } = this.state;
        const targetIndex = recordList.findIndex(r => r.id === record.id);
        this.fetchNewData(record);
        this.swiper.slideTo(targetIndex, 0, true);
      });
    } else {
      this.setState({ recordList: [record], customer: record });
    }
    debounceCallback(() => {
      this.closeCustomer().then(res => {
        this.fetchNewData(record);
      });
    });
  }

  validateData() {
    let isValid = true;
    const { customerForm } = this.state;
    if (!customerForm.name || !(customerForm.name.length > 0)) {
      isValid = false;
      this.setState({
        submitError: { title: "Save Error", content: "Name is Required" }
      });
      return isValid;
    }
    if (customerForm.fixedPhone && !(customerForm.fixedPhone.length >= 8)) {
      isValid = false;
      this.setState({
        submitError: {
          title: "Save Error",
          content: "mobile phone must have 8 character"
        }
      });
      return isValid;
    }
    return isValid;
  }

  saveCustomer() {
    const { onUpdate, onNewUpdate } = this.props.route;
    const { customer, customerForm, recordList, isNew } = this.state;

    if (isNew) {
      // if (!this.validateData(customerForm)) {
      //   this.setState({ showErrorDialog: true });
      //   return;
      // }
      if (customerForm.firstName) {
        customerForm.fullName = `${customerForm.name} ${customerForm.firstName}`;
      } else {
        customerForm.fullName = customerForm.name;
      }
    
      this.restAPI.add("com.axelor.apps.base.db.Partner", {...customerForm, emailAddress: {address: customerForm.emailAddress}}).then(res => {
        const { data } = res;
        if (data && data.length > 0) {
          const newRecord = data[0];
          if (onNewUpdate) {
            onNewUpdate(newRecord);
          }
          this.setState({ isNew: false, edit: false }, () => {
            this.onRecordSwipe(newRecord);
          });
          this.setState({ isNew: false, edit: false, ...customerForm });
        }
      });
    } else {
      const record = recordList.find(r => r.id === customer.id);

      console.log("inside else",record)
      if (!this.validateData(record)) {
        this.setState({ showErrorDialog: true });
        return;
      }

      if (record) {
        console.log("inside if")
        if (record.firstName) {
          record.fullName = `${record.name} ${record.firstName}`;
        } else {
          record.fullName = record.name;
        }
      console.log("before restAPI")
        this.restAPI
          .update("com.axelor.apps.base.db.Partner", record , record.id)
          .then(res => res.json())
          .then(result => {
            console.log("result",result)
            const { data } = result;
            if (data && data.length > 0) {
              console.log("inside if:::")
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

  closeCustomer(close) {
    const { recordList, customer } = this.state;
    return new Promise(resolve => {
      const targetIndex = recordList.findIndex(
        record => record.id === customer.id
      );
      this.isRecordChanged(close).then(ok => {
        if (ok) {
          recordList[targetIndex] = customer;
          this.setState({ edit: false, customer, recordList });
          resolve(true);
        }
      });
    });
  }

  removeCustomer(record) {
    ons.notification
      .confirm({ message: "Do u want to delete this record?" })
      .then(res => {
        if (res === 1) {
          this.restAPI.delete("com.axelor.apps.base.db.Partner", this.props.route.data.id).then(res => {
            if (this.props.route.removeCustomer) {
              this.props.route.removeRecord(record);
            }
            this.props.navigator.popPage();
          });
        }
      });
  }

  editCustomer() {
    this.setState({ edit: true });
  }

  renderView(customerForm) {
    console.log("customer", customerForm);
    const { contactPartnerSet, partnerAddressList } = customerForm;
    console.log("partnerAddressList", partnerAddressList);
    let disabled;
    if (!this.state.edit) {
      disabled = true;
    }
    return (
      <div>
        {this.state.edit ? (
          <div>
            <Card>
              <label>Partner Type</label>
              <p>
                <Select
                  value={customerForm.partnerTypeSelect}
                  onChange={e =>
                    this.changeField("partnerTypeSelect", e.target.value)
                  }
                >
                  {Object.keys(partnerTypeSelect).map((s, i) => (
                    <option key={i} value={s}>
                      {partnerTypeSelect[s]}
                    </option>
                  ))}
                </Select>
              </p>
              {partnerTypeSelect[customerForm.partnerTypeSelect] ===
                "Individual" && (
                <div>
                  <label>Title</label>
                  <p>
                    <Select
                      value={customerForm.titleSelect}
                      onChange={e =>
                        this.changeField("titleSelect", e.target.value)
                      }
                    >
                      {Object.keys(titleSelect).map((s, i) => (
                        <option key={i} value={s}>
                          {titleSelect[s]}
                        </option>
                      ))}
                    </Select>
                  </p>
                </div>
              )}
              <label>Name</label>
              <p>
                <Input
                  type="text"
                  value={customerForm.name}
                  onChange={e => this.changeField("name", e.target.value)}
                />
              </p>
              {partnerTypeSelect[customerForm.partnerTypeSelect] ===
                "Individual" && (
                <div>
                  <label>First Name</label>
                  <p>
                    <Input
                      type="text"
                      value={customerForm.firstName}
                      onChange={e =>
                        this.changeField("firstName", e.target.value)
                      }
                    />
                  </p>
                </div>
              )}
              <label>Phone</label>
              <p>
                <Input
                  type="text"
                  value={customerForm.fixedPhone}
                  onChange={e => this.changeField("fixedPhone", e.target.value)}
                />
              </p>
              <label>Email</label>
              <p>
                <Input
                  type="text"
                  value={
                    customerForm.emailAddress && customerForm.emailAddress.name
                  }
                  onChange={e =>
                    this.changeField("emailAddress", e.target.value)
                  }
                />
              </p>
              <label>Website</label>
              <p>
                <Input
                  type="text"
                  value={customerForm.website}
                  onChange={e => this.changeField("website", e.target.value)}
                />
              </p>
              {this.state.isNew && (
                <div>
                  <input
                    type="checkbox"
                    defaultChecked={this.state.customerForm.isCustomer}
                    value={customerForm.isCustomer}
                    onChange={value => this.changeField("isCustomer", value)}
                  />
                  <span>isCustomer</span>
                  <input
                    type="checkbox"
                    defaultChecked={this.state.customerForm.isProspect}
                    value={customerForm.isProspect}
                    onChange={value => this.changeField("isProspect", value)}
                  />
                  <span>isProspect</span>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div>
            {!this.state.isNew &&
              customerForm && (
                <Card>
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <h5>{customerForm.fullName}</h5>
                    <h5>{customerForm.fixedPhone}</h5>
                    <h5>
                      {customerForm.emailAddress &&
                        customerForm.emailAddress.name}
                    </h5>

                    <div className={classNames("action-view")}>
                      <Row>
                        <Col>
                          <Icon
                            icon="fa-envelope"
                            onClick={() => this.sendMail()}
                          />
                          <br />
                          Send Mail
                        </Col>
                        <Col>
                          <Icon
                            icon="md-calendar"
                            onClick={() => this.createEvent()}
                          />
                          <br />
                          Schedule Event
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
        <div>
          <TabberView>
            <TabberView.Tab
              title="contacts associated"
              active={this.state.activeTab1 === 1}
              onClick={() => this.setState({ activeTab1: 1 })}
            />
            <TabberView.Tab
              title="Addresses"
              active={this.state.activeTab1 === 2}
              onClick={() => this.setState({ activeTab1: 2 })}
            />
          </TabberView>
          {this.state.activeTab1 === 1 ? (
            contactPartnerSet && contactPartnerSet.length > 0 ? (
              contactPartnerSet.map((item, index) => (
                <div
                  className={classNames(
                    this.state.edit ? "list-container-edit" : "list-container"
                  )}
                  key={item.id}
                >
                  <div
                    style={{ display: "flex", flex: 1 }}
                    // onClick={() => this.renderContactView(item.id)}
                  >
                    <div style={{ lineHeight: "5px" }}>
                      <p style={{ fontWeight: "bold" }}>{item.fullName}</p>
                      <p>{item.fixedPhone}</p>
                    </div>
                  </div>
                  {this.state.edit && (
                    <Icon
                      icon="md-close"
                      className="item-nav-icon"
                      style={{ color: "red" }}
                      // onClick={() => this.onDeleteContact(item, index)}
                    />
                  )}
                </div>
              ))
            ) : (
              <div>
                {!this.state.edit && (
                  <div
                    className="list-container"
                    style={{ padding: "15px", justifyContent: "center" }}
                  >
                    No ContactAssociated Found
                  </div>
                )}

                {this.state.edit && (
                  <div
                    className="list-container-edit"
                    // onClick={() =>
                    //   this.props.navigator.pushPage({
                    //     key: "add_partner_contact" + Date.now(),
                    //     component:
                    //       this.props.route.module === "Sale"
                    //         ? SaleContacts
                    //         : CRMContacts,
                    //     addContact: contact => this.onAddContact(contact)
                    //   })
                    // }
                  >
                    <p> Select Contact</p>
                    <Icon icon="md-plus" className="item-nav-icon" />
                  </div>
                )}
              </div>
            )
          ) : (
            <div>
              {partnerAddressList && partnerAddressList.length > 0 ? (
                partnerAddressList.map((item, index) => (
                  <div
                    className={classNames(
                      this.state.edit ? "list-container-edit" : "list-container"
                    )}
                    key={index}
                  >
                    <p className="list-item-content">
                      {item.address && item.address.fullName}
                    </p>
                    {this.state.edit && (
                      <Icon
                        icon="md-close"
                        className="item-nav-icon"
                        style={{ color: "red" }}
                        // onClick={() => this.onDeleteAddress(item, index)}
                      />
                    )}
                  </div>
                ))
              ) : !this.state.edit ? (
                <div
                  className="list-container"
                  style={{ padding: "15px", justifyContent: "center" }}
                >
                  No Address Found
                </div>
              ) : (
                this.state.edit && (
                  <div
                    className="list-container-edit"
                    // onClick={() =>
                    //   this.props.navigator.pushPage({
                    //     key: "create_address",
                    //     component: CreateAddress,
                    //     createAddress: (address) => this.onCreateAddress(address),
                    //     data: customerForm,
                    //     partnerAddressList
                    //   })
                    // }
                  >
                    <p> selectAddress </p>
                    <Icon icon="md-plus" className="item-nav-icon" />
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <div>
          <TabberView>
            <TabberView.Tab
              title="Partner Details"
              active={this.state.activeTab2 === 1}
              onClick={() => this.setState({ activeTab2: 1 })}
            />

            <TabberView.Tab
              title="Others"
              active={this.state.activeTab2 === 2}
              onClick={() => this.setState({ activeTab2: 2 })}
            />
            <TabberView.Tab
              title="Comments"
              {...this.state.total}
              active={this.state.activeTab2 === 3}
              onClick={() => this.setState({ activeTab2: 3 })}
            />
          </TabberView>
          {this.state.activeTab2 === 1 && (
            <div>
              <Card>
                <RenderManyToOne
                  name="partnerCategory"
                  searchAPI="com.axelor.apps.base.db.PartnerCategory"
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                  targetName="name"
                  value={customerForm["partnerCategory"]}
                  fieldLabel="Category"
                  placeholder="select category"
                  onChange={e =>
                    this.changeField("partnerCategory", e.target.value)
                  }
                />
                {partnerTypeSelect[customerForm.partnerTypeSelect] ===
                  "Company" && (
                  <RenderManyToOne
                    name="industrySector"
                    searchAPI="com.axelor.apps.base.db.IndustrySector"
                    edit={this.state.edit}
                    navigator={this.props.navigator}
                    targetName="name"
                    value={customerForm["industrySector"]}
                    fieldLabel="industrySector"
                    placeholder="select industry"
                    onChange={e =>
                      this.changeField("industrySector", e.target.value)
                    }
                  />
                )}
                <RenderManyToOne
                  name="source"
                  searchAPI="com.axelor.apps.base.db.Source"
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                  targetName="name"
                  value={customerForm["source"]}
                  fieldLabel="source"
                  placeholder="select source"
                  onChange={e => this.changeField("source", e.target.value)}
                />
                {partnerTypeSelect[customerForm.partnerTypeSelect] ===
                  "Company" && (
                  <RenderManyToOne
                    name="parentPartner"
                    searchAPI="com.axelor.apps.base.db.Partner"
                    edit={this.state.edit}
                    navigator={this.props.navigator}
                    targetName="fullName"
                    value={customerForm["parentPartner"]}
                    fieldLabel="Mother Company"
                    placeholder="select parent partner"
                    onChange={e =>
                      this.changeField("parentPartner", e.target.value)
                    }
                  />
                )}
                <RenderManyToOne
                  name="language"
                  searchAPI="com.axelor.apps.base.db.Language"
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                  targetName="name"
                  value={customerForm["language"]}
                  fieldLabel="Language"
                  placeholder="select language"
                  onChange={e => this.changeField("language", e.target.value)}
                />
              </Card>
              <Card>
                <label>Employees</label>
                <p>
                  <Input
                    type="number"
                    disabled={disabled}
                    value={customerForm.nbrEmployees}
                    onChange={e =>
                      this.changeField("nbrEmployees", e.target.value)
                    }
                  />
                </p>
                <label>Turnover</label>
                <p>
                  <Input
                    type="number"
                    disabled={disabled}
                    value={customerForm.saleTurnover}
                    onChange={e =>
                      this.changeField("saleTurnover", e.target.value)
                    }
                  />
                </p>
                <label>Registration Code</label>
                <p>
                  <Input
                    type="text"
                    disabled={disabled}
                    value={customerForm.registrationCode}
                    onChange={e =>
                      this.changeField("registrationCode", e.target.value)
                    }
                  />
                </p>
                <label>tax N</label>
                <p>
                  <Input
                    type="text"
                    disabled={disabled}
                    value={customerForm.taxNbr}
                    onChange={e => this.changeField("taxNbr", e.target.value)}
                  />
                </p>
              </Card>
            </div>
          )}
          {this.state.activeTab2 === 2 && (
            <div>
              <Card>
                <RenderManyToOne
                  name="user"
                  searchAPI="com.axelor.auth.db.User"
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                  targetName="fullName"
                  value={customerForm["user"]}
                  fieldLabel="Assigned To"
                  placeholder="select assignee"
                  onChange={e => this.changeField("user", e.target.value)}
                />
                <RenderManyToOne
                  name="team"
                  searchAPI="com.axelor.team.db.Team"
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                  targetName="name"
                  value={customerForm["team"]}
                  fieldLabel="Team"
                  placeholder="select team"
                  onChange={e => this.changeField("team", e.target.value)}
                />
                <RenderManyToMany
                  name="companySet"
                  fieldLabel="companies associated to"
                  placeholder="select company"
                  targetName="name"
                  value={customerForm.companySet}
                  searchAPI="com.axelor.apps.base.db.Company"
                  onChange={e => this.changeField("companySet", e.target.value)}
                  edit={this.state.edit}
                  navigator={this.props.navigator}
                />
              </Card>
              <Card>
                <label>Notes</label>
                <br />
                <TextareaAutosize
                  rows={3}
                  value={customerForm.description}
                  onChange={e =>
                    this.changeField("description", e.target.value)
                  }
                />
              </Card>
            </div>
          )}
          {this.state.activeTab2 === 3 && (
            <Card>
              <Input
                type="text"
                placeholder="Write about it"
                disabled={disabled}
              />
            </Card>
          )}
        </div>
      </div>
    );
  }

  renderToolbar() {
    const { recordList, edit, isNew, customerForm } = this.state;
    const original = this.state.customer;
    let customer = {};
    if (!isNew) {
      customer = recordList.find(r => r.id === original.id) || {};
    } else {
      customer = customerForm;
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
            {customer.name}
          </span>
        </div>
        <div className="right right-icons">
          {isNew &&
            edit && (
              <div>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveCustomer(e)} />
                </ToolbarButton>
              </div>
            )}
          {edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon
                    icon="fa-close"
                    onClick={() => this.closeCustomer(true)}
                  />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon icon="fa-save" onClick={e => this.saveCustomer(e)} />
                </ToolbarButton>
              </div>
            )}
          {!edit &&
            !isNew && (
              <div>
                <ToolbarButton>
                  <Icon
                    icon="fa-trash"
                    onClick={() => this.removeCustomer(customer)}
                  />
                </ToolbarButton>
                <ToolbarButton>
                  <Icon icon="fa-pencil" onClick={() => this.editCustomer()} />
                </ToolbarButton>
              </div>
            )}
        </div>
      </Toolbar>
    );
  }
  render() {
    const { isNew, recordList, customer, customerForm } = this.state;
    // const customerdata = recordList.find(r => r.id === customer.id) || {};

    return (
      <Page {...this.props} renderToolbar={() => this.renderToolbar()}>
        {isNew ? this.renderView(customerForm) : 
          // this.renderView(customerdata)
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

export default CustomerView;
