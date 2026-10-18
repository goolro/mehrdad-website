import ZAI from 'z-ai-web-dev-sdk';
const zai = await ZAI.create();
const c = await zai.chat.completions.create({
  messages: [{ role: 'user', content: 'Say OK' }],
  thinking: { type: 'disabled' },
});
console.log('PROBE:', (c.choices[0]?.message?.content || '').slice(0, 20));
