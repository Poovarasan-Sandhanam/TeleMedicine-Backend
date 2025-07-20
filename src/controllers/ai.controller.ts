   // src/controllers/ai.controller.ts
   import { Request, Response } from 'express';
   import OpenAI from 'openai';

   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   export const checkSymptoms = async (req: Request, res: Response) => {
     const { symptoms } = req.body;
     if (!symptoms) {
       return res.status(400).json({ error: 'Symptoms are required.' });
     }

     const prompt = `A patient reports the following symptoms: ${symptoms}. What are the possible health issues, and which type of doctor should they consult? Respond in JSON with keys 'possible_conditions' (array of strings) and 'recommended_doctor' (string).`;

     try {
       const completion = await openai.chat.completions.create({
         model: 'gpt-4',
         messages: [{ role: 'user', content: prompt }],
         temperature: 0.2,
       });
       const aiResponse = completion.choices[0].message?.content;
       let result;
       try {
         result = JSON.parse(aiResponse || '{}');
       } catch (e) {
         return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
       }
       res.json(result);
     } catch (error) {
       const errMsg = error instanceof Error ? error.message : String(error);
       res.status(500).json({ error: 'AI service error', details: errMsg });
     }
   };