
class WB {
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
}

module.exports = WB;
