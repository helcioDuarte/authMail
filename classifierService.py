import os
import random
import re
from bs4 import BeautifulSoup
from transformers import pipeline

classifierPath = "./classificador_email_model"
try:
    classifier = pipeline("text-classification", model=classifierPath)
    print("Modelo de classificação local carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o classificador: {e}")
    classifier = None

def cleanEmailText(rawText):
    if not rawText:
        return ""
    
    textWithoutHtml = BeautifulSoup(rawText, "html.parser").get_text()
    textWithoutSignature = re.split(r'\n--\s*?\n', textWithoutHtml)[0]
    
    lines = textWithoutSignature.split('\n')
    linesWithoutQuotation = [line for line in lines if not line.strip().startswith('>')]
    textWithoutQuotation = '\n'.join(linesWithoutQuotation)
    
    textWithoutUrls = re.sub(r'http\S+|www.\S+', '', textWithoutQuotation)
    textWithoutEmails = re.sub(r'\S*@\S*\s?', '', textWithoutUrls)
    cleanText = ' '.join(textWithoutEmails.split())
    
    return cleanText

unproductiveResponses = [
    "Obrigado por compartilhar.",
    "Recebido, obrigado pelo aviso.",
    "Agradecemos o contato e a informação.",
    "Entendido, obrigado.",
    "Ciente. Agradeço a mensagem."
]

def suggestProductiveResponse(emailText):
    lowerText = emailText.lower()
    if "reunião" in lowerText or "agendar" in lowerText or "call" in lowerText:
        return "Recebido. Vou verificar a agenda e as disponibilidades para marcarmos."
    if "fatura" in lowerText or "pagamento" in lowerText or "cobrança" in lowerText:
        return "Obrigado por nos contatar. Encaminhei sua mensagem para o setor financeiro responsável pela verificação."
    if "problema" in lowerText or "erro" in lowerText or "não consigo" in lowerText or "bug" in lowerText:
        return "Agradecemos por reportar o problema. Nossa equipe técnica já está investigando e daremos um retorno em breve."
    if "status" in lowerText or "atualização" in lowerText or "novidades" in lowerText:
        return "Recebido. Estou verificando o status atual da sua solicitação e volto a contatar assim que tiver novidades."
    if "anexo" in lowerText or "documento" in lowerText or "contrato" in lowerText or "relatório" in lowerText:
        return "Confirmo o recebimento do anexo. Faremos a análise e daremos o retorno necessário."
    return "Recebido. A equipe já está ciente e daremos andamento à sua solicitação."

def getClassificationAndSuggestion(rawText):
    if not classifier:
        raise RuntimeError("O modelo de classificação não foi carregado.")

    cleanText = cleanEmailText(rawText)
    
    if not cleanText:
        return {
            'classification': 'Improdutivo',
            'suggested_response': 'Recebido.',
            'cleaned_text': ''
        }
        
    result = classifier(cleanText)[0]
    classification = result['label']
    
    suggestion = ""
    if classification == "Produtivo":
        suggestion = suggestProductiveResponse(cleanText)
    else:
        suggestion = random.choice(unproductiveResponses)
        
    return {
        'classification': classification,
        'suggested_response': suggestion,
        'cleaned_text': cleanText
    }