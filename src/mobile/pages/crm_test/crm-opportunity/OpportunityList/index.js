import React, { Component } from "react";
import {
  Page,
  Toolbar,
  ToolbarButton,
  Icon,
  SearchInput,
  List,
  ListItem
} from "react-onsenui";
import Service from "../../../../../service";
import debounce from "lodash.debounce";
import OpportunityView from "./../OpportunityView";

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

class OpportunityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filter: 0,
      offset: 0,
      total: 0,
      limit: 10,
      searchInput: ""
    };
    this.service = new Service();
    this.debounce = debounce(() => this.fetchData(), 1000);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { offset, limit, searchInput } = this.state;
    const sales_stage_select = Object.keys(salesStageSelect).find(
      type => salesStageSelect[type] === searchInput
    );
    let data = {};
    data = {
      _domain: null,
      _domainContext: {},
      operator: "or",
      criteria: [
        { fieldName: "name", value: searchInput, operator: "like" },
        {
          fieldName: "salesStageSelect",
          value: sales_stage_select,
          operator: "="
        }
      ]
    };
    let fields = [
      "name",
      "opportunityType",
      "source",
      "salesStageSelect",
      "nextStep",
      "expectedCloseDate",
      "probability",
      "amount",
      "currency",
      "partner",
      "lead",
      "user",
      "company",
      "description"
    ];
    this.service
      .getData("com.axelor.apps.crm.db.Opportunity", {
        data,
        fields,
        limit,
        offset
      })
      .then(res => res.json())
      .then(result =>
        this.setState({
          data: result.data,
          total: result.total
        })
      );
  }

  viewOpportunity(record) {
    const { data } = this.state;
    const index = data.findIndex(d => d.id === record.id);
    this.props.navigator.pushPage(
      {
        component: OpportunityView,
        path: "OpportunityView",
        onUpdate: record => {
          const target = data.findIndex(d => d.id === record.id);
          data[target] = { ...record };
          this.setState({ data: [...data] });
        },
        removeRecord: record => {
          const targetIndex = data.findIndex(o => o.id === record.id);
          data.splice(targetIndex, 1);
          this.setState({ data });
        },
        data: record,
        recordIndex: index,
        getRecordsByIndex: (record, isMount) =>
          this.getRecordsByIndex(record, isMount)
      },
      { animation: "none" }
    );
  }

  addOpportunity() {
    const { data } = this.state;
    this.props.navigator.pushPage(
      {
        component: OpportunityView,
        path: "OpportunityView",
        onUpdate: record => {
          const target = data.findIndex(d => d.id === record.id);
          data[target] = { ...record };
          this.setState({ data: [...data] });
        },
        removeRecord: record => {
          const targetIndex = data.findIndex(o => o.id === record.id);
          data.splice(targetIndex, 1);
          this.setState({ data });
        },
        getRecordsByIndex: (record, isMount) =>
          this.getRecordsByIndex(record, isMount),
        onNewUpdate: record => this.setState({ data: [record, ...data] })
      },
      { animation: "none" }
    );
  }

  getRecordsByIndex(record) {
    const { data } = this.state;
    let newList = [];
    const index = data.findIndex(l => l.id === record.id);
    debounceCallback(() => {});
    if (index === 0) {
      newList = data.slice(index, index + 2);
    } else {
      newList = data.slice(index - 1, index + 2);
    }
    return newList;
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

  onListItemClick(item) {
    return this.viewOpportunity(item);
  }

  renderRow(row, index) {
    return (
      <ListItem
        key={row.row_id || row.id || index}
        onClick={() => this.onListItemClick(row, index)}
      >
        <div textalign="left">
          <h3>{row.name}</h3>
          <h4>{row.opportunityType.name}</h4>
          <h4>{row.expectedCloseDate}</h4>
          <h4>{row.user && row.user.fullName}</h4>
        </div>
      </ListItem>
    );
  }

  renderList() {
    const { data } = this.state;
    return (
      <List
        style={{ marginTop: 45, backgroundImage: "none" }}
        dataSource={data}
        renderRow={(row, index) => this.renderRow(row, index)}
      />
    );
  }

  homePage() {
    this.props.navigator.popPage();
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="left">
          <ToolbarButton>
            <Icon icon="fa-th-large" onClick={() => this.homePage()} />
          </ToolbarButton>
        </div>
        <div className="center">Opportunity</div>
        <div className="right">
          <ToolbarButton>
            <Icon icon="md-plus" onClick={() => this.addOpportunity()} />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }
  render() {
    return (
      <Page
        {...this.props}
        renderToolbar={() => this.renderToolbar()}
      >
        <section style={{ textAlign: "center", padding: "10px" }}>
          {this.renderListSearch()}
        </section>
        {this.renderList()}
      </Page>
    );
  }
}

export default OpportunityList;
