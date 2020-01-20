"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNewValueForFieldOp = exports.validateValue = exports.validateTree = void 0;

var _configUtils = require("./configUtils");

var _stuff = require("../utils/stuff");

var _defaultUtils = require("../utils/defaultUtils");

var _omit = _interopRequireDefault(require("lodash/omit"));

var _immutable = _interopRequireDefault(require("immutable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var typeOf = function typeOf(v) {
  if (_typeof(v) == 'object' && v !== null && Array.isArray(v)) return 'array';else return _typeof(v);
};

var isTypeOf = function isTypeOf(v, type) {
  if (typeOf(v) == type) return true;
  if (type == 'number' && !isNaN(v)) return true; //can be casted

  return false;
};

var validateTree = function validateTree(tree, _oldTree, config, oldConfig) {
  var removeEmptyGroups = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var removeInvalidRules = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var c = {
    config: config,
    oldConfig: oldConfig,
    removeEmptyGroups: removeEmptyGroups,
    removeInvalidRules: removeInvalidRules
  };
  return validateItem(tree, [], null, {}, c);
};

exports.validateTree = validateTree;

function validateItem(item, path, itemId, meta, c) {
  var type = item.get('type');
  var children = item.get('children1');

  if (type === 'group' && children && children.size) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === 'rule') {
    return validateRule(item, path, itemId, meta, c);
  } else if (type === 'ruleAction') {
    return validateRuleAction(item, path, itemId, meta, c);
  } else {
    return item;
  }
}

;

function validateRuleAction(item, path, itemId, meta, c) {
  var id = item.get('id');

  if (!id && itemId) {
    id = itemId;
    item = item.set('id', id);
    meta.sanitized = true;
  }

  return item;
}

function validateGroup(item, path, itemId, meta, c) {
  var removeEmptyGroups = c.removeEmptyGroups;
  var id = item.get('id');
  var children = item.get('children1');
  var oldChildren = children;

  if (!id && itemId) {
    id = itemId;
    item = item.set('id', id);
    meta.sanitized = true;
  } //validate children


  var submeta = {};
  children = children.map(function (currentChild, childId) {
    return validateItem(currentChild, path.concat(id), childId, submeta, c);
  });
  if (removeEmptyGroups) children = children.filter(function (currentChild) {
    return currentChild != undefined;
  });
  var sanitized = submeta.sanitized || oldChildren.size != children.size;

  if (!children.size && removeEmptyGroups && path.length) {
    sanitized = true;
    item = undefined;
  }

  if (sanitized) meta.sanitized = true;
  if (sanitized && item) item = item.set('children1', children);
  return item;
}

;

function validateRule(item, path, itemId, meta, c) {
  var removeInvalidRules = c.removeInvalidRules,
      config = c.config,
      oldConfig = c.oldConfig;
  var id = item.get('id');
  var properties = item.get('properties');
  var field = properties.get('field');
  var operator = properties.get('operator');
  var operatorOptions = properties.get('operatorOptions');
  var valueSrc = properties.get('valueSrc');
  var value = properties.get('value');
  var oldSerialized = {
    field: field,
    operator: operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null
  };

  var _wasValid = field && operator && value && !value.find(function (v, ind) {
    return v === undefined;
  });

  if (!id && itemId) {
    id = itemId;
    item = item.set('id', id);
    meta.sanitized = true;
  } //validate field


  var fieldDefinition = field ? (0, _configUtils.getFieldConfig)(field, config) : null;
  if (!fieldDefinition) field = null;

  if (field == null) {
    properties = ['operator', 'operatorOptions', 'valueSrc', 'value'].reduce(function (map, key) {
      return map["delete"](key);
    }, properties);
    operator = null;
  } //validate operator


  operator = properties.get('operator');
  var operatorDefinition = operator ? (0, _configUtils.getOperatorConfig)(config, operator, field) : null;
  if (!operatorDefinition) operator = null;
  var availOps = field ? (0, _configUtils.getOperatorsForField)(config, field) : [];
  if (availOps.indexOf(operator) == -1) operator = null;

  if (operator == null) {
    properties = properties["delete"]('operatorOptions');
    properties = properties["delete"]('valueSrc');
    properties = properties["delete"]('value');
  } //validate operator options


  operatorOptions = properties.get('operatorOptions');

  var _operatorCardinality = operator ? (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1) : null;

  if (!operator || operatorOptions && !operatorDefinition.options) {
    operatorOptions = null;
    properties = properties["delete"]('operatorOptions');
  } else if (operator && !operatorOptions && operatorDefinition.options) {
    operatorOptions = (0, _defaultUtils.defaultOperatorOptions)(config, operator, field);
    properties = properties.set('operatorOptions', operatorOptions);
  } //validate values


  valueSrc = properties.get('valueSrc');
  value = properties.get('value');

  var _getNewValueForFieldO = getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, true),
      newValue = _getNewValueForFieldO.newValue,
      newValueSrc = _getNewValueForFieldO.newValueSrc;

  value = newValue;
  valueSrc = newValueSrc;
  properties = properties.set('value', value);
  properties = properties.set('valueSrc', valueSrc);
  var newSerialized = {
    field: field,
    operator: operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null
  };
  var sanitized = !(0, _stuff.deepEqual)(oldSerialized, newSerialized);
  var isValid = field && operator && value && !value.find(function (v, _ind) {
    return v === undefined;
  });
  if (sanitized) meta.sanitized = true;
  if (sanitized && !isValid && removeInvalidRules) item = undefined;
  if (sanitized && item) item = item.set('properties', properties);
  return item;
}

;
/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @param {bool} isRawValue false is used only internally from validateFuncValue
 * @return {array} [validError, fixedValue] - if validError === null and canFix == true, fixedValue can differ from value if was fixed
 */

var validateValue = function validateValue(config, leftField, field, operator, value, valueType, valueSrc) {
  var canFix = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var isEndValue = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var isRawValue = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : true;
  var validError = null;
  var fixedValue = value;

  if (value != null) {
    if (valueSrc == 'field') {
      var _validateFieldValue = validateFieldValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);

      var _validateFieldValue2 = _slicedToArray(_validateFieldValue, 2);

      validError = _validateFieldValue2[0];
      fixedValue = _validateFieldValue2[1];
    } else if (valueSrc == 'func') {
      var _validateFuncValue = validateFuncValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);

      var _validateFuncValue2 = _slicedToArray(_validateFuncValue, 2);

      validError = _validateFuncValue2[0];
      fixedValue = _validateFuncValue2[1];
    } else if (valueSrc == 'value' || !valueSrc) {
      var _validateNormalValue = validateNormalValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);

      var _validateNormalValue2 = _slicedToArray(_validateNormalValue, 2);

      validError = _validateNormalValue2[0];
      fixedValue = _validateNormalValue2[1];
    }

    if (!validError) {
      var fieldConfig = (0, _configUtils.getFieldConfig)(field, config);
      var w = (0, _configUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
      var fieldWidgetDefinition = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, w, valueSrc), ['factory', 'formatValue']);
      var rightFieldDefinition = valueSrc == 'field' ? (0, _configUtils.getFieldConfig)(value, config) : null;
      var fn = fieldWidgetDefinition.validateValue;

      if (typeof fn == 'function') {
        var args = [fixedValue, //field,
        fieldConfig];
        if (valueSrc == 'field') args.push(rightFieldDefinition);
        var validResult = fn.apply(void 0, args);

        if (typeof validResult == "string" || validResult === null) {
          validError = validResult;
        } else {
          if (validError == false) validError = "Invalid value";
        }
      }
    }
  }

  if (isRawValue && validError) {
    validError = "Field ".concat(field, ": ").concat(validError);
    console.warn("[RAQB validate]", validError);
  }

  return [validError, validError ? value : fixedValue];
};
/**
* 
*/


exports.validateValue = validateValue;

var validateNormalValue = function validateNormalValue(leftField, field, value, valueSrc, valueType, config) {
  var operator = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var isEndValue = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var canFix = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var fixedValue = value;
  var fieldConfig = (0, _configUtils.getFieldConfig)(field, config);
  var w = (0, _configUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
  var wConfig = config.widgets[w];
  var wType = wConfig.type;
  var jsType = wConfig.jsType;
  if (valueType != wType) return ["Value should have type ".concat(wType, ", but got value of type ").concat(valueType), value];

  if (jsType && !isTypeOf(value, jsType)) {
    return ["Value should have JS type ".concat(jsType, ", but got value of type ").concat(_typeof(value)), value];
  }

  var fieldSettings = fieldConfig.fieldSettings;

  if (fieldSettings) {
    if (fieldSettings.listValues && !fieldSettings.allowCustomValues) {
      if (value instanceof Array) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var v = _step.value;

            if ((0, _stuff.getTitleInListValues)(fieldSettings.listValues, v) == undefined) {
              return ["Value ".concat(v, " is not in list of values"), value];
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
      } else {
        if ((0, _stuff.getTitleInListValues)(fieldSettings.listValues, value) == undefined) {
          return ["Value ".concat(value, " is not in list of values"), value];
        }
      }
    }

    if (fieldSettings.min != null && value < fieldSettings.min) {
      return ["Value ".concat(value, " < min ").concat(fieldSettings.min), value];
    }

    if (fieldSettings.max != null && value > fieldSettings.max) {
      return ["Value ".concat(value, " > max ").concat(fieldSettings.max), value];
    }
  }

  return [null, value];
};
/**
* 
*/


var validateFieldValue = function validateFieldValue(leftField, field, value, _valueSrc, valueType, config) {
  var operator = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var isEndValue = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var canFix = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var fieldSeparator = config.settings.fieldSeparator;
  var leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  var rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  var rightFieldDefinition = (0, _configUtils.getFieldConfig)(value, config);
  if (!rightFieldDefinition) return ["Unknown field ".concat(value), value];
  if (rightFieldStr == leftFieldStr) return ["Can't compare field ".concat(leftField, " with itself"), value];
  if (valueType && valueType != rightFieldDefinition.type) return ["Field ".concat(value, " is of type ").concat(rightFieldDefinition.type, ", but expected ").concat(valueType), value];
  return [null, value];
};
/**
* 
*/


var validateFuncValue = function validateFuncValue(leftField, field, value, _valueSrc, valueType, config) {
  var operator = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var isEndValue = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var canFix = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var fixedValue = value;

  if (value) {
    var funcKey = value.get('func');

    if (funcKey) {
      var funcConfig = (0, _configUtils.getFuncConfig)(funcKey, config);

      if (funcConfig) {
        if (valueType && funcConfig.returnType != valueType) return ["Function ".concat(funcKey, " should return value of type ").concat(funcConfig.returnType, ", but got ").concat(valueType), value];

        for (var argKey in funcConfig.args) {
          var argConfig = funcConfig.args[argKey];
          var args = fixedValue.get('args');
          var argVal = args ? args.get(argKey) : undefined;
          var fieldDef = (0, _configUtils.getFieldConfig)(argConfig, config);
          var argValue = argVal ? argVal.get('value') : undefined;
          var argValueSrc = argVal ? argVal.get('valueSrc') : undefined;

          if (argValue !== undefined) {
            var _validateValue = validateValue(config, leftField, fieldDef, operator, argValue, argConfig.type, argValueSrc, canFix, isEndValue, false),
                _validateValue2 = _slicedToArray(_validateValue, 2),
                argValidError = _validateValue2[0],
                fixedArgVal = _validateValue2[1];

            if (argValidError !== null) {
              if (canFix) {
                fixedValue = fixedValue.deleteIn(['args', argKey]);

                if (argConfig.defaultValue !== undefined) {
                  fixedValue = fixedValue.setIn(['args', argKey, 'value'], argConfig.defaultValue);
                  fixedValue = fixedValue.setIn(['args', argKey, 'valueSrc'], 'value');
                }
              } else {
                return ["Invalid value of arg ".concat(argKey, " for func ").concat(funcKey, ": ").concat(argValidError), value];
              }
            } else if (fixedArgVal !== argValue) {
              fixedValue = fixedValue.setIn(['args', argKey, 'value'], fixedArgVal);
            }
          } else if (isEndValue && argConfig.defaultValue === undefined && !canFix) {
            return ["Value of arg ".concat(argKey, " for func ").concat(funcKey, " is required"), value];
          }
        }
      } else return ["Unknown function ".concat(funcKey), value];
    } // else it's not function value

  } // empty value


  return [null, fixedValue];
};
/**
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @param {string} changedField
 * @return {object} - {canReuseValue, newValue, newValueSrc, newValueType}
 */


var getNewValueForFieldOp = function getNewValueForFieldOp(config) {
  var oldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var current = arguments.length > 2 ? arguments[2] : undefined;
  var newField = arguments.length > 3 ? arguments[3] : undefined;
  var newOperator = arguments.length > 4 ? arguments[4] : undefined;
  var changedField = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var canFix = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
  if (!oldConfig) oldConfig = config;
  var currentField = current.get('field');
  var currentOperator = current.get('operator');
  var currentValue = current.get('value');
  var currentValueSrc = current.get('valueSrc', new _immutable["default"].List());
  var currentValueType = current.get('valueType', new _immutable["default"].List());

  var _currentOperatorConfig = (0, _configUtils.getOperatorConfig)(oldConfig, currentOperator, currentField);

  var newOperatorConfig = (0, _configUtils.getOperatorConfig)(config, newOperator, newField);
  var operatorCardinality = newOperator ? (0, _stuff.defaultValue)(newOperatorConfig.cardinality, 1) : null;
  var currentFieldConfig = (0, _configUtils.getFieldConfig)(currentField, oldConfig);
  var newFieldConfig = (0, _configUtils.getFieldConfig)(newField, config); // get widgets info

  var widgetsMeta = Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var vs = currentValueSrc.get(i) || null;
    var currentWidgets = (0, _configUtils.getWidgetForFieldOp)(oldConfig, currentField, currentOperator, vs);
    var newWidgets = (0, _configUtils.getWidgetForFieldOp)(config, newField, newOperator, vs); // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value

    var currentValueWidgets = vs == 'value' ? currentWidgets : (0, _configUtils.getWidgetForFieldOp)(oldConfig, currentField, currentOperator, 'value');
    var newValueWidgets = vs == 'value' ? newWidgets : (0, _configUtils.getWidgetForFieldOp)(config, newField, newOperator, 'value');
    return {
      currentWidgets: currentWidgets,
      newWidgets: newWidgets,
      currentValueWidgets: currentValueWidgets,
      newValueWidgets: newValueWidgets
    };
  });
  var currentWidgets = widgetsMeta.map(function (_ref) {
    var currentWidgets = _ref.currentWidgets;
    return currentWidgets;
  });
  var newWidgets = widgetsMeta.map(function (_ref2) {
    var newWidgets = _ref2.newWidgets;
    return newWidgets;
  });
  var currentValueWidgets = widgetsMeta.map(function (_ref3) {
    var currentValueWidgets = _ref3.currentValueWidgets;
    return currentValueWidgets;
  });
  var newValueWidgets = widgetsMeta.map(function (_ref4) {
    var newValueWidgets = _ref4.newValueWidgets;
    return newValueWidgets;
  });
  var commonWidgetsCnt = Math.min(newWidgets.length, currentWidgets.length);
  var reusableWidgets = newValueWidgets.filter(function (w) {
    return currentValueWidgets.includes(w);
  });
  var firstWidgetConfig = (0, _configUtils.getFieldWidgetConfig)(config, newField, newOperator, null, currentValueSrc.first());
  var valueSources = (0, _configUtils.getValueSourcesForFieldOp)(config, newField, newOperator);
  var canReuseValue = currentField && currentOperator && newOperator && (!changedField || changedField == 'field' && !config.settings.clearValueOnChangeField || changedField == 'operator' && !config.settings.clearValueOnChangeOp) && currentFieldConfig && newFieldConfig && currentFieldConfig.type == newFieldConfig.type && reusableWidgets.length > 0;
  ;
  var valueFixes = {};

  if (canReuseValue) {
    var _loop = function _loop(i) {
      var v = currentValue.get(i);
      var vType = currentValueType.get(i) || null;
      var vSrc = currentValueSrc.get(i) || null;
      var isValidSrc = valueSources.find(function (v) {
        return v == vSrc;
      }) != null;
      var isEndValue = !canFix;

      var _validateValue3 = validateValue(config, newField, newField, newOperator, v, vType, vSrc, canFix, isEndValue),
          _validateValue4 = _slicedToArray(_validateValue3, 2),
          validateError = _validateValue4[0],
          fixedValue = _validateValue4[1];

      var isValid = !validateError;

      if (!isValidSrc || !isValid) {
        canReuseValue = false;
        return "break";
      } else if (canFix && fixedValue !== v) {
        valueFixes[i] = fixedValue;
      }
    };

    for (var i = 0; i < commonWidgetsCnt; i++) {
      var _ret = _loop(i);

      if (_ret === "break") break;
    }
  }

  var newValue = null,
      newValueSrc = null,
      newValueType = null;
  newValue = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var v = undefined;

    if (canReuseValue) {
      if (i < currentValue.size) {
        v = currentValue.get(i);

        if (valueFixes[i] !== undefined) {
          v = valueFixes[i];
        }
      }
    } else if (operatorCardinality == 1 && (firstWidgetConfig || newFieldConfig)) {
      if (newFieldConfig.defaultValue !== undefined) v = newFieldConfig.defaultValue;else if (newFieldConfig.fieldSettings && newFieldConfig.fieldSettings.defaultValue !== undefined) v = newFieldConfig.fieldSettings.defaultValue;else if (firstWidgetConfig.defaultValue !== undefined) v = firstWidgetConfig.defaultValue;
    }

    return v;
  }));
  newValueSrc = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var vs = null;

    if (canReuseValue) {
      if (i < currentValueSrc.size) vs = currentValueSrc.get(i);
    } else if (valueSources.length == 1) {
      vs = valueSources[0];
    } else if (valueSources.length > 1) {
      vs = valueSources[0];
    }

    return vs;
  }));
  newValueType = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var vt = null;

    if (canReuseValue) {
      if (i < currentValueType.size) vt = currentValueType.get(i);
    } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
      vt = firstWidgetConfig.type;
    }

    return vt;
  }));
  return {
    canReuseValue: canReuseValue,
    newValue: newValue,
    newValueSrc: newValueSrc,
    newValueType: newValueType
  };
};

exports.getNewValueForFieldOp = getNewValueForFieldOp;