from flask import Flask, request, jsonify, render_template
from classifier_service import getClassificationAndSuggestion

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classifyEmail():
    data = request.get-json()
    
    sender = data.get('sender', '')
    subject = data.get('subject', '')
    body = data.get('body', '')
    triggers = data.get('triggers', [])
    
    if not body:
        return jsonify({'error': 'O corpo do email não foi fornecido.'}), 400

    try:
        result = getClassificationAndSuggestion(body, triggers)
        
        # save full email class to client side
        emailEntry = {
            "sender": sender,
            "subject": subject,
            "classification": result['classification'],
            "suggestedResponse": result['suggested_response'],
            "cleaned_text": result['cleaned_text']
        }
        classifiedEmails.append(emailEntry)
        print(f"Total de emails classificados na sessão: {len(classifiedEmails)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Erro ao processar a requisição: {e}")
        return jsonify({'error': 'Ocorreu um erro interno no servidor.'}), 500

if __name__ == '__main__':
    app.run(debug=True)