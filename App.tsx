import React from 'react';
import { Footer } from './components/Footer';
import { RegistrationForm } from './components/RegistrationForm';
import { REPRESENTATIVES, DEFAULT_REPRESENTATIVE } from './utils';

const App: React.FC = () => {
  // Lógica de roteamento manual para capturar ID da URL
  // Remove barras iniciais e finais
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  
  let currentRepresentative = DEFAULT_REPRESENTATIVE;
  let error = false;

  // Se houver algo no path
  if (path) {
    // 1. Verifica se o path corresponde exatamente a um ID conhecido
    if (REPRESENTATIVES[path]) {
      currentRepresentative = REPRESENTATIVES[path];
    } else {
      // 2. Se não encontrado, verificamos se é um ID válido (numérico)
      // Isso previne que URLs de ambiente (ex: /apps/temp/1) quebrem a página
      const isNumericId = /^\d+$/.test(path);

      if (isNumericId) {
        // Se é puramente numérico e não está na lista, é um ID inválido -> Erro
        error = true;
      }
      // Se contém letras ou caracteres especiais (como nas URLs de preview), 
      // assumimos que é URL do sistema/ambiente e mantemos o Default (Francisco) sem erro.
    }
  }

  if (error) {
    return (
       <div className="flex flex-col min-h-screen bg-[#eff6ff] items-center justify-center p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
            <div className="mb-6 flex justify-center">
               <div className="bg-red-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Representante não encontrado</h1>
            <p className="text-gray-500 mb-6">O código informado não consta em nossa base de dados de representantes ativos.</p>
            <a href="/" className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm hover:shadow-md">
              Ir para página inicial
            </a>
         </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#eff6ff] font-sans">
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationForm representative={currentRepresentative} />
      </main>

      <Footer />
    </div>
  );
};

export default App;