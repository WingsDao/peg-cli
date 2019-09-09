const {ZERO_ADDRESS} = require("../index");

class EthAPI {
	constructor({poa, web3}) {
		this._web3 = web3;
		this._poa = new web3.eth.Contract(poa.abi, poa.address);

		this._encodedCall = {};

		this._encodedCall.PoA = this._createSelf(this._poa);
	}

	get PoA() {
		return this._encodedCall.PoA;
	}

	get web3() {
		return this._web3;
	}

	_createSelf(abiInterface) {
		const res = {};

		abiInterface._jsonInterface
			.filter(el => el.type === 'function')
			.forEach(method => {
				res[method.name] = (function bound(...args) {
					return this._web3.eth.abi.encodeFunctionCall(
						method,
						args
					);
				}).bind(this);
		});

		return res;
	};

	async sendTransaction(target, data, options) {
		const receipt = await this._poa.methods.submitTransaction(
			target,
			data
		).send(options);

		return receipt.events.TX_SUBMISSED.returnValues._transactionId;
	};

	getDataHash(address, data) {
		return this._web3.utils.soliditySha3({t: 'address', v: address}, {t: 'bytes', v: data});
	};

	async isFailedTransactions(ids) {
		ids = ids.map(id => parseInt(id));

		const failed = (await this._poa.getPastEvents('TX_EXECUTION_FAILED', {
			fromBlock: 0,
			toBlock: 'latest'
		})).map(event => parseInt(event.returnValues._transactionId));

		return ids.map(id => failed.includes(id));
	}

	async getTransactionsInfo(transactionsId, options = {}) {
		let isArray = true;
		if(!Array.isArray(transactionsId)) {
			transactionsId = [transactionsId];
			isArray = false;
		}

		let txs = transactionsId.map(id => this._poa.methods.transactions(id).call()
			.then(async tx => {
				if(!tx.creator || tx.creator === ZERO_ADDRESS) {
					return null;
				}

				tx.id = id;
				tx.isConfirmed = await this._poa.methods.isConfirmed(id).call();
				tx.confirmationCount = await this._poa.methods.getConfirmationCount(id).call();
				tx.isFailed = false;

				return tx;
			})
		);

		txs = await Promise.all(txs);

		if(options.checkFailed === undefined || options.checkFailed === true) {
			await this.isFailedTransactions(transactionsId)
				.then(failed => {
					failed.forEach((isFailed, index) => txs[index] && (txs[index].isFailed = isFailed))
				});
		}

		return !isArray ? txs[0] : txs;
	}
}

module.exports = exports = EthAPI;
