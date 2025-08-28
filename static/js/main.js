const emailInput = document.getElementById('email-input');
const classifyBtn = document.getElementById('classify-btn');
const resultsDiv = document.getElementById('results');
const classificationSpan = document.getElementById('result-classification');
const responseP = document.getElementById('result-response');

classifyBtn.addEventListener('click', () => {
  const emailText = emailInput.value;

  if (!emailText.trim()) {
    alert('Por favor, insira o texto do email.');
    return;
  }

  classifyBtn.textContent = 'Analisando...';
  classifyBtn.disabled = true;

  fetch('/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_text: emailText }),
  })
  .then(response => response.json())
  .then(data => {
    classificationSpan.textContent = data.classification;
    responseP.textContent = data.suggested_response;
    resultsDiv.classList.remove('hidden');
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Ocorreu um erro ao analisar o email.');
  })
  .finally(() => {
    classifyBtn.textContent = 'Analisar Email';
    classifyBtn.disabled = false;
  });
});