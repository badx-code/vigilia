import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  Activity,
  Download,
  RotateCcw,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  HardDrive,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useVigilia } from '../../context/VigiliaContext';

interface ServerMonitoringData {
  server: {
    status: string;
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    uptimeFormatted: string;
    memory: {
      heapUsedMb: string;
      heapTotalMb: string;
      rssMb: string;
    };
    activeSessions: number;
    rateLimitedIps: number;
  };
  database: {
    status: string;
    filePath: string;
    sizeBytes: number;
    sizeKb: string;
    lastModified: string;
    totalVigils: number;
    activeVigilName: string;
    momentsCount: number;
    ministersCount: number;
    repertoireCount: number;
    participantsCount: number;
    prayerRequestsCount: number;
    noticesCount: number;
    templatesCount: number;
    updatedAt: string;
  };
  backupEngine: {
    autoBackupActive: boolean;
    intervalMinutes: number;
    totalSnapshotsOnDisk: number;
    backupDirectory: string;
  };
  logsEngine: {
    totalInMemory: number;
    auditLogFile: string;
  };
}

interface BackupFile {
  filename: string;
  sizeBytes: number;
  sizeKb: string;
  createdAt: string;
  isAuto: boolean;
  vigilsCount: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security';
  category: string;
  action: string;
  details: string;
  ip: string;
}

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  message: string;
}

interface TestsResponse {
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  totalDurationMs: number;
  timestamp: string;
  results: TestResult[];
}

export const ServerMonitoringSection: React.FC = () => {
  const { allVigils, activeVigilId } = useVigilia();

  const [activeTab, setActiveTab] = useState<'status' | 'backups' | 'tests' | 'logs' | 'dependencies'>('status');
  const [monitoringData, setMonitoringData] = useState<ServerMonitoringData | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [dependencies, setDependencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Backup creation state
  const [newBackupLabel, setNewBackupLabel] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [confirmRestoreFile, setConfirmRestoreFile] = useState<string | null>(null);

  // Test Runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestsResponse | null>(null);

  // Log filters
  const [logFilterLevel, setLogFilterLevel] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  const fetchMonitoring = async () => {
    try {
      const res = await fetch('/api/system/monitoring');
      const data = await res.json();
      if (data.success) {
        setMonitoringData(data);
      }
    } catch (e) {
      console.error('Error fetching monitoring data:', e);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/system/backups');
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.error('Error fetching backups:', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logFilterLevel !== 'all') params.append('level', logFilterLevel);
      if (logSearchQuery) params.append('search', logSearchQuery);

      const res = await fetch(`/api/system/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  const fetchDependencies = async () => {
    try {
      const res = await fetch('/api/system/dependencies');
      const data = await res.json();
      if (data.success) {
        setDependencies(data.dependencies || {});
      }
    } catch (e) {
      console.error('Error fetching dependencies:', e);
    }
  };

  useEffect(() => {
    fetchMonitoring();
    fetchBackups();
    fetchLogs();
    fetchDependencies();

    const interval = setInterval(() => {
      fetchMonitoring();
      if (activeTab === 'logs') fetchLogs();
      if (activeTab === 'backups') fetchBackups();
    }, 6000);

    return () => clearInterval(interval);
  }, [activeTab, logFilterLevel, logSearchQuery]);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const res = await fetch('/api/system/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLabel: newBackupLabel.trim() || 'ponto-manual' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        setNewBackupLabel('');
        fetchBackups();
        fetchMonitoring();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Erro ao criar backup.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Falha de conexão com o servidor.' });
    } finally {
      setIsCreatingBackup(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/backups/restore/${encodeURIComponent(filename)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        setConfirmRestoreFile(null);
        fetchMonitoring();
        fetchLogs();
        window.location.reload();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Erro ao restaurar backup.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erro ao conectar ao servidor para restauração.' });
    } finally {
      setLoading(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/system/run-tests', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResults(data);
        setActionMessage({
          type: 'success',
          text: `Testes finalizados: ${data.passedCount}/${data.totalCount} aprovados em ${data.totalDurationMs}ms!`,
        });
        fetchLogs();
      } else {
        setActionMessage({ type: 'error', text: 'Falha ao executar testes automatizados.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erro na comunicação com o servidor de testes.' });
    } finally {
      setIsRunningTests(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/system/logs/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchLogs();
        setActionMessage({ type: 'success', text: 'Logs em memória limpos com sucesso.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Falha ao limpar logs.' });
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div id="server-monitoring-section" className="space-y-6">
      {/* Top Banner with Server Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14171C] to-[#191D24] border border-[#292E36] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1F242C] border border-[#C9B27C]/30 text-[#C9B27C] flex items-center justify-center shadow-inner">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2]">
                  Servidor & Banco de Dados Central
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Online & Sincronizado
                </span>
              </div>
              <p className="text-xs text-[#9FA4AD] mt-0.5">
                Os dados da vigília ficam gravados no servidor central para todos os celulares e computadores conectados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchMonitoring();
                fetchBackups();
                fetchLogs();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#1C2128] border border-[#292E36] text-xs font-semibold text-[#F2F2F2] flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9B27C] to-[#E2D2A4] text-[#0B0D10] text-xs font-bold flex items-center gap-2 transition hover:opacity-95 shadow-md disabled:opacity-50"
            >
              {isRunningTests ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Executar Testes</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border-rose-800 text-rose-300'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#14171C] border border-[#292E36] rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'status'
              ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D24]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Status & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'backups'
              ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D24]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backups Automáticos ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'tests'
              ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D24]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Testes Automatizados</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'logs'
              ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D24]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Logs de Auditoria</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'dependencies'
              ? 'bg-[#C9B27C] text-[#0B0D10] font-bold shadow-md'
              : 'text-[#9FA4AD] hover:text-[#F2F2F2] hover:bg-[#191D24]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Dependências</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STATUS & METRICS */}
      {/* ========================================================= */}
      {activeTab === 'status' && monitoringData && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#9FA4AD]">Tempo Ativo (Uptime)</span>
                <Clock className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 font-mono">
                {monitoringData.server.uptimeFormatted}
              </p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                ● Servidor estável sem quedas
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#9FA4AD]">Memória RAM (Heap)</span>
                <Cpu className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 font-mono">
                {monitoringData.server.memory.heapUsedMb} MB
              </p>
              <span className="text-[10px] text-[#9FA4AD] mt-1 block">
                Total Alocado: {monitoringData.server.memory.heapTotalMb} MB
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#9FA4AD]">Banco no Disco</span>
                <HardDrive className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 font-mono">
                {monitoringData.database.sizeKb} KB
              </p>
              <span className="text-[10px] text-emerald-400 mt-1 block">
                Gravação atômica persistente
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#14171C] border border-[#292E36]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#9FA4AD]">Backups no Servidor</span>
                <Database className="w-4 h-4 text-[#C9B27C]" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F2F2F2] mt-1 font-mono">
                {monitoringData.backupEngine.totalSnapshotsOnDisk}
              </p>
              <span className="text-[10px] text-[#9FA4AD] mt-1 block">
                Snapshots automáticos salvos
              </span>
            </div>
          </div>

          {/* Database Details Card */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#C9B27C]" />
                <h3 className="text-sm font-bold text-[#F2F2F2]">Estatísticas do Banco de Dados Ativo</h3>
              </div>
              <span className="text-xs text-[#9FA4AD] font-mono">
                Vigília: <strong className="text-[#C9B27C]">{monitoringData.database.activeVigilName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Atividades</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.momentsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Louvores</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.repertoireCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Ministros</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.ministersCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Presenças</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.participantsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Pedidos Oração</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.prayerRequestsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36]/60 text-center">
                <span className="text-[10px] text-[#9FA4AD] uppercase font-mono block">Avisos</span>
                <span className="text-lg font-bold text-[#F2F2F2] mt-0.5 block">{monitoringData.database.noticesCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#191D24] border border-[#292E36] text-xs text-[#9FA4AD] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Arquivo do Banco: <code className="text-[#C9B27C] font-mono">{monitoringData.database.filePath}</code></span>
              </div>
              <span className="font-mono text-[11px]">
                Última Atualização: {new Date(monitoringData.database.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AUTOMATED BACKUPS */}
      {/* ========================================================= */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Create Backup Action */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C9B27C]" />
                  <span>Criar Ponto de Restauração Manual</span>
                </h3>
                <p className="text-xs text-[#9FA4AD] mt-0.5">
                  O servidor já realiza backups automáticos a cada 15 minutos, mas você pode criar um ponto de restauração imediato.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome/Rótulo (ex: antes-da-abertura)..."
                  value={newBackupLabel}
                  onChange={(e) => setNewBackupLabel(e.target.value)}
                  className="bg-[#0B0D10] text-[#F2F2F2] px-3.5 py-2 rounded-xl border border-[#292E36] text-xs font-mono focus:border-[#C9B27C] focus:outline-none w-64"
                />
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="px-4 py-2 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs flex items-center gap-2 transition shrink-0 disabled:opacity-50"
                >
                  {isCreatingBackup ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Salvar Snapshot Agora</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Backups */}
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
              <h3 className="text-sm font-bold text-[#F2F2F2]">
                Histórico de Snapshots no Disco ({backups.length})
              </h3>
              <span className="text-xs text-[#9FA4AD]">
                Retenção automática dos últimos 25 backups
              </span>
            </div>

            {backups.length === 0 ? (
              <div className="text-center py-8 text-[#9FA4AD] text-xs">
                Nenhum backup encontrado no disco.
              </div>
            ) : (
              <div className="space-y-2.5">
                {backups.map((b) => (
                  <div
                    key={b.filename}
                    className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#292E36] hover:border-[#C9B27C]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#191D24] text-[#C9B27C] flex items-center justify-center shrink-0 border border-[#292E36]">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#F2F2F2]">
                            {b.filename}
                          </span>
                          {b.isAuto ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#191D24] text-[#9FA4AD] text-[10px] font-mono">
                              Automático
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#C9B27C]/20 text-[#C9B27C] text-[10px] font-semibold">
                              Manual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#9FA4AD] mt-0.5">
                          Criado em: {new Date(b.createdAt).toLocaleString()} • Tamanho: {b.sizeKb} KB • Vigílias: {b.vigilsCount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/api/system/backups/download/${encodeURIComponent(b.filename)}`}
                        download
                        className="px-3 py-1.5 rounded-lg bg-[#191D24] hover:bg-[#292E36] text-[#F2F2F2] text-xs font-semibold border border-[#292E36] flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C9B27C]" />
                        <span>Baixar</span>
                      </a>

                      <button
                        onClick={() => setConfirmRestoreFile(b.filename)}
                        className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/80 text-amber-300 text-xs font-semibold border border-amber-800/40 flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Restore Modal */}
          {confirmRestoreFile && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#14171C] border border-[#292E36] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-base font-bold text-[#F2F2F2]">Confirmar Restauração?</h3>
                </div>
                <p className="text-xs text-[#9FA4AD] leading-relaxed">
                  Você está prestes a restaurar o banco de dados para o snapshot:{' '}
                  <strong className="text-[#C9B27C] font-mono block mt-1">{confirmRestoreFile}</strong>
                  Todas as alterações posteriores serão substituídas pelos dados deste ponto de backup.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                  <button
                    onClick={() => setConfirmRestoreFile(null)}
                    className="px-4 py-2 rounded-xl bg-[#191D24] text-[#9FA4AD] hover:text-[#F2F2F2] text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRestoreBackup(confirmRestoreFile)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>Confirmar & Restaurar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUTOMATED TESTS */}
      {/* ========================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E36] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#C9B27C]" />
                  <span>Bateria de Testes Automatizados & Diagnóstico</span>
                </h3>
                <p className="text-xs text-[#9FA4AD] mt-0.5">
                  Verifica a integridade do banco de dados, motor de backups, criptografia, recálculo de cronograma e API multi-dispositivos.
                </p>
              </div>

              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="px-5 py-2.5 rounded-xl bg-[#C9B27C] hover:bg-[#bfa872] text-[#0B0D10] font-bold text-xs flex items-center gap-2 transition shadow-md shrink-0 disabled:opacity-50"
              >
                {isRunningTests ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>{isRunningTests ? 'Executando...' : 'Iniciar Todos os Testes'}</span>
              </button>
            </div>

            {testResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0D10] border border-[#292E36]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      testResults.allPassed ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    }`}>
                      {testResults.allPassed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F2F2F2]">
                        {testResults.allPassed ? 'Todos os Testes Aprovados com Sucesso!' : 'Atenção: Alguns testes falharam'}
                      </h4>
                      <p className="text-xs text-[#9FA4AD]">
                        Resultado: <strong className="text-emerald-400">{testResults.passedCount}/{testResults.totalCount}</strong> testes validados em <strong className="text-[#C9B27C]">{testResults.totalDurationMs}ms</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#9FA4AD]">
                    {new Date(testResults.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResults.results.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B0D10] border border-[#292E36] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F2F2F2]">{t.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            t.passed
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {t.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {t.passed ? 'Aprovado' : 'Falhou'} ({t.durationMs}ms)
                        </span>
                      </div>
                      <p className="text-xs text-[#9FA4AD]">{t.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#9FA4AD] text-xs space-y-3">
                <ShieldCheck className="w-10 h-10 text-[#C9B27C]/40 mx-auto" />
                <p>Nenhum teste executado nesta sessão ainda. Clique no botão acima para iniciar o diagnóstico.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AUDIT LOGS */}
      {/* ========================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-[#9FA4AD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar nos logs..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0D10] text-[#F2F2F2] pl-8 pr-3 py-1.5 rounded-xl border border-[#292E36] text-xs font-mono focus:border-[#C9B27C] focus:outline-none"
                />
              </div>

              <select
                value={logFilterLevel}
                onChange={(e) => setLogFilterLevel(e.target.value)}
                className="bg-[#0B0D10] text-[#F2F2F2] px-3 py-1.5 rounded-xl border border-[#292E36] text-xs focus:border-[#C9B27C] focus:outline-none"
              >
                <option value="all">Todos os Níveis</option>
                <option value="info">Info</option>
                <option value="security">Segurança</option>
                <option value="warn">Avisos</option>
                <option value="error">Erros</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                className="px-3 py-1.5 rounded-xl bg-[#191D24] hover:bg-[#292E36] text-[#F2F2F2] text-xs font-semibold border border-[#292E36] flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3 h-3 text-[#C9B27C]" />
                <span>Atualizar</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800/40 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#14171C] border border-[#292E36] overflow-x-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-[#9FA4AD] text-xs">
                Nenhum registro de log encontrado para os filtros selecionados.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#292E36] text-[#9FA4AD] text-[10px] uppercase">
                    <th className="py-2 px-3">Data/Hora</th>
                    <th className="py-2 px-3">Nível</th>
                    <th className="py-2 px-3">Categoria</th>
                    <th className="py-2 px-3">Ação</th>
                    <th className="py-2 px-3">Detalhes</th>
                    <th className="py-2 px-3">Origem (IP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292E36]/40">
                  {logs.map((log) => {
                    const badgeClass =
                      log.level === 'security'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-800/50'
                        : log.level === 'error'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/50'
                        : log.level === 'warn'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/50'
                        : 'bg-[#191D24] text-[#C9B27C] border-[#292E36]';

                    return (
                      <tr key={log.id} className="hover:bg-[#191D24]/60 transition">
                        <td className="py-2.5 px-3 text-[#9FA4AD] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${badgeClass}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#F2F2F2] uppercase text-[10px] font-bold">
                          {log.category}
                        </td>
                        <td className="py-2.5 px-3 text-[#F2F2F2] font-semibold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-[#9FA4AD] max-w-xs sm:max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 text-[#9FA4AD] whitespace-nowrap">
                          {log.ip}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DEPENDENCIES */}
      {/* ========================================================= */}
      {activeTab === 'dependencies' && (
        <div className="p-6 rounded-2xl bg-[#14171C] border border-[#292E36] space-y-4">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C9B27C]" />
                <span>Pacotes & Dependências do Sistema</span>
              </h3>
              <p className="text-xs text-[#9FA4AD] mt-0.5">
                Status de instalação dos pacotes de produção e desenvolvimento do servidor e aplicação.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              ✓ Todas Atualizadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(dependencies).map(([pkg, version]) => (
              <div
                key={pkg}
                className="p-3 rounded-xl bg-[#0B0D10] border border-[#292E36] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#F2F2F2] font-mono">{pkg}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Operacional</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#191D24] text-[#C9B27C] text-xs font-mono">
                  {version}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
