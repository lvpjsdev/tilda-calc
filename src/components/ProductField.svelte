<script lang="ts">
  import type { Product, ProductEdition, ProductOption } from '../types';

  interface VariantQuantity {
    title: string;
    price: string;
    quantity: number;
    checked: boolean;
  }

  let {
    products,
    options = [],
    selectedUid = $bindable(0),
    variantQuantities = $bindable<VariantQuantity[]>([]),
  } = $props();

  let total = 0; // Total sum of selected products and variants

  let quantity = $state(0); // For services without variants

  function getVariants(
    product: Product | null,
    options: ProductOption[]
  ): Array<{ title: string; price: string }> {
    if (!product || !product.editions) return [];
    const optionKeys = options.map((option) => option.title);

    return product.editions.map((edition) => {
      console.log('edition', edition);
      console.log('optionKeys', optionKeys);

      const title = optionKeys.reduce((acc, key) => {
        console.log(key);

        // Проверяем наличие свойства через оператор in
        return (
          acc +
          (key in edition ? String(edition[key as keyof ProductEdition]) : '')
        );
      }, '');

      return {
        title,
        price: edition.price,
      };
    });
  }
  type Variant = {
    title: string;
    price: string;
  };

  let selectedProduct = $derived.by(() =>
    products.find((p: Product) => p.uid === selectedUid)
  );
  let variants = $derived.by(() => getVariants(selectedProduct, options));

  $effect(() => {
    if (variants) {
      variantQuantities = variants.map((v: Variant) => ({
        ...v,
        quantity: 0,
        checked: variants.length === 1,
      }));
    } else {
      variantQuantities = [];
    }
  });

  $effect(() => {
    total = 0;
    if (selectedUid > 0 && variantQuantities.length === 0) {
      total += quantity * parseInt(selectedProduct?.price || '0');
    }
    if (variantQuantities.length > 0) {
      total += variantQuantities.reduce((sum, variant) => {
        return (
          sum +
          (variant.checked ? variant.quantity * parseInt(variant.price) : 0)
        );
      }, 0);
    }
  });

  function handleProductChange(newUid: number) {
    selectedUid = newUid;
  }

  function handleVariantChange(index: number, checked: boolean) {
    variantQuantities[index].checked = checked;
    if (!checked) {
      variantQuantities[index].quantity = 0;
    }
  }

  function handleQuantityChange(index: number, quantity: number) {
    variantQuantities[index].quantity = quantity;
    if (quantity > 0 && !variantQuantities[index].checked) {
      variantQuantities[index].checked = true;
    }
  }

  function getOptionString(product: Product): string {
    if (!product) return 'Выберите услугу';

    if (isNaN(Number(product.price))) {
      return `${product.title} - ${product.price}`;
    }

    if (Number(product.price) !== 0) {
      return `${product.title} - ${product.price}₽`;
    }

    return `${product.title}`;
  }
</script>

<div class="lvp-t-calc_service-item">
  <select
    class="lvp-t-calc_service-select"
    bind:value={selectedUid}
    onchange={() => handleProductChange(selectedUid)}
    required
  >
    <option value={0} disabled selected>Выберите услугу</option>
    {#each products as product}
      <option value={product.uid}>{getOptionString(product)}</option>
    {/each}
  </select>
  {#if selectedUid > 0 && variantQuantities.length === 0}
    <div class="lvp-t-calc_quantity-wrapper">
      <label for="quantity-input">Количество:</label>
      <input
        id="quantity-input"
        type="number"
        inputmode="numeric"
        class="lvp-t-calc_quantity-input"
        bind:value={quantity}
        oninput={(e) => (quantity = parseInt(e.currentTarget.value) || 0)}
        min="1"
        max="999"
        required
      />
    </div>
  {:else if selectedUid > 0 && variantQuantities.length > 0}
    <div class="lvp-t-calc_variants-list">
      {#each variantQuantities as variant, i}
        <div class="lvp-t-calc_variant-item">
          {#if variantQuantities.length > 1}
            <label class="lvp-t-calc_variant-label">
              <input
                type="checkbox"
                bind:checked={variant.checked}
                onchange={(e) =>
                  handleVariantChange(i, e.currentTarget.checked)}
              />
              <span>{getOptionString(variant)}</span>
            </label>
            {#if variant.checked}
              <input
                type="number"
                inputmode="numeric"
                class="lvp-t-calc_quantity-input"
                bind:value={variant.quantity}
                oninput={(e) =>
                  handleQuantityChange(i, parseInt(e.currentTarget.value) || 0)}
                min="1"
                max="999"
                required
              />
            {/if}
            {#if variant.quantity > 0}
              <span class="lvp-t-calc_total-price">
                {isNaN(parseInt(variant.price))
                  ? variant.price
                  : variant.quantity * parseInt(variant.price) + '₽'}
              </span>
            {/if}
          {:else}
            <input
              type="number"
              inputmode="numeric"
              class="lvp-t-calc_quantity-input"
              bind:value={variant.quantity}
              oninput={(e) =>
                handleQuantityChange(i, parseInt(e.currentTarget.value) || 0)}
              min="1"
              max="999"
              required
            />
            {#if variant.quantity > 0}
              <span class="lvp-t-calc_total-price">
                {isNaN(parseInt(variant.price))
                  ? variant.price
                  : variant.quantity * parseInt(variant.price) + '₽'}
              </span>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lvp-t-calc_service-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    width: 100%;
    overflow: hidden;
    flex-direction: column;
  }

  .lvp-t-calc_variants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .lvp-t-calc_variant-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lvp-t-calc_variant-label {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    cursor: pointer;
  }

  .lvp-t-calc_service-select,
  .lvp-t-calc_quantity-input {
    padding: 10px;
    border: 1px solid var(--lvp-t-calc-color-border);
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Montserrat', Arial, sans-serif;
  }

  .lvp-t-calc_service-select {
    min-width: 200px;
    max-width: 100%;
    width: 100%;
  }

  .lvp-t-calc_quantity-input {
    width: 80px;
    flex-shrink: 0;
  }

  .lvp-t-calc_total-price {
    min-width: 80px;
    text-align: right;
  }
</style>
