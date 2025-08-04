class ServerError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
		this.name = 'ServerError';
	}
}

export default ServerError;
