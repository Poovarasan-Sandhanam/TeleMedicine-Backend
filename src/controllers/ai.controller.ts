import { Request, Response } from 'express';
import OpenAI from 'openai';
import moment from 'moment';
import HttpStatusCode from 'http-status-codes';
import { sendError, sendSuccess } from '../utilities/responseHandler';
import careRequestModel from '../models/ai/careRequest.model';
import { understandRequest, ClientNow } from '../ai/triage';
import { findSuggestions } from '../ai/matching';

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
// ---------------------------------------------------------------------------
// Find care: understand a patient's request and offer bookable times.
// ---------------------------------------------------------------------------

const DISCLAIMER = 'These are suggestions to help you find the right doctor, not a diagnosis. Your doctor will review your case.';

/**
 * The patient's local date and hour, so "today", "tomorrow" and already-passed
 * slots are judged in their timezone. Values far from the server's clock are
 * ignored rather than trusted.
 */
const clientNow = (body: any): ClientNow => {
    const serverNow = moment();
    const date = typeof body?.clientDate === 'string' && moment(body.clientDate, 'YYYY-MM-DD', true).isValid()
        && Math.abs(moment(body.clientDate).diff(serverNow.clone().startOf('day'), 'days')) <= 1
        ? body.clientDate : serverNow.format('YYYY-MM-DD');
    const hour = Number.isInteger(body?.clientHour) && body.clientHour >= 0 && body.clientHour <= 23
        ? body.clientHour : serverNow.hour();
    return { date, hour };
};

/**
 * POST /ai/find-care  { message, clientDate?, clientHour? }
 *
 * Returns either emergency advice or a short list of bookable doctor/time options.
 * It never books: the patient reviews and confirms in the app (Option A).
 */
export const findCare = async (req: Request, res: Response) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (message.length < 3) {
        return sendError(res, 'Tell us a little about how you are feeling.', HttpStatusCode.BAD_REQUEST);
    }
    if (message.length > 1000) {
        return sendError(res, 'Please keep it under 1000 characters.', HttpStatusCode.BAD_REQUEST);
    }
    const now = clientNow(req.body);
    const patientId = (req as any).user._id;

    try {
        const intent = await understandRequest(message, now);
        const emergency = intent.urgency === 'emergency';
        const match = emergency ? null : await findSuggestions(intent, now);

        // Audit every request. A logging failure must not block care advice.
        careRequestModel.create({
            patientId, message, intent, emergency, source: intent.source,
            suggestionCount: match?.suggestions.length ?? 0, widened: match?.widened ?? false,
        }).catch(err => console.error('[find-care] audit log failed', err));

        const understanding = {
            summary: intent.summary,
            specialty: intent.specialty,
            urgency: intent.urgency,
            day: intent.day,
            timeOfDay: intent.timeOfDay,
            doctorGender: intent.doctorGender,
            language: intent.language,
        };

        if (emergency) {
            return sendSuccess(res, {
                type: 'emergency',
                crisis: intent.redFlags.some(f => f.crisis),
                reasons: intent.redFlags.map(f => f.label),
                understanding,
                source: intent.source,
            }, 'This may need urgent help');
        }

        return sendSuccess(res, {
            type: 'suggestions',
            understanding,
            suggestions: match!.suggestions,
            relaxed: match!.relaxed,
            widened: match!.widened,
            source: intent.source,
            disclaimer: DISCLAIMER,
        }, 'Suggestions ready');
    } catch (error: any) {
        console.error('[find-care] failed', error);
        return sendError(res, 'Could not find doctors right now. Please try again.', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
};
