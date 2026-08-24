import { jsPDF } from 'jspdf';
import { VigiliaConfig, ScheduleMoment, RepertoireSong } from '../types';
import { formatFullDate } from './timeUtils';

export interface GeneratePdfOptions {
  config: VigiliaConfig;
  moments: ScheduleMoment[];
  repertoire?: RepertoireSong[];
  qrCodeDataUrl?: string;
  includeRepertoire?: boolean;
}

export function generateVigilOfficialPdf({
  config,
  moments,
  repertoire = [],
  qrCodeDataUrl,
  includeRepertoire = true,
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  // Header Background bar
  doc.setFillColor(15, 23, 42); // Navy blue #0F172A
  doc.rect(margin, currentY, pageWidth - margin * 2, 28, 'F');

  // Gold decorative line
  doc.setFillColor(212, 175, 55); // Gold #D4AF37
  doc.rect(margin, currentY + 27, pageWidth - margin * 2, 1.2, 'F');

  // Church Name
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text((config.churchName || 'IGREJA LOCAL').toUpperCase(), pageWidth / 2, currentY + 7, { align: 'center' });

  // Vigil Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(config.vigilName || 'GRANDE VIGÍLIA DE ORAÇÃO', pageWidth / 2, currentY + 15, { align: 'center' });

  // Date & Time subtitle
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const dateFormatted = formatFullDate(config.date);
  doc.text(`${dateFormatted} • ${config.startTime} às ${config.endTime} • Código: ${config.memberCode || config.accessCode}`, pageWidth / 2, currentY + 22, { align: 'center' });

  currentY += 34;

  // Theme & Scripture block
  if (config.theme || config.keyVerse) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, 'FD');

    if (config.theme) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`TEMA: ${config.theme}`, margin + 4, currentY + 6);
    }

    if (config.keyVerse) {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const verseText = `"${config.keyVerse}" (${config.verseReference || ''})`;
      const splitVerse = doc.splitTextToSize(verseText, pageWidth - margin * 2 - 8);
      doc.text(splitVerse, margin + 4, currentY + 11);
    }

    currentY += 20;
  }

  // Section Header: Programação Oficial
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
  doc.text('PROGRAMAÇÃO & ESCALA OFICIAL', margin + 4, currentY + 5);

  currentY += 7;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');

  doc.text('HORÁRIO', margin + 3, currentY + 4.2);
  doc.text('ATIVIDADE / MOMENTO', margin + 32, currentY + 4.2);
  doc.text('RESPONSÁVEL', margin + 110, currentY + 4.2);
  doc.text('DETALHES / NOTA', margin + 152, currentY + 4.2);

  currentY += 6;

  // Table Rows
  const sortedMoments = [...moments].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));

  sortedMoments.forEach((mom, idx) => {
    // Check for page overflow
    if (currentY > pageHeight - 24) {
      doc.addPage();
      currentY = 15;

      // Repeat Table Header
      doc.setFillColor(241, 245, 249);
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
      doc.text('HORÁRIO', margin + 3, currentY + 4.2);
      doc.text('ATIVIDADE / MOMENTO', margin + 32, currentY + 4.2);
      doc.text('RESPONSÁVEL', margin + 110, currentY + 4.2);
      doc.text('DETALHES / NOTA', margin + 152, currentY + 4.2);
      currentY += 6;
    }

    // Row alternating background
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, currentY, pageWidth - margin * 2, 6.5, 'F');

    // Bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY + 6.5, pageWidth - margin, currentY + 6.5);

    // Time
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${mom.startTime} - ${mom.endTime}`, margin + 3, currentY + 4.5);

    // Title
    doc.setFont('helvetica', 'normal');
    const titleText = doc.splitTextToSize(mom.title, 75);
    doc.text(titleText[0] || '', margin + 32, currentY + 4.5);

    // Responsible
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    const respText = doc.splitTextToSize(mom.responsible || '—', 38);
    doc.text(respText[0] || '', margin + 110, currentY + 4.5);

    // Details / Scripture
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    const detailText = mom.scripture || (mom.songsList ? 'Louvor' : (mom.description || '—'));
    const shortDetail = doc.splitTextToSize(detailText, 28);
    doc.text(shortDetail[0] || '', margin + 152, currentY + 4.5);

    currentY += 6.5;
  });

  // Repertoire section
  if (includeRepertoire && repertoire && repertoire.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 15;
    } else {
      currentY += 6;
    }

    doc.setFillColor(30, 41, 59);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
    doc.text('REPERTÓRIO DE LOUVORES & MÚSICAS', margin + 4, currentY + 5);

    currentY += 7;

    doc.setFillColor(241, 245, 249);
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
    doc.text('#', margin + 3, currentY + 4.2);
    doc.text('NOME DO LOUVOR', margin + 12, currentY + 4.2);
    doc.text('CANTOR / MINISTÉRIO', margin + 85, currentY + 4.2);
    doc.text('TOM', margin + 140, currentY + 4.2);
    doc.text('RESPONSÁVEL', margin + 155, currentY + 4.2);

    currentY += 6;

    repertoire.forEach((song, sIdx) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 15;
      }

      if (sIdx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252);
      }
      doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, currentY + 6, pageWidth - margin, currentY + 6);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(sIdx + 1), margin + 3, currentY + 4.2);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(song.title, margin + 12, currentY + 4.2);

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(song.artist || '—', margin + 85, currentY + 4.2);

      doc.setTextColor(212, 175, 55);
      doc.setFont('helvetica', 'bold');
      doc.text(song.key ? `Tom: ${song.key}` : '—', margin + 140, currentY + 4.2);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(song.responsible || '—', margin + 155, currentY + 4.2);

      currentY += 6;
    });
  }

  // Footer note with QR code / Access instructions
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 15;
  } else {
    currentY += 6;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(212, 175, 55);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'FD');

  if (qrCodeDataUrl) {
    try {
      doc.addImage(qrCodeDataUrl, 'PNG', margin + 3, currentY + 1.5, 11, 11);
    } catch {
      // ignore
    }
  }

  const textStartX = qrCodeDataUrl ? margin + 17 : margin + 4;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Acompanhe a programação em tempo real pelo celular:`, textStartX, currentY + 5.5);

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Acesse applaner.com.br e digite o Código: ${config.memberCode || config.accessCode}`, textStartX, currentY + 10.5);

  // Save the PDF
  const filename = `escala-vigilia-${(config.memberCode || config.accessCode || 'oficial').toLowerCase()}.pdf`;
  doc.save(filename);
}
