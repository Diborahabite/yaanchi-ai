/**
 * mobile/hooks/useCfaSandbox.ts
 * React Hook for communicating with the CFA AI Sandbox API
 */

import { useState } from 'react';
import axios from 'axios';
import { Endpoints } from '../constants/Api';

export interface CfaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CfaChatResponse {
  success: boolean;
  content?: string;
  data?: any;
  error?: string;
}

export function useCfaSandbox() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CfaChatResponse | null>(null);

  const querySandbox = async (
    prompt: string,
    systemPrompt?: string,
    model: string = 'default'
  ): Promise<CfaChatResponse> => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post<CfaChatResponse>(
        Endpoints.cfaChat,
        {
          prompt,
          system_prompt: systemPrompt,
          model,
        },
        { timeout: 60000 }
      );

      setResponse(res.data);
      return res.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.detail || err.message || 'Error connecting to CFA AI Sandbox';
      setError(errMsg);
      const errRes: CfaChatResponse = {
        success: false,
        error: errMsg,
      };
      setResponse(errRes);
      return errRes;
    } finally {
      setLoading(false);
    }
  };

  return {
    querySandbox,
    loading,
    error,
    response,
  };
}
