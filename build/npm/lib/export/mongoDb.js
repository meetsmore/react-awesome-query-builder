'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongodbFormat = void 0;

var _stuff = require("../utils/stuff");

var _configUtils = require("../utils/configUtils");

var _defaultUtils = require("../utils/defaultUtils");

var _funcUtils = require("../utils/funcUtils");

var _omit = _interopRequireDefault(require("lodash/omit"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _immutable = require("immutable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var mongodbFormat = function mongodbFormat(tree, config) {
  var meta = {
    errors: []
  };
  var res = mongodbFormatItem(tree, config, meta);
  if (meta.errors.length) console.warn("Errors while exporting to MongoDb:", meta.errors);
  return res;
}; //meta is mutable


exports.mongodbFormat = mongodbFormat;

var mongoFormatValue = function mongoFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition) {
  if (currentValue === undefined) return [undefined, false];
  var fieldSeparator = config.settings.fieldSeparator;
  var ret;
  var useExpr = false;

  if (valueSrc == 'field') {
    //format field
    var rightField = currentValue;

    if (rightField) {
      var rightFieldDefinition = (0, _configUtils.getFieldConfig)(rightField, config) || {};
      var fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);

      var _fieldKeys = (0, _configUtils.getFieldPath)(rightField, config);

      var fieldPartsLabels = (0, _configUtils.getFieldPathLabels)(rightField, config);
      var fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
      var formatField = config.settings.formatField || defaultSettings.formatField;
      var rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField; // if (rightFieldDefinition.tableName) {
      //     const fieldPartsCopy = [...fieldParts];
      //     fieldPartsCopy[0] = rightFieldDefinition.tableName;
      //     rightFieldName = fieldPartsCopy.join(fieldSeparator);
      // }

      var formattedField = formatField(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config, false);
      ret = "$" + formattedField;
      useExpr = true;
    }
  } else if (valueSrc == 'func') {
    useExpr = true;
    var funcKey = currentValue.get('func');
    var args = currentValue.get('args');
    var funcConfig = (0, _configUtils.getFuncConfig)(funcKey, config);
    var funcName = funcConfig.mongoFunc || funcKey;
    var mongoArgsAsObject = funcConfig.mongoArgsAsObject;
    var formattedArgs = {};
    var argsCnt = 0;
    var lastArg = undefined;

    for (var argKey in funcConfig.args) {
      var argConfig = funcConfig.args[argKey];
      var fieldDef = (0, _configUtils.getFieldConfig)(argConfig, config);
      var argVal = args ? args.get(argKey) : undefined;
      var argValue = argVal ? argVal.get('value') : undefined;
      var argValueSrc = argVal ? argVal.get('valueSrc') : undefined;

      var _mongoFormatValue = mongoFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null),
          _mongoFormatValue2 = _slicedToArray(_mongoFormatValue, 2),
          formattedArgVal = _mongoFormatValue2[0],
          _argUseExpr = _mongoFormatValue2[1];

      if (argValue != undefined && formattedArgVal === undefined) {
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
        return [undefined, false];
      }

      argsCnt++;

      if (formattedArgVal !== undefined) {
        // skip optional in the end
        formattedArgs[argKey] = formattedArgVal;
        lastArg = formattedArgVal;
      }
    }

    if (typeof funcConfig.mongoFormatFunc === 'function') {
      var fn = funcConfig.mongoFormatFunc;
      var _args = [formattedArgs];
      ret = fn.apply(void 0, _args);
    } else {
      if (mongoArgsAsObject) ret = _defineProperty({}, funcName, formattedArgs);else if (argsCnt == 1 && lastArg !== undefined) ret = _defineProperty({}, funcName, lastArg);else ret = _defineProperty({}, funcName, Object.values(formattedArgs));
    }
  } else {
    if (typeof fieldWidgetDefinition.mongoFormatValue === 'function') {
      var _fn = fieldWidgetDefinition.mongoFormatValue;
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

  return [ret, useExpr];
}; //meta is mutable


var mongodbFormatItem = function mongodbFormatItem(item, config, meta) {
  var _not = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (!item) return undefined;
  var type = item.get('type');
  var properties = item.get('properties') || new _immutable.Map();
  var children = item.get('children1');

  if (type === 'group' && children && children.size) {
    var not = _not ? !properties.get('not') : properties.get('not');
    var list = children.map(function (currentChild) {
      return mongodbFormatItem(currentChild, config, meta, not);
    }).filter(function (currentChild) {
      return typeof currentChild !== 'undefined';
    });
    if (!list.size) return undefined;
    var conjunction = properties.get('conjunction');
    if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
    var conjunctionDefinition = config.conjunctions[conjunction];
    var reversedConj = conjunctionDefinition.reversedConj;

    if (not && reversedConj) {
      conjunction = reversedConj;
      conjunctionDefinition = config.conjunctions[conjunction];
    }

    var mongoConj = conjunctionDefinition.mongoConj;
    var resultQuery;
    if (list.size == 1) resultQuery = list.first();else {
      var rules = list.toList().toJS();
      var canShort = mongoConj == '$and';

      if (canShort) {
        resultQuery = rules.reduce(function (acc, rule) {
          if (!acc) return undefined;

          for (var k in rule) {
            if (k[0] == '$') {
              acc = undefined;
              break;
            }

            acc[k] = rule[k];
          }

          return acc;
        }, {});
      }

      if (!resultQuery) // can't be shorten
        resultQuery = _defineProperty({}, mongoConj, rules);
    }
    return resultQuery;
  } else if (type === 'rule') {
    var operator = properties.get('operator');
    var operatorOptions = properties.get('operatorOptions');
    var field = properties.get('field');
    var value = properties.get('value');
    if (field == null || operator == null) return undefined;
    var fieldDefinition = (0, _configUtils.getFieldConfig)(field, config) || {};
    var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
    var reversedOp = operatorDefinition.reversedOp;
    var revOperatorDefinition = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};
    var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);

    if (_not) {
      var _ref = [reversedOp, operator];
      operator = _ref[0];
      reversedOp = _ref[1];
      var _ref2 = [revOperatorDefinition, operatorDefinition];
      operatorDefinition = _ref2[0];
      revOperatorDefinition = _ref2[1];
    } //format field


    var fieldName = field; // if (fieldDefinition.tableName) {
    //   let fieldParts = Array.isArray(field) ? [...field] : field.split(fieldSeparator);
    //   fieldParts[0] = fieldDefinition.tableName;
    //   fieldName = fieldParts.join(fieldSeparator);
    // }
    //format value

    var valueSrcs = [];
    var valueTypes = [];
    var useExpr = false;
    value = value.map(function (currentValue, ind) {
      var valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
      var valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
      currentValue = (0, _funcUtils.completeValue)(currentValue, valueSrc, config);
      var widget = (0, _configUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
      var fieldWidgetDefinition = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ['factory']);

      var _mongoFormatValue3 = mongoFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition),
          _mongoFormatValue4 = _slicedToArray(_mongoFormatValue3, 2),
          fv = _mongoFormatValue4[0],
          _useExpr = _mongoFormatValue4[1];

      if (fv !== undefined) {
        useExpr = useExpr || _useExpr;
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }

      return fv;
    });
    var hasUndefinedValues = value.filter(function (v) {
      return v === undefined;
    }).size > 0;
    if (value.size < cardinality || hasUndefinedValues) return undefined;
    var formattedValue = cardinality > 1 ? value.toArray() : cardinality == 1 ? value.first() : null; //build rule

    var fn = operatorDefinition.mongoFormatOp;

    if (!fn) {
      meta.errors.push("Operator ".concat(operator, " is not supported"));
      return undefined;
    }

    var args = [fieldName, operator, formattedValue, useExpr, valueSrcs.length > 1 ? valueSrcs : valueSrcs[0], valueTypes.length > 1 ? valueTypes : valueTypes[0], (0, _omit["default"])(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp', 'jsonLogic']), operatorOptions];
    var ruleQuery = fn.apply(void 0, args);

    if (ruleQuery && useExpr) {
      ruleQuery = {
        '$expr': ruleQuery
      };
    }

    return ruleQuery;
  }

  return undefined;
};