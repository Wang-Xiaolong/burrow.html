const urlParams = new URLSearchParams(window.location.search);
const Category = urlParams.get('cat');
let baseKey = "Burrow";
if (Category != null) {
	document.title = "Burrow:" + Category;
	baseKey = "Burrow/" + Category + '/';
}
const slTopic = document.getElementById("slTopic");
const keysStr = localStorage.getItem(baseKey)
if (keysStr !== null) {
	const keys = keysStr.split(";");
	for (const key of keys) {
		if (key == 'Default') continue
		const opt = document.createElement("option");
		opt.text = key;
		opt.value = key;
		slTopic.options.add(opt);
	}
}
let curKey = 'Default';
function changeTopic() {
	curKey = slTopic.value
	taHistory.value = localStorage.getItem(baseKey + curKey);
	if (curKey == 'Default') {
		btDelTopic.disabled = true;
		btFunc2.disabled = true;
	} else {
		btDelTopic.disabled = false;
		btFunc2.disabled = (tiFunc.value == '')
	}
	lbStatus.textContent = 'Switched to ' + curKey;
}
const btDelTopic = document.getElementById("btDelTopic");
slTopic.addEventListener('keydown', function(event) {
	if (event.key === 'Delete') {
		btDelTopic.click();
	}
});
function deleteTopic() {
	let opt = slTopic.options[slTopic.selectedIndex];
	if (opt.text == 'Default') {
		lbStatus.textContent = "Don't delete the Default dialog."
		return;
	}
	lbStatus.textContent = 'Dialog ' + opt.text + ' was deleted.'
	localStorage.removeItem(baseKey + opt.text)
	slTopic.removeChild(opt);
	changeTopic();
	saveTopics();
}
const slFunc = document.getElementById("slFunc");
const tiFunc = document.getElementById("tiFunc");
const btFunc1 = document.getElementById("btFunc1");
function changeFunc() {
	tiFunc.value = '';
	btFunc1.disabled = true;
	btFunc2.disabled = true;
	if (slFunc.value === 'New topic') {
		btFunc1.textContent = 'Insert';
		btFunc2.textContent = 'Rename';
		tiFunc.placeholder = 'Name it here.'
	} else if (slFunc.value === 'Search') {
		btFunc1.textContent = 'Here';
		btFunc2.textContent = 'Anywhere';
		tiFunc.placeholder = 'Input regex here.'
	} else if (slFunc.value === 'Down/Upload') {
		btFunc1.textContent = 'Down';
		btFunc2.textContent = 'Upload';
		tiFunc.placeholder = 'Local file path...'
	}
}
tiFunc.addEventListener('keydown', function(event) {
	if (event.ctrlKey && event.key === 'Enter') {
		btFunc2.click();
	} else if (event.key === 'Insert' || event.key === 'Enter') {
		btFunc1.click();
	} else if (event.key === 'Escape') {
		this.value = ''
		btFunc1.disabled = true;
		btFunc2.disabled = true;
	}
});
function focusTiFunc() {
	lbStatus.textContent = 'Ready to name a topic.';
}
function inputTiFunc() {
	btFunc1.disabled = (tiFunc.value === '');
	if (slFunc.value === 'New topic') {
		lbStatus.textContent = 'Editing the topic name...';
		btFunc2.disabled = (tiFunc.value === '' || slTopic.value === 'Default');
	} else if (slFunc.value === 'Search') {
		lbStatus.textContent = 'Editing the search regex...';
		btFunc2.disabled = (tiFunc.value === '');
	} else if (slFunc.value === 'Down/Upload') {
		lbStatus.textContent = 'Editing local file path...';
		btFunc2.disabled = (tiFunc.value === '');
	}
}
function clickBtFunc1() {
	if (slFunc.value === 'Search') {
		searchRegexHere();
		return;
	} else if (slFunc.value === 'Down/Upload') {
		downloadTopics();
		return;
	}
	let trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	for (let i = 0; i < slTopic.options.length; i++) {
		if (slTopic.options[i].text == trimmed) {
			lbStatus.textContent = trimmed + ' already exist.';
			return;
		}
	}
	let opt = document.createElement("option");
	opt.text = trimmed;
	opt.value = trimmed;
	slTopic.add(opt);
	slTopic.value = trimmed;
	changeTopic()
	saveTopics();
	tiFunc.value = ''; btFunc1.disabled = true; btFunc2.disabled = true;
	lbStatus.textContent = trimmed + ' was added as a new dialog.';
}
function saveTopics() {
	let vals = []
	for (let i = 0; i < slTopic.options.length; i++) {
		vals.push(slTopic.options[i].value);
	}
	vals.sort()
	localStorage.setItem(baseKey, vals.join(";"));
}
const btFunc2 = document.getElementById("btFunc2");
function clickBtFunc2() {
	if (slFunc.value === 'Search') {
		searchRegexAnywhere();
		return;
	}
	const trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	for (let i = 0; i < slTopic.options.length; i++) {
		if (slTopic.options[i].text == trimmed) {
			lbStatus.textContent = trimmed + ' already exist.';
			return;
		}
	}
	const opt = slTopic.options[slTopic.selectedIndex];
	const oldKey = opt.value;
	if (oldKey === trimmed) return;
	opt.text = trimmed;
	opt.value = trimmed;
	let value = localStorage.getItem(baseKey + oldKey);
	localStorage.setItem(baseKey + trimmed, value);
	localStorage.removeItem(baseKey + oldKey);
	saveTopics();
	curKey = trimmed;
	tiFunc.value = ''; btFunc1.disabled = true; btFunc2.disabled = true;
	lbStatus.textContent = 'Dialog ' + oldKey + ' has been renamed to ' + trimmed + '.'
}
const taHistory = document.getElementById("taHistory");
if (urlParams.has('hr')) taHistory.rows = urlParams.get('hr');
taHistory.value = localStorage.getItem(baseKey + curKey);
let dirty = false;
const taMessage = document.getElementById("taMessage");
if (urlParams.has('mr')) taMessage.rows = urlParams.get('mr');
const btSave = document.getElementById("btSave");
const lbStatus = document.getElementById("lbStatus");
function focusHistory() {
	lbStatus.textContent = 'Ready to edit the history.';
	btSave.disabled = (dirty === false);
}
function inputHistory() {
	lbStatus.textContent = 'Editing the history...';
	dirty = true;
	btSave.disabled = false;
}
function keydownHistory(event) {
	if (event.ctrlKey && event.key == 'Enter') {
		saveHistory();
	}
}
function blurHistory() {
	saveHistory();
}
function saveHistory() {
	if (dirty === false) return;
	localStorage.setItem(baseKey + curKey, taHistory.value);
	lbStatus.textContent = 'The history was just saved.';
	dirty = false;
	btSave.disabled = true;
}
function focusMessage() {
	btSave.disabled = (taMessage.value === '');
	lbStatus.textContent = 'Ready to edit the message.';
}
function inputMessage() {
	btSave.disabled = (taMessage.value === '');
	lbStatus.textContent = 'Editing the message...';
}
function keydownMessage(event) {
	if (event.ctrlKey && event.key == 'Enter') {
		saveMessage();
	}
}
function saveMessage() {
	let trimmed = taMessage.value.trim();
	if (trimmed == "") return;
	let now = new Date();
	let sDt = "<#" + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "." + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + ("0" + now.getSeconds()).slice(-2) + ">";
	taHistory.value = taHistory.value.trimEnd() + "\n" +  sDt + "\n" + trimmed;
	taMessage.value = "";
	btSave.disabled = true;
	taHistory.scrollTop = taHistory.scrollHeight;
	localStorage.setItem(baseKey + curKey, taHistory.value);
	lbStatus.textContent = 'A message was just added to the history.';
}
function clickSave() {
	saveMessage();
}
function searchRegexHere() {
	let trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	const regex = new RegExp(trimmed, 'i')
	let matchedLines = taHistory.value.split('\n').filter(function(line) {
		return line.match(regex);
	});
	if (matchedLines.length > 0) {
		alert(matchedLines.join('\n'));
	}
}
function searchRegexAnywhere() {
	let trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	const regex = new RegExp(trimmed, 'i');
	let result = '';
	for (let i = 0; i < slTopic.options.length; i++) {
		let str = localStorage.getItem(baseKey + slTopic.options[i].text);
		if (str === null) continue;
		let matchedLines = str.split('\n').filter(function(line) {
			return line.match(regex);
		});
		if (matchedLines.length > 0) {
			result += '------' + slTopic.options[i].text + '------\n'
				+ matchedLines.join('\n') + '\n';
		}
	}
	if (result !== '') alert(result)
}
function downloadTopics() {
	let topics = {};
	for (let i = 0; i < slTopic.options.length; i++) {
		let str = localStorage.getItem(baseKey + slTopic.options[i].text);
		if (str === null) continue;
		topics[slTopic.options[i].text] = str;
	}
	const data = JSON.stringify(topics);
	const blob = new Blob([data], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", Category + '.json');
	document.body.appendChild(link);
	link.click();
}
