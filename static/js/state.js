export let customTriggers = [
    { "name": "Relato de Bug", "priority": 1, "keywords": ["problema", "erro", "bug"], "response": "Agradecemos por reportar. Nossa equipe técnica já está investigando." },
    { "name": "Agendamento", "priority": 2, "keywords": ["reunião", "agendar", "call"], "response": "Recebido. Vou verificar a agenda e as disponibilidades." },
    { "name": "Financeiro", "priority": 3, "keywords": ["pagamento", "fatura"], "response": "Obrigado. Encaminhei sua mensagem para o setor financeiro." }
];

export let classificationHistory = [
    {
        classification: 'Produtivo',
        suggested_response: 'Recebido. Estou verificando o status atual da sua solicitação e volto a contatar assim que tiver novidades.',
        cleaned_text: 'Bom dia, gostaria de pedir uma atualização sobre o status do ticket 12345. Já se passaram dois dias e ainda não tive retorno.',
        sender: 'cliente.ansioso@email.com',
        subject: 'Status do Ticket 12345'
    },
    {
        classification: 'Improdutivo',
        suggested_response: 'Obrigado por compartilhar.',
        cleaned_text: 'Obrigado a todos pela reunião de ontem, foi muito produtiva e esclarecedora. Bom trabalho!',
        sender: 'colega.feliz@empresa.com',
        subject: 'Reunião de ontem'
    },
    {
        classification: 'Produtivo',
        suggested_response: 'Agradecemos por reportar o problema. Nossa equipe técnica já está investigando e daremos um retorno em breve.',
        cleaned_text: 'Olá equipe, estamos enfrentando um erro 500 intermitente no portal de clientes desde a última atualização. O problema parece ocorrer principalmente ao tentar gerar relatórios em PDF. Anexei os logs do navegador para análise.',
        sender: 'suporte.ti@parceiro.com',
        subject: 'URGENTE: Erro 500 no Portal de Clientes'
    },
    {
        classification: 'Improdutivo',
        suggested_response: 'Ciente. Agradeço a mensagem.',
        cleaned_text: 'Confirmado, estarei presente.',
        sender: 'gerente.direto@empresa.com',
        subject: 'Re: Confirmação de Presença na reunião de sexta'
    }
];

export function addTrigger(trigger) {
    customTriggers.push(trigger);
}

export function updateTrigger(index, updatedTrigger) {
    if (index >= 0 && index < customTriggers.length) {
        customTriggers[index] = updatedTrigger;
    }
}

export function deleteTrigger(index) {
    if (index >= 0 && index < customTriggers.length) {
        customTriggers.splice(index, 1);
    }
}

export function addHistoryItem(item) {
    classificationHistory.push(item);
}

export function updateHistoryItemClassification(index, newClassification) {
    if (index >= 0 && index < classificationHistory.length) {
        classificationHistory[index].classification = newClassification;
    }
}

export function deleteHistoryItem(index) {
    if (index >= 0 && index < classificationHistory.length) {
        classificationHistory.splice(index, 1);
    }
}
