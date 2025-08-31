export async function classifyEmail(payload) {
    const response = await fetch('/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Erro na resposta da api.');
    }

    return await response.json();
}


