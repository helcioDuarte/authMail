import os
import random
import re
from bs4 import BeautifulSoup
from transformers import pipeline

class Email:
    def __init__(self, sender, subject, body, inputType):
        self.sender = sender
        self.subject = subject
        self.body = body
        self.inputType = inputType

unproductiveResponses = [
    "Obrigado por compartilhar.",
    "Recebido, obrigado pelo aviso.",
    "Agradecemos o contato e a informação.",
    "Entendido, obrigado.",
    "Ciente. Agradeço a mensagem."
]

classifierPath = "./classificador_email_model"
try:
    classifier = pipeline("text-classification", model=classifierPath)
    print("Modelo de classificação local carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o classificador: {e}")
    classifier = None

def suggestProductiveResponse(emailText, triggers):
    lowerText = emailText.lower()
    triggers.sort(key=lambda trigger: trigger.get('priority', 99))

    for trigger in triggers:
        if trigger["keyword"].lower() in lowerText:
            return trigger["response"]

    return "Recebido. A equipe já está ciente e daremos andamento à sua solicitação."

def getClassificationAndSuggestion(rawText, triggers):
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
        suggestion = suggestProductiveResponse(cleanText, triggers)
    else:
        suggestion = random.choice(unproductiveResponses)
        
    return {
        'classification': classification,
        'suggested_response': suggestion,
        'cleaned_text': cleanText
    }

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

