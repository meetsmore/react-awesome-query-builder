import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import startsWith from 'lodash/startsWith'
import GroupContainer from './containers/GroupContainer';
import Draggable from './containers/Draggable';
import { Icon, Modal } from 'antd';
const { confirm } = Modal;
const classNames = require('classnames');
import Item from './Item';
import {ConjsRadios, ConjsButtons} from './Conjs';
import {Actions} from './Actions';

const defaultPosition = 'topRight';


@GroupContainer
@Draggable("group")
class Group extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    treeNodesCnt: PropTypes.number,
    conjunctionOptions: PropTypes.object.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    path: PropTypes.any, //instanceOf(Immutable.List)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    //actions
    handleDraggerMouseDown: PropTypes.func,
    onDragStart: PropTypes.func,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    ruleActions: PropTypes.object,
    headerLabel: PropTypes.string,
  };

  isGroupTopPosition = () => {
    return startsWith(this.props.config.settings.groupActionsPosition || defaultPosition, 'top')
  }

  removeSelf = () => {
    const confirmOptions = this.props.config.settings.removeGroupConfirmOptions;
    const doRemove = () => {
      this.props.removeSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      confirm({...confirmOptions,
        onOk: doRemove,
        onCancel: null
      });
    } else {
      doRemove();
    }
  }

  isEmptyCurrentGroup = () => {
    const children = this.props.children1;
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmpty = (item) => {
    return item.get("type") == "group" ? this.isEmptyGroup(item) : this.isEmptyRule(item);
  }

  isEmptyGroup = (group) => {
    const children = group.get("children1");
    return children.size == 0 ||
      children.size == 1 && this.isEmpty(children.first());
  }

  isEmptyRule = (rule) => {
    const properties = rule.get('properties');
      return !(
          properties.get("field") !== null &&
          properties.get("operator") !== null &&
          properties.get("value").filter((val) => val !== undefined).size > 0
      );
  }

  render() {
    const isGroupTopPosition = this.isGroupTopPosition();
    return [
        <div key="group-header" className="group--header">
          {this.renderHeader()}
          {isGroupTopPosition && this.renderBeforeActions()}
          {isGroupTopPosition && this.renderActions()}
          {isGroupTopPosition && this.renderAfterActions()}
        </div>
    , this.props.children1 &&
        <div key="group-children" className={classNames(
          "group--children",
          this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : ''
        )}>{this.renderChildren()}</div>
    , !isGroupTopPosition &&
        <div key="group-footer" className='group--footer'>
          {this.renderBeforeActions()}
          {this.renderActions()}
          {this.renderAfterActions()}
        </div>
    ];
  }

  renderBeforeActions = () => {
    const BeforeActions = this.props.config.settings.renderBeforeActions;
    if (BeforeActions == undefined)
      return null;

    return typeof BeforeActions === 'function' ? <BeforeActions {...this.props}/> : BeforeActions;
  }

  renderAfterActions = () => {
    const AfterActions = this.props.config.settings.renderAfterActions;
    if (AfterActions == undefined)
      return null;

    return typeof AfterActions === 'function' ? <AfterActions {...this.props}/> : AfterActions;
  }

  hasChildrenOfType = (type) => {
    return this.props.children1 && this.props.children1
      .some(item => item.get('type') === type)
  }

  renderActions = () => {
    return <Actions
      config={this.props.config}
      addRule={this.props.addRule}
      addGroup={this.props.addGroup}
      addRuleAction={this.props.addRuleAction}
      allowFurtherNesting={this.props.allowFurtherNesting}
      isRoot={this.props.isRoot}
      isIfStatement={this.props.selectedConjunction === 'IF'}
      isMultiActionStatement={this.props.selectedConjunction === 'MERGE'}
      removeSelf={this.removeSelf}
    />;
  }

  renderChildren = () => {
    const props = this.props;
    const isIfStatement = this.props.selectedConjunction === 'IF';
    const children = props.children1 ? props.children1
    // render rule actions separately at the end of list
    .filter(item => item.get('type') !== 'ruleAction')
    .toList()
    .map((item, index) => {
      return <Item
        key={item.get('id')}
        id={item.get('id')}
        //path={props.path.push(item.get('id'))}
        path={item.get('path')}
        type={item.get('type')}
        properties={item.get('properties')}
        config={props.config}
        actions={props.actions}
        children1={item.get('children1')}
        //tree={props.tree}
        treeNodesCnt={props.treeNodesCnt}
        onDragStart={props.onDragStart}
        headerLabel={isIfStatement ? index === 0 ? 'If' : 'Else If' : null}
      />
    }) : null;

    const ruleActions = props.children1 ? props.children1
    .filter(item => item.get('type') === 'ruleAction')
    .toList()
    .map((ruleAction, index) => (
      <Item
        key={ruleAction.get('id')}
        id={ruleAction.get('id')}
        path={ruleAction.get('path')}
        type={'ruleAction'}
        properties={ruleAction.get('properties')}
        config={props.config}
        actions={props.actions}
        headerLabel={isIfStatement && index === 0 && 'Else'}
      />
    )) : null;

    return [children, ruleActions].flat()
  }

  renderHeader = () => {
    const Conjs = this.props.config.settings.renderConjsAsRadios ? ConjsRadios : ConjsButtons;

    const nonRuleActionChildren = this.props.children1.filter(
      item => item.get('type') !== 'ruleAction'
    )

    const conjs = <Conjs
      disabled={nonRuleActionChildren.size < 2}
      selectedConjunction={this.props.selectedConjunction}
      setConjunction={this.props.setConjunction}
      conjunctionOptions={this.props.conjunctionOptions}
      config={this.props.config}
      not={this.props.not}
      setNot={this.props.setNot}
      hasRuleChildren={this.hasChildrenOfType('rule')}
    />;

    const showDragIcon = this.props.config.settings.canReorder && this.props.treeNodesCnt > 2 && !this.props.isRoot;
    const drag = showDragIcon &&
      <span
        key="group-drag-icon"
        className={"qb-drag-handler group--drag-handler"}
        onMouseDown={this.props.handleDraggerMouseDown}
      ><Icon type="bars" /> </span>;

    const headerLabel = this.props.headerLabel

    return (
      <div>
        {headerLabel && <h3>{headerLabel}</h3>}
        <div className={classNames(
          "group--conjunctions",
          // this.props.children1.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : ''
        )}>
          {conjs}
          {drag}
        </div>
      </div>
    );
  }
}


export default Group;
