const urlParams = new URLSearchParams(window.location.search);
const proc = urlParams.get('proc');
let baseKey = "Burrow";
if (proc != null) {
	document.title = "Burrow:" + proc;
	baseKey = "Burrow/" + proc + '/';
}
const slThread = document.getElementById("slThread");
const keysStr = localStorage.getItem(baseKey)
if (keysStr !== null) {
	const keys = keysStr.split(";");
	for (const key of keys) {
		if (key == 'Default') continue
		const opt = document.createElement("option");
		opt.text = key;
		opt.value = key;
		slThread.options.add(opt);
	}
}
let curKey = 'Default';
function changeThread() {
	curKey = slThread.value
	taHistory.value = localStorage.getItem(baseKey + curKey);
	if (curKey == 'Default') {
		btDelThread.disabled = true;
		btFunc2.disabled = true;
	} else {
		btDelThread.disabled = false;
		btFunc2.disabled = (tiFunc.value == '')
	}
	lbStatus.textContent = 'Switched to ' + curKey;
}
const btDelThread = document.getElementById("btDelThread");
slThread.addEventListener('keydown', function(event) {
	if (event.key === 'Delete') {
		btDelThread.click();
	}
});
function deleteThread() {
	let opt = slThread.options[slThread.selectedIndex];
	if (opt.text == 'Default') {
		lbStatus.textContent = "Don't delete the Default dialog."
		return;
	}
	lbStatus.textContent = 'Dialog ' + opt.text + ' was deleted.'
	localStorage.removeItem(baseKey + opt.text)
	slThread.removeChild(opt);
	changeThread();
	saveThreads();
}
const slFunc = document.getElementById("slFunc");
const tiFunc = document.getElementById("tiFunc");
const btFunc1 = document.getElementById("btFunc1");
function changeFunc() {
	tiFunc.value = '';
	btFunc1.disabled = true;
	btFunc2.disabled = true;
	if (slFunc.value === 'New Thread') {
		btFunc1.textContent = 'Insert';
		btFunc2.textContent = 'Rename';
		tiFunc.placeholder = 'Name it here.'
	} else if (slFunc.value === 'Search') {
		btFunc1.textContent = 'Here';
		btFunc2.textContent = 'Anywhere';
		tiFunc.placeholder = 'Input regex here.'
	} else if (slFunc.value === 'Ex/Import') {
		btFunc1.textContent = 'Export';
		btFunc2.textContent = 'Import';
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
	if (slFunc.value === 'New Thread') {
		lbStatus.textContent = 'Editing the topic name...';
		btFunc2.disabled = (tiFunc.value === '' || slThread.value === 'Default');
	} else if (slFunc.value === 'Search') {
		lbStatus.textContent = 'Editing the search regex...';
		btFunc2.disabled = (tiFunc.value === '');
	} else if (slFunc.value === 'Ex/Import') {
		lbStatus.textContent = 'Editing local file path...';
		btFunc2.disabled = (tiFunc.value === '');
	}
}
function clickBtFunc1() {
	if (slFunc.value === 'Search') {
		searchRegexHere();
		return;
	} else if (slFunc.value === 'Ex/Import') {
		exportThreads();
		return;
	}
	let trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	for (let i = 0; i < slThread.options.length; i++) {
		if (slThread.options[i].text == trimmed) {
			lbStatus.textContent = trimmed + ' already exist.';
			return;
		}
	}
	let opt = document.createElement("option");
	opt.text = trimmed;
	opt.value = trimmed;
	slThread.add(opt);
	slThread.value = trimmed;
	changeThread()
	saveThreads();
	tiFunc.value = ''; btFunc1.disabled = true; btFunc2.disabled = true;
	lbStatus.textContent = trimmed + ' was added as a new dialog.';
}
function saveThreads() {
	let vals = []
	for (let i = 0; i < slThread.options.length; i++) {
		vals.push(slThread.options[i].value);
	}
	vals.sort()
	localStorage.setItem(baseKey, vals.join(";"));
}
const btFunc2 = document.getElementById("btFunc2");
function clickBtFunc2() {
	if (slFunc.value === 'Search') {
		searchRegexAnywhere();
		return;
	} else if (slFunc.value === 'Ex/Import') {
		importThreads();
		return;
	}
	const trimmed = tiFunc.value.trim();
	if (trimmed == "") return;
	for (let i = 0; i < slThread.options.length; i++) {
		if (slThread.options[i].text == trimmed) {
			lbStatus.textContent = trimmed + ' already exist.';
			return;
		}
	}
	const opt = slThread.options[slThread.selectedIndex];
	const oldKey = opt.value;
	if (oldKey === trimmed) return;
	opt.text = trimmed;
	opt.value = trimmed;
	let value = localStorage.getItem(baseKey + oldKey);
	localStorage.setItem(baseKey + trimmed, value);
	localStorage.removeItem(baseKey + oldKey);
	saveThreads();
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
	let sDt = "#" + getCurrentTime(1);
	taHistory.value = taHistory.value.trimEnd() + "\n" +  sDt + "\n" + trimmed;
	taMessage.value = "";
	btSave.disabled = true;
	taHistory.scrollTop = taHistory.scrollHeight;
	localStorage.setItem(baseKey + curKey, taHistory.value);
	lbStatus.textContent = 'A message was just added to the history.';
}
function getCurrentTime(type) {
	const date = new Date();
	const year = date.getFullYear().toString().substr(-2);
	const month = ('0' + (date.getMonth() + 1)).slice(-2);
	const day = ('0' + date.getDate()).slice(-2);
	const hours = ('0' + date.getHours()).slice(-2);
	const minutes = ('0' + date.getMinutes()).slice(-2);
	const seconds = ('0' + date.getSeconds()).slice(-2);
	let formattedDate;
	if (type === 1) {
		formattedDate = `${month}${day}_${hours}${minutes}${seconds}`;
	} else if (type === 2) {
		formattedDate = `${year}${month}${day}_${hours}${minutes}${seconds}`;
	} else {
		formattedDate = 'Invalid type argument';
	}
	return formattedDate;
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
	for (let i = 0; i < slThread.options.length; i++) {
		let str = localStorage.getItem(baseKey + slThread.options[i].text);
		if (str === null) continue;
		let matchedLines = str.split('\n').filter(function(line) {
			return line.match(regex);
		});
		if (matchedLines.length > 0) {
			result += '------' + slThread.options[i].text + '------\n'
				+ matchedLines.join('\n') + '\n';
		}
	}
	if (result !== '') alert(result)
}
function exportThreads() {
	let topics = {};
	for (let i = 0; i < slThread.options.length; i++) {
		let str = localStorage.getItem(baseKey + slThread.options[i].text) || '';
		topics[slThread.options[i].text] = str;
	}
	const data = JSON.stringify(topics);
	const blob = new Blob([data], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", proc + '_' + getCurrentTime(2) + '.json');
	document.body.appendChild(link);
	link.click();
	link.remove();
}
function importThreads() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json';
	input.onchange = function(event) {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = function(event) {
			const data = JSON.parse(event.target.result);
			console.log(data);
		};
		reader.readAsText(file);
	};
	input.click();
	input.remove();
}
