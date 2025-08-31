import { customTriggers, classificationHistory, addTrigger, addHistoryItem, updateTrigger, deleteTrigger, updateHistoryItemClassification, deleteHistoryItem} from './state.js';
import { renderTriggers, renderHistory } from './ui.js';
import { classifyEmail } from './api.js';

function navigateTo(templateId) {
    const mainContent = document.getElementById('main-content'); 
    const template = document.getElementById(templateId);
    const classbtn = document.getElementById("travel-classify");
    const trigbtn = document.getElementById("travel-triggers");
    const histbtn = document.getElementById("travel-history");
    if (!template) return;

    mainContent.innerHTML = '';
    const clone = template.content.cloneNode(true);
    mainContent.appendChild(clone);

    if (templateId === 'template-classify') {
        initClassifyPage();
        classbtn.classList.add("border-emerald-500", "border");
        classbtn.classList.remove("shadow-sm");
        trigbtn.classList.remove("border-emerald-500", "border");
        histbtn.classList.remove("border-emerald-500", "border");
    } else if (templateId === 'template-triggers') {
        initTriggersPage();
        trigbtn.classList.add("border-emerald-500", "border");
        trigbtn.classList.remove("shadow-sm");
        classbtn.classList.remove("border-emerald-500", "border");
        histbtn.classList.remove("border-emerald-500", "border");
    } else if (templateId === 'template-history') {
        initHistoryPage();
        histbtn.classList.add("border-emerald-500", "border");
        histbtn.classList.remove("shadow-sm");
        classbtn.classList.remove("border-emerald-500", "border");
        trigbtn.classList.remove("border-emerald-500", "border");
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

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        }
    });

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        senderInput.value = '';
        subjectInput.value = '';
        emailInput.value = 'Lendo arquivo...';

        if (file.type === "text/plain") {
            const text = await file.text();
            emailInput.value = text;
        } 
        else if (file.type === "application/json") {
            const text = await file.text();
            try {
                const jsonData = JSON.parse(text);
                senderInput.value = jsonData.from || '';
                subjectInput.value = jsonData.subject || '';
                emailInput.value = jsonData.body?.parts?.content || '';
            } catch (e) {
                emailInput.value = "Erro: O arquivo JSON não é válido.";
                console.error("Erro ao parsear JSON:", e);
            }
        } 
        else if (file.type === "application/pdf") {
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
                    console.error("Erro ao processar PDF:", err);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            emailInput.value = "Formato de arquivo não suportado.";
        }
    }

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
            //send info to api
            const data = await classifyEmail(payload);

            if (data.error) {
                alert(data.error);
                return;
            }

            data.sender = sender;
            data.subject = subject;
            //send status to html
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

    document.getElementById('edit-name-input').value = trigger.name;
    document.getElementById('edit-priority-input').value = trigger.priority;
    document.getElementById('edit-keywords-input').value = trigger.keywords.join(', ');
    document.getElementById('edit-response-input').value = trigger.response;

    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    }

    function closeEditModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    currentlyEditingIndex = null;
    document.body.classList.remove('overflow-hidden');
    }
    
    saveTriggerBtn.addEventListener('click', () => {
        const newName = document.getElementById('edit-name-input').value.trim();
        const newPriority = parseInt(document.getElementById('edit-priority-input').value, 10);

        if (!newName || !document.getElementById('edit-priority-input').value.trim()) {
            alert('O nome e a prioridade do trigger são obrigatórios.');
            return;
        }

        const priorityExists = customTriggers.some(
            (trigger, index) => trigger.priority === newPriority && index !== currentlyEditingIndex
        );

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

    deleteTriggerBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este trigger?')) {
            deleteTrigger(currentlyEditingIndex);
            renderTriggers(triggerListUl, customTriggers, openEditModal);
            closeEditModal();
        }
    });

    closeModalBtn.addEventListener('click', closeEditModal);

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
            alert('Erro: Esta prioridade já está em uso. Por favor, escolha um número diferente.');
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

        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    });
    
    renderTriggers(triggerListUl, customTriggers, openEditModal);
}


function initHistoryPage() {
    const historyListUl = document.getElementById('history-list');
    const modalOverlay = document.getElementById('history-modal-overlay');
    const saveBtn = document.getElementById('save-history-btn');
    const closeBtn = document.getElementById('close-history-modal-btn');
    const deleteBtn = document.getElementById('delete-history-btn');

    let currentlyViewingIndex = null;

    function openHistoryModal(index) {
    currentlyViewingIndex = index;
    const item = classificationHistory[index];

    document.getElementById('history-sender').textContent = item.sender || "N/A";
    document.getElementById('history-subject').textContent = item.subject || "N/A";
    document.getElementById('history-classification-select').value = item.classification;
    document.getElementById('history-response').textContent = item.suggested_response;
    document.getElementById('history-cleaned-text').textContent = item.cleaned_text;

    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    }

    function closeHistoryModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    currentlyViewingIndex = null;
    document.body.classList.remove('overflow-hidden');
    }

    saveBtn.addEventListener('click', () => {
        const newClassification = document.getElementById('history-classification-select').value;
        updateHistoryItemClassification(currentlyViewingIndex, newClassification);
        renderHistory(historyListUl, classificationHistory, openHistoryModal);
        closeHistoryModal();
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover este item do histórico?')) {
            deleteHistoryItem(currentlyViewingIndex);
            renderHistory(historyListUl, classificationHistory, openHistoryModal);
            closeHistoryModal();
        }
    });

    closeBtn.addEventListener('click', closeHistoryModal);

    renderHistory(historyListUl, classificationHistory, openHistoryModal);
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