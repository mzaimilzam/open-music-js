const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

module.exports = InvariantError;
