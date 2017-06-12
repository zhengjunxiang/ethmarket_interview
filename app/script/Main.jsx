import React, {Component} from 'react';
import {Layout, Row, Col, Tabs} from 'antd';
import Table from 'rc-table';
import Animate from 'rc-animate';
import 'rc-table/assets/index.css';
import 'rc-table/assets/animation.css';
import 'whatwg-fetch';
import '../style/style.less';
import {columnsDeal, columnsDetail} from './columns';

const {Header, Content} = Layout;
const TabPane = Tabs.TabPane;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notDealPay: [],
      notDealSell: [],
      tradingDetail: [], // 记录交易详情
      currentIndex: 0
    };
  }
  componentWillMount() {
    window.setInterval(() => {
      fetch('/listOrders?start=0&size=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => (
        res.json()
      )).then((resp) => {
        const {currentIndex} = this.state;
        if (currentIndex < (resp.length && resp.length)) this.renderPlaceOrder(resp);
      }).catch((error) => {
        console.info('error', error);
      });
    }, 2000);
  }
  sortDatas(arr, op = 1) {
    arr.sort((a, b) => {
      if (a.price > b.price) {
        return -1 * op;
      }
      if (a.price < b.price) {
        return 1 * op;
      }
      if (a.price === b.price) {
        return a.number - b.number;
      }
      return 0;
    });
    return arr;
  }
  getDateT() {
    return new Date().toLocaleString();
  }
  renderPlaceOrder(resp) {
    const {tradingDetail} = this.state;
    const payBill = [];
    const sellSingle = [];
    let orderPayBill = []; // 排列由大到小的买单
    let orderSellSingle = []; // 排列由小到大的卖单
    let notDealPay = [];
    let notDealSell = [];
    const {notDealPay: notDealP, notDealSell: notDealS, currentIndex} = this.state;
    [...notDealP, ...notDealS, ...resp.slice(currentIndex)].map((data, ind) => {
      data.key = ind;
      if (data.side === 'bid') {
        payBill.push(data);
      } else {
        sellSingle.push(data);
      }
      return null;
    });
    orderPayBill = this.sortDatas(payBill);
    orderSellSingle = this.sortDatas(sellSingle, -1);
    orderPayBill.map((p, pInd) => {
      orderSellSingle.map((s, sInd) => {
        if (p.quantity > 0 && p.price > s.price) {
          if (s.quantity > 0) {
            tradingDetail.unshift({
              price: (p.price + s.price) / 2,
              date: this.getDateT(),
              pay: Object.assign({}, orderPayBill[pInd]),
              sell: Object.assign({}, orderSellSingle[sInd])
            });
            if (p.quantity >= s.quantity) {
              orderPayBill[pInd].quantity = p.quantity - s.quantity;
              orderSellSingle[sInd].quantity = 0;
            } else {
              orderPayBill[pInd].quantity = 0;
              orderSellSingle[sInd].quantity = s.quantity - p.quantity;
            }
          }
        }
      });
    });
    notDealPay = orderPayBill.filter(item => item.quantity > 0);
    notDealSell = orderSellSingle.filter(item => item.quantity > 0);
    tradingDetail.map((item, index) => {
      item.key = index;
      item.number = index;
    });
    this.setState({
      notDealPay,
      notDealSell: this.sortDatas(notDealSell),
      tradingDetail,
      currentIndex: resp.length
    });
  }
  getBodyWrapper(body) {
    return (
      <Animate transitionName="move" component="tbody" className={body.props.className}>
        {body.props.children}
      </Animate>
    );
  }
  expandedRowRender(record) {
    return (<div>
      <p>买方（bid）: </p>
      <span>number: {record.pay.number} /</span>
      <span> price: {record.pay.price} /</span>
      <span> quantity: {record.pay.quantity} </span>
      <p>卖方（ask）: </p>
      <span>number: {record.sell.number} /</span>
      <span> price: {record.sell.price} /</span>
      <span> quantity: {record.sell.quantity} </span>
    </div>);
  }
  render() {
    const {notDealPay, notDealSell, tradingDetail} = this.state;
    const payDatas = notDealPay.slice(0, 20);
    const sellDatas = notDealSell.slice(0, 20);
    const tradingD = tradingDetail.slice(0, 30);
    return (
      <Layout className="my-layout">
        <Header><h2>证券交易市场</h2></Header>
        <Content>
          <Row gutter={16}>
            <Col md={12}>
              <Tabs defaultActiveKey="1">
                <TabPane tab={`买单(bid) ${payDatas.length}条记录`} key="1">
                  <Table columns={columnsDeal} data={payDatas} getBodyWrapper={this.getBodyWrapper} />
                </TabPane>
                <TabPane tab={`卖单(ask) ${sellDatas.length}条记录`} key="2">
                  <Table columns={columnsDeal} data={sellDatas} getBodyWrapper={this.getBodyWrapper} />
                </TabPane>
              </Tabs>
            </Col>
            <Col md={12}>
              <Table
                columns={columnsDetail}
                data={tradingD}
                getBodyWrapper={this.getBodyWrapper}
                expandedRowRender={this.expandedRowRender}
                title={currentData => <div>成交队列: {currentData.length}条记录 </div>}
                />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default Main;
