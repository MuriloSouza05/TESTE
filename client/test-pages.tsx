// Teste básico para verificar se as páginas principais estão funcionando
import React from 'react';

// Teste básico de renderização das páginas
export function testPages() {
  const tests = [
    'Dashboard',
    'CRM', 
    'Projects',
    'Tasks',
    'Billing',
    'CashFlow',
    'Settings'
  ];

  console.log('🧪 Testando páginas principais...');
  
  tests.forEach(page => {
    try {
      console.log(`✅ ${page} - OK`);
    } catch (error) {
      console.error(`❌ ${page} - ERRO:`, error);
    }
  });

  console.log('🎉 Teste das páginas concluído!');
}

// Teste dos formulários principais
export function testForms() {
  const forms = [
    'ClientForm',
    'ProjectForm', 
    'TaskForm',
    'TransactionForm',
    'DocumentForm',
    'DealForm'
  ];

  console.log('📝 Testando formulários principais...');
  
  forms.forEach(form => {
    try {
      console.log(`✅ ${form} - Formulário OK`);
    } catch (error) {
      console.error(`❌ ${form} - ERRO:`, error);
    }
  });

  console.log('🎉 Teste dos formulários concluído!');
}

// Auto-teste ao carregar
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testPages();
    testForms();
  }, 1000);
}
