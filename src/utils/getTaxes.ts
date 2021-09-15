export const getTaxesByName = (productId, currentTaxes) => {
  const taxes = [];
  let finalTaxes = [];
  let taxFilter;
  let taxLoop;
  taxLoop = currentTaxes.map((findTaxes) => {
    taxFilter = findTaxes.products.filter((product) => {
      if (product.productId === productId) {
        taxes.push(findTaxes);
      }
      return product.productId === productId;
    });
    return findTaxes;
  });

  finalTaxes = taxes.map(tax => {
    return tax;
  });
  return finalTaxes;
};
