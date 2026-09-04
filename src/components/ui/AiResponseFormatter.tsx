import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronRight, BarChart2, ShieldAlert, Sparkles } from 'lucide-react';

interface AiResponseFormatterProps {
  content: string;
}

export const AiResponseFormatter: React.FC<AiResponseFormatterProps> = ({ content }) => {
  // Split lines while preserving block context
  const lines = content.split('\n');

  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let currentList: string[] = [];

  const flushTable = (key: string | number) => {
    if (tableHeader.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 shadow-sm">
          <table className="w-full text-left text-[11px] font-mono border-collapse">
            {tableHeader.length > 0 && (
              <thead className="bg-[#0f172a] text-slate-300 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  {tableHeader.map((th, i) => (
                    <th key={i} className="px-3 py-2 font-semibold text-bio-300">
                      {formatInline(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-slate-300">
                      {formatInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  const flushList = (key: string | number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-2 space-y-1.5">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px] sm:text-xs leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-bio-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <div className="flex-1 min-w-0">{formatInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // 1. Table Handling
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if it's a separator line (e.g. |---|---|)
      const isSeparator = line.replace(/[|\s-:]/g, '').length === 0;
      if (isSeparator) {
        return; // Skip separator line
      }
      const cells = line.slice(1, -1).split('|');
      if (!inTable) {
        flushList(idx);
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // 2. Bullet / List Item Handling
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      currentList.push(line.replace(/^[-*•]\s+/, ''));
      return;
    } else {
      flushList(idx);
    }

    // Skip empty lines
    if (!line) {
      return;
    }

    // 3. Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      elements.push(
        <div key={idx} className="my-3 border-t border-slate-800/80" />
      );
      return;
    }

    // 4. Feasibility Verdict Callout Card
    if (line.includes('FEASIBILITY VERDICT') || line.includes('VERDICT:')) {
      const isFailure = line.includes('CRITICAL') || line.includes('FAILURE') || line.includes('IMPOSSIBLE') || line.includes('DEFICIT') || line.includes('❌');
      const isMarginal = line.includes('MARGINAL') || line.includes('WARNING') || line.includes('RISK') || line.includes('⚠️');
      const isSuccess = line.includes('FEASIBLE') || line.includes('NOMINAL') || line.includes('PASSED') || line.includes('✅');

      const cardStyle = isFailure
        ? 'bg-red-950/50 border-red-500/50 text-red-200'
        : isMarginal
        ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
        : isSuccess
        ? 'bg-bio-950/60 border-bio-400 text-bio-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        : 'bg-slate-900 border-slate-700 text-slate-200';

      const Icon = isFailure ? XCircle : isMarginal ? AlertTriangle : CheckCircle;

      elements.push(
        <div
          key={idx}
          className={`my-2.5 p-3 rounded-xl border flex items-center gap-2.5 ${cardStyle}`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm font-bold tracking-wide font-display">
            {formatInline(line.replace(/^#+\s*/, ''))}
          </div>
        </div>
      );
      return;
    }

    // 5. Headings
    if (line.startsWith('# ')) {
      elements.push(
        <div key={idx} className="mt-3 mb-1.5 pb-1 border-b border-slate-800 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-bio-400 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-white">
            {formatInline(line.replace(/^#\s+/, ''))}
          </h2>
        </div>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <div key={idx} className="mt-3 mb-1.5 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <h3 className="text-[11px] sm:text-xs font-bold font-display uppercase tracking-wider text-cyan-200">
            {formatInline(line.replace(/^##\s+/, ''))}
          </h3>
        </div>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="mt-2 mb-1 text-[11px] font-bold font-mono text-bio-300 flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-bio-400" />
          {formatInline(line.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }

    // 6. Numbered Steps (e.g. "1. Step description")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={idx} className="my-1.5 flex items-start gap-2 text-slate-300 text-[11px] sm:text-xs">
          <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-bio-500/40 text-bio-300 font-bold font-mono text-[10px] shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <div className="flex-1">{formatInline(numberedMatch[2])}</div>
        </div>
      );
      return;
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={idx} className="text-slate-300 text-[11px] sm:text-xs leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  });

  // Flush remaining buffers
  flushTable('final');
  flushList('final');

  return (
    <div className="space-y-1 font-mono text-slate-200">
      {elements}
    </div>
  );
};

// Inline Markdown Formatter (Bold, Code, Highlight)
function formatInline(text: string): React.ReactNode {
  // Match bold **text** or inline `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="text-white font-semibold tracking-wide">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-bio-300 text-[10px] font-mono">
          {inner}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
