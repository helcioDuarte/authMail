import joblib
import os
import random
nltk_data_dir = os.path.join(os.path.dirname(__file__), '.nltk_data')
nltk.data.path.append(nltk_data_dir)
import re
from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer
from nltk.tokenize import word_tokenize

MODEL_PATH = "./svm_classifier_model/svm_model.joblib"
try:
    model = joblib.load(MODEL_PATH)
    stop_words_pt = set(stopwords.words('portuguese'))
    stemmer = RSLPStemmer()
    print("IA carregada")
except Exception as e:
    print(f"Erro ao carregar o modelo ou recursos NLTK: {e}")
    model = None

def preprocessador(texto):
    tokens = word_tokenize(texto.lower())
    tokens_limpos = [palavra for palavra in tokens if palavra.isalpha() and palavra not in stop_words_pt]
    tokens_stemmed = [stemmer.stem(palavra) for palavra in tokens_limpos]
    return " ".join(tokens_stemmed)

def cleanEmailText(rawText):
    if not rawText: return ""
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
    "Obrigado por compartilhar.", "Recebido, obrigado pelo aviso.", 
    "Agradecemos o contato.", "Entendido, obrigado.", "Ciente."
]

def suggestProductiveResponse(emailText, triggers):
    lowerText = emailText.lower()
    triggers.sort(key=lambda trigger: trigger.get('priority', 99))
    for trigger in triggers:
        for keyword in trigger["keywords"]:
            if keyword.lower() in lowerText:
                return trigger["response"]
    return "Recebido. A equipe já está ciente e daremos andamento à sua solicitação."

def getClassificationAndSuggestion(rawText, triggers):
    if not model:
        raise RuntimeError("O modelo de classificação não foi carregado.")

    cleanedText = cleanEmailText(rawText)
    
    if not cleanedText:
        return {'classification': 'Improdutivo', 'suggested_response': 'Recebido.', 'cleaned_text': ''}
        
    processedForSvm = preprocessador(cleanedText)
    classification = model.predict([processedForSvm])[0]
    
    suggestion = ""
    if classification == "Produtivo":
        suggestion = suggestProductiveResponse(cleanedText, triggers)
    else:
        suggestion = random.choice(unproductiveResponses)
        
    return {'classification': classification, 'suggested_response': suggestion, 'cleaned_text': cleanedText}