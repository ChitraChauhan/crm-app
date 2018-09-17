import React, { Component } from "react";
import Service from "../../../../../service";
import {
  Toolbar,
  ToolbarButton,
  Page,
  Icon,
  List,
  ListItem,
  SearchInput
} from "react-onsenui";
import classNames from "classnames";
import debounce from "lodash.debounce";
import moment from "moment";
import EventView from "../EventView";

const debounceCallback = debounce(func => {
  func();
}, 100);

const Tabbar = ({ tabs, value, onChange }) => {
  if (tabs.filter(t => t.value === value).length === 0 && tabs && tabs.length) {
    value = tabs[0].value;
  }
  return (
    <div className="tabbar tabbar--top tabbar--material">
      {tabs.map((tab, i) => (
        <React.Fragment key={i}>
          <label
            className="tabbar__item tabbar--material__item"
            onClick={() => onChange(tab.value)}
          >
            <button
              className={classNames("tabbar__button", {
                "highlight-list-tab-button": tab.value === value
              })}
            >
              {tab.text}
            </button>
          </label>
        </React.Fragment>
      ))}
    </div>
  );
};

class EventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventData: [],
      filter: 0,
      offset: 0,
      total: 0,
      limit: 10,
      searchInput: "",
      loading: false
    };
    this.service = new Service();
    this.debounce = debounce(() => this.fetchData(), 1000);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData(loading = true) {
    this.setState({ loading });
    const { offset, limit, filter, searchInput } = this.state;
    let data = {};
    if (filter === 0) {
      if (searchInput) {
        data = {
          criteria: [
            {
              operator: "or",
              criteria: [
                { fieldName: "subject", value: searchInput, operator: "like" }
              ]
            }
          ],
          operator: "and",
          _domain: null,
          _domainContext: {}
        };
      } else {
        data = {};
      }
    } else if (searchInput) {
      data = {
        criteria: [
          {
            operator: "or",
            criteria: [
              { fieldName: "subject", value: searchInput, operator: "like" }
            ]
          },
          {
            operator: "and",
            criteria: [
              { fieldName: "statusSelect", value: filter, operator: "=" }
            ]
          }
        ],
        operator: "and",
        _domain: null,
        _domainContext: {}
      };
    } else {
      data = {
        criteria: [
          {
            operator: "and",
            criteria: [
              { fieldName: "statusSelect", value: filter, operator: "=" }
            ]
          }
        ],
        operator: "and",
        _domain: null,
        _domainContext: {}
      };
    }
    let fields = [
      "typeSelect",
      "callTypeSelect",
      "meetingType",
      "statusSelect",
      "subject",
      "startDateTime",
      "endDateTime",
      "duration",
      "user",
      "description",
      "partner",
      "contactPartner",
      "lead"
    ];
    this.service
      .getData("com.axelor.apps.crm.db.Event", { data, fields, limit, offset })
      .then(res => res.json())
      .then(result =>
        this.setState({
          eventData: result.data,
          total: result.total,
          loading: false,
        })
      );
    // this.service
    //   .getData("com.axelor.apps.crm.db.Event", { data, fields, limit, offset })
    //   .then(res => {
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         resolve(res);
    //       }, 200);
    //     });
    //   })
    //   .then(({ data = [], total = 0, status }) => {
    //     // if any error happens
    //     if (!Array.isArray(data)) {
    //       data = [];
    //       total = 0;
    //     }
    //     this.setState(prevState => {
    //       return {
    //         eventData: offset === 0 ? data : [...prevState.data, ...data],
    //         offset,
    //         total,
    //         loading: false
    //       };
    //     });
    //   });
  }

  addEvent() {
    const { eventData } = this.state;
    this.props.navigator.pushPage(
      {
        component: EventView,
        path: "EventView",
        onUpdate: record => {
          const target = eventData.findIndex(d => d.id === record.id);
          eventData[target] = { ...record };
          this.setState({ eventData: [...eventData] });
        },
        removeRecord: record => {
          const targetIndex = eventData.findIndex(e => e.id === record.id);
          eventData.splice(targetIndex, 1);
          this.setState({ eventData });
        },
        getRecordsByIndex: (record, isMount) =>
          this.getRecordsByIndex(record, isMount),
        onNewUpdate: record =>
          this.setState({ eventData: [record, ...eventData] })
      },
      { animation: "none" }
    );
  }

  getListTabsData() {
    return [
      { text: "All", value: 0 },
      { text: "Planned", value: 1 },
      { text: "Realized", value: 2 },
      { text: "Canceled", value: 3 }
    ];
  }

  onTabChange(newIndex) {
    const { filter } = this.state;
    if (filter !== newIndex) {
      this.setState({ filter: newIndex }, () => this.fetchData());
    }
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

  getRecordsByIndex(record) {
    const { eventData } = this.state;
    let newList = [];
    const index = eventData.findIndex(l => l.id === record.id);
    debounceCallback(() => {
      if (index >= eventData.length - 3) {
        this.onLoadMore(() => {});
      }
    });
    if (index === 0) {
      newList = eventData.slice(index, index + 2);
    } else {
      newList = eventData.slice(index - 1, index + 2);
    }
    return newList;
  }

  onLoadMore(done) {
    const { offset, limit, total } = this.state;
    const newOffset = offset + limit;
    const hasMore = newOffset < total;
    if (hasMore) {
      this.setState({ offset: newOffset }, () => this.fetchData());
    }
  }

  viewEvent(record) {
    const { eventData } = this.state;
    const index = eventData.findIndex(d => d.id === record.id);
    this.props.navigator.pushPage(
      {
        component: EventView,
        path: "EventView",
        onUpdate: record => {
          const target = eventData.findIndex(d => d.id === record.id);
          eventData[target] = { ...record };
          console.log(target, record);
          this.setState({ eventData: [...eventData] });
        },
        removeRecord: record => {
          const { eventData } = this.state;
          const targetIndex = eventData.findIndex(e => e.id === record.id);
          eventData.splice(targetIndex, 1);
          this.setState({ eventData });
        },
        data: record,
        recordIndex: index,
        getRecordsByIndex: (record, isMount) =>
          this.getRecordsByIndex(record, isMount)
      },
      { animation: "none" }
    );
  }

  onListItemClick(item) {
    return this.viewEvent(item);
  }

  renderRow(row, index) {
    let typeSelect;
    if (row.typeSelect === 1) {
      typeSelect = "Call";
    } else if (row.typeSelect === 2) {
      typeSelect = "Meeting";
    } else if (row.typeSelect === 3) {
      typeSelect = "Task";
    } else {
      typeSelect = "Event";
    }
    return (
      <ListItem
        key={row.row_id || row.id || index}
        onClick={() => this.onListItemClick(row, index)}
      >
        <div textalign="left">
          <h3> {row.subject} </h3>
          <h4>{moment(row.startDateTime).format("DD MMM YYYY HH:mm")}</h4>
          <h4> {typeSelect} </h4>
          <h3> {row.user && row.user.fullName} </h3>
        </div>
      </ListItem>
    );
  }

  renderList() {
    const { eventData } = this.state;
    return (
      <List
        style={{ marginTop: 45, backgroundImage: "none" }}
        dataSource={eventData}
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
        <div className="center">Events</div>
        <div className="right">
          <ToolbarButton>
            <Icon icon="md-plus" onClick={() => this.addEvent()} />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render() {
    return (
      <Page
        renderToolbar={() => this.renderToolbar()}
        onInfiniteScroll={done => this.onLoadMore(done)}
        {...this.props}
      >
        <section style={{ textAlign: "center", padding: "10px" }}>
          {this.renderListSearch()}
        </section>
        <Tabbar
          value={this.state.filter}
          tabs={this.getListTabsData()}
          onChange={e => this.onTabChange(e)}
        />
        {this.renderList()}
      </Page>
    );
  }
}

export default EventList;
