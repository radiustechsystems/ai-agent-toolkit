'use client';

import { type FormEvent, useState } from 'react';

interface ContentFormProps {
  onSubmit: (prompt: string, creatorAddress: string) => void;
  isLoading: boolean;
}

export function ContentForm({ onSubmit, isLoading }: ContentFormProps) {
  const [prompt, setPrompt] = useState('');
  const [creatorAddress, setCreatorAddress] = useState(
    process.env.NEXT_PUBLIC_CREATOR_ADDRESS || '',
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && creatorAddress.trim()) {
      onSubmit(prompt, creatorAddress);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Content Prompt
        </label>
        <textarea
          id="prompt"
          rows={4}
          className={`
            w-full px-4 py-2 
            bg-radius-dark/50 
            border border-radius-dark 
            rounded-lg 
            focus:ring-2 focus:ring-radius-primary focus:border-transparent 
            transition-all
          `}
          placeholder="Describe the content you'd like to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="creator" className="block text-sm font-medium text-gray-300 mb-2">
          Creator Wallet Address
        </label>
        <input
          type="text"
          id="creator"
          className={`
            w-full px-4 py-2 
            bg-radius-dark/50 
            border border-radius-dark 
            rounded-lg 
            focus:ring-2 focus:ring-radius-primary focus:border-transparent 
            transition-all
          `}
          placeholder="0x..."
          value={creatorAddress}
          onChange={(e) => setCreatorAddress(e.target.value)}
          disabled={isLoading}
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          This address will receive the micropayment for generated content
        </p>
      </div>

      <button
        type="submit"
        className={`
          w-full py-3 px-6 
          bg-gradient-to-r from-radius-primary to-radius-secondary 
          rounded-lg text-white font-medium 
          hover:opacity-90 transition-opacity 
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        disabled={isLoading || !prompt.trim() || !creatorAddress.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate Content & Pay Creator'}
      </button>
    </form>
  );
}
