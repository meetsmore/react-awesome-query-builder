'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonLogicFormat = void 0;

var _stuff = require("../utils/stuff");

var _configUtils = require("../utils/configUtils");

var _defaultUtils = require("../utils/defaultUtils");

var _funcUtils = require("../utils/funcUtils");

var _uuid = _interopRequireDefault(require("../utils/uuid"));

var _immutable = require("immutable");

var _omit = _interopRequireDefault(require("lodash/omit"));

var _pick = _interopRequireDefault(require("lodash/pick"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// http://jsonlogic.com/
var jsonLogicFormat = function jsonLogicFormat(item, config) {
  var meta = {
    usedFields: [],
    errors: []
  };
  var logic = jsonLogicFormatItem(item, config, meta); // build empty data

  var errors = meta.errors,
      usedFields = meta.usedFields;
  var fieldSeparator = config.settings.fieldSeparator;
  var data = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = usedFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var ff = _step.value;
      var parts = ff.split(fieldSeparator);
      var tmp = data;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];

        if (i != parts.length - 1) {
          if (!tmp[p]) tmp[p] = {};
          tmp = tmp[p];
        } else {
          tmp[p] = null;
        }
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

  return {
    errors: errors,
    logic: logic,
    data: data
  };
}; //meta is mutable


exports.jsonLogicFormat = jsonLogicFormat;

var jsonLogicFormatValue = function jsonLogicFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition) {
  if (currentValue === undefined) return undefined;
  var fieldSeparator = config.settings.fieldSeparator;
  var ret;

  if (valueSrc == 'field') {
    var rightField = currentValue;

    if (rightField) {
      var rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField;
      ret = {
        "var": rightFieldName
      };
      if (meta.usedFields.indexOf(rightFieldName) == -1) meta.usedFields.push(rightFieldName);
    }
  } else if (valueSrc == 'func') {
    var funcKey = currentValue.get('func');
    var args = currentValue.get('args');
    var funcConfig = (0, _configUtils.getFuncConfig)(funcKey, config);

    if (!funcConfig.jsonLogic) {
      meta.errors.push("Func ".concat(funcKey, " is not supported"));
      return undefined;
    }

    var formattedArgs = {};

    for (var argKey in funcConfig.args) {
      var argConfig = funcConfig.args[argKey];
      var fieldDef = (0, _configUtils.getFieldConfig)(argConfig, config);
      var argVal = args ? args.get(argKey) : undefined;
      var argValue = argVal ? argVal.get('value') : undefined;
      var argValueSrc = argVal ? argVal.get('valueSrc') : undefined;
      var formattedArgVal = jsonLogicFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null);

      if (argValue != undefined && formattedArgVal === undefined) {
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
        return undefined;
      }

      if (formattedArgVal !== undefined) {
        // skip optional in the end
        formattedArgs[argKey] = formattedArgVal;
      }
    }

    var formattedArgsArr = Object.values(formattedArgs);

    if (typeof funcConfig.jsonLogic === 'function') {
      var fn = funcConfig.jsonLogic;
      var _args = [formattedArgs];
      ret = fn.apply(void 0, _args);
    } else {
      var funcName = funcConfig.jsonLogic || funcKey;
      var isMethod = !!funcConfig.jsonLogicIsMethod;

      if (isMethod) {
        var _formattedArgsArr = _toArray(formattedArgsArr),
            obj = _formattedArgsArr[0],
            params = _formattedArgsArr.slice(1);

        if (params.length) {
          ret = {
            "method": [obj, funcName, params]
          };
        } else {
          ret = {
            "method": [obj, funcName]
          };
        }
      } else {
        ret = _defineProperty({}, funcName, formattedArgsArr);
      }
    }
  } else {
    if (typeof fieldWidgetDefinition.jsonLogic === 'function') {
      var _fn = fieldWidgetDefinition.jsonLogic;
      var _args2 = [currentValue, (0, _pick["default"])(fieldDefinition, ['fieldSettings', 'listValues']), //useful options: valueFormat for date/time
      (0, _omit["default"])(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue', 'sqlFormatValue', 'jsonLogic'])];

      if (operator) {
        _args2.push(operator);

        _args2.push(operatorDefinition);
      }

      ret = _fn.apply(void 0, _args2);
    } else {
      ret = currentValue;
    }
  }

  return ret;
}; //meta is mutable


var jsonLogicFormatItem = function jsonLogicFormatItem(item, config, meta) {
  if (!item) return undefined;
  var type = item.get('type');
  var properties = item.get('properties') || new _immutable.Map();
  var children = item.get('children1');

  if (type === 'group' && children && children.size) {
    var list = children.filter(function (currentChild) {
      return currentChild.get('type') !== 'ruleAction';
    }).map(function (currentChild) {
      return jsonLogicFormatItem(currentChild, config, meta);
    }).filter(function (currentChild) {
      return typeof currentChild !== 'undefined';
    });
    if (!list.size) return undefined;
    var conjunction = properties.get('conjunction');
    if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
    var conj = conjunction.toLowerCase();
    var not = properties.get('not');
    var resultQuery;

    if (list.size == 1) {
      resultQuery = list.first();
    } else if (conj === 'if') {
      // handle if together with rule actions
      resultQuery = list.toList().toJS();
    } else {
      resultQuery = _defineProperty({}, conj, list.toList().toJS());
    }

    if (not) {
      resultQuery = {
        "!": resultQuery
      };
    }

    var ruleActions = children.filter(function (currentChild) {
      return currentChild.get('type') === 'ruleAction';
    });

    if (ruleActions.size) {
      var ruleActionsValues = Object.values(ruleActions.map(function (ra) {
        return ra.get('properties').get('value');
      }).toJS());

      if (conj === 'if') {
        if (!Array.isArray(resultQuery)) {
          resultQuery = [resultQuery];
        }

        resultQuery = {
          firstMatch: [].concat(_toConsumableArray(resultQuery), [ruleActionsValues])
        };
      } else {
        resultQuery = {
          "if": [resultQuery, ruleActionsValues, []]
        };
      }
    }

    return resultQuery;
  } else if (type === 'rule') {
    var operator = properties.get('operator');
    var operatorOptions = properties.get('operatorOptions');
    operatorOptions = operatorOptions ? operatorOptions.toJS() : null;
    if (operatorOptions && !Object.keys(operatorOptions).length) operatorOptions = null;
    var field = properties.get('field');
    var value = properties.get('value');
    if (field == null || operator == null) return undefined;
    var fieldDefinition = (0, _configUtils.getFieldConfig)(field, config) || {};
    var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
    var reversedOp = operatorDefinition.reversedOp;
    var revOperatorDefinition = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};

    var _fieldType = fieldDefinition.type || "undefined";

    var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
    var isReverseArgs = (0, _stuff.defaultValue)(operatorDefinition._jsonLogicIsRevArgs, false); // check op

    var isRev = false;

    if (!operatorDefinition.jsonLogic && revOperatorDefinition.jsonLogic) {
      isRev = true;
      var _ref = [reversedOp, operator];
      operator = _ref[0];
      reversedOp = _ref[1];
      var _ref2 = [revOperatorDefinition, operatorDefinition];
      operatorDefinition = _ref2[0];
      revOperatorDefinition = _ref2[1];
    }

    if (!operatorDefinition.jsonLogic) {
      meta.errors.push("Operator ".concat(operator, " is not supported"));
      return undefined;
    } // format value


    var valueSrcs = [];
    var valueTypes = [];
    var _usedFields = meta.usedFields;
    value = value.map(function (currentValue, ind) {
      var valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
      var valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
      currentValue = (0, _funcUtils.completeValue)(currentValue, valueSrc, config);
      var widget = (0, _configUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
      var fieldWidgetDefinition = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ['factory']);
      var fv = jsonLogicFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition);

      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }

      return fv;
    });
    var hasUndefinedValues = value.filter(function (v) {
      return v === undefined;
    }).size > 0;

    if (value.size < cardinality || hasUndefinedValues) {
      meta.usedFields = _usedFields; // restore

      return undefined;
    }

    var formattedValue = cardinality > 1 ? value.toArray() : cardinality == 1 ? value.first() : null; // format field

    var fieldName = field;
    var formattedField = {
      "var": fieldName
    };
    if (meta.usedFields.indexOf(fieldName) == -1) meta.usedFields.push(fieldName); // format logic

    var formatteOp = operator;
    if (typeof operatorDefinition.jsonLogic == 'string') formatteOp = operatorDefinition.jsonLogic;
    var fn = typeof operatorDefinition.jsonLogic == 'function' ? operatorDefinition.jsonLogic : null;

    if (!fn) {
      var rangeOps = ['<', '<=', '>', '>='];

      fn = function fn(field, op, val, opDef, opOpts) {
        if (cardinality == 0) return _defineProperty({}, formatteOp, formattedField);else if (cardinality == 1 && isReverseArgs) return _defineProperty({}, formatteOp, [formattedValue, formattedField]);else if (cardinality == 1) return _defineProperty({}, formatteOp, [formattedField, formattedValue]);else if (cardinality == 2 && rangeOps.includes(formatteOp)) return _defineProperty({}, formatteOp, [formattedValue[0], formattedField, formattedValue[1]]);else return _defineProperty({}, formatteOp, [formattedField].concat(_toConsumableArray(formattedValue)));
      };
    }

    var args = [formattedField, operator, formattedValue, (0, _omit["default"])(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp', 'jsonLogic']), operatorOptions];
    var ruleQuery = fn.apply(void 0, args);

    if (isRev) {
      ruleQuery = {
        "!": ruleQuery
      };
    }

    return ruleQuery;
  }

  return undefined;
};