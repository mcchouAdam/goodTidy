const app = require('../app');
const chai = require('chai');
const { API_VERSION } = process.env;
// const deepEqualInAnyOrder = require('deep-equal-in-any-order');
// const chaiHttp = require('chai-http');
const { expect } = require('chai');

const supertest = require('supertest');
const api = supertest('http://localhost:3001/api/1.0'); // 定義測試的 Signin API 路徑

let signin_data; // 全域變數等待 before() 取得 Token

describe('signin', () => {
  it('signin with email & password', (done) => {
    api
      .post(`/user/signin`) // 登入測試
      .set('Accept', 'application/json')
      .send({
        provider: 'native',
        email: '1@gmail.com',
        password: '123',
      })
      .expect(200)
      .end((err, res) => {
        // console.log('res.body', res.body);
        // signin_data = res.data.token; // 登入成功取得 JWT
        if (err) {
          done(err);
        }
        // 斷言做資料驗證(文章id、用戶id、文章標題、文章標籤、文章內容)
        expect(res.body.data.user).to.have.property('id');
        // expect(res.body[0].article_id).to.be.a('number');
        // expect(res.body[0]).to.have.property('user_id');
        // expect(res.body[0].user_id).to.be.a('number');
        // expect(res.body[0]).to.have.property('article_title');
        // expect(res.body[0].article_title).to.be.a('string');
        // expect(res.body[0]).to.have.property('article_tag');
        // expect(res.body[0].article_tag).to.be.a('string');
        // expect(res.body[0]).to.have.property('article_content');
        // expect(res.body[0].article_content).to.be.a('string');
        done();
      });
  });
  //   it('should return a 200 response', (done) => {
  //     api
  //       .get('/article/personal') // 測試取得某用戶的所有文章
  //       .set('Authorization', `Bearer ${APItoken}`) // 將 Bearer Token 放入 Header 中的 Authorization
  //       .expect(200, done);
  //   });
});
