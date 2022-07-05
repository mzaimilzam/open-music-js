const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistSongsService,
    playlistService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistSongsService,
      playlistService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
