/**
 * Waits for a specific DOM element to exist.
 * @param {() => HTMLElement | null} selectorFn
 * @param {number} timeout
 * @returns {Promise<HTMLElement>}
 */
function waitForElement(selectorFn, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      const element = selectorFn();
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
      elapsed += intervalTime;
      if (elapsed >= timeout) {
        clearInterval(interval);
        reject(new Error("Element not found in time"));
      }
    }, intervalTime);
  });
}

/**
 * Opens the chat panel if it is not already open.
*/
function openChatPanelIfClosed() {
  const chatButton =
    document.querySelector('[aria-label="Chat com todos"]') ||
    document.querySelector('[aria-label="Abrir o chat"]') ||
    document.querySelector('[aria-label="Open chat"]') ||
    [...document.querySelectorAll('button')].find(btn =>
      btn.innerHTML.includes('chat') &&
      btn.getAttribute('data-panel-id') === '2'
    );

  if (!chatButton) {
    console.warn('[OracaoMeetHelper] Chat button not found, cannot open chat panel.');
    return False;
  }
  const isOpen = chatButton.getAttribute('aria-pressed') === 'true';
  if (!isOpen) {
    chatButton.click();
    return true;
  }
  return false;
}

/**
 * Splits a large message into chunks of maxLength.
 * @param {string} message
 * @param {number} maxLength
 * @returns {string[]}
 */
function splitMessageIntoChunks(message, maxLength = 500) {
  const lines = message.split('\n');
  const chunks = [];
  let currentChunk = '';
  for (const line of lines) {
    const lineWithBreak = line + '\n';
    if ((currentChunk + lineWithBreak).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = lineWithBreak;
    } else {
      currentChunk += lineWithBreak
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/**
 * Sends messages to Google Meet chat, split in chunks of up to 500 characters.
 * @param {string} message
 */
async function sendMessageToMeetChat(message) {
  try {
    openChatPanelIfClosed();

    const input = await waitForElement(() =>
      document.querySelector('textarea[aria-label="Enviar uma mensagem"]') ||
      document.querySelector('textarea[aria-label="Send a message"]'));

    const sendButton = await waitForElement(() =>
      document.querySelector('button[aria-label="Enviar uma mensagem"]') ||
      document.querySelector('button[aria-label="Send a message"]'));

    const chunks = splitMessageIntoChunks(message, 500);
    console.log(`[OracaoMeetHelper] Sending ${chunks.length} message(s) to chat...`);

    for (const chunk of chunks) {
      input.value = chunk;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
      sendButton.click();
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    console.log('[OracaoMeetHelper] All messages sent');
  } catch (error) {
    console.error('Failed to send messages to Meet chat:', error);
  }
}

function isParticipantPanelOpen() {
  const button = document.querySelector('[data-panel-id="1"]');
  return button?.getAttribute('aria-pressed') === 'true';
}

function openPeoplePanel() {
  const button =
    document.querySelector('[aria-label="Pessoas"]') ||
    document.querySelector('[data-panel-id="1"]');

  if (!button) {
    return;
  }
  button.click();
  return;
}

function extractParticipantCount() {
  const list = document.querySelector('[role="list"]');
  if (!list) return null;

  const items = list.querySelectorAll('[role="listitem"]');
  return items.length || null;
}

async function getParticipantCountFromPanel() {
  if (!isParticipantPanelOpen()) {
    openPeoplePanel();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const participantCount = extractParticipantCount();
  openPeoplePanel();

  return participantCount;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToChat') {
    sendMessageToMeetChat(message.payload);
  }

  if (message.action === 'getParticipantCount') {
    getParticipantCountFromPanel().then(count => {
      sendResponse({ count });
    }).catch(err => {
      console.error('[OracaoMeetHelper] Erro ao contar participantes:', err);
      sendResponse({ count: null });
    });
    return true;
  }
});
