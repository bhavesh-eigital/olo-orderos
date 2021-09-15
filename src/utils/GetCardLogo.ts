export const getCardLogo = (cardName) => {
  let cardNameLogo = '';

  switch (cardName) {
    case 'amex':
      cardNameLogo = 'American.svg';
      break;
    case 'discover':
      cardNameLogo = 'Discover.svg';
      break;
    case 'disc':
      cardNameLogo = 'Discover.svg';
      break;
    case 'mastercard':
      cardNameLogo = 'Mastercard.svg';
      break;
    case 'visa':
      cardNameLogo = 'Visa.svg';
      break;
    case 'mc':
      cardNameLogo = 'Mastercard.svg';
      break;
    case 'diners':
      cardNameLogo = 'Diners.svg';
      break;
    case 'jcb':
      cardNameLogo = 'JCB.svg';
      break;
    case 'unionpay':
      cardNameLogo = 'union.svg';
      break;
  }
  return cardNameLogo;
};
