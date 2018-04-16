// Get DOM elements
const buttonContainer = $('#button-container');

const chatContainer = $('#chat-container');
const chatButton = $('#chat-button');
const shownText = $('#chat-shown-text');
const hiddenText = $('#chat-hidden-text');

const editContainer = $('#edit-container');
const editButton = $('#edit-button');
const cancelButton = $('#cancel-button');
const submitButton = $('submit-button');

const mapContainer = $('map-container');
const mapButton = $('#map-button');

const homeButton = $('#home-button');
const overlay = $('#overlay');

// Menu
const showZoomMenu = () => {
  buttonContainer.fadeIn(FADE_DURATION);
}
const hideZoomMenu = () => {
  buttonContainer.fadeOut(FADE_DURATION);
  hideChat();
}

// Chat
chatButton.on('click', () => showChat('Miwatasukagiri no kouyani hitori tatteirunda sorya miburui mo surundarou'));

let chatTimer;
const typewrite = () => {
  const visibleText = shownText.text();
  const newInvisibleText = hiddenText.text().substring(1)
  const nextVisibleLetter = hiddenText.text().charAt(0);
  shownText.text(visibleText + nextVisibleLetter);
  hiddenText.text(newInvisibleText);
  if (hiddenText.text().length > 0) {
    chatTimer = setTimeout(typewrite, TYPEWRITE_INTERVAL);
  }
};

const showChat = text => {
  clearTimeout(chatTimer);
  chatContainer.fadeIn(FADE_DURATION);
  shownText.text('');
  hiddenText.text(text);
  typewrite();
}

const hideChat = () => {
  clearTimeout(chatTimer);
  chatContainer.hide();
}

// Edit
editButton.on('click', () => {
  hideChat();
  editContainer.fadeIn(FADE_DURATION);
})
cancelButton.on('click', () => {
  editContainer.fadeOut(FADE_DURATION);
})

// Map
mapButton.on('click', () => {
  hideChat();
})

// Home
homeButton.on('click', () => {
  overlay.fadeIn(WORLD_LINK_DURATION, () => {
    window.location.href = "world.html"
  });
})
