import type {
  Products,
  ProductsTransformation,
} from "../types/productType.ts";

export const transformProducts = (
  depuratedProducts: Products,
): ProductsTransformation => {
  let productsQuantity: number = 0;
  const transformedProducts: Products = [];

  depuratedProducts.forEach((p) => {
    transformedProducts.push({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
    });
    productsQuantity++;
  });

  return { transformedProducts: transformedProducts, productsQuantity };
};
