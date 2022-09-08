require('dotenv').config();
const bcrypt = require('bcrypt');
// TODO: 換argon比較快

const { Mongo } = require('./mongocon');

const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET, MONGO_DB, S3_HOST } = process.env; // 30 days by seconds

const jwt = require('jsonwebtoken');

const signUp = async (name, email, password, picture) => {
  await Mongo.connect();
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
      access_expired: TOKEN_EXPIRE,
      login_at: loginAt,
    };

    const insert_result = await userCollection.insertOne(user);
    const user_id = insert_result.insertedId.toString();
    user.id = user_id;
    // console.log(insert_result.insertedId.toString());

    const accessToken = jwt.sign(
      {
        provider: user.provider,
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      TOKEN_SECRET
    );
    // console.log(accessToken);
    user.access_token = accessToken;
    user.picture = `${S3_HOST}/user_picture/${user.picture}`;

    const response = {
      'data': {
        'access_token': accessToken,
        'access_expired': TOKEN_EXPIRE,
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
    await Mongo.close();
  }
};

const nativeSignIn = async (email, password) => {
  await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');

  try {
    // console.log(email);
    const users = await userCollection.find({ 'email': email }).toArray();
    const user = users[0];
    const user_id = user._id.toString();
    user.id = user_id;
    // console.log(user_id);
    console.log('user_id in user_model:', user);

    if (!bcrypt.compare(password.toString(), user.password)) {
      return { error: 'Your email or password is wrong' };
    }

    const loginAt = new Date();
    const accessToken = jwt.sign(
      {
        user_id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: `${S3_HOST}/user_picture/${user.picture}`,
      },
      TOKEN_SECRET
    );

    user.access_token = accessToken;
    user.login_at = loginAt;
    user.access_expired = TOKEN_EXPIRE;
    user.picture = `${S3_HOST}/user_picture/${user.picture}`;

    return { user };
  } catch (error) {
    return { error };
  } finally {
    await Mongo.close();
  }
};

const getUserDetail = async (email) => {
  await Mongo.connect();
  const userCollection = Mongo.db(MONGO_DB).collection('user');
  try {
    const [user] = await userCollection.find({ 'email': email }).toArray();
    return user;
  } catch (e) {
    return null;
  } finally {
    await Mongo.close();
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  getUserDetail,
};
