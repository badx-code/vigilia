import React from 'react';
import {
  Sliders,
  HandHeart,
  Camera,
  Music,
  BookOpen,
  Utensils,
  ClipboardList,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  Mic,
  Video,
  Sun,
  Flame,
  Radio,
  Car,
  Baby,
  Layers,
  HeartHandshake,
} from 'lucide-react';

interface TeamIconProps {
  name: string;
  className?: string;
}

export const TeamIcon: React.FC<TeamIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name?.toLowerCase()) {
    case 'sliders':
    case 'som':
    case 'audio':
      return <Sliders className={className} />;
    case 'handheart':
    case 'recepcao':
    case 'acolhimento':
      return <HandHeart className={className} />;
    case 'camera':
    case 'midia':
    case 'foto':
      return <Camera className={className} />;
    case 'music':
    case 'louvor':
    case 'musica':
      return <Music className={className} />;
    case 'bookopen':
    case 'pregacao':
    case 'palavra':
    case 'biblia':
      return <BookOpen className={className} />;
    case 'utensils':
    case 'alimentacao':
    case 'copa':
    case 'cafe':
      return <Utensils className={className} />;
    case 'clipboardlist':
    case 'organizacao':
    case 'apoio':
      return <ClipboardList className={className} />;
    case 'shield':
    case 'intercessao':
    case 'oracao':
      return <Shield className={className} />;
    case 'shieldcheck':
    case 'seguranca':
    case 'portaria':
      return <ShieldCheck className={className} />;
    case 'sparkles':
    case 'limpeza':
      return <Sparkles className={className} />;
    case 'mic':
      return <Mic className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'radio':
      return <Radio className={className} />;
    case 'car':
    case 'estacionamento':
      return <Car className={className} />;
    case 'baby':
    case 'criancas':
      return <Baby className={className} />;
    case 'hearthandshake':
      return <HeartHandshake className={className} />;
    case 'users':
    default:
      return <Layers className={className} />;
  }
};
