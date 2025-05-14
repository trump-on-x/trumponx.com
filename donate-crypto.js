// user details
const userInfo = {
	avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/668895/profile/profile-512.jpg',
	hero: 'https://static.codepen.io/assets/profile/profile-bg-8ff33bd9518be912289d4620cb48f21eb5c9a2e0b9577484126cfe10a5fb354f.svg',
	website: 'https://rainnerlins.com/',
	name: 'Rainner Lins',
	info: 'Fullstack Codepen Superstar Wannabe',
};

// crypto wallets
const cryptoWallets = [
	{
		symbol: 'BTC',
		name: 'Bitcoin',
		address: '3D4FaN7VBzbG6vW2y6G73qVfGkRLuBWhvF',
	},
	{
		symbol: 'ETH',
		name: 'Ethereum',
		address: '0x363Ca9F80Ca55f93CE7B7e12D36Ed30965C0f10D',
	},
	{
		symbol: 'DOGE',
		name: 'Dogecoin',
		address: 'DKa8JeH66nJZJTpGrirYEhYVotFupnzcfY',
	},
	{
		symbol: 'SOL',
		name: 'Solana',
		address: 'CYfuDG4pAykWvhSJjPEB3Xf7MycZqXkT1kiuK4DazSEV',
	},
	{
		symbol: 'BCH',
		name: 'Bitcoin Cash',
		address: 'qrq22nr2zrcqczgn33hurjssvvd50jh5fq40thmhky',
	},
	{
		symbol: 'LTC',
		name: 'Litecoin',
		address: 'LeJ8KZWUEPyGwjF4CKc4hkLaYNQkZXLnsm',
	},
	{
		symbol: 'XRP',
		name: 'Ripple',
		address: 'rP7iTgGszW8jg7TEhJjjVJjVifitKRaX6Y',
	},
];

// number format filter
Vue.filter('toMoney', (num, decimals) => {
	let o = {style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals};
	return new Intl.NumberFormat('en-US', o).format(num);
});

// vue instance
new Vue({
	el: '#card',

	// app data
	data: {
		userInfo,
		cryptoWallets,
		tab: 'BTC',
		wallet: {},
		statsCache: {},
		stats: {},
	},

	// computed methods
	computed: {

		// compute list wallets for tabs
		walletsList() {
			return this.cryptoWallets.map(w => {
				w.active = (w.symbol === this.tab);
				return w;
			});
		},
	},

	// custom methods
	methods: {

		// select active tab wallet
		selectWallet(symbol) {
			let wallet = this.cryptoWallets.filter(w => w.symbol === symbol).shift();
			if (!wallet) return;
			wallet.copied = 0;
			this.wallet = wallet;
			this.tab = symbol;
			this.fetchStats(symbol);
		},

		// copy text to clipboard
		copyText(txt) {
			txt = String(txt || '').trim();
			if (!txt) return;
			let input = document.createElement('input');
			document.body.appendChild(input);
			input.value = txt;
			input.select();
			document.execCommand('Copy');
			document.body.removeChild(input);
			this.wallet = Object.assign({}, this.wallet, {copied: 1});
		},

		// get qr image url for selected wallet
		getQrImage() {
			// const w = 128;
			// const h = 128;
			const a = this.wallet.address;
			// [deprecated] return a ? `https://chart.googleapis.com/chart?chs=${w}x${h}&cht=qr&choe=UTF-8&chl=${a}` : ``
			// return a ? `https://api.qrserver.com/v1/create-qr-code/?size=128x128&margin=10&data=${a}` : ``
			return a ? `/qr/${a}.png` : ``
		},

		// set coin stats
		// setStats(symbol, data) {
		// 	let price = 0;
		// 	let cap = 0;
		// 	let supply = 0;
		// 	let time = Date.now();
		// 	let stats = Object.assign({price, cap, supply, time}, data);
		// 	this.statsCache[symbol] = stats;
		// 	this.stats = stats;
		// },

		// fetch market stats for a symbol
		// fetchStats(symbol) {
		// 	let stats = this.statsCache[symbol] || null;
		// 	let price = stats ? stats.price : 0;
		// 	let secs = stats ? ((Date.now() - stats.time) / 1000) : 0;
		//
		// 	// use values from cache
		// 	if (price && secs < 300) {
		// 		return this.setStats(symbol, stats);
		// 	}
		// 	// reset and fetch new values from api
		// 	this.setStats(symbol);
		// 	const xhr = new XMLHttpRequest();
		// 	xhr.open('GET', 'https://coincap.io/page/' + symbol, true);
		// 	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		// 	xhr.responseType = 'json';
		// 	xhr.addEventListener('load', e => {
		// 		if (!xhr.response || !xhr.response.id) return;
		// 		let price = parseFloat(xhr.response.price) || 0;
		// 		let cap = parseFloat(xhr.response.market_cap) || 0;
		// 		let supply = parseFloat(xhr.response.supply) || 0;
		// 		this.setStats(symbol, {price, cap, supply});
		// 	});
		// 	xhr.send();
		// },
	},

	// when component mounts
	mounted() {
		this.selectWallet(this.tab);
	},
});