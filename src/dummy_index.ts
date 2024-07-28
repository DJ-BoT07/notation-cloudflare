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
        console.log(text);
        const temp = c.json({message: text})
        console.log(temp);
        
    
        return temp;
    } catch (error) {
        console.error('Error:', error);
        console.log( c.json({ error: 'Failed to generate content' }, 500));
    }

    return c.text('Hello!');
});

export default app;
