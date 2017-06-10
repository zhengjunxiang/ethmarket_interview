import React, {Component} from 'react';
import {Layout, Row, Col, Tabs} from 'antd';
import Table from 'rc-table';
import Animate from 'rc-animate';
import 'rc-table/assets/index.css';
import 'rc-table/assets/animation.css';
import 'whatwg-fetch';
import '../style/style.less';

const {Header, Content} = Layout;
const TabPane = Tabs.TabPane;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notDealPay: [],
      notDealSell: [],
      tradingDetail: []
    };
  }
  componentWillMount() {
    window.setInterval(() => {
      fetch('/listOrders?start=0&size=20', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => (
        res.json()
      )).then((resp) => {
        this.renderPlaceOrder(resp);
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
  getDateT(date) {
    let d = '';
    let s = '';
    d = date;
    s = `${d.getYear() + 1990}-`;             //取年份
    s = `${s + (d.getMonth() + 1)}-`;//取月份
    s += `${d.getDate()} `;         //取日期
    s += `${d.getHours()}:`;       //取小时
    s += `${d.getMinutes()}:`;    //取分
    s += d.getSeconds();         //取秒
    return s;
  }
  renderPlaceOrder(resp) {
    const payBill = [];
    const sellSingle = [];
    let orderPayBill = []; // 排列由大到小的买单
    let orderSellSingle = []; // 排列由小到大的卖单
    const tradingDetail = []; // 记录交易详情
    let notDealPay = [];
    let notDealSell = [];
    resp.map((data, ind) => {
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
            tradingDetail.push({
              number: sInd,
              price: (p.price - s.price) / 2,
              date: new Date().getTime(),
              pay: orderPayBill[pInd],
              sell: orderSellSingle[sInd]
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
    tradingDetail.sort((a, b) => a.date - b.date);
    this.setState({
      notDealPay,
      notDealSell: this.sortDatas(notDealSell),
      tradingDetail
    });
  }
  getBodyWrapper(body) {
    return (
      <Animate transitionName="move" component="tbody" className={body.props.className}>
        {body.props.children}
      </Animate>
    );
  }
  render() {
    const {notDealPay, notDealSell, tradingDetail} = this.state;
    console.log('tradingDetail', tradingDetail);
    const columns = [{
      title: 'Number',
      dataIndex: 'number',
      key: 'number'
    }, {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price
    }, {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    }];
    return (
      <Layout className="my-layout">
        <Header><h2>证券交易市场</h2></Header>
        <Content>
          <Row>
            <Col span={12}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="买单(bid)" key="1">
                  <Table columns={columns} data={notDealPay} getBodyWrapper={this.getBodyWrapper} />
                </TabPane>
                <TabPane tab="卖单(ask)" key="2">
                  <Table columns={columns} data={notDealSell} getBodyWrapper={this.getBodyWrapper} />
                </TabPane>
              </Tabs>
            </Col>
            <Col span={12}>
              <p>成交队列</p>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default Main;
