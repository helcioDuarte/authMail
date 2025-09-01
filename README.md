# AuthMail - Classificador de E-mails com IA

[https://authmail.helcio.me](https://authmail.helcio.me)

## Descrição do Projeto

Solução web que utiliza Machine Learning para classificar e-mails em 'Produtivo' ou 'Improdutivo', sugerindo respostas contextuais para otimizar a triagem e o fluxo de trabalho. Este projeto foi desenvolvido como um case prático da AutoU.

## Funcionalidades Principais

* **Classificação de E-mails:** Análise textual para determinar se um e-mail requer ação (`Produtivo`) ou não (`Improdutivo`).
* **Sugestão de Respostas:** Geração de respostas baseadas na classificação e em um sistema de triggers com prioridade, customizáveis pelo usuário.
* **Múltiplos Métodos de Entrada:** Suporte para entrada de texto manual e upload de arquivos `.txt`, `.pdf` e `.json`, com processamento no lado do cliente.
* **Gerenciamento de Sessão:** Interface para o usuário criar triggers e visualizar o histórico de classificações durante a sessão no navegador.

## Stack de Tecnologias e Decisões de Arquitetura

* **Frontend:** Single-Page Application (SPA) com JavaScript modular (ES6), HTML5 e **Tailwind CSS**.
* **Backend:** API stateless construída com **Flask** e servida em produção com **Gunicorn**.
* **Modelo de IA:** A classificação é realizada por um pipeline de Machine Learning Clássico. O texto é pré-processado com **NLTK** (limpeza de ruídos, remoção de stopwords, stemming) e vetorizado com **TF-IDF**. O modelo final é um **SVM** treinado com `Scikit-Learn`. 

## Como Executar o Projeto Localmente

Você pode utilizar `make` para automatizar a configuração e execução.

**Pré-requisitos:**
* Python 3.12+
* `venv`
* `make`

**Instalação e Execução:**

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/helcioDuarte/authMail.git](https://github.com/helcioDuarte/authMail.git)
    cd AuthMail-Case
    ```

2.  Configure o ambiente virtual e instale todas as dependências:
    ```bash
    make setup
    ```

3.  Inicie a aplicação:
    ```bash
    flask run
    ```

**Outros Comandos:**
* `make clean`

### **Ou execute os comandos manualmente**

1.  Crie e ative um ambiente virtual:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

2.  Instale as dependências do requirements:
    ```bash
    pip install -r requirements.txt
    ```

3.  Baixe os pacotes de dados necessários da NLTK:
    ```bash
    python -c "import nltk; nltk.download(['punkt', 'stopwords', 'rslp', punkt_tab])"
    ```

4.  Inicie a aplicação Flask:
    ```bash
    flask run
    ```

## Autor

**Helcio Duarte** - [GitHub](https://github.com/helcioDuarte)