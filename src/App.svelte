<script lang="ts">
  import ClientOrderForm from './components/ClientOrderForm.svelte';
  import OwnerOrderForm from './components/OwnerOrderForm.svelte';
  
  let formType: 'client' | 'owner' = 'client';
  
  function toggleForm() {
    formType = formType === 'client' ? 'owner' : 'client';
  }
</script>

<main>
  <div class="form-switcher">
    <button 
      class:active={formType === 'client'}
      on:click={() => formType = 'client'}
    >
      Клиентская форма
    </button>
    <button 
      class:active={formType === 'owner'}
      on:click={() => formType = 'owner'}
    >
      Форма владельца
    </button>
  </div>
  
  <div class="form-container">
    {#if formType === 'client'}
      <ClientOrderForm />
    {:else}
      <OwnerOrderForm />
    {/if}
  </div>
</main>

<style>
  .form-switcher {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }
  
  .form-switcher button {
    padding: 0.5rem 1.5rem;
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .form-switcher button:hover {
    background: #f5f5f5;
  }
  
  .form-switcher button.active {
    background: #001f46;
    color: white;
    border-color: #001f46;
  }
  
  .form-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }
</style>
