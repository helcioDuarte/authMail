from flask import Flask, request, jsonify, render_template
from classifierService import getClassificationAndSuggestion

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classifyEmail():
    data = request.get_json()
    body = data.get('body', '')
    triggers = data.get('triggers', [])
    
    if not body:
        return jsonify({'error': 'O corpo do email não foi fornecido.'}), 400

    try:
        result = getClassificationAndSuggestion(body, triggers)
        return jsonify(result)
        
    except Exception as e:
        print(f"Erro ao processar a requisição: {e}")
        return jsonify({'error': 'Ocorreu um erro interno no servidor.'}), 500

if __name__ == '__main__':
    app.run(debug=True)