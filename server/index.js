const axios = require('axios');
const fastify = require('fastify')({ logger: true })
const NodeCache = require( "node-cache" );
const searchCaches = new NodeCache();

const processVocabulary = async (word) => {
  var request = await axios.get(`https://www.oxfordlearnersdictionaries.com/definition/english/${word}`)

  var response = await request.data;
  return (/mp3="([^"]+)"/g).exec(response)[1];
}

fastify.register(require('fastify-cors'), (instance) => (req, callback) => {
  callback(null, {
    origin: true
  });
})

const replyClient = (reply, status, data) => {
  reply.code(status).send({ data });
}

fastify.get('/british/sound/:word', function (request, reply) {
  var word = request.params.word;
  var data = searchCaches.get(word);

  if (data) return replyClient(reply, 200, { data });

  processVocabulary(word)
    .then(data => {
      searchCaches.set(word, data, 1000 ** 64)
      replyClient(reply, 200, { data })
    })
    .catch(error => {
      replyClient(reply, 500, { error })
    })
})

fastify.listen(process.env.PORT || 2387, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
