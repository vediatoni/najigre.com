const request = require('supertest')
const app = require('../app').app

describe('Index API endpoint', () => {
  it('should redirect', async () => {
    const res = await request(app)
      .get('/index.html')
      .send()
      expect(res.statusCode).toEqual(302)
      expect(res.type).toEqual('text/plain')
  })
})