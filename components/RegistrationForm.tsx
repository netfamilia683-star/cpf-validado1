import React, { useState, useEffect } from 'react';
import { RegistrationFormData, Representative, ViaCepResponse, CpfCheckResponse } from '../types';
import { masks, unmask, CSRF_TOKEN, CPF_API_TOKEN, PLANS, STATES } from '../utils';

interface RegistrationFormProps {
  representative: Representative;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ representative }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    cpf: '',
    birth: '',
    name: '',
    email: '',
    phone: '',
    cell: '',
    cep: '',
    district: '',
    city: '',
    state: '',
    street: '',
    number: '',
    complement: '',
    typeChip: 'fisico',
    coupon: '',
    plan_id: '',
    typeFrete: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedOperator, setSelectedOperator] = useState<'VIVO' | 'TIM' | 'CLARO'>('VIVO');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let maskedValue = value;
    if (name === 'cpf') maskedValue = masks.cpf(value);
    else if (name === 'phone') maskedValue = masks.phone(value);
    else if (name === 'cell') maskedValue = masks.cell(value);
    else if (name === 'cep') maskedValue = masks.cep(value);

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleOperatorChange = (operator: 'VIVO' | 'TIM' | 'CLARO') => {
    setSelectedOperator(operator);
    setFormData(prev => ({ ...prev, plan_id: '' }));
  };

  const handleCepBlur = async () => {
    const cepNumber = unmask(formData.cep);
    if (cepNumber.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumber}/json/`);
      const data: ViaCepResponse = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || '',
          district: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleCpfBlur = async () => {
    const cpfNumber = unmask(formData.cpf);
    if (cpfNumber.length !== 11) return;

    try {
      const response = await fetch('https://app.federalassociados.com.br/api/checkcpf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CPF_API_TOKEN}`,
        },
        body: JSON.stringify({ cpf: cpfNumber }),
      });

      const result: CpfCheckResponse = await response.json();

      if (result.data?.nome_da_pf) {
        setFormData(prev => ({ ...prev, name: result.data.nome_da_pf || '' }));
      }

      if (result.data?.data_nascimento) {
        setFormData(prev => ({ ...prev, birth: result.data.data_nascimento || '' }));
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (unmask(formData.cpf).length !== 11) newErrors.cpf = 'CPF inválido';
    if (!formData.birth) newErrors.birth = 'Data de nascimento obrigatória';
    if (!formData.name.trim()) newErrors.name = 'Nome obrigatório';
    if (!formData.email.includes('@')) newErrors.email = 'E-mail inválido';
    if (unmask(formData.cell).length < 10) newErrors.cell = 'Celular inválido';
    if (unmask(formData.cep).length !== 8) newErrors.cep = 'CEP inválido';
    if (!formData.plan_id) newErrors.plan_id = 'Selecione um plano';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    setLoading(true);

    const dataToSend = {
      ...formData,
      cpf: unmask(formData.cpf),
      phone: unmask(formData.phone),
      cell: unmask(formData.cell),
      cep: unmask(formData.cep),
      representative_id: representative.id,
      _token: CSRF_TOKEN,
    };

    try {
      const response = await fetch('https://app.federalassociados.com.br/cliente/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.reload();
      } else {
        throw new Error('Erro ao enviar cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 form-shadow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Associado</h1>
          <p className="text-gray-600">Representante: <span className="font-semibold text-blue-600">{representative.nome}</span></p>
          {representative.whatsapp && (
            <a
              href={`https://wa.me/${representative.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              WhatsApp: {representative.whatsapp}
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                onBlur={handleCpfBlur}
                maxLength={14}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="000.000.000-00"
                required
              />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
              <input
                type="date"
                name="birth"
                value={formData.birth}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.birth ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.birth && <p className="text-red-500 text-xs mt-1">{errors.birth}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Seu nome completo"
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="seu@email.com"
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Celular *</label>
              <input
                type="text"
                name="cell"
                value={formData.cell}
                onChange={handleInputChange}
                maxLength={15}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.cell ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="(00) 00000-0000"
                required
              />
              {errors.cell && <p className="text-red-500 text-xs mt-1">{errors.cell}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                onBlur={handleCepBlur}
                maxLength={9}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.cep ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="00000-000"
                required
              />
              {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Número"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Bairro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecione</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Apartamento, bloco, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Chip</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="typeChip"
                    value="fisico"
                    checked={formData.typeChip === 'fisico'}
                    onChange={handleInputChange}
                    className="mr-2 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Chip Físico</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="typeChip"
                    value="eSim"
                    checked={formData.typeChip === 'eSim'}
                    onChange={handleInputChange}
                    className="mr-2 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">eSIM</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Selecione a Operadora</label>
              <div className="flex gap-4 mb-4">
                {(['VIVO', 'TIM', 'CLARO'] as const).map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => handleOperatorChange(op)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      selectedOperator === op
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Plano *</label>
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.plan_id ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Selecione um plano</option>
                {PLANS[selectedOperator].map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.label}</option>
                ))}
              </select>
              {errors.plan_id && <p className="text-red-500 text-xs mt-1">{errors.plan_id}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cupom de Desconto</label>
              <input
                type="text"
                name="coupon"
                value={formData.coupon}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Código do cupom"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="loader mr-3"></div>
                Processando...
              </>
            ) : (
              'Finalizar Cadastro'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
