require('dotenv').config();
const bcrypt = require('bcrypt');
// TODO: 換argon比較快

const { Mongo } = require('./mongocon');

const salt = parseInt(process.env.BCRYPT_SALT);
const { MONGO_DB } = process.env; // 30 days by seconds

const signUp = async (name, email, password, picture) => {
  const userCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    const checkEmail = await userCollection.find({ 'email': email }).toArray();
    // check user email Exist
    if (checkEmail.length != 0) {
      throw error;
    }

    const loginAt = new Date();
    const provider = 'native';
    const user = {
      provider: provider,
      email: email,
      password: await bcrypt.hash(password.toString(), salt),
      name: name,
      picture: picture,
      login_at: loginAt,
      saved_note_id: [],
    };

    const insert_result = await userCollection.insertOne(user);
    const user_id = insert_result.insertedId.toString();
    user.id = user_id;

    const response = {
      'data': {
        'user': {
          'id': user.id,
          'provider': user.provider,
          'name': user.name,
          'email': user.email,
          'picture': user.picture,
        },
      },
    };

    return response;
  } catch (error) {
    return {
      error: 'Email Already Exists',
      status: 403,
    };
  } finally {
    // await Mongo.close();
  }
};

const nativeSignIn = async (email, password) => {
  const userCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    // console.log(email);
    const users = await userCollection.find({ 'email': email }).toArray();
    const user = users[0];
    const user_id = user._id.toString();
    user.id = user_id;

    const pw_compare = await bcrypt.compare(password.toString(), user.password);
    // console.log('askdjfoasijdfoaijdof');
    if (!pw_compare) {
      return { error: 'Your email or password is wrong' };
    }

    const loginAt = new Date();
    user.login_at = loginAt;

    return { user };
  } catch (error) {
    return { error };
  } finally {
    // await Mongo.close();
  }
};

const getUserDetail = async (email) => {
  // await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    const [user] = await userCollection.find({ 'email': email }).toArray();
    return user;
  } catch (e) {
    return null;
  } finally {
    // await Mongo.close();
  }
};

const shareToAll = async (data) => {
  // await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    const [user] = await userCollection.find({ 'email': email }).toArray();
    return user;
  } catch (e) {
    return null;
  } finally {
    // await Mongo.close();
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  getUserDetail,
  shareToAll,
};
