import { customTriggers, classificationHistory, addTrigger, addHistoryItem, updateTrigger, deleteTrigger } from './state.js';
import { renderTriggers, renderHistory } from './ui.js';
import { classifyEmail } from './api.js';

function navigateTo(templateId) {
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById(templateId);
    const classbtn = document.getElementById("travel-classify")
    const trigbtn = document.getElementById("travel-triggers")
    const histbtn = document.getElementById("travel-history")
    if (!template) return;

    mainContent.innerHTML = '';
    const clone = template.content.cloneNode(true);
    mainContent.appendChild(clone);

    if (templateId === 'template-classify') {
        initClassifyPage();
        classbtn.classList.add("border-emerald-500", "border")
        trigbtn.classList.remove("border-emerald-500", "border")
        histbtn.classList.remove("border-emerald-500", "border")
    } else if (templateId === 'template-triggers') {
        initTriggersPage();
        trigbtn.classList.add("border-emerald-500", "border")
        classbtn.classList.remove("border-emerald-500", "border")
        histbtn.classList.remove("border-emerald-500", "border")
    } else if (templateId === 'template-history') {
        initHistoryPage();
        histbtn.classList.add("border-emerald-500", "border")
        classbtn.classList.remove("border-emerald-500", "border")
        trigbtn.classList.remove("border-emerald-500", "border")
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
            //send info to api
            const data = await classifyEmail(payload);

            if (data.error) {
                alert(data.error);
                return;
            }

            data.sender = sender;
            data.subject = subject;
            //send status to html
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
}

function initTriggersPage() {
    const triggerListUl = document.getElementById('trigger-list');
    const addTriggerBtn = document.getElementById('add-trigger-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const saveTriggerBtn = document.getElementById('save-trigger-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const deleteTriggerBtn = document.getElementById('delete-trigger-btn');
    
    let currentlyEditingIndex = null;

    function openEditModal(index) {
        currentlyEditingIndex = index;
        const trigger = customTriggers[index];

        document.getElementById('edit-priority-input').value = trigger.priority;
        document.getElementById('edit-keywords-input').value = trigger.keywords.join(', ');
        document.getElementById('edit-response-input').value = trigger.response;
        
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.add('flex');
    }

    function closeEditModal() {
        modalOverlay.classList.add('hidden');
        modalOverlay.classList.remove('flex');
        currentlyEditingIndex = null;
    }
    
    saveTriggerBtn.addEventListener('click', () => {
        const updatedTrigger = {
            priority: parseInt(document.getElementById('edit-priority-input').value, 10) || 99,
            keywords: document.getElementById('edit-keywords-input').value.split(',').map(k => k.trim().toLowerCase()),
            response: document.getElementById('edit-response-input').value
        };
        updateTrigger(currentlyEditingIndex, updatedTrigger);
        renderTriggers(triggerListUl, customTriggers, openEditModal);
        closeEditModal();
    });

    deleteTriggerBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este trigger?')) {
            deleteTrigger(currentlyEditingIndex);
            renderTriggers(triggerListUl, customTriggers, openEditModal);
            closeEditModal();
        }
    });

    closeModalBtn.addEventListener('click', closeEditModal);
    
    // Lógica para adicionar novo trigger
    addTriggerBtn.addEventListener('click', () => {
        // ... (código para adicionar trigger continua o mesmo)
        renderTriggers(triggerListUl, customTriggers, openEditModal);
    });
    
    // Renderiza a lista inicial passando a função de abrir o modal
    renderTriggers(triggerListUl, customTriggers, openEditModal);
}

function initHistoryPage() {
    const historyListUl = document.getElementById('history-list');
    renderHistory(historyListUl, classificationHistory);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const templateId = button.getAttribute('data-target-template');
            navigateTo(templateId);
        });
    });
    navigateTo('template-classify');
});