const urlParams = new URLSearchParams(window.location.search);
const proc = urlParams.get('proc') || '';
const baseKey = "Burrow/" + proc + '/';
document.title = baseKey;
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
	btDelThread.disabled = (curKey == 'Default') && (slThread.options.length > 1);
	if (slFunc.value === 'New Thread') {
		btFunc2.disabled = (curKey == 'Default') || (tiFunc.value == '');
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
		if (slThread.options.length > 1) {
			lbStatus.textContent = "Don't delete the Default thread."
		} else {
			let result = window.confirm("The Default thread is the only one left in the process.\nDeleting it means to delete the whole process.\nAre you sure you want to proceed?");
			if (result == true) {
				localStorage.removeItem(baseKey + 'Default');
				localStorage.removeItem(baseKey)
				document.documentElement.innerHTML = '';
				alert('Everything was removed. Please close the window.')
			}
		}
		return;
	}
	lbStatus.textContent = 'Thread ' + opt.text + ' was deleted.'
	localStorage.removeItem(baseKey + opt.text)
	slThread.removeChild(opt);
	changeThread();
	saveThreads();
}
const slFunc = document.getElementById("slFunc");
const tiFunc = document.getElementById("tiFunc");
const btFunc1 = document.getElementById("btFunc1");
function changeFunc() {
	if (slFunc.value === 'New Thread') {
		btFunc1.disabled = true;
		btFunc1.textContent = 'Insert';
		btFunc2.disabled = true;
		btFunc2.textContent = 'Rename';
		tiFunc.disabled = false;
		tiFunc.value = '';
		tiFunc.placeholder = 'Name it here.'
		lbStatus.textContent = 'Create or rename a thread.'
	} else if (slFunc.value === 'Search') {
		btFunc1.disabled = true;
		btFunc1.textContent = 'Here';
		btFunc2.disabled = true;
		btFunc2.textContent = 'Anywhere';
		tiFunc.disabled = false;
		tiFunc.value = '';
		tiFunc.placeholder = 'Input regex here.'
		lbStatus.textContent = 'Search with regex.'
	} else if (slFunc.value === 'Ex/Import') {
		btFunc1.disabled = false;
		btFunc1.textContent = 'Export';
		btFunc2.disabled = false;
		btFunc2.textContent = 'Import';
		tiFunc.disabled = true;
		tiFunc.value = '';
		tiFunc.placeholder = 'To/From a file:'
		lbStatus.textContent = 'Export to or import from a local file.'
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
	if (slFunc.value === 'New Thread') {
		lbStatus.textContent = 'Ready to name a thread.';
	} else if (slFunc.value === 'Search') {
		lbStatus.textContent = 'Ready to input a search regex.';
	}
}
function inputTiFunc() {
	btFunc1.disabled = (tiFunc.value === '');
	if (slFunc.value === 'New Thread') {
		lbStatus.textContent = 'Editing the thread name...';
		btFunc2.disabled = (tiFunc.value === '' || slThread.value === 'Default');
	} else if (slFunc.value === 'Search') {
		lbStatus.textContent = 'Editing the search regex...';
		btFunc2.disabled = (tiFunc.value === '');
	}
}
function clickBtFunc1() {
	if (slFunc.value === 'New Thread') {
		insertThread();
	} else if (slFunc.value === 'Search') {
		searchRegexHere();
	} else if (slFunc.value === 'Ex/Import') {
		exportThreads();
	}
}
function insertThread() {
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
	lbStatus.textContent = trimmed + ' was added as a new thread.';
}
function saveThreads() {
	let vals = []
	for (let i = 0; i < slThread.options.length; i++) {
		vals.push(slThread.options[i].value);
	}
	vals.sort();
	localStorage.setItem(baseKey, vals.join(";"));
}
const btFunc2 = document.getElementById("btFunc2");
function clickBtFunc2() {
	if (slFunc.value === 'New Thread') {
		renameThread();
	} else if (slFunc.value === 'Search') {
		searchRegexAnywhere();
	} else if (slFunc.value === 'Ex/Import') {
		importThreads();
	}
}
function renameThread() {
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
	lbStatus.textContent = 'Thread ' + oldKey + ' has been renamed to ' + trimmed + '.'
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
			const result = window.confirm("Before importing a local json file, all threads in the current process will be thrown away.\nAre you sure you want to proceed?");
			if (result === false) return;
			let len = slThread.options.length
			for (let i = len - 1; i >= 0; i--) {
				localStorage.removeItem(baseKey + slThread.options[i].value);
				slThread.remove(i);
			}
			localStorage.removeItem(baseKey);
			const data = JSON.parse(event.target.result);
			Object.keys(data).forEach(function(key) {
				localStorage.setItem(baseKey + key, data[key])
				let opt = document.createElement("option");
				opt.text = key;
				opt.value = key;
				slThread.options.add(opt);
			});
			saveThreads();
			slThread.onchange();
		};
		reader.readAsText(file);
	};
	input.click();
	input.remove();
}
