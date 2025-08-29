export function renderTriggers(triggerListUl, triggers, onEditCallback) {
    triggers.sort((a, b) => a.priority - b.priority);
    triggerListUl.innerHTML = '';
    triggers.forEach((trigger, index) => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center p-3 bg-gray-50 rounded-md mb-2";

        const textDiv = document.createElement('div');
        textDiv.innerHTML = `<span class="font-bold text-emerald-blue">P: ${trigger.priority}</span> | 
                             <span class="text-emerald-blue-light font-semibold">Keywords:</span> [${trigger.keywords.join(', ')}]`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = "bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded ml-2";

        editButton.addEventListener('click', () => onEditCallback(index));

        li.appendChild(textDiv);
        li.appendChild(editButton);
        triggerListUl.appendChild(li);
    });
}

export function renderHistory(historyListUl, history) {
    historyListUl.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        const textSnippet = item.cleaned_text ? `"${item.cleaned_text.substring(0, 40)}..."` : "Texto vazio";
        li.textContent = `Texto: ${textSnippet} -> Classificação: ${item.classification}`;
        historyListUl.appendChild(li);
    });
}