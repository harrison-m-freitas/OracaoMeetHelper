# Oracao Meet Helper

**Oracao Meet Helper** é uma extensão para navegadores baseados em Chromium (como Google Chrome e Microsoft Edge) que auxilia grupos de oração a organizarem e enviarem pedidos diretamente no chat do Google Meet de forma prática e automatizada.

## Funcionalidades

- Interface simples e responsiva para inserção de pedidos
- Divisão automática dos pedidos entre os participantes
- Possibilidade de definir:
  - Número total de participantes
  - Número fixo de pedidos por pessoa
- Envio automático dos pedidos para o chat da reunião
- Detecção opcional do número atual de participantes do Meet
- Armazenamento local da lista de pedidos para reutilização
- Compatível com Google Meet em navegadores Chromium

## Instalação (Modo Desenvolvedor)

1. Acesse `chrome://extensions/` ou `edge://extensions/`
2. Ative o **Modo de Desenvolvedor** (no canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta raiz do projeto com os arquivos da extensão

## Como Usar

1. Durante uma reunião no Google Meet, clique no ícone da extensão
2. Insira os pedidos de oração (um por linha)
3. Escolha entre:
   - Dividir por número de participantes
   - Dividir por quantidade de pedidos por pessoa
4. Clique em "Dividir"
5. Visualize a distribuição dos pedidos
6. Clique em "Enviar para o chat do Meet"

## Estrutura do Projeto

```text
├── background.js
├── content.js
├── LICENSE
├── manifest.json
├── popup.html
├── popup.js
├── public
│   └── icons
├── README.md
├── style.css
└── utils
    └── divider.js

```

## Requisitos

* Navegador baseado em Chromium
* Permissões mínimas: acesso à aba ativa e injeção de conteúdo na página do Meet
* Manifest V3 (padrão atual de extensões Chrome)


## Tecnologias Utilizadas

* HTML5, CSS3, JavaScript (ES Modules)
* Chrome Extensions API
* Google Meet DOM interaction (não oficial)


## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.


## Autor

Feito com fé e café por **Harrison M. Freitas**