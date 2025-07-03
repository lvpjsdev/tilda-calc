<script lang="ts">
  import ProductField from './ProductField.svelte';
  import {
    downloadPDF,
    generatePdf,
    mapFormDataToPdfData,
  } from '../lib/pdf-utils';
  import type { Product, ProductOption } from '../types';
  import { sendEmail } from '../lib/email';
  import { getProducts } from '../api';

  let isGeneratingPdf = $state(false);
  let isLoading = $state(true);

  let products: Product[] = $state([]);
  let options: ProductOption[] = $state([]);

  // Убрали лишний $effect и неправильное использование реактивности
  // Загружаем данные при инициализации компонента
  $effect(() => {
    async function loadProducts() {
      try {
        isLoading = true;
        const data = await getProducts();

        // Обновляем состояние
        products = (data.products || []).map((product) => ({
          ...product,
          uid: Number(product.uid),
          editions: product.editions?.map((edition) => ({
            ...edition,
            uid: Number(edition.uid),
          })),
        }));
        options = data.options || [];
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        isLoading = false;
      }
    }

    loadProducts();
  });

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

  let email = $state('');
  let customerName = $state('');
  let customField = $state(''); // Кастомное числовое поле, изначально пустое
  let productFields = $state<FieldData[]>([
    {
      id: Date.now(),
      selectedUid: 0,
      variantQuantities: [],
    },
  ]);

  let total = $state(0);

  // Пересчет общей суммы при изменении полей
  $effect(() => {
    total = productFields.reduce((sum, field) => {
      return (
        sum +
        field.variantQuantities.reduce((fieldSum, variant) => {
          if (variant.checked) {
            const price = parseFloat(variant.price);
            return fieldSum + (isNaN(price) ? 0 : price * variant.quantity);
          }
          return fieldSum;
        }, 0)
      );
    }, 0);
  });

  // Добавление нового поля
  function addNewField() {
    productFields = [
      ...productFields,
      {
        id: Date.now(),
        selectedUid: 0,
        variantQuantities: [
          {
            title: '',
            price: '',
            quantity: 1, // Базовое значение количества
            checked: false,
          },
        ],
      },
    ];
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    try {
      isGeneratingPdf = true;

      // Формируем данные
      const formData = {
        customerName,
        email,
        customField: customField === '' ? '' : Number(customField),
        products: productFields.map((field) => ({
          product: products.find((p) => p.uid === field.selectedUid),
          variants: field.variantQuantities,
        })),
      };

      const dataForPdf = mapFormDataToPdfData(formData);
      const pdfBytes = await generatePdf(dataForPdf);

      await sendEmail(email, dataForPdf);
      downloadPDF(pdfBytes, `order-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      isGeneratingPdf = false;
    }
  }
</script>

<div class="lvp-t-calc_container">
  {import.meta.env.DEV ? 'owner' : ''}
  {#if isLoading}
    <div class="lvp-t-calc_loading">Загрузка данных...</div>
  {:else}
    <form class="lvp-t-calc_service-form" onsubmit={handleSubmit}>
      <div class="lvp-t-calc_service-items">
        {#each productFields as field (field.id)}
          <div class="lvp-t-calc_field-wrapper">
            <ProductField
              products={[...products, { uid: -1, title: 'Другое', price: '0' }]}
              {options}
              bind:selectedUid={field.selectedUid}
              bind:variantQuantities={field.variantQuantities}
              allowPriceEdit={true}
            />
          </div>
        {/each}
      </div>

      <button
        type="button"
        class="lvp-t-calc_add-service-btn"
        onclick={addNewField}
      >
        + Добавить услугу
      </button>

      <div class="lvp-t-calc_total-section">
        <span>Общая сумма:</span>
        <span class="lvp-t-calc_total-amount">{total.toFixed(2)}₽</span>
      </div>

      <div class="lvp-t-calc_email-section">
        <input
          type="text"
          class="lvp-t-calc_email-input"
          placeholder="Введите имя клиента"
          bind:value={customerName}
          required
        />
        <input
          type="email"
          class="lvp-t-calc_email-input"
          placeholder="Введите email клиента"
          bind:value={email}
          required
        />
      </div>
      <button
        type="submit"
        class="lvp-t-calc_order-btn"
        disabled={isGeneratingPdf}
      >
        {#if isGeneratingPdf}
          Подождите, генерируется PDF...
        {:else}
          Заказать и скачать PDF
        {/if}
      </button>
    </form>
  {/if}
</div>

<style scoped>
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

  .lvp-t-calc_container {
    width: 100%;
    max-width: 1000px;
    padding: 20px;
    margin: 0 auto;
    margin-top: 50px;
  }

  .lvp-t-calc_loading {
    background-color: var(--lvp-t-calc-color-white);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px var(--lvp-t-calc-color-shadow);
    text-align: center;
    color: var(--lvp-t-calc-color-text);
  }

  .lvp-t-calc_service-form {
    background-color: var(--lvp-t-calc-color-white);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px var(--lvp-t-calc-color-shadow);
    width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
  }

  .lvp-t-calc_service-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .lvp-t-calc_field-wrapper {
    position: relative;
    width: auto;
    max-width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--lvp-t-calc-color-border-light);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
  }

  .lvp-t-calc_email-input {
    padding: 10px;
    border: 1px solid var(--lvp-t-calc-color-border);
    border-radius: 4px;
    font-size: 14px;
    min-width: 0;
    width: auto;
    max-width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
    font-family: 'Montserrat', Arial, sans-serif;
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
    font-family: 'Montserrat', Arial, sans-serif;
  }

  .lvp-t-calc_total-amount {
    font-weight: bold;
    color: var(--lvp-t-calc-color-text-dark);
    font-size: 18px;
  }

  .lvp-t-calc_add-service-btn {
    width: 100%;
    padding: 12px; /* Reverted padding */
    color: var(--lvp-t-calc-color-white);
    font-size: 12px; /* Reverted font size */
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
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out,
      border-color 0.2s ease-in-out;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .lvp-t-calc_order-btn {
    width: 100%;
    padding: 16px; /* Increased padding */
    color: var(--lvp-t-calc-color-white);
    font-size: 14px; /* Increased font size */
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
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out,
      border-color 0.2s ease-in-out;
    cursor: pointer;
  }

  .lvp-t-calc_add-service-btn {
    margin-bottom: 20px;
  }

  .lvp-t-calc_email-section {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .lvp-t-calc_add-service-btn:hover,
  .lvp-t-calc_order-btn:not(:disabled):hover {
    opacity: 0.9;
  }

  .lvp-t-calc_order-btn:disabled {
    opacity: 0.7;
    cursor: wait;
  }
</style>
