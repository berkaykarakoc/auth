function errorMiddleware(error, request, response, _next) {
	const {code, message} = error;
	response.status(code || 500).json({
		error: message,
	});
}

export default errorMiddleware;
