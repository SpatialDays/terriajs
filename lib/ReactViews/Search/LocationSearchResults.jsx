import { observer } from "mobx-react";
import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import SearchHeader from "./SearchHeader";
import SearchResult from "./SearchResult";
import classNames from "classnames";
import Icon from "../Icon";
import Styles from "./location-search-result.scss";

const LocationSearchResults = observer(
  createReactClass({
    displayName: "LocationSearchResults",

    propTypes: {
      viewState: PropTypes.object.isRequired,
      isWaitingForSearchToStart: PropTypes.bool,
      terria: PropTypes.object.isRequired,
      search: PropTypes.object.isRequired,
      onLocationClick: PropTypes.func.isRequired,
      theme: PropTypes.string,
      t: PropTypes.func.isRequired
    },

    getInitialState() {
      return {
        isOpen: true,
        isExpanded: false
      };
    },

    getDefaultProps() {
      return {
        theme: "dark"
      };
    },

    toggleGroup() {
      this.setState({
        isOpen: !this.state.isOpen
      });
    },

    toggleExpand() {
      this.setState({
        isExpanded: !this.state.isExpanded
      });
    },

    renderResultsFooter() {
      const { t } = this.props;
      if (this.state.isExpanded) {
        return t("search.viewLess", {
          name: this.props.search.searchProvider.name
        });
      }
      return t("search.viewMore", {
        name: this.props.search.searchProvider.name
      });
    },

    render() {
      const search = this.props.search;
      const searchProvider = search.searchProvider;
      const results =
        search.results.length > 5
          ? this.state.isExpanded
            ? search.results
            : search.results.slice(0, 5)
          : search.results;
      return (
        <div
          key={searchProvider.name}
          className={classNames(Styles.providerResult, {
            [Styles.isOpen]: this.state.isOpen,
            [Styles.dark]: this.props.theme === "dark",
            [Styles.light]: this.props.theme === "light"
          })}
        >
          <button onClick={this.toggleGroup} className={Styles.heading}>
            <span>{searchProvider.name}</span>
            <Icon
              glyph={
                this.state.isOpen ? Icon.GLYPHS.opened : Icon.GLYPHS.closed
              }
            />
          </button>
          <SearchHeader
            searchResults={search}
            isWaitingForSearchToStart={this.props.isWaitingForSearchToStart}
          />
          <ul className={Styles.items}>
            {results.map((result, i) => (
              <SearchResult
                key={i}
                clickAction={this.props.onLocationClick.bind(null, result)}
                name={result.name}
                icon="location"
                theme={this.props.theme}
              />
            ))}
            {search.results.length > 5 && (
              <button className={Styles.footer} onClick={this.toggleExpand}>
                {this.renderResultsFooter()}
                <Icon
                  glyph={
                    this.state.isExpanded
                      ? Icon.GLYPHS.opened
                      : Icon.GLYPHS.closed
                  }
                />
              </button>
            )}
          </ul>
        </div>
      );
    }
  })
);

module.exports = withTranslation()(LocationSearchResults);
