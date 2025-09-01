import { customTriggers, classificationHistory, addTrigger, addHistoryItem, updateTrigger, deleteTrigger, updateHistoryItemClassification, deleteHistoryItem } from './state.js';
import { renderTriggers, renderHistory } from './ui.js';
import { classifyEmail } from './api.js';

let currentlyEditingIndex = null;
let currentlyViewingIndex = null;

function openEditModal(index) {
    currentlyEditingIndex = index;
    const trigger = customTriggers[index];
    document.getElementById('edit-name-input').value = trigger.name;
    document.getElementById('edit-priority-input').value = trigger.priority;
    document.getElementById('edit-keywords-input').value = trigger.keywords.join(', ');
    document.getElementById('edit-response-input').value = trigger.response;
    
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function closeEditModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    currentlyEditingIndex = null;
    document.body.classList.remove('overflow-hidden');
}

function openHistoryModal(index) {
    currentlyViewingIndex = index;
    const item = classificationHistory[index];
    document.getElementById('history-sender').textContent = item.sender || "N/A";
    document.getElementById('history-subject').textContent = item.subject || "N/A";
    document.getElementById('history-classification-select').value = item.classification;
    document.getElementById('history-response').textContent = item.suggested_response;
    document.getElementById('history-cleaned-text').textContent = item.cleaned_text;

    const modalOverlay = document.getElementById('history-modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function closeHistoryModal() {
    const modalOverlay = document.getElementById('history-modal-overlay');
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    currentlyViewingIndex = null;
    document.body.classList.remove('overflow-hidden');
}

function navigateTo(templateId) {
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById(templateId);
    if (!template) return;

    mainContent.innerHTML = '';
    const clone = template.content.cloneNode(true);
    mainContent.appendChild(clone);

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove("border-emerald-500", "border", "shadow-inner");
        btn.classList.add("shadow-sm");
    });
    const activeButton = document.querySelector(`button[data-target-template='${templateId}']`);
    if (activeButton) {
        activeButton.classList.add("border-emerald-500", "border", "shadow-inner");
        activeButton.classList.remove("shadow-sm");
    }

    if (templateId === 'template-classify') {
        initClassifyPage();
    } else if (templateId === 'template-triggers') {
        initTriggersPage();
    } else if (templateId === 'template-history') {
        initHistoryPage();
    }
}

function initClassifyPage() {
    const senderInput = document.getElementById('sender-input');
    const subjectInput = document.getElementById('subject-input');
    const emailInput = document.getElementById('email-input');
    const classifyBtn = document.getElementById('classify-btn');
    const resultsDiv = document.getElementById('results');
    const classificationSpan = document.getElementById('result-classification');
    const responseP = document.getElementById('result-response');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');

    fileInput.addEventListener('change', handleFileSelect);

    classifyBtn.addEventListener('click', async () => {
        const sender = senderInput.value;
        const subject = subjectInput.value;
        const body = emailInput.value;
        
        if (!body.trim()) {
            alert('Por favor, insira o corpo do email.');
            return;
        }

        classifyBtn.textContent = 'Analisando...';
        classifyBtn.disabled = true;
        
        try {
            const payload = { 
                sender: sender,
                subject: subject,
                body: body,
                triggers: customTriggers 
            };
            const data = await classifyEmail(payload);

            if (data.error) {
                alert(data.error);
                return;
            }

            data.sender = sender;
            data.subject = subject;
            classificationSpan.classList.remove(
              ...(data.classification === 'Produtivo'
                ? ['text-emerald-red']
                : ['text-emerald-blue'])
            );
            classificationSpan.classList.add(
              ...(data.classification === 'Produtivo'
                ? ['text-emerald-blue', 'underline']
                : ['text-emerald-red', 'underline'])
            );
            
            classificationSpan.textContent = data.classification;
            responseP.textContent = data.suggested_response;
            resultsDiv.style.display = 'block';

            addHistoryItem(data);
        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao analisar o email.');
        } finally {
            classifyBtn.textContent = 'Analisar Email';
            classifyBtn.disabled = false;
        }
    });

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        fileNameDisplay.textContent = file.name;
        senderInput.value = '';
        subjectInput.value = '';
        emailInput.value = 'Lendo arquivo...';

        if (file.type === "text/plain") {
            emailInput.value = await file.text();
        } else if (file.type === "application/json") {
            try {
                const text = await file.text();
                const jsonData = JSON.parse(text);
                senderInput.value = jsonData.from || '';
                subjectInput.value = jsonData.subject || '';
                emailInput.value = jsonData.body?.parts?.content || '';
            } catch (e) {
                emailInput.value = "Erro: O arquivo JSON não é válido.";
            }
        } else if (file.type === "application/pdf") {
            const { pdfjsLib } = globalThis;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ');
                        fullText += '\n'; 
                    }
                    emailInput.value = fullText;
                } catch (err) {
                    emailInput.value = `Erro ao ler o PDF: ${err.message}`;
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            emailInput.value = "Formato de arquivo não suportado.";
        }
    }
}

function initTriggersPage() {
    const triggerListUl = document.getElementById('trigger-list');
    const addTriggerBtn = document.getElementById('add-trigger-btn');

    addTriggerBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('name-input');
        const priorityInput = document.getElementById('priority-input');
        const keywordsInput = document.getElementById('keywords-input');
        const responseInput = document.getElementById('response-input');
        const successMessage = document.getElementById('success-message');

        const name = nameInput.value.trim();
        const priority = parseInt(priorityInput.value, 10);

        if (!name || !priorityInput.value.trim()) {
            alert('O nome e a prioridade do trigger são obrigatórios.');
            return;
        }

        const priorityExists = customTriggers.some(trigger => trigger.priority === priority);
        if (priorityExists) {
            alert('Erro: Esta prioridade já está em uso.');
            return;
        }

        const keywordsString = keywordsInput.value.trim();
        const responseString = responseInput.value.trim();
        if (!keywordsString || !responseString) {
            alert('Preencha os campos de keywords e resposta.');
            return;
        }

        const keywordsList = keywordsString.split(',').map(k => k.trim().toLowerCase());
        addTrigger({ "name": name, "priority": priority, "keywords": keywordsList, "response": responseString });

        nameInput.value = '';
        priorityInput.value = '';
        keywordsInput.value = '';
        responseInput.value = '';
        
        renderTriggers(triggerListUl, customTriggers, openEditModal);
        
        successMessage.textContent = 'Trigger adicionado com sucesso!';
        successMessage.classList.remove('hidden');
        setTimeout(() => { successMessage.classList.add('hidden'); }, 3000);
    });
    
    renderTriggers(triggerListUl, customTriggers, openEditModal);
}

function initHistoryPage() {
    const historyListUl = document.getElementById('history-list');
    const modalOverlay = document.getElementById('history-modal-overlay');
    const filterAllBtn = document.getElementById('filter-all');
    const filterProductiveBtn = document.getElementById('filter-productive');
    const filterUnproductiveBtn = document.getElementById('filter-unproductive');
    const filterButtons = [filterAllBtn, filterProductiveBtn, filterUnproductiveBtn];

    let currentFilter = 'todos'; 

    function applyFilterAndRender() {
        let filteredHistory = [];

        if (currentFilter === 'todos') {
            filteredHistory = classificationHistory;
        } else {
            filteredHistory = classificationHistory.filter(item => item.classification === currentFilter);
        }
        
        renderHistory(historyListUl, filteredHistory, openHistoryModal);
    }

    filterAllBtn.addEventListener('click', () => {
        currentFilter = 'todos';
        applyFilterAndRender();
    });

    filterProductiveBtn.addEventListener('click', () => {
        currentFilter = 'Produtivo';
        applyFilterAndRender();
    });

    filterUnproductiveBtn.addEventListener('click', () => {
        currentFilter = 'Improdutivo';
        applyFilterAndRender();
    });

    applyFilterAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const templateId = button.getAttribute('data-target-template');
            navigateTo(templateId);
        });
    });

    document.getElementById('save-trigger-btn').addEventListener('click', () => {
        const triggerListUl = document.getElementById('trigger-list');
        const newName = document.getElementById('edit-name-input').value.trim();
        const newPriority = parseInt(document.getElementById('edit-priority-input').value, 10);

        if (!newName || !document.getElementById('edit-priority-input').value.trim()) {
            alert('O nome e a prioridade do trigger são obrigatórios.');
            return;
        }
        const priorityExists = customTriggers.some((t, i) => t.priority === newPriority && i !== currentlyEditingIndex);
        if (priorityExists) {
            alert('Erro: Esta prioridade já está em uso por outro trigger.');
            return;
        }

        const updatedTrigger = {
            name: newName,
            priority: newPriority,
            keywords: document.getElementById('edit-keywords-input').value.split(',').map(k => k.trim().toLowerCase()),
            response: document.getElementById('edit-response-input').value
        };
        updateTrigger(currentlyEditingIndex, updatedTrigger);
        renderTriggers(triggerListUl, customTriggers, openEditModal);
        closeEditModal();
    });

    document.getElementById('delete-trigger-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este trigger?')) {
            const triggerListUl = document.getElementById('trigger-list');
            deleteTrigger(currentlyEditingIndex);
            renderTriggers(triggerListUl, customTriggers, openEditModal);
            closeEditModal();
        }
    });
    document.getElementById('close-modal-btn').addEventListener('click', closeEditModal);

    document.getElementById('save-history-btn').addEventListener('click', () => {
        const historyListUl = document.getElementById('history-list');
        const newClassification = document.getElementById('history-classification-select').value;
        updateHistoryItemClassification(currentlyViewingIndex, newClassification);
        renderHistory(historyListUl, classificationHistory, openHistoryModal);
        closeHistoryModal();
    });

    document.getElementById('delete-history-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover este item do histórico?')) {
            const historyListUl = document.getElementById('history-list');
            deleteHistoryItem(currentlyViewingIndex);
            renderHistory(historyListUl, classificationHistory, openHistoryModal);
            closeHistoryModal();
        }
    });
    document.getElementById('close-history-modal-btn').addEventListener('click', closeHistoryModal);

    navigateTo('template-classify');
});