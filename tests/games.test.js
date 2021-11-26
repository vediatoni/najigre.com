const request = require('supertest')
const app = require('../app').app

describe('Games API endpoint', () => {
  it('should return image', async () => {
    const res = await request(app)
      .get('/games/1/Space Crash/thumb.jpg')
      .send()
    expect(res.statusCode).toEqual(200)
    expect(res.type).toEqual('image/jpeg')
  })
})