const request = require("request-promise");

function ask(term) {
  return request(`${process.env.ASK_CFPB_API_ENDPOINT}${term}`);
}

module.exports = ask;
