export interface Edition {
  uid: number;
  price: string;
}

export interface MockProduct {
  uid: number;
  title: string;
  price: string;
  editions: Edition[];
}

export interface ProductOption {
  title: string;
  params: {
    view: string;
    hasColor?: boolean;
    linkImage?: boolean;
  };
  values: {
    id: number;
    value: string;
  }[];
}

export interface ProductProperty {
  title: string;
  params: {
    type: string;
    view?: string;
    hasColor?: boolean;
    linkImage?: boolean;
  };
  sort: number;
  values: string;
}

export interface ProductEdition {
  uid: number;
  price: string;
}

export interface Product {
  uid: number;
  title: string;
  price: string;
  json_options: string;
  properties?: ProductProperty[];
  editions?: ProductEdition[];
}

export interface OrderFormData {
  email: string;
  products: {
    product: Product | undefined;
    variants: {
      title: string;
      price: string;
      quantity: number;
      checked: boolean;
    }[];
  }[];
}
