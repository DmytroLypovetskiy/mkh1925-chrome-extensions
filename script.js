$(function(){
  const navLinks = $(".nav-link");
  const ticketsArea = $(".tickets-area");
  const blockedUsersTxt = $("#blocked-users");
  const saveSettingsBtn = $("#save-settings");
  const applySettingsBtn = $("#apply-settings");
  const postsCollection = $(".post");

  loadNextMatch();
  setSettings();
  
  navLinks.on('click', function() {
    const url = $(this).attr('href');
    goTo(url);
  });

  saveSettingsBtn.on('click', saveSettings);

  $(document).on('click', '.hidden-post', function() {
    $(this).toggleClass('show');
  });

  function goTo(url) {
    chrome.tabs.query({'active': true}, (tabs) => {
      chrome.tabs.update(tabs[0].id, {url: url});
      //window.close();
    });
  }

  function loadNextMatch() {
    const ticketsApiUrl = 'http://metalist1925.club/api/matches/next/';

    $.ajax({
      url: ticketsApiUrl,
      context: document.body
    }).done(function(data) {
      $.each(data, function( index, value ) {
        
        const match = {
          date: value.date,
          title: value.headline,
          logo: value.poster
        }

        renderNextMatch(match);
      });
    });
  }

  function renderNextMatch(match) {
    const externalUrl = 'http://metalist1925.club/';
    const date = new Date(match.date).toLocaleString("ru", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
    });

    const title = $(`<h4 class="next-match-title">${match.title}</h4>`);
    const logo = $(`<p><img class="next-match-logo" src="${externalUrl}${match.logo}"></p>`);
    const html = $(`<div class="next-match"></div>`);

    html.append(title, logo, date);
    ticketsArea.append(html);
  }

  function saveSettings() {
    chrome.storage.sync.set({"names": getNames(), "active": isActive()}, () => {
      console.log('Settings saved');
    });
  }

  function getNames() {
    return blockedUsersTxt.val();
  }

  function isActive() {
    return applySettingsBtn.prop("checked");
  }

  function setSettings() {
    chrome.storage.sync.get(['names', 'active'], (data) => {
      console.log(data.names);
      let blockedUsers = [];

      if (data.names) {
        blockedUsers = data.names.split(' ,').map(el => el.trim());
      }

      blockedUsersTxt.val(data.names);
      applySettingsBtn.prop("checked", data.active);

      if (data.active) findBlockedUsersPosts(blockedUsers);
    });
  }

  function findBlockedUsersPosts(users) {
    $.each(postsCollection, (index, post) => {
      const name = $(post).find(".head big b").text();

      if ( users.includes(name) &&  name !== "Tasman") $(post).wrap( "<div class='hidden-post'></div>" );
    });
  }
});






