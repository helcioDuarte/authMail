export let customTriggers = [
    { "name": "Relato de Bug", "priority": 1, "keywords": ["problema", "erro", "bug"], "response": "Agradecemos por reportar. Nossa equipe técnica já está investigando." },
    { "name": "Agendamento", "priority": 2, "keywords": ["reunião", "agendar", "call"], "response": "Recebido. Vou verificar a agenda e as disponibilidades." },
    { "name": "Financeiro", "priority": 3, "keywords": ["pagamento", "fatura"], "response": "Obrigado. Encaminhei sua mensagem para o setor financeiro." }
];

export let classificationHistory = [
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
