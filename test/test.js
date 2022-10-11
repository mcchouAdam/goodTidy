const app = require('../app');
const chai = require('chai');
const { API_VERSION } = process.env;
// const deepEqualInAnyOrder = require('deep-equal-in-any-order');
// const chaiHttp = require('chai-http');
const { expect } = require('chai');
const should = require('should');

// // unitTest1: getComments
// const { getComments } = require('../server/models/note_model');
// describe('getComments', () => {
//   it('it should return comments', async () => {
//     let result = await getComments('63415598e03d254ccfce75f2');
//     let result_len = result.length;
//     result_len.should.be.equal(3);
//   });
// });

// // unitTest2: signin API
// const supertest = require('supertest');
// const api = supertest('http://localhost:3001/api/1.0'); // 定義測試的 Signin API 路徑
// describe('signin', () => {
//   it('signin with email & password', (done) => {
//     api
//       .post(`/user/signin`) // 登入測試
//       .set('Accept', 'application/json')
//       .send({
//         provider: 'native',
//         email: '1@gmail.com',
//         password: '123',
//       })
//       .expect(200)
//       .end((err, res) => {
//         console.log('res.body', res.body);
//         if (err) {
//           done(err);
//         }
//         // 斷言做資料驗證User(id、provider、name, email、picture)
//         expect(res.body.data.user).to.have.property('id');
//         expect(res.body.data.user).to.have.property('provider');
//         expect(res.body.data.user).to.have.property('name');
//         expect(res.body.data.user).to.have.property('email');
//         expect(res.body.data.user).to.have.property('picture');
//         expect(res.body.data.user.id).to.be.a('string');
//         expect(res.body.data.user.provider).to.be.a('string');
//         expect(res.body.data.user.name).to.be.a('string');
//         expect(res.body.data.user.email).to.be.a('string');
//         expect(res.body.data.user.picture).to.be.a('string');
//         done();
//       });
//   });
// });

// // unitTest3: signup
const { signUp } = require('../server/models/user_model');
const faker = require('faker');
const fakerUser = {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  picture: '',
};
describe('signup', () => {
  it('should add a new user to the db', async () => {
    const result = await signUp(
      fakerUser.name,
      fakerUser.email,
      fakerUser.password,
      fakerUser.picture
    );
  });
});

// // unitTest4: getShareToAll
// router
//   .route(`/api/${API_VERSION}/note/shareToAll/:note_id`)
//   .get(authentication(), wrapAsync(getShareToAll));

// const supertest = require('supertest');
// const api = supertest('http://localhost:3001/api/1.0'); // 定義測試的 Signin API 路徑
// const noteId = '634104b494c872847cb1df22';

// // 需先登入，才能過驗證
// // before((done) => {
// //   api
// //     .post(`/user/signin`) // 登入測試
// //     .set('Accept', 'application/json')
// //     .send({
// //       provider: 'native',
// //       email: '1@gmail.com',
// //       password: '123',
// //     })
// //     .expect(200)
// //     .end((err, res) => {
// //       done();
// //     });
// // });

// describe('get the user shareToAll information', () => {
//   api
//     .post(`/user/signin`) // 登入測試
//     .set('Accept', 'application/json')
//     .send({
//       provider: 'native',
//       email: '1@gmail.com',
//       password: '123',
//     })
//     .expect(200)
//     .end((err, res) => {
//       it('use note id to get shareToAll', (done) => {
//         api
//           .get(`/note/shareToAll/${noteId}`)
//           .expect(200)
//           .end((err, res) => {
//             console.log('res.body', res.body);
//             if (err) {
//               done(err);
//             }
//             // 斷言做資料驗證User(id、provider、name, email、picture)
//             // expect(res.body.data.user).to.have.property('id');
//             // expect(res.body.data.user).to.have.property('provider');
//             // expect(res.body.data.user).to.have.property('name');
//             // expect(res.body.data.user).to.have.property('email');
//             // expect(res.body.data.user).to.have.property('picture');
//             // expect(res.body.data.user.id).to.be.a('string');
//             // expect(res.body.data.user.provider).to.be.a('string');
//             // expect(res.body.data.user.name).to.be.a('string');
//             // expect(res.body.data.user.email).to.be.a('string');
//             // expect(res.body.data.user.picture).to.be.a('string');
//             done();
//           });
//       });
//     });
// });
