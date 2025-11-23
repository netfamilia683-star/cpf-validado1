import { Representative } from './types';

export const masks = {
  cpf: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  phone: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  cell: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  cep: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
  date: (value: string) => {
      // Input date type handles formatting visually, but this is for text fallback
      return value;
  }
};

export const unmask = (value: string) => {
  return value.replace(/\D/g, '');
};

// Configurações Básicas
export const CSRF_TOKEN = "oD4xhofopobiuV5HIISyXw6lOn2dP1TLajSFbUgK"; 
export const CPF_API_TOKEN = "2|VL3z6OcyARWRoaEniPyoHJpPtxWcD99NN2oueGGn4acc0395";

// Lista de Representantes (Base de Dados Simulada)
export const REPRESENTATIVES: { [key: string]: Representative } = {
  "110956": {
    id: "110956",
    nome: "Francisco Eliedisom Dos Santos",
    whatsapp: "",
  },
  "134684": {
    id: "134684",
    nome: "William Dos Santos Pessoa",
    whatsapp: "5521969400194",
  },
  "135302": {
    id: "135302",
    nome: "Antonia Erivania Delmiro Jacinto",
    whatsapp: "558498410187",
  },
  "153542": {
    id: "153542",
    nome: "Aline Aparecida Melo",
    whatsapp: "553193371195",
  },
};

// Representante Padrão (Francisco)
export const DEFAULT_REPRESENTATIVE = REPRESENTATIVES["110956"];

export const PLANS: { [key: string]: Array<{ id: string; label: string }> } = {
  VIVO: [
    { id: "178", label: "40GB COM LIGACAO VIVO 49.90" },
    { id: "69", label: "80GB COM LIGACAO 69.90" },
    { id: "61", label: "150GB COM LIGACAO 99.90" }
  ],
  TIM: [
    { id: "56", label: "100GB COM LIGACAO 69.90" },
    { id: "154", label: "200GB SEM LIGAÇÃO 159.90" },
    { id: "155", label: "300GB SEM LIGAÇÃO 199.90" }
  ],
  CLARO: [
    { id: "57", label: "80GB COM LIGACAO 69.90" },
    { id: "183", label: "150GB COM LIGACAO 99.90" }
  ]
};

export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO", "EX"
];