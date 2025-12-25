import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  children: string;
  block?: boolean;
  className?: string;
}

export function LatexRenderer({ children, block = false, className }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(children, containerRef.current, {
          throwOnError: false, // Render errors in red instead of crashing
          displayMode: block,
          errorColor: '#cc0000',
          strict: false, // Ignore strict warnings
          trust: true, // Allow some commands
        });
        setError(null);
      } catch (err: any) {
        console.error('KaTeX critical error:', err);
        setError(err.message || 'Error rendering LaTeX');
      }
    }
  }, [children, block]);

  if (error) {
    return (
      <div className="text-red-500 font-mono text-sm p-2 border border-red-200 bg-red-50 rounded">
        Render Error: {error}
        <br/>
        <span className="text-xs text-neutral-500">Source: {children}</span>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
