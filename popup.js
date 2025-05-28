import { splitPrayerRequests } from './utils/divider.js';

const elements = {
  page1: document.querySelector('.page[data-page="1"]'),
  page2: document.querySelector('.page[data-page="2"]'),
  prayerList: document.getElementById('prayer-list'),
  participantCount: document.getElementById('participant-count'),
  requestsPerPerson: document.getElementById('requests-per-person'),
  divisionOutput: document.getElementById('division-output'),
  nextButton: document.getElementById('next-button'),
  backButton: document.getElementById('back-button'),
  sendToChatButton: document.getElementById('send-to-chat'),
  tabLinks: document.querySelectorAll('.tab-link'),
  clearButton: document.getElementById('clear-prayer-list'),
  refreshParticipantsButton: document.getElementById('refresh-participants'),
};


chrome.storage.local.get(['prayerList'], (data) => {
  if (data.prayerList) {
    elements.prayerList.value = data.prayerList;
  }
});


/**
 * Navega para a pagina correspondente
 * @param {number} pageNumber
 */
function goToPage(pageNumber) {
  document.querySelectorAll('.page').forEach(page => {
    page.hidden = page.dataset.page !== String(pageNumber);
  });
}

/**
 * Lê os dados da aba e retorna os parâmetros corretos
 */
function getDivisionParameters() {
  const activeTab = document.querySelector('.tab-link.active')?.dataset.tab;
  const requests = elements.prayerList.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  
  const usePerPerson = activeTab === 'by-requests';
  const participantCount = parseInt(elements.participantCount.value.trim(), 10);
  const requestsPerPerson = parseInt(elements.requestsPerPerson.value.trim(), 10);

  if (usePerPerson && requestsPerPerson > 0) {
    return { requests, participantCount: null, requestsPerPerson };
  }
  if (!usePerPerson && participantCount > 0) {
    return { requests, participantCount, requestsPerPerson: null };
  }
  return null;
}

/**
 * Renderiza a divisão dos pedidos na tela
 * @param {string[][]} distribution
 */
function renderDistribution(distribution) {
  const divider = '────────────────────────────';

  elements.divisionOutput.textContent = '';

  distribution.forEach((group, index) => {
    const title = `👤 Pessoa ${index + 1}`;
    const body = group.map((request, i) => `  • ${request}`).join('\n');

    const section = `${title}\n${body}`;
    elements.divisionOutput.textContent += section;

    if (index < distribution.length - 1) {
      elements.divisionOutput.textContent += `\n\n${divider}\n\n`;
    }
  });
}

/**
 * Solicita ao content script o número de participantes.
 * Atualiza o campo se a resposta for válida.
 */
function fetchAndUpdateParticipantCount() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'getParticipantCount' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[OracaoMeetHelper] Erro ao obter participantes:', chrome.runtime.lastError.message);
          return;
        }

        if (response?.count) {
          elements.participantCount.value = response.count;
          console.log(`[OracaoMeetHelper] Participantes detectados: ${response.count}`);
        } else {
          console.log('[OracaoMeetHelper] Nenhum participante detectado.');
        }
      }
    );
  });
}


/**
 * Manipula clique em "Próximo"
 */
elements.nextButton.addEventListener('click', () => {
  const rawText = elements.prayerList.value.trim();
  if (!rawText) {
    alert('Por favor, insira a lista de pedidos.');
    return;
  }

  const params = getDivisionParameters();
  if (!params) {
    alert('Preencha o campo correto conforme a aba ativa.');
    return;
  }

  const distribution = splitPrayerRequests(
    params.requests,
    params.participantCount,
    params.requestsPerPerson
  );

  renderDistribution(distribution);
  goToPage(2);
});

/**
 * Voltar para a primeira página
 */
elements.backButton.addEventListener('click', () => {
  goToPage(1);
});

/**
 * Enviar para o chat do Google Meet
 */
elements.sendToChatButton.addEventListener('click', () => {
  const message = elements.divisionOutput.textContent.trim();
  if (!message) return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, {
      action: 'sendToChat',
      payload: message
    });
  });
});

/** 
 * Salvar ao digitar
 */
elements.prayerList.addEventListener('input', () => {
  chrome.storage.local.set({ prayerList: elements.prayerList.value });
});

// Mostrar ou esconder o "X"
elements.prayerList.addEventListener('input', () => {
  chrome.storage.local.set({ prayerList: elements.prayerList.value });

  const hasContent = elements.prayerList.value.trim().length > 0;
  elements.clearButton.hidden = !hasContent;
});

// Clicar no "X" limpa o campo
elements.clearButton.addEventListener('click', () => {
  elements.prayerList.value = '';
  elements.clearButton.hidden = true;
  chrome.storage.local.remove('prayerList');
});

elements.refreshParticipantsButton.addEventListener('click', fetchAndUpdateParticipantCount);


/**
 * Alternar abas
 */
elements.tabLinks.forEach(tab => {
  tab.addEventListener('click', () => {
    elements.tabLinks.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const selected = tab.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === selected);
    });
  });
});

goToPage(1); 
fetchAndUpdateParticipantCount();