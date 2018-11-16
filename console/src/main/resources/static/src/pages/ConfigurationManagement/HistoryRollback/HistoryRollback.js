/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Button, Field, Form, Input, Loading, Pagination, Table } from '@alifd/next';
import RegionGroup from '../../../components/RegionGroup';
import { getParams, setParams, request, aliwareIntl } from '../../../globalLib';
import './index.less';

/*****************************此行为标记行, 请勿删和修改此行, 文件和组件依赖请写在此行上面, 主体代码请写在此行下面的class中*****************************/
class HistoryRollback extends React.Component {
    constructor(props) {
        super(props);

        this.field = new Field(this);
        this.appName = getParams('appName') || '';
        this.preAppName = this.appName;
        this.group = getParams('group') || '';
        this.preGroup = this.group;

        this.dataId = getParams('dataId') || '';
        this.preDataId = this.dataId;
        this.serverId = getParams('serverId') || '';
        this.state = {
            value: "",
            visible: false,
            total: 0,
            pageSize: 10,
            currentPage: 1,
            dataSource: [],
            fieldValue: [],
            showAppName: false,
            showgroup: false,
            dataId: this.dataId,
            group: this.group,
            appName: this.appName,
            selectValue: [],
            loading: false
        };
        let obj = {
            dataId: this.dataId || '',
            group: this.preGroup || '',
            appName: this.appName || '',
            serverId: this.serverId || ''
        };
        setParams(obj);
    }

    componentDidMount() {

        //this.getData()
    }
    openLoading() {
        this.setState({
            loading: true
        });
    }
    closeLoading() {
        this.setState({
            loading: false
        });
    }
    /**
     * 回车事件
     */
    keyDownSearch(e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code === 13) {
            this.getData();
            return false;
        }
        return true;
    }
    UNSAFE_componentWillMount() {
        window.addEventListener('keydown', this.keyDownSearch.bind(this), false);
    }
    componentWillUnMount() {
        window.removeEventListener('keydown', this.keyDownSearch.bind(this));
    }
    onSearch() { }

    onChange() { }
    cleanAndGetData(needclean = false) {
        if (needclean) {
            this.dataId = '';
            this.group = '';
            this.setState({
                group: '',
                dataId: ''
            });
            setParams({
                group: '',
                dataId: ''
            });
        }

        this.getData();
    }
    getData(pageNo = 1) {
        let self = this;
        this.serverId = getParams('serverId') || '';
        if (!this.dataId) return false;
        request({
            beforeSend: function () {
                self.openLoading();
            },
            url: `/nacos/v1/cs/history?search=accurate&dataId=${this.dataId}&group=${this.group}&&pageNo=${pageNo}&pageSize=${this.state.pageSize}`,
            success: function (data) {
                if (data != null) {
                    self.setState({
                        dataSource: data.pageItems || [],
                        total: data.totalCount,
                        currentPage: data.pageNumber
                    });
                }
            },
            complete: function () {
                self.closeLoading();
            }
        });
    }
    showMore() { }
    renderCol(value, index, record) {
        return <div>
            <a onClick={this.goDetail.bind(this, record)} style={{ marginRight: 5 }}>{aliwareIntl.get('com.alibaba.nacos.page.historyRollback.details')}</a>
            <span style={{ marginRight: 5 }}>|</span>
            <a style={{ marginRight: 5 }} onClick={this.goRollBack.bind(this, record)}>{aliwareIntl.get('com.alibaba.nacos.page.historyRollback.rollback')}</a>
        </div>;
    }
    changePage(value) {
        this.setState({
            currentPage: value
        });
        this.getData(value);
    }
    onInputUpdate() { }
    chooseFieldChange(fieldValue) {

        this.setState({
            fieldValue
        });
    }
    showSelect(value) {
        this.setState({
            selectValue: value
        });
        if (value.indexOf('appName') !== -1) {
            this.setState({
                showAppName: true
            });
        } else {
            this.setState({
                showAppName: false
            });
        }
        if (value.indexOf('group') !== -1) {
            this.setState({
                showgroup: true
            });
        } else {
            this.setState({
                showgroup: false
            });
        }
        this.chooseFieldChange(value);
    }
    getAppName(value) {
        this.appName = value;
        this.setState({
            appName: value
        });
    }
    getDataId(value) {
        this.dataId = value;
        this.setState({
            dataId: value
        });
    }
    getGroup(value) {

        this.group = value;
        this.setState({
            group: value
        });
    }
    selectAll() {
        if (this.dataId !== this.preDataId) {
            setParams('dataId', this.dataId);
            this.preDataId = this.dataId;
        }
        if (this.group !== this.preGroup) {
            setParams('group', this.preGroup);
            this.preGroup = this.group;
        }
        this.getData();
    }
    resetAll() {
        this.dataId = '';
        this.group = '';
        this.setState({
            selectValue: [],
            dataId: '',
            appName: '',
            group: '',
            showAppName: false,
            showgroup: false
        });
        setParams({
            group: '',
            dataId: ''
        });
    }
    chooseEnv(value) {
        console.log(value);
    }
    renderLastTime(value, index, record) {
        return aliwareIntl.intlTimeFormat(record.lastModifiedTime);
    }
    goDetail(record) {
        this.serverId = getParams('serverId') || 'center';
        this.tenant = getParams('namespace') || ''; //为当前实例保存tenant参数
        this.props.history.push(`/historyDetail?serverId=${this.serverId || ''}&dataId=${record.dataId}&group=${record.group}&nid=${record.id}&namespace=${this.tenant}`);
    }
    goRollBack(record) {
        this.serverId = getParams('serverId') || 'center';
        this.tenant = getParams('namespace') || ''; //为当前实例保存tenant参数
        this.props.history.push(`/configRollback?serverId=${this.serverId || ''}&dataId=${record.dataId}&group=${record.group}&nid=${record.id}&namespace=${this.tenant}&nid=${record.id}`);
    }
    render() {
        const pubnodedata = aliwareIntl.get('pubnodata');

        const locale = {
            empty: pubnodedata
        };
        return (
            <div style={{ padding: 10 }}>
                <Loading shape="flower" style={{ position: 'relative', width: "100%" }} visible={this.state.loading} tip="Loading..." color="#333">
                    <RegionGroup left={aliwareIntl.get('com.alibaba.nacos.page.historyRollback.to_configure')} namespaceCallBack={this.cleanAndGetData.bind(this)} />
                    {/**<div className={'namespacewrapper'}>
                              <NameSpaceList namespaceCallBack={this.cleanAndGetData.bind(this)} />
                           </div>**/}

                    <div>
                        <Form inline>

                            <Form.Item label="Data ID:">
                                <Input htmlType="text" placeholder={aliwareIntl.get('com.alibaba.nacos.page.historyRollback.dataid')}
                                    style={{ width: 200 }} value={this.state.dataId} onChange={this.getDataId.bind(this)} />
                            </Form.Item>
                            <Form.Item label="Group:">
                                <Input placeholder={aliwareIntl.get('com.alibaba.nacos.page.historyRollback.group')} id="userName" name="userName" value={this.state.group}
                                    style={{ width: 200 }} onChange={this.getGroup.bind(this)} />
                            </Form.Item>

                            <Form.Item label="">
                                <Button type="primary" style={{ marginRight: 10 }} onClick={this.selectAll.bind(this)}>
                                    {aliwareIntl.get('com.alibaba.nacos.page.historyrollback.query')}</Button>
                                {}

                            </Form.Item>

                        </Form>


                    </div>
                    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '40px' }}>

                        <h3 style={{ height: 30, width: '100%', lineHeight: '30px', padding: 0, margin: 0, paddingLeft: 10, borderLeft: '3px solid #09c' }}>{aliwareIntl.get('com.alibaba.nacos.page.historyRollback.queryresult')}<strong style={{ fontWeight: 'bold' }}> {this.state.total} </strong>{aliwareIntl.get('com.alibaba.nacos.page.historyRollback.article_meet')}</h3>

                    </div>
                    <div>

                        <Table dataSource={this.state.dataSource} locale={locale} language={aliwareIntl.currentLanguageCode}>
                            <Table.Column title="Data ID" dataIndex="dataId" />
                            <Table.Column title="Group" dataIndex="group" />
                            <Table.Column title={aliwareIntl.get('com.alibaba.nacos.page.historyRollback.last_update_time')} dataIndex="time" cell={this.renderLastTime.bind(this)} />
                            <Table.Column title={aliwareIntl.get('com.alibaba.nacos.page.historyRollback.operation')} cell={this.renderCol.bind(this)} />
                        </Table>

                    </div>
                    <div style={{ marginTop: 10, textAlign: 'right' }}>
                        <Pagination current={this.state.currentPage} language={aliwareIntl.currentLanguageCode} total={this.state.total} pageSize={this.state.pageSize} onChange={this.changePage.bind(this)} />,
                </div>
                </Loading>
            </div>
        );
    }
}
/*****************************此行为标记行, 请勿删和修改此行, 主体代码请写在此行上面的class中, 组件导出语句及其他信息请写在此行下面*****************************/
export default HistoryRollback;