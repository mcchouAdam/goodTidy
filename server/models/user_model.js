require('dotenv').config();
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
// TODO: 換argon比較快

const { Mongo } = require('./mongocon');

const salt = parseInt(process.env.BCRYPT_SALT);
const { MONGO_DB } = process.env;

const signUp = async (name, email, password, picture) => {
  const userCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    const checkEmail = await userCollection
      .find({
        email,
      })
      .toArray();
    // check user email Exist
    if (checkEmail.length != 0) {
      throw error;
    }

    const loginAt = new Date();
    const provider = 'native';
    const user = {
      provider,
      email,
      password: await bcrypt.hash(password.toString(), salt),
      name,
      picture,
      login_at: loginAt,
      saved_note_id: [],
    };

    const insert_result = await userCollection.insertOne(user);
    const user_id = insert_result.insertedId.toString();
    user.id = user_id;

    const response = {
      data: {
        user: {
          id: user.id,
          provider: user.provider,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      },
    };

    return response;
  } catch (error) {
    return {
      error: '此Email已存在',
      status: 403,
    };
  }
};

const nativeSignIn = async (email, password) => {
  const userCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    // console.log(email);
    const users = await userCollection
      .find({
        email,
      })
      .toArray();
    const user = users[0];
    if (!user) {
      return {
        error: '沒有您的用戶資訊，請您註冊新帳號！',
        status: 403,
      };
    }

    const user_id = user._id.toString();
    user.id = user_id;

    const pw_compare = await bcrypt.compare(password.toString(), user.password);
    if (!pw_compare) {
      return {
        error: '您的密碼錯誤！',
        status: 403,
      };
    }

    const loginAt = new Date();
    user.login_at = loginAt;

    return {
      user,
    };
  } catch (error) {
    return {
      error,
    };
  }
};

const getUserDetail = async (email) => {
  // await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    const [user] = await userCollection
      .find({
        email,
      })
      .toArray();
    return user;
  } catch (e) {
    return null;
  }
};

const shareToAll = async (data) => {
  // await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    const [user] = await userCollection
      .find({
        email,
      })
      .toArray();
    return user;
  } catch (e) {
    return null;
  }
};

const getMessages = async (data) => {
  const { user_email } = data;
  const MsgCollection = Mongo.db(MONGO_DB).collection('message');
  try {
    const msg_result = await MsgCollection.find({
      notify_user_email: user_email,
    }).toArray();

    return msg_result;
  } catch (e) {
    return null;
  }
};

const deleteUserMessage = async (data) => {
  const { msg_id } = data;
  const MsgCollection = Mongo.db(MONGO_DB).collection('message');
  try {
    const msg_result = await MsgCollection.deleteOne({
      _id: ObjectId(msg_id),
    }).toArray();

    return msg_result;
  } catch (e) {
    return null;
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  getUserDetail,
  shareToAll,
  getMessages,
  deleteUserMessage,
};
