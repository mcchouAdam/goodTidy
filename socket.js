const app = require('./app.js');
const Notes = require('./server/models/note_model');
require('dotenv').config();
const port = process.env.SERVER_PORT;

const server = app.listen(port, () => {
  console.log(`listening on *:${port}`);
});

const io = require('socket.io')(server, {
  cors: {
    origin: '*', //['https://styagram-6edf0.web.app/', 'http://localhost:3000', 'https://localhost:3000'],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    // credentials: true,
  },
});

// 目前在線上的使用者
let user_online_socketId = {};

// 使用者登入
io.on('connection', async (socket) => {
  // 儲存進入資訊
  socket.on('authentication', async (user_email) => {
    console.log(`authentication : ${user_email}`);
    console.log(`socket id : ${socket.id}`);
    user_online_socketId[user_email] = socket.id;
    console.log('user_online_socketId: ', user_online_socketId);
  });

  // 有人收藏貼文
  socket.on('save_note', async (obj) => {
    const note_id = obj.save_note_id;
    const heart_count = obj.heart_count;
    const user_email = obj.user_email;
    const user_name = obj.user_name;
    const note_savedStatus = JSON.parse(obj.note_savedStatus);

    const getNoteOwner = await Notes.getNoteById(note_id);
    // console.log('getNoteOwner: ', getNoteOwner[0].user_info[0].email);

    const Owner_user_email = getNoteOwner[0].user_info[0].email;
    const note_name = getNoteOwner[0].note_name;
    const Owner_user_socket_id = user_online_socketId[Owner_user_email];

    // 送出推播
    io.to(Owner_user_socket_id).emit(
      'saved_msg',
      `${user_name}收藏您的筆記: ${note_name} ！`
    );

    // 更新對方save數字
    io.to(Owner_user_socket_id).emit('saved_count_update', note_savedStatus);
  });

  // 特定人分享給你
  socket.on('shareToyou', async (obj) => {
    const shareUserEmail = obj.user_email;
    const addOther = obj.addOther;
    const sharedUser_socket_id = user_online_socketId[addOther];
    console.log('sharedUser_socket_id', sharedUser_socket_id);

    io.to(sharedUser_socket_id).emit('shareToyou_msg', shareUserEmail);
  });

  // 特定人刪除對你的分享
  socket.on('delete_ShareToYou', async (obj) => {
    const delete_user_email = obj.user_email;
    const deleted_user_email = obj.delete_email;
    const deletedShareUser_socket_id = user_online_socketId[deleted_user_email];
    console.log('deletedShareUser_socket_id', deletedShareUser_socket_id);

    io.to(deletedShareUser_socket_id).emit('delete_shareToyou_msg', delete_user_email);
  });
});
