<script lang="ts">
  import ProductField from './components/ProductField.svelte';
  import mockData from './mocks.json';
  import { downloadPDF } from './lib/pdf-utils';
  import type { Product, ProductOption } from './types';
  import { PDFDocument, rgb } from 'pdf-lib';
  import fontkit from '@pdf-lib/fontkit';

  let isGeneratingPdf = $state(false);

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
            return fieldSum + parseFloat(variant.price) * variant.quantity;
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
        variantQuantities: [],
      },
    ];
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    try {
      isGeneratingPdf = true;

      const formData = {
        email,
        products: productFields.map((field) => ({
          product: products.find((p) => p.uid === field.selectedUid),
          variants: field.variantQuantities,
        })),
      };

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Используем DejaVu Sans - хорошо поддерживает кириллицу
      const fontUrl =
        'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';

      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
      const font = await pdfDoc.embedFont(fontBytes);

      const page = pdfDoc.addPage();

      // Тестовый текст
      const text =
        'Проверка: АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';

      page.drawText(text, {
        x: 50,
        y: 750,
        size: 14,
        font: font,
        maxWidth: 500,
      });

      const pdfBytes = await pdfDoc.save();

      // Дополнительная проверка
      if (pdfBytes.length < 1000) {
        console.error('PDF слишком маленький, возможно ошибка');
        return;
      }

      downloadPDF(pdfBytes, 'cyrillic-test.pdf');

      // Преобразуем данные формы
      // const items = formData.products
      //   .filter(item => item.product && item.variants.some(v => v.checked && v.quantity > 0))
      //   .map(item => ({
      //     serviceName: item.product!.title,
      //     variants: item.variants
      //       .filter(v => v.checked && v.quantity > 0)
      //       .map(v => ({
      //         name: v.title,
      //         price: parseInt(v.price),
      //         quantity: v.quantity,
      //         total: v.quantity * parseInt(v.price)
      //       }))
      //   }));

      // Создаем определение документа

      // Генерируем и скачиваем PDF
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      isGeneratingPdf = false;
    }
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
            {products}
            {options}
            bind:selectedUid={field.selectedUid}
            bind:variantQuantities={field.variantQuantities}
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
        type="email"
        class="lvp-t-calc_email-input"
        placeholder="Введите ваш email"
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
  }

  .lvp-t-calc_email-input {
    width: 100%;
  }

  .lvp-t-calc_add-service-btn:hover,
  .lvp-t-calc_order-btn:not(:disabled):hover {
    opacity: 0.9;
  }

  .lvp-t-calc_order-btn:disabled {
    opacity: 0.7;
    cursor: wait;
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
