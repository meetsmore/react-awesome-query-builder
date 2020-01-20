"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setArgValueSrc = exports.setArgValue = exports.setFunc = exports.completeFuncValue = exports.completeValue = void 0;

var _configUtils = require("../utils/configUtils");

var _immutable = _interopRequireDefault(require("immutable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @param {*} value
 * @param {string} valueSrc - 'value' | 'field' | 'func'
 * @param {object} config
 * @return {* | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
var completeValue = function completeValue(value, valueSrc, config) {
  if (valueSrc == 'func') return completeFuncValue(value, config);else return value;
};
/**
 * @param {Immutable.Map} value
 * @param {object} config
 * @return {Immutable.Map | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */


exports.completeValue = completeValue;

var completeFuncValue = function completeFuncValue(value, config) {
  var _checkFuncValue = function _checkFuncValue(value) {
    if (!value) return undefined;
    var funcKey = value.get('func');
    var funcConfig = funcKey && (0, _configUtils.getFuncConfig)(funcKey, config);
    if (!funcConfig) return undefined;
    var complValue = value;
    var tmpHasOptional = false;

    for (var argKey in funcConfig.args) {
      var argConfig = funcConfig.args[argKey];
      var args = complValue.get('args');
      var argVal = args ? args.get(argKey) : undefined;
      var argValue = argVal ? argVal.get('value') : undefined;
      var argValueSrc = argVal ? argVal.get('valueSrc') : undefined;

      if (argValue !== undefined) {
        var completeArgValue = completeValue(argValue, argValueSrc, config);

        if (completeArgValue === undefined) {
          return undefined;
        } else if (completeArgValue !== argValue) {
          complValue = complValue.setIn(['args', argKey, 'value'], completeArgValue);
        }

        if (tmpHasOptional) {
          // has gap
          return undefined;
        }
      } else if (argConfig.defaultValue !== undefined) {
        complValue = complValue.setIn(['args', argKey, 'value'], argConfig.defaultValue);
        complValue = complValue.setIn(['args', argKey, 'valueSrc'], 'value');
      } else if (argConfig.isOptional) {
        // optional
        tmpHasOptional = true;
      } else {
        // missing value
        return undefined;
      }
    }

    return complValue;
  };

  return _checkFuncValue(value);
};
/**
 * @param {Immutable.Map} value 
 * @return {array} - [usedFields, badFields]
 */


exports.completeFuncValue = completeFuncValue;

var getUsedFieldsInFuncValue = function getUsedFieldsInFuncValue(value, config) {
  var usedFields = [];
  var badFields = [];

  var _traverse = function _traverse(value) {
    var args = value && value.get('args');
    if (!args) return;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = args.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var arg = _step.value;

        if (arg.get('valueSrc') == 'field') {
          var rightField = arg.get('value');

          if (rightField) {
            var rightFieldDefinition = config ? (0, _configUtils.getFieldConfig)(rightField, config) : undefined;
            if (config && !rightFieldDefinition) badFields.push(rightField);else usedFields.push(rightField);
          }
        } else if (arg.get('valueSrc') == 'func') {
          _traverse(arg.get('value'));
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
  };

  _traverse(value);

  return [usedFields, badFields];
};
/**
 * Used @ FuncWidget
 * @param {Immutable.Map} value 
 * @param {string} funcKey 
 * @param {object} config 
 */


var setFunc = function setFunc(value, funcKey, config) {
  var fieldSeparator = config.settings.fieldSeparator;
  value = value || new _immutable["default"].Map();

  if (Array.isArray(funcKey)) {
    // fix for cascader
    funcKey = funcKey.join(fieldSeparator);
  }

  value = value.set('func', funcKey);
  value = value.set('args', new _immutable["default"].Map()); // defaults

  var funcConfig = funcKey && (0, _configUtils.getFuncConfig)(funcKey, config);

  if (funcConfig) {
    for (var argKey in funcConfig.args) {
      var argConfig = funcConfig.args[argKey];

      if (argConfig.defaultValue !== undefined) {
        value = value.setIn(['args', argKey, 'value'], argConfig.defaultValue);
      }
    }
  }

  return value;
};
/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {*} argVal 
*/


exports.setFunc = setFunc;

var setArgValue = function setArgValue(value, argKey, argVal) {
  if (value && value.get('func')) {
    value = value.setIn(['args', argKey, 'value'], argVal);
  }

  return value;
};
/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {string} argValSrc 
*/


exports.setArgValue = setArgValue;

var setArgValueSrc = function setArgValueSrc(value, argKey, argValSrc) {
  if (value && value.get('func')) {
    value = value.setIn(['args', argKey], new _immutable["default"].Map({
      valueSrc: argValSrc
    }));
  }

  return value;
};

exports.setArgValueSrc = setArgValueSrc;