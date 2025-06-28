type FormState = {
  selectedProducts: {
    title: string;
    uid: number;
    price: string;
    quantity: number;
  }[];
};

export type TFormStore = {
  state: FormState;
  addProduct: (product: {
    title: string;
    uid: number;
    price: string;
    quantity: number;
  }) => void;
  removeProduct: (uid: number) => void;
  updateProduct: (
    uid: number,
    updatedProduct: { title?: string; price?: string; quantity?: number }
  ) => void;
  clearProducts: () => void;
  getTotalPrice: () => string;
};

class FormStore implements TFormStore {
  state: FormState = {
    selectedProducts: [],
  };

  addProduct(product: {
    title: string;
    uid: number;
    price: string;
    quantity: number;
  }) {
    // Check if the product already exists in the selectedProducts array
    const existingProduct = this.state.selectedProducts.find(
      (p) => p.uid === product.uid
    );

    this.state.selectedProducts.push({ ...product, quantity: 1 });
  }

  removeProduct(uid: number) {
    this.state.selectedProducts = this.state.selectedProducts.filter(
      (p) => p.uid !== uid
    );
  }

  updateProduct(
    uid: number,
    updatedProduct: { title?: string; price?: string; quantity?: number }
  ) {
    const product = this.state.selectedProducts.find((p) => p.uid === uid);
    if (product) {
      Object.assign(product, updatedProduct);
    }
  }

  clearProducts() {
    this.state.selectedProducts = [];
  }

  getTotalPrice() {
    return this.state.selectedProducts
      .reduce(
        (total, product) =>
          total + parseFloat(product.price) * product.quantity,
        0
      )
      .toFixed(2);
  }
}
