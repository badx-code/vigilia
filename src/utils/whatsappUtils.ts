import { VigiliaConfig, ScheduleMoment, RepertoireSong, Minister, Notice, PrayerRequest } from '../types';

export function getMomentEmoji(type?: string): string {
  switch (type) {
    case 'oracao':
      return '🛐';
    case 'louvor':
      return '🎵';
    case 'palavra':
      return '📖';
    case 'testemunho':
      return '🗣️';
    case 'dinamica':
      return '✨';
    case 'intervalo':
      return '☕';
    default:
      return '⏱️';
  }
}

/**
 * Formats the entire updated vigil schedule for WhatsApp sharing in groups
 */
export function generateScheduleWhatsAppMessage(params: {
  config: VigiliaConfig;
  moments: ScheduleMoment[];
  delayMinutes?: number;
}): string {
  const { config, moments, delayMinutes = 0 } = params;

  let msg = `🔥 *${config.vigilName ? config.vigilName.toUpperCase() : 'VIGÍLIA DE ORAÇÃO'}* 🔥\n`;
  if (config.churchName) {
    msg += `⛪ *${config.churchName}*\n`;
  }
  if (config.theme) {
    msg += `✨ *Tema:* "${config.theme}"\n`;
  }
  if (config.keyVerse) {
    msg += `📖 *Texto Chave:* "${config.keyVerse}" ${config.verseReference ? `(${config.verseReference})` : ''}\n`;
  }
  if (config.date) {
    msg += `📅 *Data:* ${config.date} | ⏰ *Início:* ${config.startTime || '22:00'} às ${config.endTime || '06:00'}\n`;
  }
  if (config.location) {
    msg += `📍 *Local:* ${config.location}\n`;
  }

  if (delayMinutes !== 0) {
    if (delayMinutes > 0) {
      msg += `\n⚠️ *Aviso de Horário:* Cronograma ajustado (+${delayMinutes} min)\n`;
    } else {
      msg += `\n⚡ *Aviso de Horário:* Cronograma adiantado (${delayMinutes} min)\n`;
    }
  }

  msg += `\n═══════════════════════\n`;
  msg += `📋 *CRONOGRAMA ATUALIZADO*\n`;
  msg += `═══════════════════════\n\n`;

  if (moments.length === 0) {
    msg += `_Nenhum momento cadastrado no momento._\n\n`;
  } else {
    moments.forEach((m, idx) => {
      const emoji = getMomentEmoji(m.type);
      msg += `*${m.startTime} às ${m.endTime}* | ${emoji} *${m.title}*\n`;
      if (m.responsible) {
        msg += `   👤 Resp: _${m.responsible}_\n`;
      }
      if (m.scripture) {
        msg += `   📖 Texto: _${m.scripture}_\n`;
      }
      if (m.description) {
        msg += `   📝 _${m.description}_\n`;
      }
      msg += `\n`;
    });
  }

  msg += `═══════════════════════\n`;
  msg += `📲 *Acompanhe em tempo real:* https://applaner.com.br/\n`;
  msg += `🕊️ _"Orai sem cessar." (1 Ts 5:17)_\n`;

  return msg;
}

/**
 * Formats a personalized schedule message for a specific member or minister
 */
export function generateMemberScheduleWhatsAppMessage(params: {
  config: VigiliaConfig;
  memberName: string;
  myMoments: ScheduleMoment[];
  mySongs?: RepertoireSong[];
}): string {
  const { config, memberName, myMoments, mySongs = [] } = params;

  let msg = `Olá, *${memberName}*! A paz do Senhor. 🙏\n\n`;
  msg += `Aqui está a sua escala atualizada para a *${config.vigilName || 'Grande Vigília'}* (${config.churchName || 'Igreja Local'}):\n\n`;

  if (myMoments.length > 0) {
    msg += `📌 *SEUS MOMENTOS NO CRONOGRAMA:*\n`;
    myMoments.forEach((m) => {
      const emoji = getMomentEmoji(m.type);
      msg += `⏰ *${m.startTime} às ${m.endTime}*\n`;
      msg += `${emoji} *${m.title}*\n`;
      if (m.scripture) {
        msg += `📖 Texto: ${m.scripture}\n`;
      }
      if (m.description) {
        msg += `📝 Detalhes: ${m.description}\n`;
      }
      msg += `\n`;
    });
  }

  if (mySongs.length > 0) {
    msg += `🎵 *SEUS LOUVORES NO REPERTÓRIO:*\n`;
    mySongs.forEach((s) => {
      msg += `🎶 *${s.title}* (Tom: *${s.key}*)\n`;
      if (s.artist) msg += `   Artista/Versão: ${s.artist}\n`;
    });
    msg += `\n`;
  }

  msg += `⚠️ *Orientações:* Por favor, esteja no púlpito/altar com 10 a 15 minutos de antecedência.\n\n`;
  msg += `📲 Acompanhe ao vivo pelo link: https://applaner.com.br/\n`;
  msg += `Que Deus abençoe seu ministério nesta noite! ✨`;

  return msg;
}

/**
 * Formats a single notice / announcement for WhatsApp
 */
export function generateNoticeWhatsAppMessage(params: {
  config: VigiliaConfig;
  notice: Notice;
}): string {
  const { config, notice } = params;

  let msg = `📢 *COMUNICADO DA VIGÍLIA* 📢\n`;
  if (config.churchName) {
    msg += `⛪ *${config.churchName}* - ${config.vigilName || 'Vigília'}\n\n`;
  }
  msg += `🔔 *${notice.title.toUpperCase()}*\n`;
  msg += `═══════════════════════\n`;
  msg += `${notice.content}\n`;
  msg += `═══════════════════════\n\n`;
  msg += `📲 Acompanhe todas as atualizações: https://applaner.com.br/`;

  return msg;
}

/**
 * Formats the approved prayer list for the intercession team
 */
export function generatePrayersWhatsAppMessage(params: {
  config: VigiliaConfig;
  prayers: PrayerRequest[];
}): string {
  const { config, prayers } = params;

  let msg = `🙏 *MOTIVOS DE ORAÇÃO & INTERCESSÃO* 🙏\n`;
  msg += `⛪ *${config.churchName || 'Igreja Local'}* | ${config.vigilName || 'Vigília'}\n\n`;

  if (prayers.length === 0) {
    msg += `_Nenhum pedido de oração registrado no momento._\n\n`;
  } else {
    prayers.forEach((p, idx) => {
      msg += `*${idx + 1}. ${p.authorName || 'Irmão(ã) anônimo'}* [${p.category || 'Geral'}]\n`;
      msg += `   💬 "${p.request}"\n\n`;
    });
  }

  msg += `🕊️ _"Confessai as vossas culpas uns aos outros, e orai uns pelos outros, para que sareis." (Tiago 5:16)_\n\n`;
  msg += `📲 Envie novos pedidos em: https://applaner.com.br/`;

  return msg;
}

/**
 * Opens WhatsApp directly in new window with pre-filled message
 */
export function openWhatsAppDirect(text: string, phoneNumber?: string): void {
  const encoded = encodeURIComponent(text);
  let cleanPhone = (phoneNumber || '').replace(/\D/g, '');

  if (cleanPhone) {
    // If phone doesn't have country code (e.g. 11999998888 or 5511999998888)
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }
}
