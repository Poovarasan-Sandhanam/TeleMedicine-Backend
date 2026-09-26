   // src/controllers/ai.controller.ts
   import { Request, Response } from 'express';
   import OpenAI from 'openai';

   /**
    * Built on first use rather than at import time. Constructing the client eagerly
    * threw when OPENAI_API_KEY was unset, which took down the whole server on boot
    * instead of just degrading this one endpoint.
    */
   let openai: OpenAI | null = null;

   const getOpenAIClient = (): OpenAI => {
     if (!openai) {
       const apiKey = process.env.OPENAI_API_KEY;
       if (!apiKey) {
         throw new Error('AI symptom checking is not configured on this server');
       }
       openai = new OpenAI({ apiKey });
     }
     return openai;
   };

   export const checkSymptoms = async (req: Request, res: Response) => {
     const { symptoms } = req.body;
     if (!symptoms) {
       return res.status(400).json({ error: 'Symptoms are required.' });
     }

     const prompt = `A patient reports the following symptoms: ${symptoms}. What are the possible health issues, and which type of doctor should they consult? Respond in JSON with keys 'possible_conditions' (array of strings) and 'recommended_doctor' (string).`;

     let client: OpenAI;
     try {
       client = getOpenAIClient();
     } catch (error) {
       const errMsg = error instanceof Error ? error.message : String(error);
       return res.status(503).json({ error: errMsg });
     }

     try {
       const completion = await client.chat.completions.create({
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