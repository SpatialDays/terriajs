import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { observer } from "mobx-react";
import PrivateIndicator from "../PrivateIndicator/PrivateIndicator";
import Loader from "../Loader";
import Icon from "../../Styled/Icon";
import Styles from "./data-catalog-group.scss";
import Box from "../../Styled/Box";
import Text from "../../Styled/Text";

const CatalogGroupButton = styled.button`
  ${(props) => `
    &:hover,
    &:focus {
      color: ${props.theme.textLight};
      background-color: ${props.theme.modalHighlight};
    }
    ${
      props.active &&
      `
        color: ${props.theme.textLight};
        background-color: ${props.theme.modalHighlight};
      `
    }
    `}
`;

/**
 * Dumb component that encapsulated the display logic for a catalog group.
 *
 * @constructor
 */
function CatalogGroup(props) {
  const { t } = useTranslation();
  return (
    <li className={Styles.root}>
      <Text fullWidth primary={!props.selected && props.isPrivate}>
        {/* If this is a display group, show the "PlusList" button */}
        {/* TODO: This should be superimposed on the above button. 
        We cannot have a button within a button, so maybe use z-values and superimpose */}
        {/* TODO: Maybe this should be a component with a 'mode' flag. 
        With a different appearance and onClick function depending on the mode */}
        {props.displayGroup === true && (
          <Box>
            <button
              type="button"
              // TODO: apply unique styles
              className={Styles.addRemoveButton}
              title={
                props.allItemsLoaded
                  ? t("models.catalog.removeAll")
                  : t("models.catalog.addAll")
              }
              // onClick should call addAll function which I should move out of GroupPreview to separate service file
              onClick={props.addRemoveButtonFunction}
            >
              <Icon
                glyph={
                  props.allItemsLoaded
                    ? Icon.GLYPHS.remove
                    : Icon.GLYPHS.plusList
                }
              />
            </button>
          </Box>
        )}
        <CatalogGroupButton
          type="button"
          className={classNames(
            Styles.btnCatalog,
            { [Styles.btnCatalogTopLevel]: props.topLevel },
            { [Styles.btnIsOpen]: props.open },
            { [Styles.isPreviewed]: props.selected }
          )}
          title={props.title}
          onClick={props.onClick}
          active={props.selected}
        >
          <If condition={!props.topLevel}>
            <span className={Styles.folder}>
              {props.open ? (
                <Icon glyph={Icon.GLYPHS.folderOpen} />
              ) : (
                <Icon glyph={Icon.GLYPHS.folder} />
              )}
            </span>
          </If>
          <Box justifySpaceBetween>
            <Box>{props.text}</Box>
            <Box centered>
              {props.isPrivate && <PrivateIndicator />}
              <span
                className={classNames(Styles.caret, {
                  [Styles.offsetRight]: props.removable
                })}
              >
                {props.open ? (
                  <Icon glyph={Icon.GLYPHS.opened} />
                ) : (
                  <Icon glyph={Icon.GLYPHS.closed} />
                )}
              </span>
              {/* This next button is for user added data, and perhaps should be called 'trashable' instead of 'removable' */}
              <If condition={props.removable}>
                <button
                  type="button"
                  className={Styles.trashGroup}
                  title={t("dataCatalog.groupRemove")}
                  onClick={props.removeUserAddedData}
                >
                  <Icon glyph={Icon.GLYPHS.trashcan} />
                </button>
              </If>
            </Box>
          </Box>
        </CatalogGroupButton>
      </Text>
      <If condition={props.open}>
        <ul
          className={classNames(Styles.catalogGroup, {
            [Styles.catalogGroupLowerLevel]: !props.topLevel
          })}
        >
          <Choose>
            <When condition={props.loading}>
              <li key="loader">
                <Loader />
              </li>
            </When>
            <When condition={props.children.length === 0 && props.emptyMessage}>
              <li
                className={classNames(Styles.label, Styles.labelNoResults)}
                key="empty"
              >
                {props.emptyMessage}
              </li>
            </When>
          </Choose>
          {props.children}
        </ul>
      </If>
    </li>
  );
}

CatalogGroup.propTypes = {
  text: PropTypes.string,
  isPrivate: PropTypes.bool,
  title: PropTypes.string,
  topLevel: PropTypes.bool,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  selected: PropTypes.bool,
  removable: PropTypes.bool,
  removeUserAddedData: PropTypes.func,
  displayGroup: PropTypes.bool,
  allItemsLoaded: PropTypes.bool,
  addRemoveButtonFunction: PropTypes.func
};

export default observer(CatalogGroup);
