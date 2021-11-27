const getMatches = (string, regex, index) => {
  index || (index = 1);
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

const getSelectionText = () => {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

const processVocabulary = async (word) => {
  var data = await fetch(`http://127.0.0.1:2387/british/sound/${word}`, { "method": "GET", });
  var {data} = (await data.json()).data;

  console.log(data);

  var audio = new Audio(data);
  audio.play();
}

window.onload = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getSelectionText,
  }, (result) => {
      var regex = /^([\w]+)/g;
      var word = regex.exec(result[0].result);
      if (word) {
        word = word[0]
      } else {
        return
      }
      document.getElementById("word-id").innerText = word;
      processVocabulary(word.toLowerCase())
    });
}
