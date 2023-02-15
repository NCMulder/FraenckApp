import { JSDOM } from 'jsdom';
import { google } from 'googleapis';
import { web } from './google_keys.json';

type Order = {
  orderno: string | undefined;
  date: string | undefined;
  email: string | undefined;
  status: string | undefined;
  source: 'ohmygood' | 'Shopify' | undefined;
  items: Item[] | undefined;
};
type Item = {
  itemno: string | undefined;
  name: string | undefined;
  variant: string | undefined;
  image: string | undefined;
  quantity: string | undefined;
};

/**
 * Gets the ohmygood order data from gmail and parses it
 * @param tokens The google gmail oath tokens
 * @returns A list of orders
 */
async function getOhmygoodOrders(tokens: Credentials): Promise<Order[]> {
  console.log('Getting ohmygood orders...');

  const gmail = google.gmail('v1');
  const oauth = new google.auth.OAuth2(
    web.client_id,
    web.client_secret,
    'https://fraenck.com'
  );

  oauth.setCredentials(tokens);
  google.options({ auth: oauth });

  // Get the order data from gmail by:
  // - first getting the ohmygood label
  // - then getting the email ids for the labeled emails
  // - then getting the full emails
  // - then parsing the emails
  return gmail.users.labels
    .list({
      userId: 'me',
    })
    .then(function getMailIds(labels) {
      // Parse the labels for ohmygood and find the messages with the
      // corresponding label
      if (!labels.data.labels) {
        throw Error("Didn't find any labels");
      }

      const labelIds = labels.data.labels
        .filter((label) => label.name?.includes('ohmygood'))
        .map((label) => label.id || '');

      return gmail.users.messages.list({ labelIds, userId: 'me' });
    })
    .then(function getMessages(mailIds) {
      // Get the full messages from the message ids
      if (!mailIds.data.messages) {
        throw Error("Didn't find any messages");
      }

      return Promise.all(
        mailIds.data.messages.map((mailInfo) =>
          // Messages we get from Gmail have ids
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          gmail.users.messages.get({ userId: 'me', id: mailInfo.id! })
        )
      );
    })
    .then(function parseMessages(messages) {
      const messageData = messages.map((message) =>
        Buffer.from(message.data.payload?.body?.data || '', 'base64').toString(
          'utf8'
        )
      );

      return messageData.map(function parseMessage(message) {
        const newOrder: Order = {
          orderno: undefined,
          date: undefined,
          email: undefined,
          status: undefined,
          source: undefined,
          items: undefined,
        };

        // Parse the message
        // const emaildoc = parser.parseFromString(message, 'text/html');
        const emaildoc = new JSDOM(message).window.document.body;

        // Orderno
        const ordernoHTML = emaildoc.getElementsByTagName('h2')[0].innerHTML;
        const ordernoRegex = /Bestelling #(\d*) .*/;
        const orderno = ordernoHTML.match(ordernoRegex);
        newOrder.orderno = orderno?.at(1);

        // Date
        const dateRegex = /datetime="(.*?)">/;
        const date = ordernoHTML.match(dateRegex);
        newOrder.date = date?.at(1);

        // Email
        const addressHTML = emaildoc.getElementsByTagName('address')[0];
        const addressLines = addressHTML.innerHTML.split('<br>');
        const email = addressLines[addressLines.length - 1].trim();
        newOrder.email = email;

        // Items
        const items: Item[] = [];
        const orderItems = emaildoc.getElementsByClassName('order_item');
        Array.from(orderItems).forEach((orderItem) => {
          const item: Item = {
            itemno: undefined,
            name: undefined,
            variant: undefined,
            image: undefined,
            quantity: undefined,
          };

          const itemHTML = orderItem.getElementsByTagName('td');
          const itemRegex = /(.*?) - (.*?) \(#(\d*)\)/;
          const itemParsed = itemHTML.item(0)?.textContent?.match(itemRegex);
          item.name = itemParsed?.at(1);
          item.variant = itemParsed?.at(2);
          item.itemno = itemParsed?.at(3);

          item.quantity = itemHTML.item(1)?.textContent || undefined;

          item.image =
            'https://upload.wikimedia.org/wikipedia/commons/e/e5/HUC_031300010104_-_Chickamauga_Creek.PNG'; // channableItems[item.itemno].imageurl;

          items.push(item);
        });

        newOrder.items = items;

        // Status, source
        newOrder.status = 'paid';
        newOrder.source = 'ohmygood';

        return newOrder;
      });
    })
    .catch((error) => {
      console.log(error);
      return [];
    });

  // if (response.data.labels === undefined) {
  //   return [];
  // }

  // // Find the labelid for ohmygood
  // const labelIds = response.data.labels
  //   .filter((label) => label.name?.includes('ohmygood'))
  //   .map((label) => label.id || '0');

  // Find the messageids with the ohmygood label
  // const mailIds = await gmail.users.messages.list({
  //   labelIds,
  //   userId: 'me',
  // });
  // if (mailIds.data.messages === undefined) {
  //   return [];
  // }

  // Get the messages with the above ids
  // const messages: string[] = [];

  // await Promise.all(
  //   mailIds.data.messages.map(async (mailInfo, i) => {
  //     if (mailInfo.id === undefined || mailInfo.id === null) {
  //       return;
  //     }
  //     // Get the message
  //     const mail = await gmail.users.messages.get({
  //       userId: 'me',
  //       id: mailInfo.id,
  //     });

  //     // console.log(mail.data.payload?.body?.data);

  //     // Decode the message
  //     const message = Buffer.from(
  //       mail.data.payload?.body?.data || '',
  //       'base64'
  //     ).toString('utf8');
  //     messages.push(message);
  //   })
  // ).catch((err) => {
  //   console.log(err);
  // });

  // const newOrders: Order[] = [];
  // // Parse the messages for the relevant information
  // // This is VERY dependent on the particular ohmygood email we get
  // messages.forEach((message) => {
  //   const newOrder: Order = {
  //     orderno: undefined,
  //     date: undefined,
  //     email: undefined,
  //     status: undefined,
  //     source: undefined,
  //     items: undefined,
  //   };

  //   // Parse the message
  //   // const emaildoc = parser.parseFromString(message, 'text/html');
  //   const emaildoc = new JSDOM(message).window.document.body;

  //   // Orderno
  //   const ordernoHTML = emaildoc.getElementsByTagName('h2')[0].innerHTML;
  //   const ordernoRegex = /Bestelling #(\d*) .*/;
  //   const orderno = ordernoHTML.match(ordernoRegex);
  //   newOrder.orderno = orderno?.at(1);

  //   // Date
  //   const dateRegex = /datetime="(.*?)">/;
  //   const date = ordernoHTML.match(dateRegex);
  //   newOrder.date = date?.at(1);

  //   // Email
  //   const addressHTML = emaildoc.getElementsByTagName('address')[0];
  //   const addressLines = addressHTML.innerHTML.split('<br>');
  //   const email = addressLines[addressLines.length - 1].trim();
  //   newOrder.email = email;

  //   // Items
  //   const items: Item[] = [];
  //   const orderItems = emaildoc.getElementsByClassName('order_item');
  //   Array.from(orderItems).forEach((orderItem) => {
  //     const item: Item = {
  //       itemno: undefined,
  //       name: undefined,
  //       variant: undefined,
  //       image: undefined,
  //       quantity: undefined,
  //     };

  //     const itemHTML = orderItem.getElementsByTagName('td');
  //     const itemRegex = /(.*?) - (.*?) \(#(\d*)\)/;
  //     const itemParsed = itemHTML.item(0)?.textContent?.match(itemRegex);
  //     item.name = itemParsed?.at(1);
  //     item.variant = itemParsed?.at(2);
  //     item.itemno = itemParsed?.at(3);

  //     item.quantity = itemHTML.item(1)?.textContent || undefined;

  //     item.image =
  //       'https://upload.wikimedia.org/wikipedia/commons/e/e5/HUC_031300010104_-_Chickamauga_Creek.PNG'; // channableItems[item.itemno].imageurl;

  //     items.push(item);
  //   });

  //   newOrder.items = items;

  //   // Status, source
  //   newOrder.status = 'paid';
  //   newOrder.source = 'ohmygood';

  //   newOrders.push(newOrder);
  // });
  // return newOrders;
}

/**
 * Gets the Shopify order data from the Shopify API
 * @returns A list of orders
 */
async function getShopifyOrders(): Promise<Order[]> {
  console.log('Getting Shopify orders...');
  return [];
}

/**
 * Gets order data from several sources
 */
async function getOrders(tokens: Credentials): Promise<Order[]> {
  return Promise.all([getShopifyOrders(), getOhmygoodOrders(tokens)])
    .then(([shopifyOrders, ohmygoodOrders]) => [
      ...shopifyOrders,
      ...ohmygoodOrders,
    ])
    .catch((error) => {
      console.log(error);
      return [];
    });

  try {
    // First, get the feed data from Channable

    // Get all the labels
    const gmail = google.gmail('v1');
    const oauth = new google.auth.OAuth2(
      web.client_id,
      web.client_secret,
      'https://fraenck.com'
    );

    oauth.setCredentials(tokens);
    google.options({ auth: oauth });

    // Do the magic
    const response = await gmail.users.labels.list({
      // The user's email address. The special value `me` can be used to indicate the authenticated user.
      userId: 'me',
    });

    if (response.data.labels === undefined) {
      return [];
    }

    // Find the labelid for ohmygood
    const labelIds = response.data.labels
      .filter((label) => label.name?.includes('ohmygood'))
      .map((label) => label.id || '0');

    // Find the messageids with the ohmygood label
    const mailIds = await gmail.users.messages.list({
      labelIds,
      userId: 'me',
    });
    if (mailIds.data.messages === undefined) {
      return [];
    }

    // Get the messages with the above ids
    const messages: string[] = [];

    await Promise.all(
      mailIds.data.messages.map(async (mailInfo, i) => {
        if (mailInfo.id === undefined || mailInfo.id === null) {
          return;
        }
        // Get the message
        const mail = await gmail.users.messages.get({
          userId: 'me',
          id: mailInfo.id,
        });

        // console.log(mail.data.payload?.body?.data);

        // Decode the message
        const message = Buffer.from(
          mail.data.payload?.body?.data || '',
          'base64'
        ).toString('utf8');
        messages.push(message);
      })
    ).catch((err) => {
      console.log(err);
    });

    const newOrders: Order[] = [];
    // Parse the messages for the relevant information
    // This is VERY dependent on the particular ohmygood email we get
    messages.forEach((message) => {
      const newOrder: Order = {
        orderno: undefined,
        date: undefined,
        email: undefined,
        status: undefined,
        source: undefined,
        items: undefined,
      };

      // Parse the message
      // const emaildoc = parser.parseFromString(message, 'text/html');
      const emaildoc = new JSDOM(message).window.document.body;

      // Orderno
      const ordernoHTML = emaildoc.getElementsByTagName('h2')[0].innerHTML;
      const ordernoRegex = /Bestelling #(\d*) .*/;
      const orderno = ordernoHTML.match(ordernoRegex);
      newOrder.orderno = orderno?.at(1);

      // Date
      const dateRegex = /datetime="(.*?)">/;
      const date = ordernoHTML.match(dateRegex);
      newOrder.date = date?.at(1);

      // Email
      const addressHTML = emaildoc.getElementsByTagName('address')[0];
      const addressLines = addressHTML.innerHTML.split('<br>');
      const email = addressLines[addressLines.length - 1].trim();
      newOrder.email = email;

      // Items
      const items: Item[] = [];
      const orderItems = emaildoc.getElementsByClassName('order_item');
      Array.from(orderItems).forEach((orderItem) => {
        const item: Item = {
          itemno: undefined,
          name: undefined,
          variant: undefined,
          image: undefined,
          quantity: undefined,
        };

        const itemHTML = orderItem.getElementsByTagName('td');
        const itemRegex = /(.*?) - (.*?) \(#(\d*)\)/;
        const itemParsed = itemHTML.item(0)?.textContent?.match(itemRegex);
        item.name = itemParsed?.at(1);
        item.variant = itemParsed?.at(2);
        item.itemno = itemParsed?.at(3);

        item.quantity = itemHTML.item(1)?.textContent || undefined;

        item.image =
          'https://upload.wikimedia.org/wikipedia/commons/e/e5/HUC_031300010104_-_Chickamauga_Creek.PNG'; // channableItems[item.itemno].imageurl;

        items.push(item);
      });

      newOrder.items = items;

      // Status, source
      newOrder.status = 'paid';
      newOrder.source = 'ohmygood';

      newOrders.push(newOrder);
    });
    return newOrders;
  } catch (err) {
    // alert(err.message);
    console.log(err.message);
    return [];
  }
}

export default getOrders;
