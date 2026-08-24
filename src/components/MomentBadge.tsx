import React from 'react';
import { MomentType } from '../types';

interface MomentBadgeProps {
  type: MomentType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const getMomentMeta = (type: MomentType) => {
  switch (type) {
    case 'oracao':
      return { label: 'Oração', emoji: '🙏', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
    case 'louvor':
      return { label: 'Louvor', emoji: '🎶', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/40' };
    case 'pregacao':
      return { label: 'Pregação', emoji: '📖', bg: 'bg-blue-950/60 text-blue-300 border-blue-800/40' };
    case 'testemunho':
      return { label: 'Testemunho', emoji: '💬', bg: 'bg-teal-950/60 text-teal-300 border-teal-800/40' };
    case 'dinamica':
      return { label: 'Dinâmica', emoji: '🎯', bg: 'bg-violet-950/60 text-violet-300 border-violet-800/40' };
    case 'aviso':
      return { label: 'Aviso', emoji: '📢', bg: 'bg-orange-950/60 text-orange-300 border-orange-800/40' };
    case 'pausa':
      return { label: 'Pausa', emoji: '🍽️', bg: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/40' };
    case 'ceia':
      return { label: 'Santa Ceia', emoji: '🍞', bg: 'bg-rose-950/60 text-rose-300 border-rose-800/40' };
    case 'intercessao':
      return { label: 'Intercessão', emoji: '🛡️', bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' };
    case 'louvor_especial':
      return { label: 'Louvor Especial', emoji: '🎤', bg: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/40' };
    case 'outro':
    default:
      return { label: 'Atividade', emoji: '⏳', bg: 'bg-stone-900 text-stone-300 border-stone-700/50' };
  }
};

export const MomentBadge: React.FC<MomentBadgeProps> = ({ type, className = '', size = 'md' }) => {
  const meta = getMomentMeta(type);
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-sm px-3 py-1.5 gap-2'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${meta.bg} ${sizeClasses} ${className}`}
    >
      <span className="text-xs leading-none">{meta.emoji}</span>
      <span className="whitespace-nowrap">{meta.label}</span>
    </span>
  );
};
