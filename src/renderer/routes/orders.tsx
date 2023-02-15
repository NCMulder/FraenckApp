import { useEffect, useState } from 'react';
// import { Buffer } from 'buffer';
// import googleKeys from '../google_keys.json';

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

function Order() {
  return (
    <div>
      Order # <br />
      blablabla
    </div>
  );
}

function OrderBlob(props: any) {
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
        <div>{`${order.source}/${order.orderno}`}</div>
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
  const [orders, setOrders] = useState(ordersData);
  const [tokenClient, setTokenClient] = useState(null);
  const [items, setItems] = useState({});

  function addOrder() {
    const newOrder = structuredClone(orders[orders.length - 1]);
    newOrder.orderno += 1;
    setOrders([...orders, newOrder]);
  }

  return (
    <div>
      Orders
      <div>
        {orders.map((order) => (
          <OrderBlob order={order} key={order.orderno} />
        ))}
      </div>
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

export default Order;
export { Orders, Order };
