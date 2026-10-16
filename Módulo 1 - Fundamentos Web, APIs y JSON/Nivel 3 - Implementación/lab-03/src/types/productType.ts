export type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
};

export type Products = Product[];

export type ProductsSet = {
  products: Products;
};

export type RawProductsResponse = {
  products: unknown[];
  total: number;
};

export type ProductsResponse = Omit<RawProductsResponse, "products"> &
  ProductsSet;

type SkipCursor = {
  skipCursor: number | null;
};

export type ProductsAndCursor = ProductsSet & SkipCursor;

export type ProductsResponseWithCursor = ProductsResponse & SkipCursor;

export type DepurationResult = ProductsSet & {
  duplicatedProducts: number;
} & SkipCursor;

export type ProductsTransformation = {
  transformedProducts: Products;
  productsQuantity: number;
};
