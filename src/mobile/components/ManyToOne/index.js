import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {
  Icon,
  ToolbarButton,
  SearchInput,
  Toolbar,
  Page,
  ListItem,
  Radio
} from "react-onsenui";
import debounce from "lodash.debounce";
import RestAPI from "../../../rest-api";

export const getEventObject = (name, value) => ({ target: { name, value } });

export class SelectionPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      value: props.route.value || null,
      pager: {
        offset: 0,
        limit: 20,
        total: 0
      },
      search: ""
    };
    this.search = debounce(this.search.bind(this), 800);
    this.is_closed = false;
    this.restAPI = new RestAPI();
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { searchAPI } = this.props.route;
    this.restAPI
      .search(searchAPI)
      .then(res => res.json())
      .then(result => {
        this.setState({ data: result.data });
      });
  }

  searchData(keyword) {
    const { targetName, searchAPI } = this.props.route;
    const isSearch = keyword !== null;
    let fields = [targetName];
    let data = {};
    if (keyword) {
      data = {
        criteria: [{ fieldName: targetName, operator: "like", value: keyword }],
        operator: "and"
      };
    }
    this.setState({  search: keyword });
    this.restAPI
      .search(searchAPI, { data, fields })
      .then(res => res.json())
      .then(({ data = [], total = 0 }) => {
        const { pager, data: stateData } = this.state;
        const newData = isSearch ? [...data] : [...stateData, ...data];
        this.setState({
          data: newData,
          pager: { ...pager, total }
        });
      });
  }

  search(value) {
    this.searchData(value);
  }

  handleChange(row) {
    this.setState({ value: row }, () => {
      if (this.props.route.closeOnSelect) {
        this.close();
      }
    });
  }

  close() {
    const { value } = this.state;
    const { targetName, all, onChange, goBack, name } = this.props.route;
    let obj = {};
    if (all) {
      obj = value;
    } else {
      obj = { id: value.id, [targetName]: value[targetName] };
    }
    onChange(getEventObject(name, obj));
    if (!this.is_closed) {
      this.is_closed = true;
      goBack();
    }
  }

  renderRow(row, index) {
    const { value } = this.state;
    const { targetName } = this.props.route;
    const isSelected =
      value && value.id && value.id.toString() === row.id.toString();
    return (
      <ListItem key={row.id} tappable onClick={() => this.handleChange(row)}>
        <label className="left">
          <Radio inputId={`radio-${row.id}`} checked={isSelected} />
        </label>
        <label htmlFor={`radio-${row.id}`} className="center">
          {row[targetName]}
        </label>
      </ListItem>
    );
  }

  renderToolbar() {
    const { goBack, title } = this.props.route;
    return (
      <Toolbar style={{ background: "#fff" }}>
        <div className="left">
          <ToolbarButton onClick={() => goBack()} style={{ color: "#000" }}>
            <Icon icon="md-arrow-left" />
          </ToolbarButton>
        </div>
        <div className="center" style={{ color: "#000", flex: 1 }}>
          {title}
        </div>
        <div className="right">
          <ToolbarButton
            onClick={() => this.close()}
            style={{ color: "#000", fontSize: 36, padding: 0, marginRight: 20 }}
          >
            <Icon icon="md-check" />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  render() {
    const { data, search } = this.state;
    const { placeholder } = this.props.route;
    return (
      <Page renderToolbar={() => this.renderToolbar()}>
        <div>
          <div style={{ padding: 12 }}>
            <SearchInput
              value={search}
              style={{ width: "100%" }}
              placeholder={placeholder}
              onChange={e => this.search(e.target.value)}
            />
          </div>
          
          {data && data.map((e, i) => this.renderRow(e, i))}
        </div>
      </Page>
    );
  }
}

export class ManyToOne extends Component {
  render() {
    const {
      title,
      liveSearch,
      placeholder,
      value,
      onChange,
      targetName,
      searchAPI,
      searchAPIOptions,
      name,
      closeOnSelect,
      notFoundContent,
      renderItem,
      navigator,
      all,
      ...restProps
    } = this.props;
    return (
      <div {...restProps} className={classNames(restProps.className)}>
        {React.cloneElement(renderItem(value), {
          onClick: () => {
            navigator.pushPage(
              {
                component: SelectionPage,
                path: `Select_${name}`,
                name,
                value,
                searchAPI,
                searchAPIOptions,
                title,
                placeholder,
                onChange,
                notFoundContent,
                closeOnSelect,
                targetName,
                liveSearch,
                all,
                goBack: () => navigator.popPage()
              },
              { animation: "slide" }
            );
          }
        })}
      </div>
    );
  }
}

ManyToOne.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  targetName: PropTypes.string,
  searchAPI: PropTypes.func,
  searchAPIOptions: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func,
  renderItem: PropTypes.func,
  navigator: PropTypes.any,
  closeOnSelect: PropTypes.bool,
  notFoundContent: PropTypes.any,
  liveSearch: PropTypes.bool
};

ManyToOne.defaultProps = {
  searchAPIOptions: {},
  liveSearch: true,
  closeOnSelect: true,
  notFoundContent: <h3> No Records </h3>
};

export default ManyToOne;
