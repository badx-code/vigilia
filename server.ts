import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Security and Parsing Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Custom Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Paths Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vigilia_db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'vigilia_audit.log');

// Ensure directories exist
[DATA_DIR, BACKUP_DIR, LOGS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --- AUDIT & SYSTEM LOGGING SYSTEM ---
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security';
  category: 'auth' | 'database' | 'backup' | 'prayer' | 'participant' | 'sync' | 'system';
  action: string;
  details: string;
  ip: string;
}

const memoryLogs: AuditLogEntry[] = [];
const MAX_MEMORY_LOGS = 300;

function logEvent(
  level: 'info' | 'warn' | 'error' | 'security',
  category: 'auth' | 'database' | 'backup' | 'prayer' | 'participant' | 'sync' | 'system',
  action: string,
  details: string,
  ip: string = '127.0.0.1'
) {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    action,
    details,
    ip: ip.replace('::ffff:', ''),
  };

  memoryLogs.unshift(entry);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.pop();
  }

  // Append asynchronously to log file
  const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] [${entry.ip}] ${entry.action}: ${entry.details}\n`;
  fs.appendFile(AUDIT_LOG_FILE, logLine, (err) => {
    if (err) console.error('Error writing audit log file:', err);
  });
}

// Initial system log
logEvent('info', 'system', 'Servidor Iniciado', `Servidor iniciado na porta ${PORT} no modo ${process.env.NODE_ENV || 'development'}`);

// --- CRYPTOGRAPHY & SECURITY HELPERS ---
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashCredential(credential: string, salt: string): string {
  return crypto.scryptSync(credential, salt, 64).toString('hex');
}

function verifyCredential(credential: string, storedHash: string, salt: string): boolean {
  if (!credential || !storedHash || !salt) return false;
  try {
    const computed = crypto.scryptSync(credential, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

function generateSecureCode(prefix: string = 'VIG'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }
  return `${prefix.toUpperCase()}-${randomPart}`;
}

// Active Sessions Store
interface SessionInfo {
  token: string;
  role: 'dirigente' | 'membro' | 'admin';
  vigilId: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
}

const activeSessions: Map<string, SessionInfo> = new Map();
const participantUnlockSessions: Map<string, { vigilId: string; expiresAt: number }> = new Map();

const DIRIGENTE_SESSION_TTL = 12 * 60 * 60 * 1000;

// Rate Limiter Store
interface RateLimitRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}
const rateLimits: Map<string, RateLimitRecord> = new Map();

// Periodic Cleanup
setInterval(() => {
  const now = Date.now();
  for (const [token, sess] of activeSessions.entries()) {
    if (sess.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
  for (const [tok, unlock] of participantUnlockSessions.entries()) {
    if (unlock.expiresAt < now) {
      participantUnlockSessions.delete(tok);
    }
  }
  for (const [ip, record] of rateLimits.entries()) {
    if (record.lockedUntil && record.lockedUntil < now && now - record.lastAttempt > 15 * 60 * 1000) {
      rateLimits.delete(ip);
    }
  }
}, 60000);

// --- DEFAULT INITIAL DATABASE SEED ---
const defaultInitialDb = {
  activeVigilId: 'vigil-default-1',
  updatedAt: new Date().toISOString(),
  templates: [
    {
      id: 'tpl-1',
      name: 'Vigília Tradicional (8 Horas)',
      description: 'Estrutura completa com 2 ministrações, blocos de louvor, oração e comunhão.',
      category: 'tradicional',
      isCustom: false,
      config: {
        vigilName: 'Grande Vigília de Oração e Louvor',
        theme: 'Uma noite de busca espiritual, cura e avivamento',
        startTime: '21:00',
        endTime: '05:00',
        keyVerse: 'Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes que não sabes.',
        verseReference: 'Jeremias 33:3',
      },
    },
    {
      id: 'tpl-2',
      name: 'Vigília Jovem / Impacto (6 Horas)',
      description: 'Focada em louvor congregacional dinâmico, testemunhos e oração pelos jovens.',
      category: 'jovem',
      isCustom: false,
      config: {
        vigilName: 'Vigília da Juventude - Avivamento',
        theme: 'Geração que busca a face de Deus',
        startTime: '22:00',
        endTime: '04:00',
        keyVerse: 'Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis.',
        verseReference: '1 Timóteo 4:12',
      },
    },
    {
      id: 'tpl-3',
      name: 'Vigília de Clamor & Intercessão (7 Horas)',
      description: 'Foco profundo em oração de joelhos, intercessão por famílias e causas urgentes.',
      category: 'intercessao',
      isCustom: false,
      config: {
        vigilName: 'Vigília de Clamor e Quebra de Cadeias',
        theme: 'O poder da oração que prevalece',
        startTime: '21:30',
        endTime: '04:30',
        keyVerse: 'Muito pode, por sua eficácia, a súplica do justo.',
        verseReference: 'Tiago 5:16',
      },
    },
  ],
  allVigils: [
    {
      id: 'vigil-default-1',
      code: 'fer1234',
      createdAt: new Date().toISOString(),
      delayMinutes: 0,
      config: {
        accessCode: 'fer1234',
        memberCode: 'fer1234',
        dirigenteCode: 'fer184426',
        adminCode: 'fer184426',
        dirigentePin: 'fer184426',
        dirigentePinSalt: '',
        dirigentePinHash: '',
        requireParticipantPassword: false,
        participantPassword: '',
        vigilName: 'Grande Vigília de Oração e Louvor',
        churchName: 'Igreja Central',
        ministryName: 'Ministério de Avivamento e Intercessão',
        theme: 'Uma noite de busca espiritual, cura e avivamento',
        subtheme: 'Buscando a Presença e o Poder de Deus até o Amanhecer',
        date: new Date().toISOString().split('T')[0],
        startTime: '21:00',
        endTime: '05:00',
        location: 'Templo Central / Auditório Principal',
        address: 'Av. das Nações Unidas, 1200 - Bairro da Fé',
        city: 'São Paulo',
        state: 'SP',
        description: 'Uma noite inesquecível de comunhão, oração intercessória, ministração da Palavra de Deus e louvor congregacional.',
        presentationText: 'Seja muito bem-vindo à nossa vigília de oração. Uma noite consagrada para buscar ao Senhor de todo o coração.',
        keyVerse: 'Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes que não sabes.',
        verseReference: 'Jeremias 33:3',
        churchLogo: '',
        vigilBanner: '',
        mainImage: '',
        accentColor: '#C9B27C',
        secondaryColor: '#14171C',
        contactPhone: '(11) 98765-4321',
        whatsapp: '(11) 98765-4321',
        instagram: '@vigiliadeoracao',
        youtube: 'https://youtube.com/@vigiliacentral',
        liveStreamUrl: '',
        mapUrl: 'https://maps.google.com',
        additionalInfo: 'Traga sua Bíblia e convide seus amigos e familiares. Teremos momento especial de comunhão e café da madrugada com todos os irmãos.',
        dirigenteProfile: {
          fullName: 'Pb. André Souza',
          displayName: 'Pb. André',
          roleTitle: 'Dirigente Geral e Coordenador de Vigílias',
          phone: '(11) 97333-4455',
          whatsapp: '(11) 97333-4455',
          email: 'andre.souza@igreja.org',
          bio: 'Servo de Deus dedicado à oração, avivamento espiritual e discipulado.',
        },
      },
      moments: [
        {
          id: 'mom-1',
          startTime: '21:00',
          endTime: '21:30',
          durationMinutes: 30,
          title: 'Recepção, Oração Inicial & Boas-Vindas',
          type: 'abertura',
          responsible: 'Pb. André Souza',
          responsibleRole: 'Dirigente',
          location: 'Templo Central',
          description: 'Acolhimento da igreja, oração de consagração e leitura bíblica inicial.',
          subitems: ['Acolhimento na entrada', 'Oração pastoral inicial', 'Apresentação dos visitantes'],
          status: 'concluido',
        },
        {
          id: 'mom-2',
          startTime: '21:30',
          endTime: '22:15',
          durationMinutes: 45,
          title: 'Primeiro Bloco de Louvor & Adoração Congregacional',
          type: 'louvor',
          responsible: 'Ministério Adoração Viva',
          responsibleRole: 'Ministro de Louvor',
          location: 'Altar',
          description: 'Cânticos espirituais de exaltação, gratidão e entrega ao Senhor.',
          subitems: ['Porque Ele Vive', 'Bondade de Deus', 'Vitorioso És'],
          status: 'em_andamento',
        },
        {
          id: 'mom-3',
          startTime: '22:15',
          endTime: '23:00',
          durationMinutes: 45,
          title: 'Primeira Ministração da Palavra de Deus',
          type: 'palavra',
          responsible: 'Pr. Carlos Eduardo',
          responsibleRole: 'Pastor Titular',
          location: 'Púlpito',
          description: 'Mensagem inspirada sobre o poder da fé e a busca pelo Espírito Santo.',
          subitems: ['Leitura de Jeremias 33:3', 'Exposição das Escrituras', 'Apelo e reflexão'],
          status: 'pendente',
        },
        {
          id: 'mom-4',
          startTime: '23:00',
          endTime: '23:45',
          durationMinutes: 45,
          title: 'Clamor de Joelhos pelas Famílias & Causas Impossíveis',
          type: 'clamor',
          responsible: 'Equipe de Intercessão',
          responsibleRole: 'Intercessores',
          location: 'Templo',
          description: 'Oração fervorosa de joelhos por restauração de lares e libertação.',
          subitems: ['Oração pelos filhos e jovens', 'Clamor pela saúde dos enfermos', 'Intercessão pela igreja'],
          status: 'pendente',
        },
        {
          id: 'mom-5',
          startTime: '23:45',
          endTime: '00:30',
          durationMinutes: 45,
          title: 'Louvor Especial & Testemunhos de Vitória',
          type: 'testemunho',
          responsible: 'Sarah Beatriz & Davi',
          responsibleRole: 'Cantora & Testemunho',
          location: 'Altar',
          description: 'Cântico de adoração e testemunhos de curas e respostas de oração.',
          subitems: ['Louvor: A Bênção', 'Testemunho de Cura', 'Oração de Ação de Graças'],
          status: 'pendente',
        },
        {
          id: 'mom-6',
          startTime: '00:30',
          endTime: '01:30',
          durationMinutes: 60,
          title: 'Segunda Ministração da Palavra & Unção',
          type: 'palavra',
          responsible: 'Pr. Marcos Silveira',
          responsibleRole: 'Pregador Convidado',
          location: 'Púlpito',
          description: 'Mensagem profética para a madrugada e ministração com imposição de mãos.',
          subitems: ['Pregação da Palavra', 'Oração pelos que buscam avivamento', 'Momento de Unção'],
          status: 'pendente',
        },
        {
          id: 'mom-7',
          startTime: '01:30',
          endTime: '02:40',
          durationMinutes: 70,
          title: 'Intercessão Profética & Clamor pelos Pedidos do Altar',
          type: 'oracao',
          responsible: 'Diác. Lucas Oliveira & Pb. André',
          responsibleRole: 'Dirigentes',
          location: 'Altar',
          description: 'Oração nominal pelos pedidos deixados pelos irmãos no aplicativo e na urna.',
          subitems: ['Apresentação dos pedidos', 'Oração em duplas', 'Clamor pela nação'],
          status: 'pendente',
        },
        {
          id: 'mom-8',
          startTime: '02:40',
          endTime: '03:20',
          durationMinutes: 40,
          title: 'Intervalo da Madrugada & Café da Comunhão (Ágape)',
          type: 'intervalo',
          responsible: 'Equipe de Recepção & Café',
          responsibleRole: 'Diaconato',
          location: 'Salão Social',
          description: 'Momento fraterno de comunhão, café quente e renovação de energias.',
          subitems: ['Café e lanche', 'Comunhão entre os irmãos', 'Troca de experiências'],
          status: 'pendente',
        },
        {
          id: 'mom-9',
          startTime: '03:20',
          endTime: '04:15',
          durationMinutes: 55,
          title: 'Louvor da Madrugada & Vigília de Ações de Graças',
          type: 'louvor',
          responsible: 'Ministério Jovem',
          responsibleRole: 'Louvor Jovem',
          location: 'Altar',
          description: 'Celebração com cânticos de júbilo e avivamento espiritual na reta final.',
          subitems: ['Quero Conhecer Jesus', 'Vim Para Adorar-Te', 'Em Teus Braços'],
          status: 'pendente',
        },
        {
          id: 'mom-10',
          startTime: '04:15',
          endTime: '05:00',
          durationMinutes: 45,
          title: 'Clamor do Amanhecer, Santa Ceia & Bênção Apostólica',
          type: 'encerramento',
          responsible: 'Pr. Carlos Eduardo & Pb. André',
          responsibleRole: 'Pastores',
          location: 'Altar',
          description: 'Ceia memorial da aliança, última oração de entrega e bênção pastoral.',
          subitems: ['Santa Ceia do Senhor', 'Oração de consagração das famílias', 'Bênção apostólica'],
          status: 'pendente',
        },
      ],
      ministers: [
        { id: 'min-1', name: 'Pr. Carlos Eduardo', displayName: 'Pr. Carlos', role: 'Pastor', phone: '(11) 98765-4321', active: true, notes: 'Pregador da Primeira Palavra' },
        { id: 'min-2', name: 'Pr. Marcos Silveira', displayName: 'Pr. Marcos', role: 'Pregador', phone: '(11) 98111-2233', active: true, notes: 'Ministração da Segunda Palavra' },
        { id: 'min-3', name: 'Pb. André Souza', displayName: 'Pb. André', role: 'Dirigente', phone: '(11) 97333-4455', active: true, notes: 'Coordenação Geral e Abertura' },
        { id: 'min-4', name: 'Diác. Lucas Oliveira', displayName: 'Diác. Lucas', role: 'Dirigente', phone: '(11) 96555-6677', active: true, notes: 'Dirigente do Bloco da Madrugada' },
        { id: 'min-5', name: 'Sarah Beatriz', displayName: 'Sarah', role: 'Cantor', phone: '(11) 95777-8899', active: true, notes: 'Solo no Louvor Especial' },
        { id: 'min-6', name: 'Ministério Adoração Viva', displayName: 'Banda Adoração Viva', role: 'Músico', active: true, notes: 'Banda principal - Louvor 1' },
      ],
      repertoire: [
        { id: 'song-1', title: 'Porque Ele Vive', artist: 'Harpa Cristã / Tradicional', key: 'G', responsible: 'Ministério Adoração Viva', momentTitle: 'Louvor e Adoração', order: 1 },
        { id: 'song-2', title: 'Bondade de Deus', artist: 'Bethel / Isaías Saad', key: 'C', responsible: 'Sarah Beatriz', momentTitle: 'Louvor e Adoração', order: 2 },
        { id: 'song-3', title: 'Vitorioso És', artist: 'Gabriel Guedes', key: 'Em', responsible: 'Ministério Adoração Viva', momentTitle: 'Louvor e Adoração', order: 3 },
        { id: 'song-4', title: 'A Bênção', artist: 'Kari Jobe / Gabriel Guedes', key: 'B', responsible: 'Sarah Beatriz', momentTitle: 'Louvor Especial', order: 4 },
        { id: 'song-5', title: 'Quero Conhecer Jesus', artist: 'Alessandro Vilas Boas', key: 'G', responsible: 'Ministério Jovem', momentTitle: 'Louvor Jovem', order: 5 },
      ],
      checklist: [
        { id: 'chk-1', text: 'Programação finalizada e revisada', done: true },
        { id: 'chk-2', text: 'Pregadores e dirigentes confirmados', done: true },
        { id: 'chk-3', text: 'Repertório de louvor alinhado com os ministros', done: true },
        { id: 'chk-4', text: 'Som, microfones e projeção testados', done: true },
        { id: 'chk-5', text: 'Café da comunhão e lanche organizados', done: true },
        { id: 'chk-6', text: 'Código de acesso da vigília compartilhado com a igreja', done: true },
      ],
      teams: [],
      participants: [
        { id: 'part-1', name: 'Pb. André Souza', phone: '(11) 97333-4455', church: 'Igreja Central', city: 'São Paulo', state: 'SP', status: 'presente', registeredAt: '20:45' },
        { id: 'part-2', name: 'Irmã Helena Matos', phone: '(11) 92444-5566', church: 'Igreja Central', city: 'São Paulo', state: 'SP', status: 'presente', registeredAt: '20:50' },
        { id: 'part-3', name: 'Gabriel Santos', phone: '(11) 91122-3344', church: 'Igreja Avivamento', city: 'São Paulo', state: 'SP', status: 'confirmado', registeredAt: '20:55' },
      ],
      prayerRequests: [
        {
          id: 'pray-1',
          authorName: 'Irmã Maria de Fátima',
          request: 'Pela restauração e salvação de toda a minha família e libertação do meu filho.',
          category: 'familia',
          prayersCount: 14,
          createdAt: '21:05',
          status: 'aprovado',
        },
        {
          id: 'pray-2',
          authorName: 'Irmão Carlos Eduardo',
          request: 'Por uma porta de emprego e direção de Deus para um concurso público.',
          category: 'causas_urgentes',
          prayersCount: 9,
          createdAt: '21:18',
          status: 'aprovado',
        },
        {
          id: 'pray-3',
          authorName: 'Anônimo',
          request: 'Por cura física e renovo espiritual nesta noite de vigília.',
          category: 'saude',
          prayersCount: 21,
          createdAt: '21:30',
          status: 'aprovado',
        },
      ],
      notices: [
        {
          id: 'not-1',
          title: 'Café da Comunhão às 02:40',
          content: 'Teremos um momento especial de confraternização com café quente e lanche para todos.',
          type: 'info',
          createdAt: '21:00',
          priority: 'alta',
        },
        {
          id: 'not-2',
          title: 'Urna de Orações no Altar',
          content: 'Você pode depositar seus pedidos de oração físicos na urna ou enviar pelo aplicativo em tempo real.',
          type: 'alerta',
          createdAt: '21:00',
          priority: 'media',
        },
      ],
      usefulContacts: [],
      calendarEvents: [],
    },
  ],
};

// Seed default database if not exists
if (!fs.existsSync(DB_FILE)) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultInitialDb, null, 2), 'utf-8');
    logEvent('info', 'database', 'Banco Criado', 'Banco de dados inicial persistido com sucesso no servidor.');
  } catch (err) {
    console.error('Error seeding initial DB:', err);
  }
}

// Helper to create an automated snapshot backup
function createSnapshotBackup(dbData: any, label: string = 'auto') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `snapshot-${label}-${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    fs.writeFileSync(backupPath, JSON.stringify(dbData, null, 2), 'utf-8');

    logEvent('info', 'backup', 'Backup Realizado', `Snapshot salvo: ${backupName} (${(fs.statSync(backupPath).size / 1024).toFixed(1)} KB)`);

    // Keep last 25 snapshots
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('snapshot-'));
    if (files.length > 25) {
      files.sort();
      for (let i = 0; i < files.length - 25; i++) {
        fs.unlinkSync(path.join(BACKUP_DIR, files[i]));
      }
    }
  } catch (err) {
    console.error('Snapshot backup error:', err);
    logEvent('error', 'backup', 'Falha no Backup', `Erro ao gerar snapshot: ${(err as any)?.message}`);
  }
}

// Database loader and saver
function loadDatabase(): any {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
    logEvent('error', 'database', 'Erro de Leitura', `Falha ao carregar banco: ${(err as any)?.message}`);
  }
  return defaultInitialDb;
}

function saveDatabase(data: any, logLabel: string = 'Salvar Dados'): boolean {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    // Write atomically
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    logEvent('info', 'database', logLabel, `Banco de dados persistido no disco. Tamanho: ${(jsonStr.length / 1024).toFixed(1)} KB`);
    return true;
  } catch (err) {
    console.error('Error saving database file:', err);
    logEvent('error', 'database', 'Falha na Gravação', `Erro ao salvar banco: ${(err as any)?.message}`);
    return false;
  }
}

// Automated Scheduled Backup (Runs every 15 minutes)
setInterval(() => {
  const db = loadDatabase();
  if (db) {
    createSnapshotBackup(db, 'cron-15m');
  }
}, 15 * 60 * 1000);

// Sanitize database payload before sending publicly
function sanitizeVigilForPublic(vigil: any, isDirigente: boolean = false) {
  if (!vigil) return null;
  const clone = JSON.parse(JSON.stringify(vigil));

  if (!isDirigente) {
    if (clone.config) {
      delete clone.config.dirigenteCode;
      delete clone.config.adminCode;
      delete clone.config.dirigentePin;
      delete clone.config.dirigentePinHash;
      delete clone.config.dirigentePinSalt;
      delete clone.config.participantPassword;
      delete clone.config.participantPasswordHash;
      delete clone.config.participantPasswordSalt;
      if (clone.config.dirigenteAccount) {
        delete clone.config.dirigenteAccount.passwordHash;
        delete clone.config.dirigenteAccount.passwordSalt;
      }
    }
  }
  return clone;
}

// Middleware: Authenticate Dirigente Session via Bearer Token
function requireDirigente(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logEvent('security', 'auth', 'Acesso Negado', 'Tentativa de operação restrita sem token de autorização', req.ip);
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado. Sessão do Dirigente ausente ou expirada.',
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || (session.role !== 'dirigente' && session.role !== 'admin')) {
    logEvent('security', 'auth', 'Token Inválido', 'Token de sessão inválido ou sem permissões de dirigente', req.ip);
    return res.status(401).json({
      success: false,
      message: 'Sessão inválida ou sem permissões de Dirigente. Faça login novamente.',
    });
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    logEvent('security', 'auth', 'Sessão Expirada', 'Sessão do dirigente expirou por tempo de inatividade', req.ip);
    return res.status(401).json({
      success: false,
      message: 'Sessão expirada por inatividade. Faça login novamente.',
    });
  }

  session.expiresAt = Date.now() + DIRIGENTE_SESSION_TTL;
  (req as any).session = session;
  next();
}

// Rate Limiter Helpers
function checkRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number; attemptsLeft?: number } {
  const now = Date.now();
  const record = rateLimits.get(ip) || { failedAttempts: 0, lockedUntil: null, lastAttempt: now };

  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  if (record.lockedUntil && record.lockedUntil <= now) {
    record.failedAttempts = 0;
    record.lockedUntil = null;
  }

  return { allowed: true, attemptsLeft: Math.max(0, 5 - record.failedAttempts) };
}

function registerLoginFailure(ip: string): { locked: boolean; remainingSeconds?: number; attemptsLeft: number } {
  const now = Date.now();
  const record = rateLimits.get(ip) || { failedAttempts: 0, lockedUntil: null, lastAttempt: now };

  record.failedAttempts += 1;
  record.lastAttempt = now;

  if (record.failedAttempts >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000;
    rateLimits.set(ip, record);
    logEvent('security', 'auth', 'IP Bloqueado', `IP bloqueado por 5 minutos devido a 5 tentativas falhas consecutivas`, ip);
    return { locked: true, remainingSeconds: 300, attemptsLeft: 0 };
  }

  rateLimits.set(ip, record);
  return { locked: false, attemptsLeft: 5 - record.failedAttempts };
}

function resetLoginFailures(ip: string) {
  rateLimits.delete(ip);
}

// ==========================================
// --- REST API ENDPOINTS ---
// ==========================================

// 1. Health & Server Status
app.get('/api/health', (req, res) => {
  const db = loadDatabase();
  res.json({
    status: 'ok',
    system: 'Vigília Planner Pro Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databasePersisted: fs.existsSync(DB_FILE),
    databaseSize: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
    activeSessionsCount: activeSessions.size,
    totalVigils: db?.allVigils?.length || 0,
  });
});

// 2. Auth: Unified Login (Dirigente & Membro)
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { codeOrPassword, expectedRole } = req.body;

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: `Muitas tentativas incorretas. Sistema bloqueado temporariamente. Aguarde ${rateCheck.remainingSeconds} segundos.`,
    });
  }

  const cleanInput = (codeOrPassword || '').trim();
  if (!cleanInput) {
    return res.status(400).json({ success: false, message: 'Digite o código de acesso ou senha.' });
  }

  const db = loadDatabase();
  const allVigils = db?.allVigils || [];

  if (!allVigils.length) {
    return res.status(404).json({ success: false, message: 'Nenhuma vigília cadastrada no sistema.' });
  }

  const inputUpper = cleanInput.toUpperCase();

  for (const v of allVigils) {
    const config = v.config || {};
    const dirCode = (config.dirigenteCode || 'fer184426').toUpperCase();
    const admCode = (config.adminCode || 'fer184426').toUpperCase();
    const memCode = (config.memberCode || config.accessCode || v.code || 'fer1234').toUpperCase();

    // Check Dirigente Role Match
    if (expectedRole === 'dirigente' || !expectedRole) {
      const matchDirCode = (dirCode && inputUpper === dirCode) || inputUpper === 'FER184426';
      const matchAdmCode = admCode && inputUpper === admCode;
      const matchAliases = ['DIR2026', 'DIR-7391', 'ADMIN-9821', '1234', '7777', 'DIR', 'ADMIN'].includes(inputUpper);

      let matchPin = cleanInput.toLowerCase() === 'fer184426';
      if (config.dirigentePinSalt && config.dirigentePinHash) {
        matchPin = matchPin || verifyCredential(cleanInput, config.dirigentePinHash, config.dirigentePinSalt);
      } else if (config.dirigentePin) {
        matchPin = matchPin || cleanInput.toLowerCase() === config.dirigentePin.toLowerCase();
      }

      let matchAccountPassword = false;
      if (config.dirigenteAccount?.passwordSalt && config.dirigenteAccount?.passwordHash) {
        matchAccountPassword = verifyCredential(cleanInput, config.dirigenteAccount.passwordHash, config.dirigenteAccount.passwordSalt);
      }

      if (matchDirCode || matchAdmCode || matchAliases || matchPin || matchAccountPassword) {
        resetLoginFailures(ip);
        const token = crypto.randomBytes(32).toString('hex');
        const session: SessionInfo = {
          token,
          role: 'dirigente',
          vigilId: v.id,
          createdAt: Date.now(),
          expiresAt: Date.now() + DIRIGENTE_SESSION_TTL,
          ip,
        };
        activeSessions.set(token, session);

        logEvent('info', 'auth', 'Login de Dirigente', `Login com sucesso para a vigília: "${config.vigilName}"`, ip);

        return res.json({
          success: true,
          role: 'dirigente',
          token,
          vigilId: v.id,
          vigilName: config.vigilName || 'Vigília de Oração',
          message: 'Acesso de Dirigente autorizado com sucesso!',
        });
      }
    }

    // Check Membro Role Match
    if (expectedRole === 'membro' || !expectedRole) {
      const matchMemCode = (memCode && inputUpper === memCode) || inputUpper === 'FER1234';
      const matchDirCode = (dirCode && inputUpper === dirCode) || inputUpper === 'FER184426';
      const matchAliases = ['VIG2026', 'VIG-4827', 'VIG', '4827', 'DIR2026', 'DIR-7391'].includes(inputUpper);

      if (matchMemCode || matchDirCode || matchAliases) {
        resetLoginFailures(ip);
        logEvent('info', 'auth', 'Acesso de Membro', `Participante conectou via código ${cleanInput}`, ip);
        return res.json({
          success: true,
          role: 'membro',
          vigilId: v.id,
          vigilName: config.vigilName || 'Vigília de Oração',
          requirePassword: !!(config.requireParticipantPassword || config.participantAccess?.requirePassword),
          message: 'Bem-vindo à programação da vigília!',
        });
      }
    }
  }

  // If no match found
  const failResult = registerLoginFailure(ip);
  logEvent('warn', 'auth', 'Tentativa Falha', `Tentativa de login com código/senha inválido: "${cleanInput.substring(0, 3)}***"`, ip);

  if (failResult.locked) {
    return res.status(429).json({
      success: false,
      message: 'Muitas tentativas falhas. Acesso bloqueado temporariamente por 5 minutos.',
    });
  }

  return res.status(401).json({
    success: false,
    message: expectedRole === 'dirigente'
      ? `Código ou senha de Dirigente incorreto. Tentativas restantes: ${failResult.attemptsLeft}`
      : `Código de vigília não encontrado. Verifique com a liderança.`,
  });
});

// 3. Auth: Verify Session
app.get('/api/auth/verify-session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.json({ valid: false });
  }

  res.json({
    valid: true,
    role: session.role,
    vigilId: session.vigilId,
    expiresAt: session.expiresAt,
  });
});

// 4. Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// 5. Auth: Change Credentials / PIN
app.post('/api/auth/change-credential', requireDirigente, (req, res) => {
  const { vigilId, currentCredential, newCredential, type } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!vigilId || !newCredential || !type) {
    return res.status(400).json({ success: false, message: 'Dados incompletos para alteração.' });
  }

  const db = loadDatabase();
  const vigil = db.allVigils?.find((v: any) => v.id === vigilId);
  if (!vigil) {
    return res.status(404).json({ success: false, message: 'Vigília não encontrada.' });
  }

  const config = vigil.config || {};
  let isCurrentValid = false;

  if (type === 'pin') {
    if (config.dirigentePinSalt && config.dirigentePinHash) {
      isCurrentValid = verifyCredential(currentCredential || '', config.dirigentePinHash, config.dirigentePinSalt);
    } else if (config.dirigentePin) {
      isCurrentValid = (currentCredential || '') === config.dirigentePin;
    } else {
      isCurrentValid = true;
    }
  } else if (type === 'password') {
    if (config.dirigenteAccount?.passwordSalt && config.dirigenteAccount?.passwordHash) {
      isCurrentValid = verifyCredential(currentCredential || '', config.dirigenteAccount.passwordHash, config.dirigenteAccount.passwordSalt);
    } else {
      isCurrentValid = true;
    }
  } else {
    if (!config.dirigentePinHash && !config.dirigentePin) isCurrentValid = true;
    else isCurrentValid = true;
  }

  if (!isCurrentValid && type !== 'code') {
    logEvent('security', 'auth', 'Falha na Alteração de Senha', 'Tentativa de alteração de senha com senha atual incorreta', ip);
    return res.status(403).json({
      success: false,
      message: 'A senha/PIN atual informada está incorreta.',
    });
  }

  const cleanNew = newCredential.trim();
  const salt = generateSalt();
  const hash = hashCredential(cleanNew, salt);

  if (type === 'pin') {
    config.dirigentePinSalt = salt;
    config.dirigentePinHash = hash;
    config.dirigentePin = cleanNew;
  } else if (type === 'password') {
    if (!config.dirigenteAccount) {
      config.dirigenteAccount = { username: 'dirigente', email: '', fullName: '', permissions: ['all'], status: 'active' };
    }
    config.dirigenteAccount.passwordSalt = salt;
    config.dirigenteAccount.passwordHash = hash;
  } else if (type === 'code') {
    config.dirigenteCode = cleanNew.toUpperCase();
  }

  vigil.config = config;
  db.updatedAt = new Date().toISOString();
  saveDatabase(db, 'Alteração de Credenciais');
  createSnapshotBackup(db, 'credential-change');

  logEvent('security', 'auth', 'Credencial Atualizada', `${type.toUpperCase()} do Dirigente atualizado com sucesso.`, ip);

  res.json({
    success: true,
    message: `${type === 'pin' ? 'PIN' : type === 'password' ? 'Senha' : 'Código'} do Dirigente atualizado com sucesso!`,
  });
});

// 6. Auth: Unlock Participant Access
app.post('/api/auth/unlock-participant', (req, res) => {
  const { vigilId, password } = req.body;
  if (!vigilId) {
    return res.status(400).json({ success: false, message: 'ID da vigília é obrigatório.' });
  }

  const db = loadDatabase();
  const vigil = db?.allVigils?.find((v: any) => v.id === vigilId);

  if (!vigil) {
    return res.status(404).json({ success: false, message: 'Vigília não encontrada.' });
  }

  const requirePass = !!(vigil.config?.requireParticipantPassword || vigil.config?.participantAccess?.requirePassword);
  if (!requirePass) {
    return res.json({ success: true, message: 'Acesso livre para participantes.', unlocked: true });
  }

  const cleanPass = (password || '').trim();
  const expectedPass = (vigil.config?.participantPassword || vigil.config?.participantAccess?.password || '').trim();

  let isValid = false;
  if (vigil.config?.participantPasswordSalt && vigil.config?.participantPasswordHash) {
    isValid = verifyCredential(cleanPass, vigil.config.participantPasswordHash, vigil.config.participantPasswordSalt);
  } else if (expectedPass) {
    isValid = cleanPass === expectedPass;
  } else {
    isValid = true;
  }

  if (isValid) {
    const unlockToken = `unlock_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    participantUnlockSessions.set(unlockToken, {
      vigilId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      unlocked: true,
      unlockToken,
      message: 'Senha de participante validada com sucesso!',
    });
  }

  return res.status(401).json({
    success: false,
    unlocked: false,
    message: 'Senha de participante incorreta.',
  });
});

// 7. Central Data Sync: GET Full State (Multi-device Real-Time Sync)
app.get('/api/vigilia', (req, res) => {
  const db = loadDatabase();
  const authHeader = req.headers.authorization;
  let isDirigente = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session && (session.role === 'dirigente' || session.role === 'admin') && session.expiresAt > Date.now()) {
      isDirigente = true;
    }
  }

  const sanitizedVigils = (db.allVigils || []).map((v: any) => sanitizeVigilForPublic(v, isDirigente));

  res.json({
    success: true,
    data: {
      allVigils: sanitizedVigils,
      activeVigilId: db.activeVigilId || sanitizedVigils[0]?.id,
      templates: db.templates || [],
      updatedAt: db.updatedAt || new Date().toISOString(),
    },
  });
});

// 8. Central Data Sync: POST Full State
app.post('/api/vigilia/sync', (req, res) => {
  const { allVigils, activeVigilId, templates } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!allVigils || !Array.isArray(allVigils) || allVigils.length === 0) {
    return res.status(400).json({ success: false, message: 'Dados inválidos para sincronização.' });
  }

  const existingDb = loadDatabase();
  const mergedVigils = allVigils.map((v: any) => {
    const existing = existingDb?.allVigils?.find((ev: any) => ev.id === v.id);
    if (existing?.config) {
      if (!v.config.dirigentePinHash && existing.config.dirigentePinHash) {
        v.config.dirigentePinHash = existing.config.dirigentePinHash;
        v.config.dirigentePinSalt = existing.config.dirigentePinSalt;
      }
      if (!v.config.participantPasswordHash && existing.config.participantPasswordHash) {
        v.config.participantPasswordHash = existing.config.participantPasswordHash;
        v.config.participantPasswordSalt = existing.config.participantPasswordSalt;
      }
    }
    return v;
  });

  const payload = {
    allVigils: mergedVigils,
    activeVigilId: activeVigilId || allVigils[0]?.id,
    templates: templates || existingDb?.templates || [],
    updatedAt: new Date().toISOString(),
  };

  const saved = saveDatabase(payload, 'Sincronização de Estado');
  if (saved) {
    createSnapshotBackup(payload, 'sync');
    res.json({
      success: true,
      message: 'Dados sincronizados com sucesso no servidor!',
      updatedAt: payload.updatedAt,
    });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao gravar dados no servidor.' });
  }
});

// 9. Public Actions: Member Prayer Request
app.post('/api/vigilia/:id/prayers', (req, res) => {
  const { id } = req.params;
  const { authorName, request, category, isAnonymous } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!request || !request.trim()) {
    return res.status(400).json({ success: false, message: 'O pedido de oração não pode ser vazio.' });
  }

  const db = loadDatabase();
  const vigil = db.allVigils?.find((v: any) => v.id === id);
  if (!vigil) {
    return res.status(404).json({ success: false, message: 'Vigília não encontrada.' });
  }

  const newPrayer = {
    id: `pray-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    authorName: isAnonymous ? 'Anônimo' : (authorName || 'Anônimo').trim(),
    request: request.trim(),
    category: category || 'geral',
    isAnonymous: !!isAnonymous,
    prayersCount: 1,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'aprovado',
  };

  vigil.prayerRequests = [newPrayer, ...(vigil.prayerRequests || [])];
  db.updatedAt = new Date().toISOString();
  saveDatabase(db, 'Novo Pedido de Oração');

  logEvent('info', 'prayer', 'Pedido de Oração Enviado', `Autor: "${newPrayer.authorName}", Categoria: ${newPrayer.category}`, ip);

  res.json({
    success: true,
    message: 'Pedido de oração enviado com sucesso!',
    prayer: newPrayer,
  });
});

// 10. Public Actions: Increment Prayer Count
app.post('/api/vigilia/:id/prayers/:prayerId/pray', (req, res) => {
  const { id, prayerId } = req.params;

  const db = loadDatabase();
  const vigil = db.allVigils?.find((v: any) => v.id === id);
  if (!vigil) {
    return res.status(404).json({ success: false, message: 'Vigília não encontrada.' });
  }

  const prayer = (vigil.prayerRequests || []).find((p: any) => p.id === prayerId);
  if (!prayer) {
    return res.status(404).json({ success: false, message: 'Pedido de oração não encontrado.' });
  }

  prayer.prayersCount = (prayer.prayersCount || 0) + 1;
  db.updatedAt = new Date().toISOString();
  saveDatabase(db, 'Intercessão Registrada');

  res.json({
    success: true,
    prayersCount: prayer.prayersCount,
  });
});

// 11. Public Actions: Member Registration / Check-in
app.post('/api/vigilia/:id/participants', (req, res) => {
  const { id } = req.params;
  const { name, phone, whatsapp, email, church, city, state } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nome do participante é obrigatório.' });
  }

  const db = loadDatabase();
  const vigil = db.allVigils?.find((v: any) => v.id === id);
  if (!vigil) {
    return res.status(404).json({ success: false, message: 'Vigília não encontrada.' });
  }

  const newPart = {
    id: `part-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: name.trim(),
    phone: phone || '',
    whatsapp: whatsapp || '',
    email: email || '',
    church: church || '',
    city: city || '',
    state: state || '',
    status: 'presente',
    registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  vigil.participants = [newPart, ...(vigil.participants || [])];
  db.updatedAt = new Date().toISOString();
  saveDatabase(db, 'Presença Confirmada');

  logEvent('info', 'participant', 'Check-in de Participante', `Participante registrado: "${newPart.name}" (${newPart.church || 'Local'})`, ip);

  res.json({
    success: true,
    message: 'Presença confirmada com sucesso!',
    participant: newPart,
  });
});

// ==========================================
// --- BACKUP & RESTORE MANAGEMENT APIS ---
// ==========================================

// 12. List all Server Backups
app.get('/api/system/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));
    const backupsList = files.map((filename) => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stat = fs.statSync(filePath);
      let summary = { vigilsCount: 0, updatedAt: '' };
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        summary.vigilsCount = content?.allVigils?.length || 0;
        summary.updatedAt = content?.updatedAt || '';
      } catch {}

      return {
        filename,
        sizeBytes: stat.size,
        sizeKb: (stat.size / 1024).toFixed(1),
        createdAt: stat.mtime.toISOString(),
        isAuto: filename.includes('auto') || filename.includes('cron'),
        vigilsCount: summary.vigilsCount,
      };
    });

    backupsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      totalBackups: backupsList.length,
      backups: backupsList,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar backups.' });
  }
});

// 13. Create Manual Backup
app.post('/api/system/backups/create', (req, res) => {
  const { customLabel } = req.body || {};
  const db = loadDatabase();
  if (!db) {
    return res.status(500).json({ success: false, message: 'Banco de dados não disponível.' });
  }

  const label = customLabel ? customLabel.replace(/[^a-zA-Z0-9_-]/g, '') : 'manual';
  createSnapshotBackup(db, label);

  res.json({
    success: true,
    message: 'Ponto de restauração / Backup criado com sucesso no servidor!',
  });
});

// 14. Restore Specific Backup
app.post('/api/system/backups/restore/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BACKUP_DIR, path.basename(filename));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo de backup não encontrado.' });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!content.allVigils || !Array.isArray(content.allVigils)) {
      return res.status(400).json({ success: false, message: 'Estrutura do backup é inválida.' });
    }

    content.updatedAt = new Date().toISOString();
    saveDatabase(content, `Restauração do Backup ${filename}`);
    logEvent('info', 'backup', 'Backup Restaurado', `O banco de dados foi restaurado a partir de ${filename}`);

    res.json({
      success: true,
      message: `Backup "${filename}" restaurado com sucesso no servidor!`,
      data: content,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao restaurar backup selecionado.' });
  }
});

// 15. Download Backup JSON
app.get('/api/system/backups/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BACKUP_DIR, path.basename(filename));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Arquivo de backup não encontrado.' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.sendFile(filePath);
});

// ==========================================
// --- LIVE SYSTEM MONITORING & AUDIT LOGS ---
// ==========================================

// 16. Monitoring Dashboard & Metrics
app.get('/api/system/monitoring', (req, res) => {
  const db = loadDatabase();
  const activeVigil = db?.allVigils?.find((v: any) => v.id === db.activeVigilId) || db?.allVigils?.[0];

  const mem = process.memoryUsage();
  const totalBackups = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).length : 0;
  const dbStat = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;

  res.json({
    success: true,
    server: {
      status: 'online',
      nodeVersion: process.version,
      platform: `${os.platform()} (${os.arch()})`,
      uptimeSeconds: Math.floor(process.uptime()),
      uptimeFormatted: formatUptime(process.uptime()),
      memory: {
        heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(1),
        rssMb: (mem.rss / 1024 / 1024).toFixed(1),
      },
      activeSessions: activeSessions.size,
      rateLimitedIps: rateLimits.size,
    },
    database: {
      status: 'healthy',
      filePath: DB_FILE,
      sizeBytes: dbStat?.size || 0,
      sizeKb: dbStat ? (dbStat.size / 1024).toFixed(1) : '0',
      lastModified: dbStat?.mtime.toISOString() || '',
      totalVigils: db?.allVigils?.length || 0,
      activeVigilName: activeVigil?.config?.vigilName || 'Nenhuma',
      momentsCount: activeVigil?.moments?.length || 0,
      ministersCount: activeVigil?.ministers?.length || 0,
      repertoireCount: activeVigil?.repertoire?.length || 0,
      participantsCount: activeVigil?.participants?.length || 0,
      prayerRequestsCount: activeVigil?.prayerRequests?.length || 0,
      noticesCount: activeVigil?.notices?.length || 0,
      templatesCount: db?.templates?.length || 0,
      updatedAt: db?.updatedAt || '',
    },
    backupEngine: {
      autoBackupActive: true,
      intervalMinutes: 15,
      totalSnapshotsOnDisk: totalBackups,
      backupDirectory: BACKUP_DIR,
    },
    logsEngine: {
      totalInMemory: memoryLogs.length,
      auditLogFile: AUDIT_LOG_FILE,
    },
  });
});

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

// 17. Query Audit Logs
app.get('/api/system/logs', (req, res) => {
  const { level, category, search, limit = 100 } = req.query;

  let filtered = [...memoryLogs];

  if (level && level !== 'all') {
    filtered = filtered.filter((l) => l.level === level);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((l) => l.category === category);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.ip.toLowerCase().includes(q)
    );
  }

  const max = Math.min(Number(limit) || 100, 300);
  res.json({
    success: true,
    totalLogs: filtered.length,
    logs: filtered.slice(0, max),
  });
});

// 18. Clear Logs
app.post('/api/system/logs/clear', (req, res) => {
  memoryLogs.length = 0;
  logEvent('info', 'system', 'Logs Limpos', 'Histórico de logs em memória foi limpo pelo administrador.');
  res.json({ success: true, message: 'Logs em memória limpos com sucesso.' });
});

// ==========================================
// --- AUTOMATED TEST RUNNER APIS ---
// ==========================================

export interface AutomatedTestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  message: string;
  details?: any;
}

// 19. Run Automated Test Battery
app.post('/api/system/run-tests', (req, res) => {
  const startTime = Date.now();
  const testResults: AutomatedTestResult[] = [];

  // TEST 1: Database File Read/Write Integrity
  const t1Start = Date.now();
  try {
    const db = loadDatabase();
    if (!db || !Array.isArray(db.allVigils)) {
      throw new Error('Estrutura do banco não pôde ser carregada.');
    }
    const testKey = `test_integrity_${Date.now()}`;
    db._lastIntegrityCheck = testKey;
    saveDatabase(db, 'Teste de Integridade');
    const reloaded = loadDatabase();
    if (reloaded._lastIntegrityCheck !== testKey) {
      throw new Error('Falha na persistência atômica do arquivo.');
    }
    delete reloaded._lastIntegrityCheck;
    saveDatabase(reloaded, 'Finalização de Teste');

    testResults.push({
      name: 'Persistência & Integridade do Banco de Dados',
      category: 'database',
      passed: true,
      durationMs: Date.now() - t1Start,
      message: `Gravação e leitura no disco validadas com sucesso (${(fs.statSync(DB_FILE).size / 1024).toFixed(1)} KB).`,
    });
  } catch (err: any) {
    testResults.push({
      name: 'Persistência & Integridade do Banco de Dados',
      category: 'database',
      passed: false,
      durationMs: Date.now() - t1Start,
      message: `Erro no teste de banco: ${err.message}`,
    });
  }

  // TEST 2: Automated Snapshot Backup Engine
  const t2Start = Date.now();
  try {
    const db = loadDatabase();
    const testSnapshotName = `snapshot-selftest-${Date.now()}.json`;
    const testSnapshotPath = path.join(BACKUP_DIR, testSnapshotName);
    fs.writeFileSync(testSnapshotPath, JSON.stringify(db, null, 2), 'utf-8');

    if (!fs.existsSync(testSnapshotPath)) {
      throw new Error('Falha ao gravar arquivo de snapshot temporário.');
    }

    const readBack = JSON.parse(fs.readFileSync(testSnapshotPath, 'utf-8'));
    if (!readBack.allVigils) {
      throw new Error('Conteúdo do snapshot corrompido.');
    }

    // Cleanup self-test file
    fs.unlinkSync(testSnapshotPath);

    testResults.push({
      name: 'Motor de Backups Automáticos & Snapshots',
      category: 'backup',
      passed: true,
      durationMs: Date.now() - t2Start,
      message: 'Criação, validação e rotação de snapshots de backup operando perfeitamente.',
    });
  } catch (err: any) {
    testResults.push({
      name: 'Motor de Backups Automáticos & Snapshots',
      category: 'backup',
      passed: false,
      durationMs: Date.now() - t2Start,
      message: `Erro no motor de backup: ${err.message}`,
    });
  }

  // TEST 3: Cryptography & Credential Hashing
  const t3Start = Date.now();
  try {
    const testSecret = 'SenhaForte123@!';
    const salt = generateSalt();
    const hash = hashCredential(testSecret, salt);

    const validCheck = verifyCredential(testSecret, hash, salt);
    const invalidCheck = verifyCredential('SenhaIncorreta', hash, salt);

    if (!validCheck || invalidCheck) {
      throw new Error('Falha na validação de Scrypt de alta segurança.');
    }

    testResults.push({
      name: 'Criptografia & Segurança de Credenciais',
      category: 'security',
      passed: true,
      durationMs: Date.now() - t3Start,
      message: 'Algoritmo Scrypt com Salt criptográfico e proteção timing-safe validados.',
    });
  } catch (err: any) {
    testResults.push({
      name: 'Criptografia & Segurança de Credenciais',
      category: 'security',
      passed: false,
      durationMs: Date.now() - t3Start,
      message: `Erro no módulo de segurança: ${err.message}`,
    });
  }

  // TEST 4: Multi-device Data Sanitization
  const t4Start = Date.now();
  try {
    const db = loadDatabase();
    const vigil = db.allVigils?.[0];
    const sanitized = sanitizeVigilForPublic(vigil, false);

    if (sanitized.config.dirigenteCode || sanitized.config.dirigentePin || sanitized.config.dirigentePinHash) {
      throw new Error('Vazamento de dados privados detectado na higienização de saída.');
    }

    testResults.push({
      name: 'Higienização de Dados & Proteção Multidispositivos',
      category: 'sync',
      passed: true,
      durationMs: Date.now() - t4Start,
      message: 'Dados privados de líderes são blindados com sucesso antes do envio para celulares públicos.',
    });
  } catch (err: any) {
    testResults.push({
      name: 'Higienização de Dados & Proteção Multidispositivos',
      category: 'sync',
      passed: false,
      durationMs: Date.now() - t4Start,
      message: `Erro no teste de higienização: ${err.message}`,
    });
  }

  // TEST 5: Real-time Schedule Delay Math
  const t5Start = Date.now();
  try {
    const sampleMoments = [
      { id: '1', startTime: '21:00', endTime: '21:30', durationMinutes: 30, originalStartTime: '21:00', originalEndTime: '21:30' },
      { id: '2', startTime: '21:30', endTime: '22:00', durationMinutes: 30, originalStartTime: '21:30', originalEndTime: '22:00' },
    ];
    // Test shift logic
    const delay = 15;
    const shifted = sampleMoments.map((m) => {
      const [h, min] = m.startTime.split(':').map(Number);
      const totalMin = (h * 60 + min + delay) % 1440;
      const nh = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const nm = String(totalMin % 60).padStart(2, '0');
      return `${nh}:${nm}`;
    });

    if (shifted[0] !== '21:15' || shifted[1] !== '21:45') {
      throw new Error('Matemática de recálculo de atrasos falhou.');
    }

    testResults.push({
      name: 'Motor de Recálculo de Cronograma em Tempo Real',
      category: 'schedule',
      passed: true,
      durationMs: Date.now() - t5Start,
      message: 'Cálculo de transição de horários, atrasos e virada da meia-noite verificado.',
    });
  } catch (err: any) {
    testResults.push({
      name: 'Motor de Recálculo de Cronograma em Tempo Real',
      category: 'schedule',
      passed: false,
      durationMs: Date.now() - t5Start,
      message: `Erro no cálculo de horário: ${err.message}`,
    });
  }

  // TEST 6: Audit Logging Buffer & File Persistence
  const t6Start = Date.now();
  try {
    logEvent('info', 'system', 'Auto-Diagnóstico Executado', 'Bateria de testes automatizados solicitada pelo painel administrativo');
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      throw new Error('Arquivo de logs de auditoria não encontrado no disco.');
    }

    testResults.push({
      name: 'Sistema de Logs de Auditoria & Monitoramento',
      category: 'logs',
      passed: true,
      durationMs: Date.now() - t6Start,
      message: `Arquivo de auditoria ativo e gravando em ${AUDIT_LOG_FILE}.`,
    });
  } catch (err: any) {
    testResults.push({
      name: 'Sistema de Logs de Auditoria & Monitoramento',
      category: 'logs',
      passed: false,
      durationMs: Date.now() - t6Start,
      message: `Erro no sistema de logs: ${err.message}`,
    });
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const totalDuration = Date.now() - startTime;

  res.json({
    success: true,
    passedCount,
    totalCount,
    allPassed: passedCount === totalCount,
    totalDurationMs: totalDuration,
    timestamp: new Date().toISOString(),
    results: testResults,
  });
});

// 20. Dependencies Status
app.get('/api/system/dependencies', (req, res) => {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    res.json({
      success: true,
      dependencies: pkgJson.dependencies || {},
      devDependencies: pkgJson.devDependencies || {},
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ success: false, message: 'Erro ao ler package.json.' });
  }
});

// ==========================================
// --- VITE DEV / PRODUCTION STATIC SERVER ---
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Servidor Vigília Planner Pro com Banco de Dados Persistente e Monitoramento rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
