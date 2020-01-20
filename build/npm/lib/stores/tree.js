"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _immutable = _interopRequireDefault(require("immutable"));

var _treeUtils = require("../utils/treeUtils");

var _defaultUtils = require("../utils/defaultUtils");

var constants = _interopRequireWildcard(require("../constants"));

var _uuid = _interopRequireDefault(require("../utils/uuid"));

var _configUtils = require("../utils/configUtils");

var _stuff = require("../utils/stuff");

var _validation = require("../utils/validation");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hasChildren = function hasChildren(tree, path) {
  return tree.getIn((0, _treeUtils.expandTreePath)(path, 'children1')).size > 0;
};
/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */


var addNewGroup = function addNewGroup(state, path, properties, config) {
  var groupUuid = (0, _uuid["default"])();
  state = addItem(state, path, 'group', groupUuid, (0, _defaultUtils.defaultGroupProperties)(config).merge(properties || {}));
  var groupPath = path.push(groupUuid); // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason

  state = state.setIn((0, _treeUtils.expandTreePath)(groupPath, 'children1'), new _immutable["default"].OrderedMap());
  state = addItem(state, groupPath, 'rule', (0, _uuid["default"])(), (0, _defaultUtils.defaultRuleProperties)(config));
  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */


var removeGroup = function removeGroup(state, path, config) {
  state = removeItem(state, path);
  var parentPath = path.slice(0, -1);
  var isEmptyGroup = !hasChildren(state, parentPath);
  var isEmptyRoot = isEmptyGroup && parentPath.size == 1;
  var canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;

  if (isEmptyGroup && !canLeaveEmpty) {
    state = addItem(state, parentPath, 'rule', (0, _uuid["default"])(), (0, _defaultUtils.defaultRuleProperties)(config));
  }

  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {object} config
 * @param {Immutable.List} path
 */


var removeRule = function removeRule(state, path, config) {
  state = removeItem(state, path);
  var parentPath = path.slice(0, -1);
  var isEmptyGroup = !hasChildren(state, parentPath);
  var isEmptyRoot = isEmptyGroup && parentPath.size == 1;
  var canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;

  if (isEmptyGroup && !canLeaveEmpty) {
    state = addItem(state, parentPath, 'rule', (0, _uuid["default"])(), (0, _defaultUtils.defaultRuleProperties)(config));
  }

  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {bool} not
 */


var setNot = function setNot(state, path, not) {
  return state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'not'), not);
};

var addRuleAction = function addRuleAction(state, path, id, properties) {
  state = state.mergeIn((0, _treeUtils.expandTreePath)(path, 'properties', 'ruleActions'), new _immutable["default"].OrderedMap(_defineProperty({}, id, new _immutable["default"].Map({
    properties: properties
  }))));
  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};

var setRuleAction = function setRuleAction(state, path, value) {
  return state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'value'), value);
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} conjunction
 */


var setConjunction = function setConjunction(state, path, conjunction) {
  return state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'conjunction'), conjunction);
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} type
 * @param {string} id
 * @param {Immutable.OrderedMap} properties
 */


var addItem = function addItem(state, path, type, id, properties) {
  state = state.mergeIn((0, _treeUtils.expandTreePath)(path, 'children1'), new _immutable["default"].OrderedMap(_defineProperty({}, id, new _immutable["default"].Map({
    type: type,
    id: id,
    properties: properties
  }))));
  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */


var removeItem = function removeItem(state, path) {
  state = state.deleteIn((0, _treeUtils.expandTreePath)(path));
  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} fromPath
 * @param {Immutable.List} toPath
 * @param {string} placement, see constants PLACEMENT_*: PLACEMENT_AFTER, PLACEMENT_BEFORE, PLACEMENT_APPEND, PLACEMENT_PREPEND
 * @param {object} config
 */


var moveItem = function moveItem(state, fromPath, toPath, placement, config) {
  var from = (0, _treeUtils.getItemByPath)(state, fromPath);
  var sourcePath = fromPath.pop();
  var source = fromPath.size > 1 ? (0, _treeUtils.getItemByPath)(state, sourcePath) : null;
  var sourceChildren = source ? source.get('children1') : null;
  var to = (0, _treeUtils.getItemByPath)(state, toPath);
  var targetPath = placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND ? toPath : toPath.pop();
  var target = placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND ? to : toPath.size > 1 ? (0, _treeUtils.getItemByPath)(state, targetPath) : null;
  var targetChildren = target ? target.get('children1') : null;
  if (!source || !target) return state;
  var isSameParent = source.get('id') == target.get('id');
  var isSourceInsideTarget = targetPath.size < sourcePath.size && (0, _stuff.deepEqual)(targetPath.toArray(), sourcePath.toArray().slice(0, targetPath.size));
  var isTargetInsideSource = targetPath.size > sourcePath.size && (0, _stuff.deepEqual)(sourcePath.toArray(), targetPath.toArray().slice(0, sourcePath.size));
  var sourceSubpathFromTarget = null;
  var targetSubpathFromSource = null;

  if (isSourceInsideTarget) {
    sourceSubpathFromTarget = _immutable["default"].List(sourcePath.toArray().slice(targetPath.size));
  } else if (isTargetInsideSource) {
    targetSubpathFromSource = _immutable["default"].List(targetPath.toArray().slice(sourcePath.size));
  }

  var newTargetChildren = targetChildren,
      newSourceChildren = sourceChildren;
  if (!isTargetInsideSource) newSourceChildren = newSourceChildren["delete"](from.get('id'));

  if (isSameParent) {
    newTargetChildren = newSourceChildren;
  } else if (isSourceInsideTarget) {
    newTargetChildren = newTargetChildren.updateIn((0, _treeUtils.expandTreeSubpath)(sourceSubpathFromTarget, 'children1'), function (_oldChildren) {
      return newSourceChildren;
    });
  }

  if (placement == constants.PLACEMENT_BEFORE || placement == constants.PLACEMENT_AFTER) {
    newTargetChildren = _immutable["default"].OrderedMap().withMutations(function (r) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = newTargetChildren.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              itemId = _step$value[0],
              item = _step$value[1];

          if (itemId == to.get('id') && placement == constants.PLACEMENT_BEFORE) {
            r.set(from.get('id'), from);
          }

          r.set(itemId, item);

          if (itemId == to.get('id') && placement == constants.PLACEMENT_AFTER) {
            r.set(from.get('id'), from);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
  } else if (placement == constants.PLACEMENT_APPEND) {
    newTargetChildren = newTargetChildren.merge(_defineProperty({}, from.get('id'), from));
  } else if (placement == constants.PLACEMENT_PREPEND) {
    newTargetChildren = _immutable["default"].OrderedMap(_defineProperty({}, from.get('id'), from)).merge(newTargetChildren);
  }

  if (isTargetInsideSource) {
    newSourceChildren = newSourceChildren.updateIn((0, _treeUtils.expandTreeSubpath)(targetSubpathFromSource, 'children1'), function (_oldChildren) {
      return newTargetChildren;
    });
    newSourceChildren = newSourceChildren["delete"](from.get('id'));
  }

  if (!isSameParent && !isSourceInsideTarget) state = state.updateIn((0, _treeUtils.expandTreePath)(sourcePath, 'children1'), function (_oldChildren) {
    return newSourceChildren;
  });
  if (!isTargetInsideSource) state = state.updateIn((0, _treeUtils.expandTreePath)(targetPath, 'children1'), function (_oldChildren) {
    return newTargetChildren;
  });
  state = (0, _treeUtils.fixPathsInTree)(state);
  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */


var setField = function setField(state, path, newField, config) {
  if (!newField) return removeItem(state, path);
  var fieldSeparator = config.settings.fieldSeparator;
  if (Array.isArray(newField)) newField = newField.join(fieldSeparator);
  return state.updateIn((0, _treeUtils.expandTreePath)(path, 'properties'), function (map) {
    return map.withMutations(function (current) {
      var currentOperator = current.get('operator');
      var currentOperatorOptions = current.get('operatorOptions');

      var _currentField = current.get('field');

      var _currentValue = current.get('value');

      var _currentValueSrc = current.get('valueSrc', new _immutable["default"].List());

      var _currentValueType = current.get('valueType', new _immutable["default"].List()); // If the newly selected field supports the same operator the rule currently
      // uses, keep it selected.


      var newFieldConfig = (0, _configUtils.getFieldConfig)(newField, config);
      var lastOp = newFieldConfig && newFieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
      var newOperator = null;
      var availOps = (0, _configUtils.getOperatorsForField)(config, newField);
      if (availOps && availOps.length == 1) newOperator = availOps[0];else if (availOps && availOps.length > 1) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (config.settings.setOpOnChangeField || [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var strategy = _step2.value;
            if (strategy == 'keep') newOperator = lastOp;else if (strategy == 'default') newOperator = (0, _defaultUtils.defaultOperator)(config, newField, false);else if (strategy == 'first') newOperator = (0, _configUtils.getFirstOperator)(config, newField);
            if (newOperator) //found op for strategy
              break;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      var _getNewValueForFieldO = (0, _validation.getNewValueForFieldOp)(config, config, current, newField, newOperator, 'field', true),
          canReuseValue = _getNewValueForFieldO.canReuseValue,
          newValue = _getNewValueForFieldO.newValue,
          newValueSrc = _getNewValueForFieldO.newValueSrc,
          newValueType = _getNewValueForFieldO.newValueType;

      var newOperatorOptions = canReuseValue ? currentOperatorOptions : (0, _defaultUtils.defaultOperatorOptions)(config, newOperator, newField);
      return current.set('field', newField).set('operator', newOperator).set('operatorOptions', newOperatorOptions).set('value', newValue).set('valueSrc', newValueSrc).set('valueType', newValueType);
    });
  });
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */


var setOperator = function setOperator(state, path, newOperator, config) {
  return state.updateIn((0, _treeUtils.expandTreePath)(path, 'properties'), function (map) {
    return map.withMutations(function (current) {
      var currentField = current.get('field');
      var currentOperatorOptions = current.get('operatorOptions');

      var _currentValue = current.get('value', new _immutable["default"].List());

      var _currentValueSrc = current.get('valueSrc', new _immutable["default"].List());

      var _currentOperator = current.get('operator');

      var _getNewValueForFieldO2 = (0, _validation.getNewValueForFieldOp)(config, config, current, currentField, newOperator, 'operator', true),
          canReuseValue = _getNewValueForFieldO2.canReuseValue,
          newValue = _getNewValueForFieldO2.newValue,
          newValueSrc = _getNewValueForFieldO2.newValueSrc,
          newValueType = _getNewValueForFieldO2.newValueType;

      var newOperatorOptions = canReuseValue ? currentOperatorOptions : (0, _defaultUtils.defaultOperatorOptions)(config, newOperator, currentField);
      return current.set('operator', newOperator).set('operatorOptions', newOperatorOptions).set('value', newValue).set('valueSrc', newValueSrc).set('valueType', newValueType);
    });
  });
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 * @param {string} valueType
 * @param {boolean} __isInternal
 */


var setValue = function setValue(state, path, delta, value, valueType, config, __isInternal) {
  var fieldSeparator = config.settings.fieldSeparator;
  if (valueSrc === 'field' && Array.isArray(value)) value = value.join(fieldSeparator);
  var valueSrc = state.getIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueSrc', delta + '')) || null;
  var field = state.getIn((0, _treeUtils.expandTreePath)(path, 'properties', 'field')) || null;
  var operator = state.getIn((0, _treeUtils.expandTreePath)(path, 'properties', 'operator')) || null;
  var isEndValue = false;
  var canFix = false;
  var calculatedValueType = valueType || calculateValueType(value, valueSrc, config);

  var _validateValue = (0, _validation.validateValue)(config, field, field, operator, value, calculatedValueType, valueSrc, canFix, isEndValue),
      _validateValue2 = _slicedToArray(_validateValue, 2),
      validateError = _validateValue2[0],
      fixedValue = _validateValue2[1];

  var isValid = !validateError;

  if (isValid && canFix && fixedValue !== value) {
    value = fixedValue;
  }

  if (isValid) {
    if (typeof value === "undefined") {
      state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'value', delta + ''), undefined);
      state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueType', delta + ''), null);
    } else {
      var lastValue = state.getIn((0, _treeUtils.expandTreePath)(path, 'properties', 'value', delta + ''));
      var isLastEmpty = lastValue == undefined;
      state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'value', delta + ''), value);
      state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueType', delta + ''), calculatedValueType);
      state.__isInternalValueChange = __isInternal && !isLastEmpty;
    }
  }

  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */


var setValueSrc = function setValueSrc(state, path, delta, srcKey) {
  state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'value', delta + ''), undefined);
  state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueType', delta + ''), null);

  if (typeof srcKey === "undefined") {
    state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueSrc', delta + ''), null);
  } else {
    state = state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'valueSrc', delta + ''), srcKey);
  }

  return state;
};
/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */


var setOperatorOption = function setOperatorOption(state, path, name, value) {
  return state.setIn((0, _treeUtils.expandTreePath)(path, 'properties', 'operatorOptions', name), value);
};
/**
 *
 */


var calculateValueType = function calculateValueType(value, valueSrc, config) {
  var calculatedValueType = null;

  if (value) {
    if (valueSrc === 'field') {
      var fieldConfig = (0, _configUtils.getFieldConfig)(value, config);

      if (fieldConfig) {
        calculatedValueType = fieldConfig.type;
      }
    } else if (valueSrc === 'func') {
      var funcKey = value.get('func');

      if (funcKey) {
        var funcConfig = (0, _configUtils.getFuncConfig)(funcKey, config);

        if (funcConfig) {
          calculatedValueType = funcConfig.returnType;
        }
      }
    }
  }

  return calculatedValueType;
};

var emptyDrag = {
  dragging: {
    id: null,
    x: null,
    y: null,
    w: null,
    h: null
  },
  mousePos: {},
  dragStart: {
    id: null
  }
};
/**
 * @param {Immutable.Map} state
 * @param {object} action
 */

var _default = function _default(config) {
  var emptyTree = (0, _defaultUtils.defaultRoot)(config);
  var emptyState = Object.assign({}, {
    tree: emptyTree
  }, emptyDrag);
  var unset = {
    __isInternalValueChange: undefined
  };
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : emptyState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case constants.SET_TREE:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: action.tree
        });

      case constants.ADD_NEW_GROUP:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: addNewGroup(state.tree, action.path, action.properties, action.config)
        });

      case constants.ADD_GROUP:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: addItem(state.tree, action.path, 'group', action.id, action.properties)
        });

      case constants.REMOVE_GROUP:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: removeGroup(state.tree, action.path, action.config)
        });

      case constants.ADD_RULE:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: addItem(state.tree, action.path, 'rule', action.id, action.properties)
        });

      case constants.REMOVE_RULE:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: removeRule(state.tree, action.path, action.config)
        });

      case constants.SET_CONJUNCTION:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setConjunction(state.tree, action.path, action.conjunction)
        });

      case constants.SET_NOT:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setNot(state.tree, action.path, action.not)
        });

      case constants.ADD_RULE_ACTION:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: addItem(state.tree, action.path, 'ruleAction', action.id, action.properties)
        });

      case constants.REMOVE_RULE_ACTION:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: removeItem(state.tree, action.path)
        });

      case constants.SET_RULE_ACTION:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setRuleAction(state.tree, action.path, action.value)
        });

      case constants.SET_FIELD:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setField(state.tree, action.path, action.field, action.config)
        });

      case constants.SET_OPERATOR:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setOperator(state.tree, action.path, action.operator, action.config)
        });

      case constants.SET_VALUE:
        var set = {};
        var tree = setValue(state.tree, action.path, action.delta, action.value, action.valueType, action.config, action.__isInternal);
        if (tree.__isInternalValueChange) set.__isInternalValueChange = true;
        return Object.assign({}, state, _objectSpread({}, unset, {}, set), {
          tree: tree
        });

      case constants.SET_VALUE_SRC:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setValueSrc(state.tree, action.path, action.delta, action.srcKey)
        });

      case constants.SET_OPERATOR_OPTION:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: setOperatorOption(state.tree, action.path, action.name, action.value)
        });

      case constants.MOVE_ITEM:
        return Object.assign({}, state, _objectSpread({}, unset), {
          tree: moveItem(state.tree, action.fromPath, action.toPath, action.placement, action.config)
        });

      case constants.SET_DRAG_START:
        return Object.assign({}, state, _objectSpread({}, unset), {
          dragStart: action.dragStart,
          dragging: action.dragging,
          mousePos: action.mousePos
        });

      case constants.SET_DRAG_PROGRESS:
        return Object.assign({}, state, _objectSpread({}, unset), {
          mousePos: action.mousePos,
          dragging: action.dragging
        });

      case constants.SET_DRAG_END:
        return Object.assign({}, state, _objectSpread({}, unset), emptyDrag);

      default:
        return state;
    }
  };
};

exports["default"] = _default;