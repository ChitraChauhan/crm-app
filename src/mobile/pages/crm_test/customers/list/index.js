import React, { Component } from "react";
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  List,
  ListItem,
  SearchInput
} from "react-onsenui";
import RestAPI from "../../../../../rest-api";
import debounce from "lodash.debounce";
import CustomerView from "../view"

class CustomerList extends Component {
  constructor(props) {
    super();
    this.state = {
      data: [],
      limit: 10,
      offset: 0,
      total: 0,
      searchInput: ""
    };
    this.restAPI = new RestAPI();
    this.debounce = debounce(() => this.fetchData(), 1000);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { limit, offset, searchInput } = this.state;
    let data = {};
    if (searchInput) {
      data = {
        criteria: [
          { fieldName: "fixedPhone", operator: "like", value: searchInput },
          { fieldName: "fullName", operator: "like", value: searchInput }
        ],
        operator: "or",
        _domain: "self.isCustomer = true AND self.isContact = false",
        _domainContext: {}
      };
    } else {
      data = {
        criteria: [],
        operator: "or",
        _domain: "self.isCustomer = true AND self.isContact = false",
        _domainContext: {}
      };
    }
    let fields = [
      "name",
      "firstName",
      "fullName",
      "emailAddress.address",
      "emailAddress",
      "fixedPhone",
      "isCustomer",
      "isProspect",
      "team",
      "user",
      "titleSelect",
      "language",
      "companySet",
      "currency",
      "partnerTypeSelect",
      "contactPartnerSet",
      "parentPartner",
      "partnerCategory",
      "partnerAddressList", 
      "partnerAddressList.address",
      "nbrEmployees",
      "registrationCode",
      "saleTurnover",
      "taxNbr",
      'industrySector',
      'source',
      "website",
    ];
    this.restAPI
      .search("com.axelor.apps.base.db.Partner", {
        data,
        fields,
        limit,
        offset
      })
      .then(res => res.json())
      .then(result => {
        // console.log("data",result.data)
        this.setState({
          data: result.data,
          total: result.total
        });
      });
  }

  homePage() {
    this.props.navigator.popPage();
  }

  getRecordsByIndex(record) {
    const { data } = this.state;
    let newList = [];
    const index = data.findIndex(l => l.id === record.id);
    if (index === 0) {
      newList = data.slice(index, index + 2);
    } else {
      newList = data.slice(index - 1, index + 2)
    }
    return newList;
  }


  addCustomer(){
    this.props.navigator.pushPage(
      {
        component: CustomerView,
        path: "customerView",
        addRecord: (record) => {
          const { data } = this.state;
          data.splice(0, 0, record)
        },
        updateRecord: (record) => {
          const { data } = this.state;
          const targetIndex = data.findIndex(l => l.id === record.id);
          data[targetIndex] = record;
          this.setState({ data });
        },
        removeRecord: (record) => {
          const { data } = this.state;
          const targetIndex = data.findIndex(l => l.id === record.id);
          data.splice(targetIndex, 1);
          this.setState({ data });
        },
        getRecordsByIndex: (record, isMount) => this.getRecordsByIndex(record, isMount),
      },
      { animation: "none" }
    );
  }

  viewCustomer(record) {
    this.props.navigator.pushPage(
      {
        component: CustomerView,
        path: "customerView",
        key: "view_customer_" + Date.now(),
        removeRecord: (record) => {
          const { data } = this.state;
          const targetIndex = data.findIndex(l => l.id === record.id);
          data.splice(targetIndex, 1);
          this.setState({ data });
        },
        updateRecord: (record) => {
          const { data } = this.state;
          const targetIndex = data.findIndex(l => l.id === record.id);
          data[targetIndex] = record;
          this.setState({ data });
        },
        data: record,
        getRecordsByIndex: (record, isMount) => this.getRecordsByIndex(record, isMount),
      },
      { animation: "none" }
    );
  }

  onListItemClick(record) {
    return this.viewCustomer(record);
  }

  renderRow(row, index) {
    return (
      <ListItem
        key={row.row_id || row.id || index}
        onClick={() => this.onListItemClick(row, index)}
      >
        <div textalign="left">
          <h4>{row.fullName} </h4>
          <h5>{row.fixedPhone} </h5>
          <h5>{row.emailAddress && row.emailAddress.name} </h5>
        </div>
      </ListItem>
    );
  }

  renderList() {
    return (
      <List
        style={{ marginTop: "45" }}
        dataSource={this.state.data}
        renderRow={(row, index) => this.renderRow(row, index)}
      />
    );
  }

  renderListSearch({ placeholder = "Search by name" } = {}) {
    const { searchInput } = this.state;
    const onKeywordChange = e => {
      this.setState({ searchInput: e.target.value }, () => {
        this.debounce();
      });
    };
    return (
      <div key="0" className="ax-searchbar">
        <SearchInput
          placeholder={placeholder}
          value={searchInput}
          onChange={onKeywordChange}
        />
      </div>
    );
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton>
            <Icon icon="fa-th-large" onClick={() => this.homePage()} />
          </ToolbarButton>
        </div>
        <div className="right">
          <ToolbarButton>
            <Icon icon="md-plus" onClick={() => this.addCustomer()} />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render() {
    return (
      <Page {...this.props} renderToolbar={() => this.renderToolbar()}>
        <section style={{ textAlign: "center", padding: "10px" }}>
          {this.renderListSearch()}
        </section>
        {this.renderList()}
      </Page>
    );
  }
}

export default CustomerList;
