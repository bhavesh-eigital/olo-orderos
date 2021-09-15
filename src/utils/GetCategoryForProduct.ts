export const findCategories = (productId, categories) => {
  const categorySelected = [];
  categories.filter((category) => {
    category.products.map(products => {
      if (products.productId === productId) {
        categorySelected.push(category);
      }
    });
  });
  return categorySelected[0];
};
