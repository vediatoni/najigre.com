const request = require('supertest')
const app = require('../app').app
const API = require("../data").API

describe('Admin API endpoint', () => {
  it('should return success', async () => {
    const res = await request(app)
      .post('/api/admin/test')
      .auth(API.login, API.password)
      .send()
    expect(res.statusCode).toEqual(200)
  })
})