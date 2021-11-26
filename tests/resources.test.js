const request = require('supertest')
const app = require('../app').app

describe('Resources API endpoint', () => {
  it('should receive javascript script', async () => {
    const res = await request(app)
      .get('/res/gdpr.js')
      .send()
      expect(res.statusCode).toEqual(200)
      expect(res.type).toEqual('application/javascript')
  })
})