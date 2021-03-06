const strip = require("strip");
const WordPOS = require("wordpos");
const request = require("request-promise");
const db = require("./db");
const askAbout = require("./ask");

const wordpos = new WordPOS();

function _callSendAPI(messageData) {
  request({
    uri: "https://graph.facebook.com/v2.6/me/messages",
    qs: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN },
    method: "POST",
    json: messageData
  })
    .then(body => {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log(
        "Successfully sent generic message with id %s to recipient %s",
        messageId,
        recipientId
      );
    })
    .catch(err => {
      console.error("Unable to send message.");
      console.error(err);
    });
}

function processMessage(event) {
  var senderID = event.sender.id;
  var msg = event.message;
  
  wordpos.getNouns(msg.text, function(nouns) {
    nouns = nouns.filter((noun) => noun.length > 3).join(' ');
    console.log(nouns);
    db.initUser(senderID).then(data => {
      askAbout(nouns).then(body => {
        var questions = JSON.parse(body);
        var answer = questions.length
          ? strip(questions[0].value).split("\r\n")[0].substring(0, 600)
          : "Sorry, I didn't catch that. Please try rephrasing your question or asking another one.";
        var messageData = {
          recipient: {
            id: senderID
          },
          message: {
            text: answer
          }
          // sender_action: "typing_on"
        };
        _callSendAPI(messageData);
      });
    });
  });

  console.log(
    "Received message for user %d and page %d at %d with message:",
    event.sender.id,
    event.recipient.id,
    event.timestamp
  );
}

module.exports = {
  process: processMessage
};
