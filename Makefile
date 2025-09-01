PYTHON = venv/bin/python
PIP = venv/bin/pip
FLASK = venv/bin/flask

.PHONY: setup run clean

setup:
	@echo "Criando ambiente virtual e instalando dependências..."
	test -d venv || python3 -m venv venv
	$(PIP) install -r requirements.txt
	$(PYTHON) -c "import nltk; nltk.download(['punkt', 'stopwords', 'rslp', 'punkt_tab'])"
	@echo "Finalizado"

run:
	$(FLASK) run

clean:
	@echo "Limpando o projeto..."
	rm -rf venv
	rm -rf .nltk_data
	find . -type d -name "__pycache__" -exec rm -r {} +
	@echo "Projeto limpo."
