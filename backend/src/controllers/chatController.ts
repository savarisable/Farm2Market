import { Request, Response } from 'express';
import { processMultilingualQuery, SupportedLanguage } from '../ai/multilingualChatService';
import {
  MAHARASHTRA_FARMERS,
  MAHARASHTRA_BUYERS,
  MAHARASHTRA_FPOS,
  MAHARASHTRA_ADMINS,
} from '../data/maharashtraDirectory';

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message, language } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const lang: SupportedLanguage = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';

    const userContext = {
      role: (req as any).user?.role || 'FARMER',
      name: (req as any).user?.name || 'Ramesh Patil',
      location: (req as any).user?.location || 'Nashik, Maharashtra',
    };

    const response = await processMultilingualQuery(message, lang, userContext);

    return res.json({
      success: true,
      ...response,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDirectoryData(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      directory: {
        farmers: MAHARASHTRA_FARMERS,
        buyers: MAHARASHTRA_BUYERS,
        fpos: MAHARASHTRA_FPOS,
        admins: MAHARASHTRA_ADMINS,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
