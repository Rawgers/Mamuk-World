// Get DOM Elements
const buttonContainer = $('#button-container');
const chatContainer = $('#chat-container');
const chatShownTextSpan = $('#chat-shown-text');
const chatHiddenTextSpan = $('#chat-hidden-text');
const inputContainer = $('#edit-input-container');
const inputPrefixSpan = $('#edit-input-prefix');
const input = $('#edit-input');

let assetType;
let assetData = {};

// Menu
const showZoomMenu = (zoomedAssetType, zoomedAssetData) => {
  assetType = zoomedAssetType;
  Object.assign(assetData, zoomedAssetData);
  buttonContainer.fadeIn(FADE_DURATION);
};

const hideZoomMenu = () => {
  buttonContainer.fadeOut(FADE_DURATION);
  hideChat();
  hideEdit();
}

// Set button listeners
$('#chat-button').on('click', () => {
  showChat();
  hideEdit();
});
$('#edit-button').on('click', () => {
  hideChat();
  showEdit();
});
$('#map-button').on('click', () => {
  hideChat();
  hideEdit();
});
$('#home-button').on('click', () => {
  $('#overlay').fadeIn(HOME_LINK_DURATION, () => {
    window.location.href = "world.html";
  });
});

// Chat
let chatTimer;

const typewrite = () => {
  chatShownTextSpan.text(chatShownTextSpan.text() + chatHiddenTextSpan.text().charAt(0));
  chatHiddenTextSpan.text(chatHiddenTextSpan.text().substring(1));
  if (chatHiddenTextSpan.text().length > 0) {
    chatTimer = setTimeout(typewrite, TYPEWRITE_INTERVAL);
  }
};

const showChat = () => {
  clearTimeout(chatTimer);
  
  // Define the text to show
  let text;
  const topic = ['name', 'like', 'dislike', 'wish'][Math.floor(Math.random() * 4)];
  switch (topic) {
    case 'name':
      text = `I'm ${assetData.name}! Nice to meet you.`;
      break;
    case 'like':
      text = `I like ${concatenate(assetData.like)}♡`;
      break;
    case 'dislike':
      text = `I don't like ${concatenate(assetData.dislike)}...`;
      break;
    case 'wish':
      text = `I wish ${concatenate(assetData.wish)}!`;
      break;
  }
  
  chatShownTextSpan.text('');
  chatHiddenTextSpan.text(text);
  chatContainer.show();
  typewrite();
}

const hideChat = () => {
  clearTimeout(chatTimer);
  chatContainer.hide();
}

// Edit
let editView;

const showEdit = () => {
  document.body.style.background = `radial-gradient(#09123b, #03020a)`;
  editView = new EditView(
    new THREE.Scene(),
    new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000),
    null,
    data.mamuka[2]
  );
};

const hideEdit = () => {
};

const changeTopic = topic => {
  $('#edit-profile-button-container').css('visibility', 'hidden');
  inputPrefixSpan.text(`I ${topic}`);
  editView.drawConstellation(topic);
};

$('#like-button').on('click', () => changeTopic('like'));
$('#dislike-button').on('click', () => changeTopic('dislike'));
$('#wish-button').on('click', () => changeTopic('wish'));

input.keyup(event => {
  console.log(event.keyCode);
  if (event.keyCode === 13) {
    // TODO: distinguish add and edit
    editView.constellation.addStar()
  }
  if (event.keyCode === 27) {
    input.val('');
    inputContainer.fadeOut(200);
  }
});

$('#cancel-button').on('click', () => {
  hideEdit();
});