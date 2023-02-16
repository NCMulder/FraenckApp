import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
// import { Buffer } from 'buffer';
// import googleKeys from '../google_keys.json';
import { Order, Item } from '../../types';

const ordersData = [
  {
    orderno: 123124312,
    email: 'test@fraenck.com',
    date: '2023-01-01T12:34:56',
    items: [
      {
        itemno: 12341,
        name: 'Fietstas Brook',
        variant: 'Donkerblauw',
        image:
          'https://cdn.shopify.com/s/files/1/0337/6024/7852/products/brook-855186_1120x1120.jpg?v=1623347172',
      },
      {
        itemno: 12342,
        name: 'Etui Kim',
        variant: 'Rood',
        image:
          'https://cdn.shopify.com/s/files/1/0337/6024/7852/products/kim-684595_1120x1120.jpg?v=1631030321',
      },
    ],
    status: 'fulfilled',
  },
  {
    orderno: 123124325,
    email: 'test@fraenck.com',
    date: '2023-01-01T12:34:56',
    items: [
      {
        itemno: 12341,
        name: 'Fietstas Brook',
        variant: 'Donkerblauw',
        image:
          'https://cdn.shopify.com/s/files/1/0337/6024/7852/products/brook-855186_1120x1120.jpg?v=1623347172',
      },
      {
        itemno: 12342,
        name: 'Etui Kim',
        variant: 'Rood',
        image:
          'https://cdn.shopify.com/s/files/1/0337/6024/7852/products/kim-684595_1120x1120.jpg?v=1631030321',
      },
    ],
    status: 'paid',
  },
];

export async function orderLoader({ params }: { orderId: string }) {
  const { orderId } = params;
  // Set up the order handler
  // window.electron.getOrders.once('get-orders', (o) => {
  //   return { o };
  // });
  // Get the orders
  // window.electron.getOrders.getOrders();
  return window.electron.getOrders
    .testThing()
    .then((orders: Order[]) =>
      orders.find((order) => order.orderno === orderId)
    )
    .catch((e) => console.log(e));
  // return {
  //   orderid: orderId,
  // };
}

function OrderPage() {
  const test: Order = useLoaderData();
  console.log(test);
  // const { order } = props;
  return (
    <div>
      <Link to="/orders">Terug</Link>
      Order #{test.orderno}
      <br />
      blablabla
    </div>
  );
}

function OrderBlob(props: { order: Order }) {
  const { order } = props;

  const dateOptions = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };

  return (
    <div className={`order-blob order-status-${order.status}`}>
      <img src={order.items[0].image} alt={order.items[0].name} />
      <div className="order-info">
        <div>Ordernummer:</div>
        <div>
          <Link
            to={`/orders/${order.orderno}`}
          >{`${order.source}/${order.orderno}`}</Link>
        </div>
        <div>Email:</div>
        <div>
          <a href={`mailto:${order.email}`}>{order.email}</a>
        </div>
        <div>Datum:</div>
        {/* <div>{new Date(order.date).toLocaleString('NL-nl', dateOptions)}</div> */}
        <div>{new Date(order.date).toISOString()}</div>
      </div>
    </div>
  );
}

function Orders(props: any) {
  const [orders, setOrders] = useState<Order[]>();
  const [tokenClient, setTokenClient] = useState(null);
  const [items, setItems] = useState({});

  function addOrder() {
    if (!orders || orders.length < 1) {
      return;
    }
    const newOrder = structuredClone(orders[orders.length - 1]);
    newOrder.orderno += 1;
    setOrders([...orders, newOrder]);
  }

  useEffect(() => {
    // Set up the order handler
    window.electron.getOrders.once('get-orders', (o) => setOrders(o));
    // Get the orders
    window.electron.getOrders.getOrders();
  }, []);

  const orderList =
    orders && orders.length > 0 ? (
      orders?.map((order) => <OrderBlob order={order} key={order.orderno} />)
    ) : (
      <div>Loading orders...</div>
    );

  return (
    <div>
      Orders
      <div>{orderList}</div>
      <button onClick={() => alert('Laad orders')} type="button">
        Laad orders
      </button>
      <button onClick={() => alert('Log uit')} type="button">
        Log out
      </button>
      <button onClick={addOrder} type="button">
        Voeg order toe
      </button>
    </div>
  );
}

// export default Order;
export { Orders, OrderPage };
