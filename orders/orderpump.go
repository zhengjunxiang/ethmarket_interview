package orders

import "sync"

type Order struct {
	Number   int     `json:"number"` // assigned by OrderPump
	Side     string  `json:"side"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

type OrderPump struct { // concurrent-safe
	sync.Mutex

	orders []*Order
}

func NewOrderPump() *OrderPump {
	return &OrderPump{
		orders: nil,
	}
}

func (pump *OrderPump) AddOrder(order *Order) {
	pump.Lock()
	defer pump.Unlock()

	if len(pump.orders) >= 100000 {
		return
	}

	order.Number = len(pump.orders)
	pump.orders = append(pump.orders, order)
}

func (pump *OrderPump) Clear() {
	pump.Lock()
	defer pump.Unlock()

	pump.orders = nil
}

func minInt2(a, b int) int {
	if a > b {
		return b
	}
	return a
}

func (pump *OrderPump) List(start int, maxsize int) []*Order {
	pump.Lock()
	defer pump.Unlock()

	if start < 0 {
		panic("start < 0")
	}
	if start >= len(pump.orders) {
		return nil
	}

	size := minInt2(len(pump.orders)-start, maxsize)
	ret := make([]*Order, size)
	n := copy(ret, pump.orders[start:start+size])
	if n != size {
		panic("unexpected copy size")
	}
	return ret
}
