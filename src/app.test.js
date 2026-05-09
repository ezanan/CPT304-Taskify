const request = require('supertest');
const app = require('./app'); // 引入你的 Express 应用

describe('Taskify App Routing Tests', () => {
    
    // 测试 1：访问首页
    test('GET / should return 200 OK', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    // 测试 2：访问注册页
    test('GET /signup should return 200 OK', async () => {
        const response = await request(app).get('/signup');
        expect(response.statusCode).toBe(200);
    });

    // 测试 3：访问登录页 (Dashboard)
    test('GET /dashboard should return 200 OK', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.statusCode).toBe(200);
    });

    // 测试 4：访问我们新加的隐私政策页
    test('GET /privacy should return 200 OK', async () => {
        const response = await request(app).get('/privacy');
        expect(response.statusCode).toBe(200);
    });

    // 测试 5：访问一个不存在的页面，应该返回 404
    test('GET /non-existent-page should return 404', async () => {
        const response = await request(app).get('/non-existent-page');
        expect(response.statusCode).toBe(404);
    });
});