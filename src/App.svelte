<script lang="ts">
  import ProductField from './components/ProductField.svelte';
  import mockData from './mocks.json';
  import type { Product, ProductOption } from './types';

  interface FieldData {
    id: number;
    selectedUid: number;
    variantQuantities: Array<{
      title: string;
      price: string;
      quantity: number;
      checked: boolean;
    }>;
  }

  const products: Product[] = mockData.products;
  const options: ProductOption[] = mockData.options;
  let email = $state('');
  let productFields = $state<FieldData[]>([
    {
      id: Date.now(),
      selectedUid: 0,
      variantQuantities: []
    }
  ]);

  function addNewField() {
    productFields = [...productFields, {
      id: Date.now(),
      selectedUid: 0,
      variantQuantities: []
    }];
  }

  const total = $derived.by(() => {
    return productFields.reduce((sum, field) => {
      return sum + field.variantQuantities.reduce((fieldSum, variant) => {
        if (variant.checked && variant.quantity > 0) {
          return fieldSum + variant.quantity * parseInt(variant.price);
        }
        return fieldSum;
      }, 0);
    }, 0);
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    const formData = {
      email: email,
      products: productFields.map(field => ({
        id: field.id,
        product: products.find(p => p.uid === field.selectedUid),
        variants: field.variantQuantities.filter(v => v.checked && v.quantity > 0)
      }))
    };
    console.log('Form data:', formData);
  }
</script>

<div class="lvp-t-calc_container">
  <form class="lvp-t-calc_service-form" onsubmit={handleSubmit}>
    <div class="lvp-t-calc_service-items">
      <!-- {#each productRows as row, index}
        <div class="lvp-t-calc_service-item">
          <div class="lvp-t-calc_service-select-wrapper">
          <select 
            class="lvp-t-calc_service-select"
            value={row.uid}
            onchange={(e) => {
              const target = e.target as HTMLSelectElement;
              updateProduct(index, parseInt(target.value));
            }}
            required
          >
            <option value="" disabled selected>Выберите услугу</option>
            {#each products as product}
              <option value={product.uid}>{product.title} - {product.price}₽</option>
            {/each}
          </select>
          <button
            type="button"
            class="lvp-t-calc_delete-btn"
            onclick={() => deleteRow(index)}
            style="visibility: {productRows.length > 1 ? 'visible' : 'hidden'}"
            aria-label="Удалить строку"
          >
          </button>
          </div>
          <div class="lvp-t-calc_service-select-wrapper">

          <input
            type="number"
            class="lvp-t-calc_quantity-input"
            value={row.quantity}
            min="1"
            max="999"
            onchange={(e) => {
              const target = e.target as HTMLInputElement;
              updateQuantity(index, parseInt(target.value) || 0);
            }}
            disabled={!row.edition}
            required
          />

          <div class="lvp-t-calc_item-total">
            {(row.price * row.quantity).toFixed(2)}₽
          </div>
          </div>
        </div>
      {/each} -->
      {#each productFields as field (field.id)}
        <div class="lvp-t-calc_field-wrapper">
          <ProductField
            products={products}
            options={options}
            bind:selectedUid={field.selectedUid}
            bind:variantQuantities={field.variantQuantities}
          />
        </div>
      {/each}
    </div>

    <button type="button" class="lvp-t-calc_add-service-btn" onclick={addNewField}>
      + Добавить услугу
    </button>

    <div class="lvp-t-calc_total-section">
      <span>Общая сумма:</span>
      <span class="lvp-t-calc_total-amount">{total.toFixed(2)}₽</span>
    </div>

    <div class="lvp-t-calc_email-section">
      <input
        type="email"
        class="lvp-t-calc_email-input"
        placeholder="Введите ваш email"
        bind:value={email}
        required
      />
    </div>

    <button type="submit" class="lvp-t-calc_order-btn">Заказать</button>
  </form>
</div>

<style>
:global(:root) {
  --lvp-t-calc-color-background: #f5f5f5;
  --lvp-t-calc-color-white: #ffffff;
  --lvp-t-calc-color-border: #dddddd;
  --lvp-t-calc-color-shadow: rgba(0, 0, 0, 0.1);
  --lvp-t-calc-color-text: #333333;
  --lvp-t-calc-color-text-dark: #2c3e50;
  --lvp-t-calc-color-border-light: #eeeeee;
  --lvp-t-calc-gradient-start: rgba(0, 0, 0, 1);
  --lvp-t-calc-gradient-middle: rgba(0, 31, 70, 1);
  --lvp-t-calc-gradient-end: rgba(0, 19, 46, 1);
}

:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(body) {
  font-family: 'Montserrat', Arial, sans-serif;
  background-color: var(--lvp-t-calc-color-background);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lvp-t-calc_container {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

.lvp-t-calc_service-form {
  background-color: var(--lvp-t-calc-color-white);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--lvp-t-calc-color-shadow);
}

.lvp-t-calc_service-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.lvp-t-calc_field-wrapper {
  position: relative;
  width: 100%;
  border: 1px solid var(--lvp-t-calc-color-border-light);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.lvp-t-calc_service-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  overflow: hidden;
  flex-direction: column;
}

.lvp-t-calc_service-select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.lvp-t-calc_service-select,
.lvp-t-calc_quantity-input,
.lvp-t-calc_email-input {
  padding: 10px;
  border: 1px solid var(--lvp-t-calc-color-border);
  border-radius: 4px;
  font-size: 14px;
  min-width: 0;
  width: 100%;
  font-family: 'Montserrat', Arial, sans-serif;
}

.lvp-t-calc_service-select {
  min-width: 200px;
  max-width: 100%;
}

.lvp-t-calc_quantity-input {
  width: 80px;
  flex-shrink: 0;
}

.lvp-t-calc_item-total {
  font-size: 14px;
  font-weight: bold;
  color: var(--lvp-t-calc-color-text);
  width: 80px;
  text-align: right;
  flex-shrink: 0;
}

.lvp-t-calc_total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin: 20px 0;
  border-top: 1px solid var(--lvp-t-calc-color-border-light);
  border-bottom: 1px solid var(--lvp-t-calc-color-border-light);
  font-size: 16px;
}

.lvp-t-calc_total-amount {
  font-weight: bold;
  color: var(--lvp-t-calc-color-text-dark);
  font-size: 18px;
}

.lvp-t-calc_add-service-btn,
.lvp-t-calc_order-btn {
  width: 100%;
  padding: 12px;
  color: var(--lvp-t-calc-color-white);
  font-size: 12px;
  font-family: 'Montserrat', Arial, sans-serif;
  line-height: 1.55;
  font-weight: 700;
  border-radius: 30px;
  background-image: linear-gradient(
    0turn,
    var(--lvp-t-calc-gradient-start) 0%,
    var(--lvp-t-calc-gradient-middle) 50%,
    var(--lvp-t-calc-gradient-end) 100%
  );
  border-color: transparent;
  border-style: solid;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
  cursor: pointer;
}

.lvp-t-calc_add-service-btn {
  margin-bottom: 20px;
}

.lvp-t-calc_email-section {
  margin-bottom: 20px;
}

.lvp-t-calc_email-input {
  width: 100%;
}

.lvp-t-calc_add-service-btn:hover,
.lvp-t-calc_order-btn:hover {
  opacity: 0.9;
}

.lvp-t-calc_delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--lvp-t-calc-color-border);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
}

.lvp-t-calc_delete-btn::before,
.lvp-t-calc_delete-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background-color: var(--lvp-t-calc-color-text);
  transition: background-color 0.2s ease-in-out;
}

.lvp-t-calc_delete-btn::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.lvp-t-calc_delete-btn::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.lvp-t-calc_delete-btn:hover {
  border-color: #ff0000;
}

.lvp-t-calc_delete-btn:hover::before,
.lvp-t-calc_delete-btn:hover::after {
  background-color: #ff0000;
}
</style>
