import ServerError from '../errors/server.error.js';

export function convertToSeconds(durationString) {
	const match = durationString.match(/(\d+)([smhd])/);
	if (!match) {
		throw new ServerError(400, 'Invalid duration string');
	}

	const value = Number.parseInt(match[1], 10);
	const unit = match[2];

	switch (unit) {
		case 's': {
			return value;
		}

		case 'm': {
			return value * 60;
		}

		case 'h': {
			return value * 60 * 60;
		}

		case 'd': {
			return value * 60 * 60 * 24;
		}

		default: {
			return 0;
		}
	}
}
