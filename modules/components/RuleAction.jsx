import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Field from './Field';
import Operator from './Operator';
import { Col, Button, Select } from 'antd';

// @RuleContainer
class RuleAction extends PureComponent {
    static propTypes = {
        value: PropTypes.arrayOf(PropTypes.string),
        removeSelf: PropTypes.func,
        setValue: PropTypes.func,
        headerLabel: PropTypes.string,
    };

    handleChange = (val) => {
        if (val && !val.length) {
            val = undefined; //not allow []
        }

        this.props.actions.setRuleAction(this.props.path, val);
    }

    removeSelf = () => {
        this.props.actions.removeRuleAction(this.props.path)
    }

    render () {
        const {ruleActions} = this.props.config;
        const {deleteLabel} = this.props.config.settings;
        const { value, headerLabel } = this.props

        return (
            <div
            className={'rule-action--container'}
            data-id={this.props.id}
            >
                {headerLabel && <h3>{headerLabel}</h3>}
                <div className="rule-action">
                    <div key="rule-action-body" className='rule-action--body'>
                        <Col key={"widget-for-"+this.props.selectedOperator} className="rule-action--value">
                            <span className="rule-action--label">Action</span>
                            <Select
                                key="values"
                                mode={"single"}
                                style={{
                                    minWidth: 300,
                                    width: 300
                                }}
                                key={"rule-action-multiselect"}
                                dropdownMatchSelectWidth={true}
                                value={value}
                                onChange={this.handleChange}
                            >
                                {ruleActions.map(o => (
                                    <Option
                                        key={o.value}
                                        value={o.value}
                                    >
                                        {o.label}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </div>
                    <div key="rule-header" className="rule--header">
                    {!this.props.config.settings.immutableGroupsMode &&
                        <Button
                            type="danger"
                            icon="delete"
                            onClick={this.removeSelf}
                            size={this.props.config.settings.renderSize}
                        >
                            {deleteLabel}
                        </Button>
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export default RuleAction;
