//全局变量
var betterPlayer = null;
var playerStatus = [0, 0];
var nowDrag = null;
const sOne = document.querySelector("#scoreOne");
const sTwo = document.querySelector("#scoreTwo");
const tid = { "One": 0, "Two": 1 };
const blockColor = "#0599d2";

/**
 * 创建道具实例
 */
class item {
	/**
	 * 构造函数
	 * @param {string} name 
	 * @param {string} iconurl 
	 * @param {string} profile 
	 * @param {number} cd 
	 * @param {number} cost 
	 * @param {Element} obj
	 * @param {Function} func 
	 */
	constructor(name, iconurl, profile, cd, cost, func) {
		this.name = name;
		this.icon = iconurl;
		this.profile = profile;
		this.cd = cd;
		this.cost = cost;
		this.func = func;
	}
}
var items = [
	new item("寒冰之瓶", "img/hanbing.png", "埋藏在北极底下千百年的瓶子，汲取极寒之精华，时常散发令人心悸的寒冷。<br /><b>使己方方块下降速度减缓</b>", 4, 0,
		(obj) => {
			clearInterval(obj.updating);
			document.querySelector("#tetrisCanvas" + obj.ids).style.boxShadow = "0 0 10px #619ac3";
			obj.updating = setInterval(obj.update, 1000);
			let iceFade = () => { clearInterval(obj.updating); obj.updating = setInterval(obj.update, 500); document.querySelector("#tetrisCanvas" + obj.ids).style.boxShadow = ""; }
			setTimeout(iceFade, 10000);
		}),
	new item("混沌之钥", "img/yaoshi.png", "从一无名古墓中现世的珍宝，沟通大世与虚无，能够打开一条通向混沌虚空的裂缝。<br /><b>使己方的方块按行随机打乱</b>", 6, 0,
		(obj) => {
			if (obj.boardMap[19] === 0) { return; }
			let t = 0;
			for (let i = 0; i <= 19; ++i) { if (obj.boardMap[i] !== 0) { t = i; break; } }
			let tt = obj.boardMap.slice(t);
			for (let i = 0; i <= 19; ++i) { obj.boardMap[i] = 0; }
			while (tt.length !== 0) { let ttt = Math.random() * tt.length >> 0; obj.boardMap = obj.boardMap.slice(1).concat([tt[ttt]]); tt.splice(ttt, 1); }
		}),
	new item("上古残剑", "img/jian.png", "上古剑尊拔剑欲诛天，天罚之下身死道消，只余此本命残剑入凡，有着无穷的威势。<br /><b>消除己方最上面一行的方块</b>", 5, 10,
		(obj) => {
			let point = 0;
			for (let i = 0; i <= 19; ++i) { if (obj.boardMap[i] !== 0) { point = i; break; } }
			obj.boardMap[point] = 0;
		}),
	new item("小斗转阵", "img/zhenfa.png", "古籍记载的一玄妙阵法，能够偷换阴阳，瞒天过海。<br /><b>跳过当前方块</b><small style='color:red'></small>", 2, 0,
		(obj) => {
			obj.blockMap.fill(0);
			obj.newBlock();
		}),
];

/**
 * 用于创建一个玩家实例，内置基本的 Tetris 操作。
 */
class Tetris {
	constructor(canva, id) {
		this.boardMap = new Array(20).fill(0);
		this.blockMap = new Array(20).fill(0);
		this.ids = ["One", "Two"][id];
		this.nowBlock = [0, 0];//当前方块编号
		this.nextBlock = [0, 0];//下一个方块的编号
		this.blockTime = 0;//当前方块时
		this.lastItemTime = 0;//上次使用道具的方块时
		this.canvas = canva;
		this.paused = true;
		this.blocks = [
			[[48, 48]],
			[[32, 32, 32, 32], [120]],
			[[64, 112], [48, 32, 32], [112, 16], [16, 16, 48]],
			[[16, 112], [32, 32, 48], [112, 64], [48, 16, 16]],
			[[48, 96], [32, 48, 16],],
			[[96, 48], [16, 48, 32]],
			[[32, 112], [32, 48, 32], [112, 32], [32, 96, 32]]
		];
		this.item = 0;
		document.querySelector("#item-" + this.ids).innerHTML = "<img draggable='false' src='" + items[0].icon + "' />";
	}
	updateItem(num) {
		this.item = num;
		const ii = document.querySelector("#item-" + this.ids);
		ii.innerHTML = "<img draggable='false' src='" + items[num].icon + "' />";
		ii.dataset.num = num;
	}
	useItem() {
		if (this.paused) { return; }
		if (this.blockTime - this.lastItemTime >= items[this.item].cd || this.lastItemTime === 0) {
			const ta = document.querySelector("#score" + this.ids);
			if (items[this.item].cost > Number(ta.innerHTML.slice(0, -4))) {
				return;
			}
			this.lastItemTime = this.blockTime + 1;
			items[this.item].func(this);
			this.itemCd();
			ta.innerHTML = (Number(ta.innerHTML.slice(0, -4)) - items[this.item].cost) + " pts";
		}
	}
	newBlock() {
		const cvs = document.querySelector(this.canvas + "Next");
		const ctx = cvs.getContext("2d");
		const size = cvs.width / 10;
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		ctx.fillStyle = blockColor;
		this.nowBlock = this.nextBlock;
		let r = Math.random() * this.blocks.length >> 0;
		this.nextBlock = [r, Math.random() * this.blocks[r].length >> 0];
		let neBlock = this.blocks[this.nextBlock[0]][this.nextBlock[1]];
		for (let i = 0; i <= 3; ++i) {
			let aa = 512;
			for (let j = 0; j <= 9; j++) {
				if ((neBlock[i] & aa) === aa) { ctx.fillRect(j * size, i * size, size, size); }
				aa >>= 1;
			}
		}
		ctx.fill();
		let nBlock = this.blocks[this.nowBlock[0]][this.nowBlock[1]];
		this.blockMap.splice(0, nBlock.length, ...nBlock);
	}
	draw = () => {
		const cvs = document.querySelector(this.canvas);
		const ctx = cvs.getContext("2d");
		const size = cvs.width / 10;
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		ctx.drawImage(document.querySelector("#boardCanvas"), 0, 0);
		ctx.fillStyle = blockColor;
		for (let i = 0; i <= 19; ++i) {
			let rowBinary = this.blockMap[i].toString(2).padStart(10, '0'), boardBinary = this.boardMap[i].toString(2).padStart(10, '0');
			for (let j = 0; j <= 9; ++j) {
				if (rowBinary[j] === '1' || boardBinary[j] === '1') { ctx.fillRect(j * size, i * size, size, size); }
			}
		}
		ctx.fill();
	}
	update = () => {
		if (this.canDown()) { this.blockMap = [0].concat(this.blockMap.slice(0, -1)); }
		else {
			for (let i = 0; i <= 19; ++i) {
				this.boardMap[i] |= this.blockMap[i];
				this.blockMap[i] = 0;
			}
			for (let i = 0; i <= 19; ++i) { if (this.boardMap[i] === 0b1111111111) { this.eliminate(i, 10); } }
			this.newBlock();
			if (this.boardMap[0] !== 0) {
				playerStatus[tid[this.canvas.slice(13)]] = 1;
				this.end();
			}
			this.blockTime++;
			this.itemCd();
		}
	}
	/*rotate() {
		let bottomPoint = 0, next = this.blocks[this.nowBlock[0]][(this.nowBlock[1] + 1) % this.blocks[this.nowBlock[0]].length];
		this.nowBlock = next;
		for (let i = 0; i <= 19; ++i) { if (this.blockMap[i] !== 0) { bottomPoint = i; } }
		if (bottomPoint >= next.length - 1) {
		}
	}*/
	eliminate(row, score) {
		this.boardMap = ([0].concat(this.boardMap.slice(0, row))).concat(this.boardMap.slice(row + 1));
		document.querySelector("#score" + this.ids).innerHTML = parseInt(document.querySelector("#score" + this.ids).innerHTML) + score + "&nbsp;pts";
	}
	start() {
		let r = Math.random() * this.blocks.length >> 0;
		this.nextBlock = [r, Math.random() * this.blocks[r].length >> 0];
		this.newBlock();
		this.drawing = setInterval(this.draw, 10);
		this.updating = setInterval(this.update, 500);
		this.itemCd();
		this.paused = false;
	}
	continue() {
		this.updating = setInterval(this.update, 500);
		this.paused = false;
	}
	pause() {
		clearInterval(this.updating);
		this.paused = true;
	}
	end() {
		this.paused = true;
		clearInterval(this.updating);
		clearInterval(this.drawing);
	}
	go(dir) {
		if (this.paused) { return; }
		if (dir === 1) {
			/*for (let i = 0; i <= 19; ++i) { if ((this.blockMap[i] & 1) === 1 || ((this.blockMap[i] >> 1) & this.boardMap[i]) !== 0) { return; } }*/
			for (let i = 0; i <= 19; ++i) {
				if ((this.blockMap[i] & 1) === 1 || ((this.blockMap[i] >> 1) & this.boardMap[i]) !== 0) { continue; }
				this.blockMap[i] >>= 1;
			}
		}
		else if (dir === -1) {
			/*for (let i = 0; i <= 19; ++i) { if ((this.blockMap[i] & 512) === 512 || ((this.blockMap[i] << 1) & this.boardMap[i]) !== 0) { return; } }*/
			for (let i = 0; i <= 19; ++i) {
				if ((this.blockMap[i] & 512) === 512 || ((this.blockMap[i] << 1) & this.boardMap[i]) !== 0) { continue; }
				this.blockMap[i] <<= 1;
			}
		}
		else if (dir === 2) {
			for (let i = 0; i <= 1; ++i) {
				if (this.canDown()) { this.blockMap = [0].concat(this.blockMap.slice(0, -1)); }
			}
		}
	}
	/**
	 * 判断当前帧方块可否下降。
	 */
	canDown() {
		if (this.blockMap[19] !== 0) { return false; }
		for (let i = 0; i <= 18; ++i) {
			if ((this.blockMap[i] & this.boardMap[i + 1]) !== 0) {
				return false;
			}
		}
		return true;
	}
	itemCd() {
		let res = items[this.item].cd - (this.blockTime - this.lastItemTime);
		document.querySelector("#cd" + this.ids).innerHTML = this.lastItemTime === 0 ? "&nbsp;可用" : res <= 0 ? "可用" : "&nbsp;CD: " + res.toString();
	}
}

var a = new Tetris('#tetrisCanvasOne', 0);
var b = new Tetris('#tetrisCanvasTwo', 1);

/**
 * 初始化游戏，包括背景板生成，案件监听绑定，道具初始化。
 */
function init() {
	const tcvs = document.querySelector("#boardCanvas");
	const tctx = tcvs.getContext("2d");
	const size = tcvs.width / 10;
	tctx.strokeStyle = 'rgba(0,0,0,0.1)';
	tctx.lineWidth = 1;
	for (let i = 1; i <= 9; ++i) {
		tctx.moveTo(i * size, 0);
		tctx.lineTo(i * size, tcvs.height);
	}
	for (let i = 1; i <= 19; ++i) {
		tctx.moveTo(0, i * size);
		tctx.lineTo(tcvs.width, i * size);
	}
	tctx.stroke();
	document.addEventListener("keyup", (e) => {
		if (e.key === 'd') { a.go(1); }
		else if (e.key === 'a') { a.go(-1); }
		else if (e.key === 's') { a.go(2); }
		else if (e.key === "ArrowLeft") { b.go(-1); }
		else if (e.key === "ArrowRight") { b.go(1); }
		else if (e.key === "ArrowDown") { b.go(2); }
		else if (e.key === 'g') { a.useItem(); }
		else if (e.key === 'm') { b.useItem(); }
	});
	let betterPlayerColor = () => {
		let so = parseInt(sOne.innerHTML.slice(0, -4)); st = parseInt(sTwo.innerHTML.slice(0, -4));
		document.querySelector("#betterOne").style.display = (so > st ? "inline-block" : "none");
		document.querySelector("#betterTwo").style.display = (st > so ? "inline-block" : "none");
		if (playerStatus.toString() == [1, 1]) {
			clearInterval(betterPlayer);
			document.querySelector("#control").innerHTML = "重新开始";
			document.querySelector("#status").innerHTML = (so > st ? document.querySelector("#nameOne").innerHTML
				+ "&nbsp;胜利了" : (so < st ? document.querySelector("#nameTwo").innerHTML
					+ "&nbsp;胜利了" : "两名玩家平局"));
		}
	}
	betterPlayer = setInterval(betterPlayerColor, 10);
	const ta = document.querySelectorAll(".items");
	const tb = document.querySelector("#item-One");
	const tc = document.querySelector("#item-Two");
	const td = document.querySelector("body");
	td.ondragstart = (e) => {
		if (!a.paused || !b.paused) { e.preventDefault(); }
		e.dataTransfer.effectAllowed = "copy";
		nowDrag = e.target;
	};
	td.ondragover = (e) => {
		e.preventDefault();
	}
	td.ondrop = (e) => {
		let te = findParentElement(e.target);
		if ("player" in te.dataset) {
			eval(te.dataset.player + ".updateItem(" + nowDrag.dataset.num + ")");
		}
	};
	for (let i = 0; i <= ta.length - 1; ++i) {
		ta[i].innerHTML = "<img draggable='false' src='" + items[i].icon + "' />";
		bondHoverInfo(ta[i]);
	}
	bondHoverInfo(tb), bondHoverInfo(tc);
}
/**
 * 给道具绑定说明菜单
 * @param {Element} ele
 */
function bondHoverInfo(ele) {
	ele.onmouseenter = (e) => {
		const ii = document.querySelector("#item-info");
		const it = items[ele.dataset.num]
		document.querySelector("#item-name").innerHTML = it.name + "&emsp;<small style='color:skyblue'>CD: " + it.cd + "</small>";
		document.querySelector("#item-profile").innerHTML = it.profile + (it.cost !== 0 ? "<br /><small style='color:red'>消耗: " + it.cost + " pts</small>" : "");
		ii.style.top = (e.pageY + 4).toString() + "px"; ii.style.left = (e.pageX + 4).toString() + "px";
		ii.show();
	};
	ele.onmousemove = (e) => {
		const ii = document.querySelector("#item-info");
		ii.style.top = (e.pageY + 4).toString() + "px"; ii.style.left = (e.pageX + 4).toString() + "px";
	};
	ele.onmouseleave = () => {
		document.querySelector("#item-info").close();
	};
	ele.onmousedown = () => {
		document.querySelector("#item-info").close();
	};
}
/**
 * 找到含有data-player的元素
 * @param {Element} ele
 */
function findParentElement(ele) {
	if ("player" in ele) { return ele; }
	else { return ele.parentElement; }
}
/**
 * 控制游戏开始/暂停
 * @param {Element} btn 调用该函数的元素的DOM对象
 */
function sOrs(btn) {
	let aa = btn.innerHTML;
	if (aa === "开始") {
		a.start();
		b.start();
		btn.innerHTML = "暂停";
		document.querySelector("#status").innerHTML = "游戏中...";
	}
	else if (aa === "暂停") {
		a.pause();
		b.pause();
		btn.innerHTML = "继续";
		document.querySelector("#status").innerHTML = "暂停中...";
	}
	else if (aa === "继续") {
		a.continue();
		b.continue();
		btn.innerHTML = "暂停";
		document.querySelector("#status").innerHTML = "游戏中...";
	}
	else if (aa === "重新开始") { window.location.reload(); }
}
