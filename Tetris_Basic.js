//全局变量
var betterPlayer = null;
var playerStatus = [0, 0];
const sOne = document.querySelector("#scoreOne");
const sTwo = document.querySelector("#scoreTwo");
const tid = { "One": 0, "Two": 1 };

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
		this.canvas = canva;
		this.blocks = [
			[[48, 48]],
			[[32, 32, 32, 32], [120]],
			[[64, 112], [48, 32, 32], [112, 16], [16, 16, 48]],
			[[16, 112], [32, 32, 48], [112, 64], [48, 16, 16]],
			[[48, 96], [32, 48, 16],],
			[[96, 48], [16, 48, 32]],
			[[32, 112], [32, 48, 32], [112, 32], [32, 96, 32]]
		];
	}
	newBlock() {
		const cvs = document.querySelector(this.canvas+"Next");
		const ctx = cvs.getContext("2d");
		const size = cvs.width / 10;
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		ctx.fillStyle = "#91bcfe";
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
		ctx.fillStyle = "#91bcfe";
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
			for (let i = 0; i <= 19; ++i) { if (this.boardMap[i] === 0b1111111111) { this.eliminate(i,10); } }
			this.newBlock();
			if (this.boardMap[0] !== 0) {
				playerStatus[tid[this.canvas.slice(13)]] = 1;
				this.end();
			}
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
		document.querySelector("#score" + this.ids).innerHTML = parseInt(document.querySelector("#score" + this.ids).innerHTML) + score +"&nbsp;pts";
	}
	start() {
		let r = Math.random() * this.blocks.length >> 0;
		this.nextBlock = [r, Math.random() * this.blocks[r].length >> 0];
		this.newBlock();
		this.drawing = setInterval(this.draw, 10);
		this.updating = setInterval(this.update, 500);
	}
	continue() {
		this.updating = setInterval(this.update, 500);
	}
	pause() {
		clearInterval(this.updating);
	}
	end() {
		clearInterval(this.updating);
		clearInterval(this.drawing);
	}
	go(dir) {
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
}

var a = new Tetris('#tetrisCanvasOne', 0);
var b = new Tetris('#tetrisCanvasTwo', 1);

/**
 * 初始化游戏，包括背景板生成，案件监听绑定。
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
	});
	let betterPlayerColor = () => {
		let so = parseInt(sOne.innerHTML.slice(0,-4)); st = parseInt(sTwo.innerHTML.slice(0,-4));
		document.querySelector("#betterOne").style.display=(so > st ? "inline-block" : "none");
		document.querySelector("#betterTwo").style.display = (st > so ? "inline-block" : "none");
		if (playerStatus.toString() == [1, 1]) {
			clearInterval(betterPlayer);
			document.querySelector("#control").innerHTML = "重新开始";
			document.querySelector("#status").innerHTML = (so > st ? document.querySelector("#nameOne").innerHTML
				+ "&nbsp;胜利了" : (so < st ? document.querySelector("#nameTwo").innerHTML
					+ "&nbsp;胜利了" : "两名玩家平局"));
		}
	}
	betterPlayer = setInterval(betterPlayerColor,10);
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
