import { useState } from 'react';
import axios from 'axios';
import { Endpoints } from '../constants/Api';

interface LegalSource {
  article: string;
  text: string;
  relevance_score: number;
}

interface LegalQAResult {
  answer: string;
  sources: LegalSource[];
  legal_references: string[];
  disclaimer: string;
  session_purged: boolean;
}

export function useLegalQA() {
  const [result, setResult] = useState<LegalQAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string, language: string = 'en', ghostMode: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(Endpoints.legalQA, {
        question,
        language,
        ghost_mode: ghostMode,
      }, { timeout: 15000 });
      setResult(response.data);
    } catch (err: any) {
      setError('Could not connect to the legal database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, ask, reset };
}
