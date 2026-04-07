/* Main page interactions: LED controls, TV app switching, speakers, clock, and Spotify embed */
if (typeof window.CSS !== 'undefined' && typeof window.CSS.registerProperty === 'function') {
  document.body.classList.add('registerProperty-supported');
}

document.querySelectorAll('.led-option').forEach(function(button) {
  button.addEventListener('click', function() {
    var choice = button.dataset.ledChoice;
    document.body.dataset.ledColor = choice;
    document.querySelectorAll('.led-option').forEach(function(option) {
      var isActive = option === button;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-pressed', String(isActive));
    });
  });
});

var wallClock = document.querySelector('.room-8bit .timer-digits');
if (wallClock) {
  function updateWallClock() {
    var now = new Date();
    wallClock.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  updateWallClock();
  setInterval(updateWallClock, 30000);
}

var speakerBoxes = Array.from(document.querySelectorAll('.speaker-wrap .case'));
function setSpeakerBoom(isActive) {
  speakerBoxes.forEach(function(target) {
    target.classList.toggle('boom', isActive);
  });
}

var tvPrettifyButton = document.querySelector('.tv-prettify');
var tvOutput = document.querySelector('.tv-output');
if (tvPrettifyButton && tvOutput) {
  tvPrettifyButton.addEventListener('click', function() {
    tvOutput.value = tvOutput.dataset.outputText || '';
    tvOutput.classList.remove('is-output-hidden');
    tvOutput.scrollTop = 0;
    tvOutput.focus();
  });
}

var tvAddressTitle = document.querySelector('.tv-address-title');
var tvTabButtons = Array.from(document.querySelectorAll('.tv-tab'));
var tvViews = Array.from(document.querySelectorAll('.tv-view'));
var dockItems = Array.from(document.querySelectorAll('.dock-item'));
var spotifyStatus = document.getElementById('spotify-status');
var spotifyElement = document.getElementById('spotify-embed-container');
var spotifyIFrameAPI = null;
var spotifyController = null;

function setSpotifyStatus(message) {
  if (spotifyStatus) {
    spotifyStatus.textContent = message;
  }
}

function stretchSpotifyEmbed() {
  if (!spotifyElement) {
    return;
  }

  spotifyElement.style.width = '100%';
  spotifyElement.style.height = '100%';

  spotifyElement.querySelectorAll('iframe, div').forEach(function(node) {
    node.style.width = '100%';
    node.style.maxWidth = '100%';
    node.style.height = '100%';
    node.style.maxHeight = '100%';
  });
}

function initSpotifyEmbed() {
  if (!spotifyIFrameAPI || !spotifyElement || spotifyController) {
    return;
  }

  window.requestAnimationFrame(function() {
    var rect = spotifyElement.getBoundingClientRect();
    var options = {
      width: Math.max(320, Math.round(rect.width || 320)),
      height: Math.max(600, Math.round(rect.height || 600)),
      uri: 'spotify:artist:74cOFM745sSsoZ8wGC3rQw'
    };

    spotifyIFrameAPI.createController(spotifyElement, options, function(EmbedController) {
      spotifyController = EmbedController;
      stretchSpotifyEmbed();
      setSpotifyStatus('Status: Spotify controller online.');

      EmbedController.addListener('ready', function() {
        stretchSpotifyEmbed();
        setSpotifyStatus('Status: Standing by for user interaction.');
      });

      EmbedController.addListener('playback_started', function() {
        setSpeakerBoom(true);
        setSpotifyStatus('Status: Broadcasting legendary anthems.');
      });

      EmbedController.addListener('playback_update', function(event) {
        var data = event && event.data ? event.data : {};
        var duration = Number(data.duration || 0);
        var position = Number(data.position || 0);
        var isPaused = Boolean(data.isPaused);
        var isActive = !isPaused && duration > 0;

        setSpeakerBoom(isActive);

        if (isActive) {
          var progress = duration > 0 ? Math.round((position / duration) * 100) : 0;
          setSpotifyStatus('Status: Broadcasting legendary anthems. Progress: ' + progress + '%.');
        } else if (position === 0) {
          setSpotifyStatus('Status: Standing by for user interaction.');
        } else {
          setSpotifyStatus('Status: Transmission paused.');
        }
      });
    });
  });
}

function setActiveTvApp(appName) {
  if (appName !== 'json' && appName !== 'spotify') {
    return;
  }

  tvViews.forEach(function(view) {
    view.classList.toggle('is-active', view.dataset.tvView === appName);
  });

  tvTabButtons.forEach(function(tab) {
    var matches = tab.dataset.tvTab === appName;
    tab.classList.toggle('is-active', matches);
    if (appName === 'spotify' && tab.dataset.tvTab === 'spotify') {
      tab.classList.remove('is-hidden');
    }
  });

  dockItems.forEach(function(item) {
    item.classList.toggle('is-active', item.dataset.dockApp === appName);
  });

  if (tvAddressTitle) {
    tvAddressTitle.textContent = appName === 'spotify' ? 'Spotify' : 'About me Prettifier';
  }

  if (appName === 'spotify') {
    initSpotifyEmbed();
    window.setTimeout(stretchSpotifyEmbed, 120);
    window.setTimeout(stretchSpotifyEmbed, 320);
  }
}

tvTabButtons.forEach(function(tab) {
  tab.addEventListener('click', function() {
    setActiveTvApp(tab.dataset.tvTab);
  });
});

dockItems.forEach(function(item, index, items) {
  function toggleSiblingClass(offset, className, add) {
    var sibling = items[index + offset];
    if (sibling) {
      sibling.classList.toggle(className, add);
    }
  }

  item.addEventListener('mouseenter', function() {
    item.classList.add('hover');
    toggleSiblingClass(-1, 'sibling-close', true);
    toggleSiblingClass(1, 'sibling-close', true);
    toggleSiblingClass(-2, 'sibling-far', true);
    toggleSiblingClass(2, 'sibling-far', true);
  });

  item.addEventListener('mouseleave', function() {
    item.classList.remove('hover');
    toggleSiblingClass(-1, 'sibling-close', false);
    toggleSiblingClass(1, 'sibling-close', false);
    toggleSiblingClass(-2, 'sibling-far', false);
    toggleSiblingClass(2, 'sibling-far', false);
  });

  var dockButton = item.querySelector('.dock-button');
  if (dockButton && item.dataset.dockApp) {
    dockButton.addEventListener('click', function() {
      setActiveTvApp(item.dataset.dockApp);
    });
  }
});

speakerBoxes.forEach(function(box) {
  function toggleSpeaker() {
    setSpeakerBoom(!box.classList.contains('boom'));
  }
  box.addEventListener('click', function(event) {
    event.stopPropagation();
    toggleSpeaker();
  });
  box.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      toggleSpeaker();
    }
  });
});

var spotifyEmbedScript = document.createElement('script');
spotifyEmbedScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
spotifyEmbedScript.async = true;
document.body.appendChild(spotifyEmbedScript);

window.onSpotifyIframeApiReady = function(IFrameAPI) {
  spotifyIFrameAPI = IFrameAPI;
  if (document.querySelector('.tv-view.is-active[data-tv-view="spotify"]')) {
    initSpotifyEmbed();
  }
};


