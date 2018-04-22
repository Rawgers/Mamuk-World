// Get DOM elements
const buttonContainer = $('#button-container');

const chatButton = $('#chat-button');
const chatContainer = $('#chat-container');
const shownText = $('#chat-shown-text');
const hiddenText = $('#chat-hidden-text');

const editButton = $('#edit-button');
const editContainer = $('#edit-container');
const cancelButton = $('#edit-cancel-button');
const submitButton = $('#edit-submit-button');

const mapButton = $('#map-button');
const mapContainer = $('#map-container');

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
  showEdit();
});

cancelButton.on('click', () => {
  hideEdit();
});

$('.edit-tab-button').on('click', function () {
  $('.edit-field').hide();
  const fieldID = $(this).attr('id').split('-')[0] + '-field';
  $('#' + fieldID).show();
});

const showEdit = () => {
  editContainer.css('display', 'grid');
}

const hideEdit = () => {
  editContainer.fadeOut(FADE_DURATION);
}

// Map
mapButton.on('click', () => {
  hideChat();
})

// Home
homeButton.on('click', () => {
  overlay.fadeIn(HOME_LINK_DURATION, () => {
    window.location.href = "world.html"
  });
})
