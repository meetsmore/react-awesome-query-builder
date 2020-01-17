import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Rule from './Rule';
import Group from './Group';
import RuleAction from './RuleAction';


const typeMap = {
  rule: (props) => (
    <Rule 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      treeNodesCnt={props.treeNodesCnt}
      config={props.config}
      onDragStart={props.onDragStart}
    />
  ),
  group: (props) => (
    <Group 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      treeNodesCnt={props.treeNodesCnt}
      onDragStart={props.onDragStart}
      children1={props.children1}
      headerLabel={props.headerLabel}
    />
  ),
  ruleAction: (props) => (
    <RuleAction
      {...props.properties.toObject()}
      ruleActions={props.properties.ruleActions}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      headerLabel={props.headerLabel}
    />
  )
};


class Item extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.keys(typeMap)).isRequired,
    path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
    properties: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    actions: PropTypes.object.isRequired,
    treeNodesCnt: PropTypes.number,
    onDragStart: PropTypes.func,
    headerLabel: PropTypes.string,
  };

  render() {
    const { type, ...props } = this.props;
    return typeMap[type](props);
  }
}

export default Item;
