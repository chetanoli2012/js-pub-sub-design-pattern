function Events() {
  this.subscriptionList = new Map();
  this.subscribeOnceList = new Map();
  this.subscribeOnceAsyncList = new Map();

  this.subscribe = function (namespace, callback) {
    if (!this.subscriptionList.has(namespace)) {
      this.subscriptionList.set(namespace, [callback]);
    } else {
      const existingCallbacks = this.subscriptionList.get(namespace);
      this.subscriptionList.set(namespace, [...existingCallbacks, callback]);
    }

    return {
      remove: () => {
        const existingCallbacks = this.subscriptionList.get(namespace);
        const filteredCallbacks = existingCallbacks.filter(function (ecb) {
          return ecb !== callback;
        });
        this.subscriptionList.set(namespace, filteredCallbacks);
      },
    };
  };

  this.subscribeOnce = function (namespace, callback) {
    if (!this.subscribeOnceList.has(namespace)) {
      this.subscribeOnceList.set(namespace, [callback]);
    } else {
      const existingCallbacks = this.subscribeOnceList.get(namespace);
      this.subscribeOnceList.set(namespace, [...existingCallbacks, callback]);
    }
  };

  this.subscribeOnceAsync = async function (namespace) {
    return new Promise((resolve, reject) => {
      if (!this.subscribeOnceAsyncList.has(namespace)) {
        this.subscribeOnceAsyncList.set(namespace, [resolve]);
      } else {
        const existingCallbacks = this.subscribeOnceAsyncList.get(namespace);
        this.subscribeOnceAsyncList.set(namespace, [
          ...existingCallbacks,
          resolve,
        ]);
      }
    });
  };

  this.publish = function (namespace, data) {
    const callbacks = this.subscriptionList.get(namespace);
    if (callbacks && callbacks.length) {
      callbacks.forEach((cb) => {
        cb(data);
      });
    }

    const subscribeOnceCallbacks = this.subscribeOnceList.get(namespace);
    if (subscribeOnceCallbacks && subscribeOnceCallbacks.length) {
      subscribeOnceCallbacks.forEach((cb) => {
        cb(data);
      });
    }
    this.subscribeOnceList.set(namespace, []);

    const subscribeOnceAsyncCallbacks =
      this.subscribeOnceAsyncList.get(namespace);
    if (subscribeOnceAsyncCallbacks && subscribeOnceAsyncCallbacks.length) {
      subscribeOnceAsyncCallbacks.forEach((cb) => {
        cb(data);
      });
    }
    this.subscribeOnceAsyncList.set(namespace, []);
  };

  this.publishAll = function (data) {
    const entries = this.subscriptionList.entries();

    for (let [key, val] of entries) {
      val.forEach(function (v) {
        v(data);
      });
    }
  };
}

const events = new Events();

// const newUserNewsSubscription = events.subscribe(
//   "new-user",
//   function (payload) {
//     console.log(`Seding Q1 news to: ${payload}`);
//   }
// );

// events.publish("new-user", "John");

// const newUserNewsSubscription2 = events.subscribe(
//   "new-user",
//   function (payload) {
//     console.log(`Seding Q2 news to: ${payload}`);
//   }
// );

// events.publish("new-user", "Doe");

// newUserNewsSubscription.remove();

// events.publish("new-user", "Foo");

// events.publishAll("FooBar");

// events.subscribeOnce("new-user", function (payload) {
//   console.log(`I am invoked once ${payload}`);
// });

// events.publish("new-user", "Foo once");
// events.publish("new-user", "Foo twice");

events.subscribeOnceAsync("new-user").then(function (paylod) {
  console.log(`I am invoked once ${paylod}`);
});

events.publish("new-user", "Foo once async");
