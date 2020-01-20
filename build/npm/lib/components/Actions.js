"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Actions = void 0;

var _button = _interopRequireDefault(require("antd/lib/button"));

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ButtonGroup = _button["default"].Group;
var groupActionsPositionList = {
  topLeft: 'group--actions--tl',
  topCenter: 'group--actions--tc',
  topRight: 'group--actions--tr',
  bottomLeft: 'group--actions--bl',
  bottomCenter: 'group--actions--bc',
  bottomRight: 'group--actions--br'
};
var defaultPosition = 'topRight';

var Actions =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(Actions, _PureComponent);

  function Actions() {
    _classCallCheck(this, Actions);

    return _possibleConstructorReturn(this, _getPrototypeOf(Actions).apply(this, arguments));
  }

  _createClass(Actions, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          settings = _this$props.config.settings,
          addRule = _this$props.addRule,
          addGroup = _this$props.addGroup,
          addRuleAction = _this$props.addRuleAction,
          allowFurtherNesting = _this$props.allowFurtherNesting,
          isRoot = _this$props.isRoot,
          removeSelf = _this$props.removeSelf,
          isIfStatement = _this$props.isIfStatement,
          isMultiActionStatement = _this$props.isMultiActionStatement;
      var immutableGroupsMode = settings.immutableGroupsMode,
          addRuleLabel = settings.addRuleLabel,
          addGroupLabel = settings.addGroupLabel,
          delGroupLabel = settings.delGroupLabel,
          renderSize = settings.renderSize,
          groupActionsPosition = settings.groupActionsPosition,
          _settings$enableRuleA = settings.enableRuleActions,
          enableRuleActions = _settings$enableRuleA === void 0 ? true : _settings$enableRuleA,
          addRuleActionLabel = settings.addRuleActionLabel;
      var position = groupActionsPositionList[groupActionsPosition || defaultPosition];

      var addRuleBtn = !immutableGroupsMode && _react["default"].createElement(_button["default"], {
        key: "group-add-rule",
        icon: "plus",
        className: "action action--ADD-RULE",
        onClick: addRule,
        disabled: isIfStatement || isMultiActionStatement
      }, addRuleLabel);

      var addGroupBtn = !immutableGroupsMode && allowFurtherNesting && _react["default"].createElement(_button["default"], {
        key: "group-add-group",
        className: "action action--ADD-GROUP",
        icon: "plus-circle-o",
        onClick: addGroup
      }, addGroupLabel);

      var delGroupBtn = !immutableGroupsMode && !isRoot && _react["default"].createElement(_button["default"], {
        key: "group-del",
        type: "danger",
        icon: "delete",
        className: "action action--DELETE",
        onClick: removeSelf
      }, delGroupLabel);

      var addRuleActionBtn = enableRuleActions && _react["default"].createElement(_button["default"], {
        key: "group-add-rule-action",
        className: "action action--ADD-RULE-ACTION",
        icon: "plus-circle-o",
        onClick: addRuleAction,
        disabled: isMultiActionStatement
      }, addRuleActionLabel);

      return _react["default"].createElement("div", {
        className: "group--actions ".concat(position)
      }, _react["default"].createElement(ButtonGroup, {
        size: renderSize
      }, addRuleBtn, addGroupBtn, delGroupBtn, addRuleActionBtn));
    }
  }]);

  return Actions;
}(_react.PureComponent);

exports.Actions = Actions;