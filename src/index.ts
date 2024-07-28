import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = new Hono();

app.use(
    '/*',
    cors({
        origin: '*', // Allow requests from your Next.js app
        allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'], // Add Content-Type to the allowed headers to fix CORS
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    })
);

app.get('/', (c) => {
    return c.text('Hello, World!');
});

app.post('/chatToDocument', async (c) => {
    const apiKey = (c.env as any).GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const { documentData, question } = await c.req.json();

    const prompt = `You are an assistant helping the user to chat to a document. The document content is: ${documentData}. Answer the user's question in the clearest way possible. The user's question is: ${question}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return c.json({ message: text });
    } catch (error) {
        console.error('Error:', error);
        return c.json({ error: 'Failed to generate content' }, 500);
    }
});

app.post('/translateDocument', async (c) => {
    const apiKey = (c.env as any).GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const { documentData, targetLang } = await c.req.json();

    const prompt = `Summarize and Translate the following text to ${targetLang}: ${documentData}. And only give the Translated text as output`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        
        const jsonResponse = JSON.stringify({ message: text });
        console.log('Generated Content:', jsonResponse);

        return new Response(jsonResponse, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error generating content:', error);
        const errorResponse = JSON.stringify({ error: 'Failed to generate content' });
        console.log('Error Response:', errorResponse);
        
        return new Response(errorResponse, {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

export default app;
