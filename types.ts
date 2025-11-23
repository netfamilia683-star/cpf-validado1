export interface RegistrationFormData {
  cpf: string;
  birth: string;
  name: string;
  email: string;
  phone: string;
  cell: string;
  cep: string;
  district: string;
  city: string;
  state: string;
  street: string;
  number: string;
  complement: string;
  typeChip: 'fisico' | 'eSim';
  coupon: string;
  plan_id: string;
  typeFrete: 'Carta' | 'semFrete' | 'eSim' | '';
}

export interface Plan {
  id: string;
  name: string;
  operator: 'VIVO' | 'TIM' | 'CLARO';
  price: string;
}

export interface Representative {
  id: string;
  nome: string;
  whatsapp?: string;
}

export interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento: string;
  erro?: boolean | string;
}

export interface CpfCheckResponse {
  data: {
    id?: number;
    nome_da_pf?: string;
    numero_de_cpf?: string;
    data_nascimento?: string;
    msg?: string;
  };
  status?: string;
}