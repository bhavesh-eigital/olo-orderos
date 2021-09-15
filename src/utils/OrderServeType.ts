export const orderServeType = (orderType) => {
  let message = '';

  switch (orderType) {
    case 1:
      message = 'No Confirm';
      break;
    case 2:
      message = 'Order Accepted';
      break;
    case 3:
      message = 'ACTION REQUIRED';
      break;
    case 4:
      message = 'Order Preparing';
      break;
    case 5:
      message = 'Order Prepared';
      break;
    case 6:
      message = 'Out for Delivery';
      break;
    case 7:
      message = 'Order Completed';
      break;
    case 8:
      message = 'Order Cancelled';
      break;
    case 9:
      message = 'Order Scheduled';
      break;
  }

  return message;
};
