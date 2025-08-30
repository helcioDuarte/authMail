export function renderTriggers(triggerListUl, triggers, onEditCallback) {
    triggers.sort((a, b) => a.priority - b.priority);
    triggerListUl.innerHTML = '';
    triggers.forEach((trigger, index) => {
        const li = document.createElement('li');
        li.className = "bg-gray-50 flex justify-between items-center p-3 rounded-md mb-2 shadow-sm";

        const textDiv = document.createElement('div');
        textDiv.className = "flex flex-col";
        textDiv.innerHTML = `<span class="font-bold text-emerald-blue text-sm md:text-base">P: ${trigger.priority}</span>
          <span class="text-emerald-blue-light font-semibold text-xs md:text-base text-wrap">${trigger.name}</span>`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = "bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded ml-2 transition-transform delay-50 duration-200 hover:scale-110";

        editButton.addEventListener('click', () => onEditCallback(index));

        li.appendChild(textDiv);
        li.appendChild(editButton);
        triggerListUl.appendChild(li);
    });
}

export function renderHistory(historyListUl, history, onDetailsCallback) {
  historyListUl.innerHTML = '';
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = "mb-2";
    const button = document.createElement('button');
    button.className = `w-full flex flex-col md:flex-row justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm 
    text-left hover:bg-gray-100 transition-transform delay-50 duration-200 hover:scale-101`;

    button.addEventListener('click', () => onDetailsCallback(index));
    const textDiv = document.createElement('div');
    textDiv.className = "flex flex-col break-all";
    textDiv.innerHTML = `
      <span class="font-bold text-emerald-blue text-sm md:text-base">${item.subject || "Sem Assunto"}</span>
      <span class="text-emerald-blue-light font-semibold text-xs md:text-sm">${item.sender || "Sem Remetente"}</span>`;

    const classificationSpan = document.createElement('span');
    classificationSpan.textContent = item.classification;
    classificationSpan.className = item.classification === 'Produtivo'
      ? "bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2 md:mt-0 md:ml-2"
      : "bg-red-100 text-emerald-red text-xs px-2 py-1 rounded mt-2 md:mt-0 md:ml-2";

    button.appendChild(textDiv);
    button.appendChild(classificationSpan);
    li.appendChild(button);
    historyListUl.appendChild(li);
  });
}