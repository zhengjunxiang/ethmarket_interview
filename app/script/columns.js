const columnsDeal = [{
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

const columnsDetail = [{
  title: 'Number',
  dataIndex: 'number',
  key: 'number'
}, {
  title: 'Price',
  dataIndex: 'price',
  key: 'price'
}, {
  title: 'Date',
  dataIndex: 'date',
  key: 'date'
}];


export {columnsDeal, columnsDetail};
