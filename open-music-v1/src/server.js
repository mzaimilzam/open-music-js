require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
// albums
const albums = require('./api/albums');
const AlbumsService = require('./service/postgres/AlbumServices');
const AlbumsValidator = require('./validator/albums');
// songs
const songs = require('./api/songs');
const SongsService = require('./service/postgres/SongsServices');
const SongsValidator = require('./validator/songs');
// users
const users = require('./api/users');
const UserService = require('./service/postgres/UserService');
const UsersValidator = require('./validator/users');
// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationsServices');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
// playlists
const playlists = require('./api/playlist');
const PlaylistService = require('./service/postgres/PlaylistService');
const PlaylistSongsService = require('./service/postgres/PlaylistSongsService');
const PlaylistsValidator = require('./validator/playlist');
// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistService = new PlaylistService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistSongsService,
        playlistService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
