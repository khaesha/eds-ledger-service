import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /', () => {
    it('should return health check', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('should be accessible', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.text).toBe('Hello World!');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/unknown/route/that/does/not/exist')
        .expect(404);
    });
  });

  describe('Application startup', () => {
    it('should be running', () => {
      expect(app).toBeDefined();
      expect(app.getHttpServer()).toBeDefined();
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
