"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _configUtils = require("../../utils/configUtils");

var _renderUtils = require("../../utils/renderUtils");

var _reactRedux = require("react-redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _default = function _default(Rule) {
  var RuleContainer =
  /*#__PURE__*/
  function (_Component) {
    _inherits(RuleContainer, _Component);

    function RuleContainer(props) {
      var _this;

      _classCallCheck(this, RuleContainer);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RuleContainer).call(this, props));

      _this.dummyFn = function () {};

      _this.removeSelf = function () {
        _this.props.actions.removeRule(_this.props.path);
      };

      _this.setField = function (field) {
        _this.props.actions.setField(_this.props.path, field);
      };

      _this.setOperator = function (operator) {
        _this.props.actions.setOperator(_this.props.path, operator);
      };

      _this.setOperatorOption = function (name, value) {
        _this.props.actions.setOperatorOption(_this.props.path, name, value);
      };

      _this.setValue = function (delta, value, type, __isInternal) {
        _this.props.actions.setValue(_this.props.path, delta, value, type, __isInternal);
      };

      _this.setValueSrc = function (delta, srcKey) {
        _this.props.actions.setValueSrc(_this.props.path, delta, srcKey);
      };

      return _this;
    }

    _createClass(RuleContainer, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
        var prevProps = this.props;
        var prevState = this.state;
        var should = (0, _renderUtils.pureShouldComponentUpdate)(this)(nextProps, nextState);

        if (should) {
          if (prevState == nextState && prevProps != nextProps) {
            var draggingId = nextProps.dragging.id || prevProps.dragging.id;
            var isDraggingMe = draggingId == nextProps.id;
            var chs = [];

            for (var k in nextProps) {
              var changed = nextProps[k] != prevProps[k];

              if (k == 'dragging' && !isDraggingMe) {
                changed = false; //dragging another item -> ignore
              }

              if (changed) {
                chs.push(k);
              }
            }

            if (!chs.length) should = false;
          }
        }

        return should;
      }
    }, {
      key: "render",
      value: function render() {
        var isDraggingMe = this.props.dragging.id == this.props.id;
        var fieldConfig = (0, _configUtils.getFieldConfig)(this.props.field, this.props.config);

        var _isGroup = fieldConfig && fieldConfig.type == '!struct';

        return _react["default"].createElement("div", {
          className: 'group-or-rule-container rule-container',
          "data-id": this.props.id
        }, [isDraggingMe ? _react["default"].createElement(Rule, {
          key: "dragging",
          id: this.props.id,
          isDraggingMe: isDraggingMe,
          isDraggingTempo: true,
          dragging: this.props.dragging,
          setField: this.dummyFn,
          setOperator: this.dummyFn,
          setOperatorOption: this.dummyFn,
          removeSelf: this.dummyFn,
          selectedField: this.props.field || null,
          selectedOperator: this.props.operator || null,
          value: this.props.value || null,
          valueSrc: this.props.valueSrc || null,
          operatorOptions: this.props.operatorOptions,
          config: this.props.config,
          treeNodesCnt: this.props.treeNodesCnt
        }) : null, _react["default"].createElement(Rule, {
          key: this.props.id,
          id: this.props.id,
          isDraggingMe: isDraggingMe,
          onDragStart: this.props.onDragStart,
          removeSelf: this.removeSelf,
          setField: this.setField,
          setOperator: this.setOperator,
          setOperatorOption: this.setOperatorOption,
          setValue: this.setValue,
          setValueSrc: this.setValueSrc,
          selectedField: this.props.field || null,
          selectedOperator: this.props.operator || null,
          value: this.props.value || null,
          valueSrc: this.props.valueSrc || null,
          operatorOptions: this.props.operatorOptions,
          config: this.props.config,
          treeNodesCnt: this.props.treeNodesCnt
        })]);
      }
    }]);

    return RuleContainer;
  }(_react.Component);

  RuleContainer.propTypes = {
    id: _propTypes["default"].string.isRequired,
    config: _propTypes["default"].object.isRequired,
    path: _propTypes["default"].any.isRequired,
    //instanceOf(Immutable.List)
    operator: _propTypes["default"].string,
    field: _propTypes["default"].string,
    actions: _propTypes["default"].object.isRequired,
    //{removeRule: Funciton, setField, setOperator, setOperatorOption, setValue, setValueSrc, ...}
    onDragStart: _propTypes["default"].func,
    value: _propTypes["default"].any,
    //depends on widget
    valueSrc: _propTypes["default"].any,
    operatorOptions: _propTypes["default"].object,
    treeNodesCnt: _propTypes["default"].number,
    //connected:
    dragging: _propTypes["default"].object //{id, x, y, w, h}

  };
  ;
  var ConnectedRuleContainer = (0, _reactRedux.connect)(function (state) {
    return {
      dragging: state.dragging
    };
  })(RuleContainer);
  ConnectedRuleContainer.displayName = "ConnectedRuleContainer";
  return ConnectedRuleContainer;
};

exports["default"] = _default;