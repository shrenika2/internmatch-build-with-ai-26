/**
 * Global mocks for external services
 */

// Set dummy env variables for testing
process.env.JWT_SECRET = 'test_secret_123';
process.env.OPENAI_API_KEY = 'sk-test-123';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('test-uuid-1234')
}));

// Mock Cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({ secure_url: 'http://test.com/img.png', public_id: 'test_id' }),
            upload_stream: jest.fn(),
            destroy: jest.fn().mockResolvedValue({ result: 'ok' })
        }
    }
}));

// Mock OpenAI
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify({ skills: ['Testing', 'Jest'], categories: { technical: ['Testing'], soft: ['Jest'] } }) } }]
                })
            }
        }
    }));
});

// Mock Streamifier (used for uploads)
jest.mock('streamifier', () => ({
    createReadStream: jest.fn().mockReturnValue({
        pipe: jest.fn()
    })
}));

console.log('[TEST] Global mocks initialized');
