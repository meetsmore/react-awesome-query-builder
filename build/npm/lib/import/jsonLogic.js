"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFromJsonLogic = void 0;

var _uuid = _interopRequireDefault(require("../utils/uuid"));

var _stuff = require("../utils/stuff");

var _configUtils = require("../utils/configUtils");

var _tree = require("./tree");

var _defaultUtils = require("../utils/defaultUtils");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

// http://jsonlogic.com/
//meta is mutable
var loadFromJsonLogic = function loadFromJsonLogic(logicTree, config) {
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config);
  var conv = buildConv(extendedConfig);
  var jsTree = convertFromLogic(logicTree, conv, extendedConfig, 'rule', meta);

  if (jsTree && jsTree.type != "group") {
    jsTree = wrapInDefaultConj(jsTree, extendedConfig);
  }

  var immTree = jsTree ? (0, _tree.loadTree)(jsTree) : undefined;
  if (meta.errors.length) console.warn("Errors while importing from JsonLogic:", meta.errors);
  return immTree;
};

exports.loadFromJsonLogic = loadFromJsonLogic;

var buildConv = function buildConv(config) {
  var operators = {};

  for (var opKey in config.operators) {
    var opConfig = config.operators[opKey];

    if (typeof opConfig.jsonLogic == "string") {
      // example: "</2", "#in/1"
      var opk = (opConfig._jsonLogicIsRevArgs ? '#' : '') + opConfig.jsonLogic + "/" + (0, _stuff.defaultValue)(opConfig.cardinality, 1);
      if (!operators[opk]) operators[opk] = [];
      operators[opk].push(opKey);
    }
  }

  var conjunctions = {};

  for (var conjKey in config.conjunctions) {
    var ck = conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  var funcs = {};

  for (var funcKey in config.funcs) {
    var funcConfig = config.funcs[funcKey];

    if (typeof funcConfig.jsonLogic == "string") {
      var fk = (funcConfig.jsonLogicIsMethod ? '#' : '') + funcConfig.jsonLogic;
      if (!funcs[fk]) funcs[fk] = [];
      funcs[fk].push(funcKey);
    }
  }

  return {
    operators: operators,
    conjunctions: conjunctions,
    funcs: funcs
  };
};

var convertFromLogic = function convertFromLogic(logic, conv, config, expectedType, meta) {
  var not = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var fieldConfig = arguments.length > 6 ? arguments[6] : undefined;
  var widget = arguments.length > 7 ? arguments[7] : undefined;
  var op, vals;

  if (isLogic(logic)) {
    op = Object.keys(logic)[0];
    vals = logic[op];
    if (!Array.isArray(vals)) vals = [vals];
  }

  var ret;
  var beforeErrorsCnt = meta.errors.length;
  var isNotOp = op == "!" && vals.length == 1 && vals[0] && isLogic(vals[0]) && Object.keys(vals[0])[0] == 'var';
  var isRev = op == "!" && !isNotOp;

  if (isRev) {
    ret = convertFromLogic(vals[0], conv, config, expectedType, meta, !not, fieldConfig, widget);
  } else if (expectedType == 'val') {
    ret = convertField(op, vals, conv, config, not, meta) || convertFunc(op, vals, conv, config, not, fieldConfig, meta) || convertVal(logic, fieldConfig, widget, config, meta);
  } else if (expectedType == 'rule') {
    ret = convertConj(op, vals, conv, config, not, meta) || convertOp(op, vals, conv, config, not, meta);
  }

  var afterErrorsCnt = meta.errors.length;

  if (op != "!" && ret === undefined && afterErrorsCnt == beforeErrorsCnt) {
    meta.errors.push("Can't parse logic ".concat(JSON.stringify(logic)));
  }

  return ret;
};

var convertVal = function convertVal(val, fieldConfig, widget, config, meta) {
  if (val === undefined) return undefined;
  var widgetConfig = config.widgets[widget || fieldConfig.mainWidget];

  if (isLogic(val)) {
    meta.errors.push("Unexpected logic in value: ".concat(JSON.stringify(val)));
    return undefined;
  } // number of seconds -> time string


  if (fieldConfig && fieldConfig.type == "time" && typeof val == "number") {
    var h = Math.floor(val / 60 / 60) % 24,
        m = Math.floor(val / 60) % 60,
        s = val % 60;
    var valueFormat = widgetConfig.valueFormat;

    if (valueFormat) {
      var dateVal = new Date(val);
      dateVal.setMilliseconds(0);
      dateVal.setHours(h);
      dateVal.setMinutes(m);
      dateVal.setSeconds(s);
      val = (0, _moment["default"])(dateVal).format(valueFormat);
    } else {
      val = "".concat(h, ":").concat(m, ":").concat(s);
    }
  } // "2020-01-08T22:00:00.000Z" -> Date object


  if (fieldConfig && ["date", "datetime"].includes(fieldConfig.type) && val && !(val instanceof Date)) {
    var _dateVal = new Date(val);

    if (_dateVal instanceof Date && _dateVal.toISOString() === val) {
      val = _dateVal;
    }
  } // Date object -> formatted string


  if (val instanceof Date && fieldConfig) {
    var _valueFormat = widgetConfig.valueFormat;

    if (_valueFormat) {
      val = (0, _moment["default"])(val).format(_valueFormat);
    }
  }

  return {
    valueSrc: "value",
    value: val,
    valueType: widgetConfig.type
  };
};

var convertField = function convertField(op, vals, conv, config, not, meta) {
  if (op == "var") {
    var field = vals[0];
    var fieldConfig = (0, _configUtils.getFieldConfig)(field, config);

    if (!fieldConfig) {
      meta.errors.push("No config for field ".concat(field));
      return undefined;
    }

    return {
      valueSrc: "field",
      value: field,
      valueType: fieldConfig.type
    };
  }

  return undefined;
};

var convertFunc = function convertFunc(op, vals, conv, config, not, fieldConfig, meta) {
  if (!op) return undefined;
  var func, argsArr;
  var jsonLogicIsMethod = op == "method";

  if (jsonLogicIsMethod) {
    var obj, opts;

    var _vals = _toArray(vals);

    obj = _vals[0];
    func = _vals[1];
    opts = _vals.slice(2);
    argsArr = [obj].concat(_toConsumableArray(opts));
  } else {
    func = op;
    argsArr = vals;
  }

  var fk = (jsonLogicIsMethod ? '#' : '') + func;
  var funcKeys = conv.funcs[fk];

  if (funcKeys) {
    var funcKey = funcKeys[0];

    if (funcKeys.length > 1 && fieldConfig) {
      funcKeys = (_readOnlyError("funcKeys"), funcKeys.filter(function (k) {
        return config.funcs[k].returnType == fieldConfig.type;
      }));

      if (funcKeys.length == 0) {
        meta.errors.push("No funcs returning type ".concat(fieldConfig.type));
        return undefined;
      }

      funcKey = funcKeys[0];
    }

    var funcConfig = config.funcs[funcKey];
    var argKeys = Object.keys(funcConfig.args);
    var args = argsArr.reduce(function (acc, val, ind) {
      var argKey = argKeys[ind];
      var argConfig = funcConfig.args[argKey];
      var argVal = convertFromLogic(val, conv, config, 'val', meta, false, argConfig);

      if (argVal === undefined) {
        argVal = argConfig.defaultValue;

        if (argVal === undefined) {
          meta.errors.push("No value for arg ".concat(argKey, " of func ").concat(funcKey));
          return undefined;
        }
      }

      return _objectSpread({}, acc, _defineProperty({}, argKey, argVal));
    }, {});
    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: args
      },
      valueType: funcConfig.returnType
    };
  }

  return undefined;
};

var convertConj = function convertConj(op, vals, conv, config, not, meta) {
  var conjKey = conv.conjunctions[op];

  if (conjKey) {
    var children = vals.map(function (v) {
      return convertFromLogic(v, conv, config, 'rule', meta, false);
    }).filter(function (r) {
      return r !== undefined;
    }).reduce(function (acc, r) {
      return _objectSpread({}, acc, _defineProperty({}, r.id, r));
    }, {});
    return {
      type: "group",
      id: (0, _uuid["default"])(),
      children1: children,
      properties: {
        conjunction: conjKey,
        not: not
      }
    };
  }

  return undefined;
};

var wrapInDefaultConj = function wrapInDefaultConj(rule, config) {
  return {
    type: "group",
    id: (0, _uuid["default"])(),
    children1: _defineProperty({}, rule.id, rule),
    properties: {
      conjunction: (0, _defaultUtils.defaultConjunction)(config),
      not: false
    }
  };
};

var convertOp = function convertOp(op, vals, conv, config, not, meta) {
  if (!op) return undefined;
  var arity = vals.length;
  var cardinality = arity - 1;
  var opk = op + "/" + cardinality;
  var oks = [],
      errors = [];

  var _check = function _check(isRevArgs) {
    var opKeys = conv.operators[(isRevArgs ? "#" : "") + opk];

    if (opKeys) {
      var jlField,
          _args = [];
      var rangeOps = ['<', '<=', '>', '>='];

      if (rangeOps.includes(op) && arity == 3) {
        jlField = vals[1];
        _args = [vals[0], vals[2]];
      } else if (isRevArgs) {
        jlField = vals[1];
        _args = [vals[0]];
      } else {
        var _vals2 = _toArray(vals);

        jlField = _vals2[0];
        _args = _vals2.slice(1);
      }

      var _jlField = jlField,
          _field = _jlField["var"];

      if (!_field) {
        errors.push("Unknown field ".concat(JSON.stringify(jlField)));
        return;
      }

      var _fieldConfig = (0, _configUtils.getFieldConfig)(_field, config);

      if (!_fieldConfig) {
        errors.push("No config for field ".concat(_field));
        return;
      }

      var _opKey = opKeys[0];

      if (opKeys.length > 1 && _fieldConfig && _fieldConfig.operators) {
        // eg. for "equal" and "select_equals"
        opKeys = opKeys.filter(function (k) {
          return _fieldConfig.operators.includes(k);
        });

        if (opKeys.length == 0) {
          errors.push("No corresponding ops for field ".concat(_field));
          return;
        }

        _opKey = opKeys[0];
      }

      oks.push({
        field: _field,
        fieldConfig: _fieldConfig,
        opKey: _opKey,
        args: _args
      });
    }
  };

  _check(false);

  _check(true);

  if (!oks.length) {
    meta.errors.push(errors.join("; ") || "Unknown op ".concat(op, "/").concat(arity));
    return undefined;
  }

  var _oks$ = oks[0],
      field = _oks$.field,
      fieldConfig = _oks$.fieldConfig,
      opKey = _oks$.opKey,
      args = _oks$.args;
  var opConfig = config.operators[opKey];

  if (not && opConfig.reversedOp) {
    not = false;
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
  }

  if (not) {
    meta.errors.push("No rev op for ".concat(opKey));
    return undefined;
  }

  var widget = (0, _configUtils.getWidgetForFieldOp)(config, field, opKey);
  var convertedArgs = args.map(function (v) {
    return convertFromLogic(v, conv, config, 'val', meta, false, fieldConfig, widget);
  });

  if (convertedArgs.filter(function (v) {
    return v === undefined;
  }).length) {
    //meta.errors.push(`Undefined arg for field ${field} and op ${opKey}`);
    return undefined;
  }

  return {
    type: "rule",
    id: (0, _uuid["default"])(),
    properties: {
      field: field,
      operator: opKey,
      value: convertedArgs.map(function (v) {
        return v.value;
      }),
      valueSrc: convertedArgs.map(function (v) {
        return v.valueSrc;
      }),
      valueType: convertedArgs.map(function (v) {
        return v.valueType;
      })
    }
  };
};

var isLogic = function isLogic(logic) {
  return _typeof(logic) === "object" && // An object
  logic !== null && // but not null
  !Array.isArray(logic) && // and not an array
  Object.keys(logic).length === 1 // with exactly one key
  ;
};