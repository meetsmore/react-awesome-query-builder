"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _button = _interopRequireDefault(require("antd/lib/button"));

var _col = _interopRequireDefault(require("antd/lib/col"));

var _select = _interopRequireDefault(require("antd/lib/select"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Field = _interopRequireDefault(require("./Field"));

var _Operator = _interopRequireDefault(require("./Operator"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// @RuleContainer
var RuleAction =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(RuleAction, _PureComponent);

  function RuleAction() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, RuleAction);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(RuleAction)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _this.handleChange = function (val) {
      if (val && !val.length) {
        val = undefined; //not allow []
      }

      _this.props.actions.setRuleAction(_this.props.path, val);
    };

    _this.removeSelf = function () {
      _this.props.actions.removeRuleAction(_this.props.path);
    };

    return _this;
  }

  _createClass(RuleAction, [{
    key: "render",
    value: function render() {
      var _React$createElement;

      var ruleActions = this.props.config.ruleActions;
      var deleteLabel = this.props.config.settings.deleteLabel;
      var _this$props = this.props,
          value = _this$props.value,
          headerLabel = _this$props.headerLabel;
      return _react["default"].createElement("div", {
        className: 'rule-action--container',
        "data-id": this.props.id
      }, headerLabel && _react["default"].createElement("h3", null, headerLabel), _react["default"].createElement("div", {
        className: "rule-action"
      }, _react["default"].createElement("div", {
        key: "rule-action-body",
        className: "rule-action--body"
      }, _react["default"].createElement(_col["default"], {
        key: "widget-for-" + this.props.selectedOperator,
        className: "rule-action--value"
      }, _react["default"].createElement("span", {
        className: "rule-action--label"
      }, "Action"), _react["default"].createElement(_select["default"], (_React$createElement = {
        key: "values",
        mode: "single",
        style: {
          minWidth: 300,
          width: 300
        }
      }, _defineProperty(_React$createElement, "key", "rule-action-multiselect"), _defineProperty(_React$createElement, "dropdownMatchSelectWidth", true), _defineProperty(_React$createElement, "value", value), _defineProperty(_React$createElement, "onChange", this.handleChange), _React$createElement), ruleActions.map(function (o) {
        return _react["default"].createElement(Option, {
          key: o.value,
          value: o.value
        }, o.label);
      })))), _react["default"].createElement("div", {
        key: "rule-header",
        className: "rule--header"
      }, !this.props.config.settings.immutableGroupsMode && _react["default"].createElement(_button["default"], {
        type: "danger",
        icon: "delete",
        onClick: this.removeSelf,
        size: this.props.config.settings.renderSize
      }, deleteLabel))));
    }
  }]);

  return RuleAction;
}(_react.PureComponent);

RuleAction.propTypes = {
  value: _propTypes["default"].arrayOf(_propTypes["default"].string),
  removeSelf: _propTypes["default"].func,
  setValue: _propTypes["default"].func,
  headerLabel: _propTypes["default"].string
};
var _default = RuleAction;
exports["default"] = _default;