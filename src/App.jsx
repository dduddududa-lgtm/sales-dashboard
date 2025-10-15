import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, Phone, Calendar, CheckCircle, Target, AlertTriangle, Download, Save, Clock, Filter, X, Upload, Plus, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blmbcmyzwokxfxzlhwtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWJjbXl6d29reGZ4emxod3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTU1MDksImV4cCI6MjA3NTk5MTUwOX0.JTVTP-YAXIQBBChTExqApyjJ50ECL9svsOta82bfswg';
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard = () => {
  const [mode, setMode] = useState('v1.0');
  const [period, setPeriod] = useState(30);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [filters, setFilters] = useState({
    theme: 'all',
    channel: 'all',
    campaign: 'all',
    week: 'all'
  });
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholds, setThresholds] = useState({
    global: {
      ctr_min: 0.8,
      cpl_max: 4000,
      valid_rate_min: 60,
      exch_rate_max: 80,
      cvr_min: 2.0
    }
  });
  
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('接続中...');
  
  const [newData, setNewData] = useState({
    date: new Date().toISOString().split('T')[0],
    theme: 'Sansan',
    channel: 'Meta',
    campaign: 'キャンペーンA',
    week: 1,
    impressions: 0,
    clicks: 0,
    spend: 0,
    leads_total: 0,
    leads_valid: 0,
    leads_exchanged: 0,
    pv: 0,
    doc_req: 0,
    warm_call: 0,
    appt: 0,
    won: 0,
    sample_presented: 0,
    sample_approved: 0,
    delivery_total: 0,
    delivery_on_sla: 0
  });

  const showPaidSections = mode === 'v1.1';

  useEffect(() => {
    loadData();
    loadTemplates();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setRawData(data);
        setConnectionStatus('✅ 接続成功');
      } else {
        setConnectionStatus('⚠️ データなし');
        await generateSampleData();
      }
    } catch (error) {
      console.error('Error:', error);
      setConnectionStatus('❌ 接続失敗');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    const themes = ['Sansan', 'ビズリーチ', 'SmartHR'];
    const channels = ['Meta', 'Google'];
    const campaigns = ['キャンペーンA', 'キャンペーンB', 'キャンペーンC'];
    
    const sampleData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      for (const theme of themes) {
        for (const channel of channels) {
          for (const campaign of campaigns) {
            sampleData.push({
              date: date.toISOString().split('T')[0],
              theme,
              channel,
              campaign,
              week: Math.floor(i / 7) % 4 + 1,
              impressions: Math.floor(Math.random() * 50000) + 10000,
              clicks: Math.floor(Math.random() * 500) + 100,
              spend: Math.floor(Math.random() * 100000) + 20000,
              leads_total: Math.floor(Math.random() * 30) + 5,
              leads_valid: Math.floor(Math.random() * 20) + 3,
              leads_exchanged: Math.floor(Math.random() * 15) + 2,
              pv: Math.floor(Math.random() * 400) + 80,
              doc_req: Math.floor(Math.random() * 40) + 5,
              warm_call: Math.floor(Math.random() * 30) + 4,
              appt: Math.floor(Math.random() * 15) + 2,
              won: Math.floor(Math.random() * 8) + 1,
              sample_presented: Math.floor(Math.random() * 50) + 10,
              sample_approved: Math.floor(Math.random() * 40) + 8,
              delivery_total: Math.floor(Math.random() * 30) + 5,
              delivery_on_sla: Math.floor(Math.random() * 28) + 4
            });
          }
        }
      }
    }
    
    await supabase.from('sales_data').insert(sampleData);
    await loadData();
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setSavedTemplates(data);
    } catch (error) {
      console.error('Template load error:', error);
    }
  };

  const addData = async () => {
    try {
      await supabase.from('sales_data').insert([newData]);
      await loadData();
      setShowAddDataModal(false);
      setNewData({
        date: new Date().toISOString().split('T')[0],
        theme: 'Sansan',
        channel: 'Meta',
        campaign: 'キャンペーンA',
        week: 1,
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads_total: 0,
        leads_valid: 0,
        leads_exchanged: 0,
        pv: 0,
        doc_req: 0,
        warm_call: 0,
        appt: 0,
        won: 0,
        sample_presented: 0,
        sample_approved: 0,
        delivery_total: 0,
        delivery_on_sla: 0
      });
      alert('データを追加しました');
    } catch (error) {
      alert('追加失敗: ' + error.message);
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvData = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const row = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          
          if (['impressions', 'clicks', 'spend', 'leads_total', 'leads_valid', 
               'leads_exchanged', 'pv', 'doc_req', 'warm_call', 'appt', 'won',
               'sample_presented', 'sample_approved', 'delivery_total', 
               'delivery_on_sla', 'week'].includes(header)) {
            row[header] = parseFloat(value) || 0;
          } else {
            row[header] = value;
          }
        });
        
        csvData.push(row);
      }
      
      if (csvData.length === 0) {
        alert('CSVファイルにデータがありません');
        return;
      }
      
      await supabase.from('sales_data').insert(csvData);
      await loadData();
      setShowUploadModal(false);
      alert(`${csvData.length}件のデータをアップロードしました`);
    } catch (error) {
      alert('アップロード失敗: ' + error.message);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `date,theme,channel,campaign,week,impressions,clicks,spend,leads_total,leads_valid,leads_exchanged,pv,doc_req,warm_call,appt,won,sample_presented,sample_approved,delivery_total,delivery_on_sla
2024-01-01,Sansan,Meta,キャンペーンA,1,30000,300,50000,15,10,8,200,20,15,10,5,30,25,15,14`;
    
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtN = (n) => Number.isFinite(n) ? Math.round(n).toLocaleString() : '–';
  const fmtP = (n, d = 1) => Number.isFinite(n) ? `${n.toFixed(d)}%` : 'N/A';
  const filteredData = useMemo(() => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (period - 1));
    startDate.setHours(0, 0, 0, 0);

    return rawData.filter(d => {
      const itemDate = new Date(d.date);
      const inPeriod = itemDate >= startDate && itemDate <= endDate;
      const matchTheme = filters.theme === 'all' || d.theme === filters.theme;
      const matchChannel = filters.channel === 'all' || d.channel === filters.channel;
      const matchCampaign = filters.campaign === 'all' || d.campaign === filters.campaign;
      const matchWeek = filters.week === 'all' || d.week === parseInt(filters.week);
      
      return inPeriod && matchTheme && matchChannel && matchCampaign && matchWeek;
    });
  }, [rawData, period, filters]);

  const calculateMetrics = (data) => {
    const totals = data.reduce((acc, d) => ({
      impressions: acc.impressions + (d.impressions || 0),
      clicks: acc.clicks + (d.clicks || 0),
      spend: acc.spend + (d.spend || 0),
      leads_total: acc.leads_total + (d.leads_total || 0),
      leads_valid: acc.leads_valid + (d.leads_valid || 0),
      leads_exchanged: acc.leads_exchanged + (d.leads_exchanged || 0),
      pv: acc.pv + (d.pv || 0),
      doc_req: acc.doc_req + (d.doc_req || 0),
      warm_call: acc.warm_call + (d.warm_call || 0),
      appt: acc.appt + (d.appt || 0),
      won: acc.won + (d.won || 0),
      sample_presented: acc.sample_presented + (d.sample_presented || 0),
      sample_approved: acc.sample_approved + (d.sample_approved || 0),
      delivery_total: acc.delivery_total + (d.delivery_total || 0),
      delivery_on_sla: acc.delivery_on_sla + (d.delivery_on_sla || 0)
    }), {
      impressions: 0, clicks: 0, spend: 0, leads_total: 0, leads_valid: 0,
      leads_exchanged: 0, pv: 0, doc_req: 0, warm_call: 0, appt: 0, won: 0,
      sample_presented: 0, sample_approved: 0, delivery_total: 0, delivery_on_sla: 0
    });

    const target = totals.impressions / 100;
    
    return {
      target: Math.round(target),
      pv: totals.pv,
      doc_req: totals.doc_req,
      warm_call: totals.warm_call,
      appt: totals.appt,
      won: totals.won,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cvr: totals.clicks > 0 ? (totals.leads_total / totals.clicks) * 100 : 0,
      cpl: totals.leads_total > 0 ? totals.spend / totals.leads_total : 0,
      pv_reach: target > 0 ? (totals.pv / target) * 100 : 0,
      doc_reach: target > 0 ? (totals.doc_req / target) * 100 : 0,
      warm_reach: target > 0 ? (totals.warm_call / target) * 100 : 0,
      appt_reach: target > 0 ? (totals.appt / target) * 100 : 0,
      won_reach: target > 0 ? (totals.won / target) * 100 : 0,
      sample_approval: totals.sample_presented > 0 ? (totals.sample_approved / totals.sample_presented) * 100 : 0,
      sla_compliance: totals.delivery_total > 0 ? (totals.delivery_on_sla / totals.delivery_total) * 100 : 0,
      valid_rate: totals.delivery_total > 0 ? (totals.leads_valid / totals.delivery_total) * 100 : 0,
      exchange_rate: totals.delivery_total > 0 ? (totals.leads_exchanged / totals.delivery_total) * 100 : 0,
      ...totals
    };
  };

  const currentMetrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);

  const metricsCards = [
    {
      id: 'sample_approval',
      label: 'サンプル承認率',
      value: currentMetrics.sample_approval.toFixed(1) + '%',
      color: 'indigo',
      icon: CheckCircle
    },
    {
      id: 'sla_compliance',
      label: 'SLA遵守率',
      value: currentMetrics.sla_compliance.toFixed(1) + '%',
      color: 'teal',
      icon: Clock
    },
    {
      id: 'target',
      label: 'ターゲット数',
      value: currentMetrics.target.toLocaleString(),
      reach: 100,
      color: 'blue',
      icon: Target
    },
    {
      id: 'pv',
      label: 'PV数',
      value: currentMetrics.pv.toLocaleString(),
      reach: currentMetrics.pv_reach,
      color: 'blue',
      icon: Users
    },
    {
      id: 'doc_req',
      label: '資料請求数',
      value: currentMetrics.doc_req.toLocaleString(),
      reach: currentMetrics.doc_reach,
      color: 'green',
      icon: Calendar
    },
    {
      id: 'warm_call',
      label: 'ウォームコール数',
      value: currentMetrics.warm_call.toLocaleString(),
      reach: currentMetrics.warm_reach,
      color: 'orange',
      icon: Phone
    },
    {
      id: 'appt',
      label: 'アポ数',
      value: currentMetrics.appt.toLocaleString(),
      reach: currentMetrics.appt_reach,
      color: 'red',
      icon: CheckCircle,
      hideInV1: true
    },
    {
      id: 'won',
      label: '受注',
      value: currentMetrics.won.toLocaleString(),
      reach: currentMetrics.won_reach,
      color: 'purple',
      icon: CheckCircle,
      hideInV1: true
    }
  ];

  const trendData = useMemo(() => {
    const dailyData = {};
    filteredData.forEach(d => {
      if (!dailyData[d.date]) {
        dailyData[d.date] = {
          date: d.date,
          pv: 0, doc_req: 0, warm_call: 0, appt: 0, won: 0
        };
      }
      dailyData[d.date].pv += d.pv || 0;
      dailyData[d.date].doc_req += d.doc_req || 0;
      dailyData[d.date].warm_call += d.warm_call || 0;
      dailyData[d.date].appt += d.appt || 0;
      dailyData[d.date].won += d.won || 0;
    });
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">営業オーケストレーション</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  mode === 'v1.0' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {mode === 'v1.0' ? 'v1.0' : 'v1.1'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {connectionStatus}
                </span>
              </div>
              <p className="text-gray-600">
                {mode === 'v1.0' ? 'リード収集・品質管理' : '営業プロセス統合管理'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setShowAddDataModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                データ追加
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                CSV
              </button>
              <button 
                onClick={() => setMode(mode === 'v1.0' ? 'v1.1' : 'v1.0')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
              >
                {mode === 'v1.0' ? 'v1.1へ' : 'v1.0へ'}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
                >
                  過去{period}日
                </button>
                {showCustomPicker && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-40 z-10">
                    <button onClick={() => { setPeriod(7); setShowCustomPicker(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">7日間</button>
                    <button onClick={() => { setPeriod(14); setShowCustomPicker(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">14日間</button>
                    <button onClick={() => { setPeriod(30); setShowCustomPicker(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">30日間</button>
                    <button onClick={() => { setPeriod(90); setShowCustomPicker(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">90日間</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={filters.theme} onChange={(e) => setFilters({...filters, theme: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="all">全テーマ</option>
              <option value="Sansan">Sansan</option>
              <option value="ビズリーチ">ビズリーチ</option>
              <option value="SmartHR">SmartHR</option>
            </select>
            <select value={filters.channel} onChange={(e) => setFilters({...filters, channel: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="all">全チャネル</option>
              <option value="Meta">Meta</option>
              <option value="Google">Google</option>
            </select>
            <select value={filters.campaign} onChange={(e) => setFilters({...filters, campaign: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="all">全キャンペーン</option>
              <option value="キャンペーンA">キャンペーンA</option>
              <option value="キャンペーンB">キャンペーンB</option>
              <option value="キャンペーンC">キャンペーンC</option>
            </select>
            {(filters.theme !== 'all' || filters.channel !== 'all' || filters.campaign !== 'all') && (
              <button onClick={() => setFilters({ theme: 'all', channel: 'all', campaign: 'all', week: 'all' })} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <X className="w-3 h-3" />
                クリア
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {metricsCards.slice(0, 2).map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{metric.label}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              </div>
            );
          })}
        </div>

        <div className={`grid gap-4 mb-6 ${showPaidSections ? 'grid-cols-6' : 'grid-cols-4'}`}>
          {metricsCards.slice(2).filter(m => showPaidSections || !m.hideInV1).map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="bg-white rounded-lg p-5 shadow-sm border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all relative">
                <div className="flex items-center gap-2 mb-3 text-gray-600 text-xs">
                  <Icon className="w-4 h-4" />
                  <span>{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-xs text-gray-600">到達率: {metric.reach?.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">トレンド分析</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={2} name="PV数" dot={false} />
              <Line type="monotone" dataKey="doc_req" stroke="#10b981" strokeWidth={2} name="資料請求" dot={false} />
              <Line type="monotone" dataKey="warm_call" stroke="#f59e0b" strokeWidth={2} name="ウォームコール" dot={false} />
              {showPaidSections && <Line type="monotone" dataKey="appt" stroke="#ef4444" strokeWidth={2} name="アポ" dot={false} />}
              {showPaidSections && <Line type="monotone" dataKey="won" stroke="#8b5cf6" strokeWidth={2} name="受注" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">CTR</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.ctr, 2)}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">CPL</div>
            <div className="text-2xl font-bold text-gray-900">¥{fmtN(currentMetrics.cpl)}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">有効率</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.valid_rate)}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">交換率</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.exchange_rate)}</div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Supabase連動ダッシュボード | 最終更新: {new Date().toLocaleString('ja-JP')}</p>
        </div>

        {showAddDataModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">データ追加</h3>
                <button onClick={() => setShowAddDataModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">日付</label>
                  <input 
                    type="date" 
                    value={newData.date}
                    onChange={(e) => setNewData({...newData, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">テーマ</label>
                  <select 
                    value={newData.theme}
                    onChange={(e) => setNewData({...newData, theme: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Sansan">Sansan</option>
                    <option value="ビズリーチ">ビズリーチ</option>
                    <option value="SmartHR">SmartHR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">チャネル</label>
                  <select 
                    value={newData.channel}
                    onChange={(e) => setNewData({...newData, channel: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Meta">Meta</option>
                    <option value="Google">Google</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">インプレッション</label>
                  <input 
                    type="number" 
                    value={newData.impressions}
                    onChange={(e) => setNewData({...newData, impressions: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">クリック数</label>
                  <input 
                    type="number" 
                    value={newData.clicks}
                    onChange={(e) => setNewData({...newData, clicks: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PV数</label>
                  <input 
                    type="number" 
                    value={newData.pv}
                    onChange={(e) => setNewData({...newData, pv: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={addData}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  追加
                </button>
                <button 
                  onClick={() => setShowAddDataModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">CSVアップロード</h3>
                <button onClick={() => setShowUploadModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={downloadSampleCSV}
                className="text-sm text-blue-600 hover:text-blue-700 underline mb-4"
              >
                📥 サンプルCSVダウンロード
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    ファイルを選択
                  </span>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;