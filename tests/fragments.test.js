// tests/fragments.test.js
const request = require('supertest');
const app = require('../src/app');

// Reusable Basic Auth header for test user
// testuser:1234 -> Base64 = dGVzdHVzZXI6MTIzNA==
const userHeader = {
  Authorization: `Basic ${Buffer.from('testuser:1234').toString('base64')}`,
};

describe('Fragments API', () => {
  test('POST /v1/fragments should reject unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'application/xml')
      .send('<note>hi</note>');

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('POST /v1/fragments should create a text/plain fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('hello fragments');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('GET /v1/fragments should return list of fragment ids', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('another fragment');

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get('/v1/fragments')
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toContain(fragmentId);
  });

  test('GET /v1/fragments?expand=1 should return full fragment objects', async () => {
    await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('expand test');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('GET /v1/fragments/:id should return metadata', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('meta test');

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentId);
  });

  test('GET /v1/fragments/:id should return 404 for unknown id', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .set(userHeader);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('GET /v1/fragments/:id/raw should return raw data', async () => {
    const text = 'raw data here';

    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send(text);

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/raw`)
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text).toBe(text);
  });

  test('PUT /v1/fragments/:id should update existing fragment', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('before update');

    const fragmentId = createRes.body.fragment.id;

    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('after update');

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('ok');

    const rawRes = await request(app)
      .get(`/v1/fragments/${fragmentId}/raw`)
      .set(userHeader);

    expect(rawRes.status).toBe(200);
    expect(rawRes.text).toBe('after update');
  });

  test('PUT /v1/fragments/:id should return 404 for unknown id', async () => {
    const res = await request(app)
      .put('/v1/fragments/does-not-exist')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('test');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('DELETE /v1/fragments/:id should delete existing fragment', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/plain')
      .send('delete me');

    const fragmentId = createRes.body.fragment.id;

    const delRes = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .set(userHeader);

    expect(delRes.status).toBe(200);
    expect(delRes.body.status).toBe('ok');

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .set(userHeader);

    expect(getRes.status).toBe(404);
  });

  test('DELETE /v1/fragments/:id should return 404 for unknown id', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .set(userHeader);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('GET /v1/fragments/:id.html should convert markdown to html', async () => {
    const md = '# Title\n\n**bold** text';

    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/markdown')
      .send(md);

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toMatch(/<h1.*>Title<\/h1>/);
    expect(res.text).toMatch(/<strong>bold<\/strong>/);
  });

  test('GET /v1/fragments/:id.txt should convert markdown to plain text', async () => {
    const md = '# Title\n\n**bold** text';

    const createRes = await request(app)
      .post('/v1/fragments')
      .set(userHeader)
      .set('Content-Type', 'text/markdown')
      .send(md);

    const fragmentId = createRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text).toContain('Title');
    expect(res.text).toContain('bold');
  });
});
