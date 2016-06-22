var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})

var ordersVue = new Vue({
  el: "#order-list",

  data: {
    orders: []
  },

  init: this.fetchOrders,

  ready: function() {
    setInterval(this.fetchOrders, 2000);
  },

  methods: {
    fetchOrders: function() {
      var self = this;
      $.ajax({
	    type: "GET",
	    url: "/listOrders",
	    dataType: "json",
	    data: {
          "start": "0",
          "size": "100"
        },
	    success: function(resp) {
	      console.log(resp);
	      self.orders = resp;
	    },
	    error: function(jqXHR, exception) {
	      console.log("Failed to get chain height!");
          self.orders = [];
	    }
      });
    }
  }
});

(function reset() {
  $.ajax({
	type: "GET",
	url: "/reset"
  })
})();
