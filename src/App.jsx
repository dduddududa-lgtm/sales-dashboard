import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, Phone, Calendar, CheckCircle, Target, AlertTriangle, Download, Save, Clock, Filter, X, Upload, Plus, Database, Edit2, Trash2, PieChart, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
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
  
  // 새로운 기능 상태
  const [showDataTable, setShowDataTable] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goals, setGoals] = useState({
    pv: 100000,
    doc_req: 5000,
    warm_call: 1000,
    appt: 200,
    won: 50
  });
  const [aggregationView, setAggregationView] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [compareMode, setCompareMode] = useState(false);
  const [compareFilters, setCompareFilters] = useState({
    theme: 'all',
    channel: 'all',
    campaign: 'all'
  });
  
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
    loadGoals();
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
    
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      
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

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .single();
      
      if (data) setGoals(data);
    } catch (error) {
      console.log('No goals set yet');
    }
  };

  const saveGoals = async () => {
    try {
      const { error } = await supabase
        .from('goals')
        .upsert({ id: 1, ...goals });
      
      if (error) throw error;
      alert('目標を保存しました');
      setShowGoalModal(false);
    } catch (error) {
      alert('保存失敗: ' + error.message);
    }
  };

  const deleteData = async (id) => {
    if (window.confirm('このデータを削除しますか？')) {
      try {
        await supabase.from('sales_data').delete().eq('id', id);
        await loadData();
        alert('削除しました');
      } catch (error) {
        alert('削除失敗: ' + error.message);
      }
    }
  };

  const updateData = async () => {
    try {
      await supabase
        .from('sales_data')
        .update(editingData)
        .eq('id', editingData.id);
      
      await loadData();
      setShowEditModal(false);
      setEditingData(null);
      alert('更新しました');
    } catch (error) {
      alert('更新失敗: ' + error.message);
    }
  };

  const saveTemplate = async () => {
    try {
      const template = {
        name: `テンプレート_${new Date().toISOString()}`,
        filters,
        period
      };
      
      await supabase.from('templates').insert([template]);
      await loadTemplates();
      alert('テンプレートを保存しました');
    } catch (error) {
      alert('保存失敗: ' + error.message);
    }
  };

  const applyTemplate = (template) => {
    setFilters(template.filters);
    setPeriod(template.period);
  };

  const deleteTemplate = async (id) => {
    if (window.confirm('このテンプレートを削除しますか？')) {
      try {
        await supabase.from('templates').delete().eq('id', id);
        await loadTemplates();
      } catch (error) {
        alert('削除失敗: ' + error.message);
      }
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

  const getColorCode = (color) => {
    const colors = {
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f59e0b',
      red: '#ef4444',
      purple: '#8b5cf6',
      indigo: '#6366f1',
      teal: '#14b8a6'
    };
    return colors[color] || '#3b82f6';
  };

  const fmtN = (n) => Number.isFinite(n) ? Math.round(n).toLocaleString() : '–';
  const fmtP = (n, d = 1) => Number.isFinite(n) ? `${n.toFixed(d)}%` : 'N/A';
  const toNum = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
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

  const compareData = useMemo(() => {
    if (!compareMode) return [];
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (period - 1));
    startDate.setHours(0, 0, 0, 0);

    return rawData.filter(d => {
      const itemDate = new Date(d.date);
      const inPeriod = itemDate >= startDate && itemDate <= endDate;
      const matchTheme = compareFilters.theme === 'all' || d.theme === compareFilters.theme;
      const matchChannel = compareFilters.channel === 'all' || d.channel === compareFilters.channel;
      const matchCampaign = compareFilters.campaign === 'all' || d.campaign === compareFilters.campaign;
      
      return inPeriod && matchTheme && matchChannel && matchCampaign;
    });
  }, [rawData, period, compareFilters, compareMode]);

  const previousPeriodData = useMemo(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - period);
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (period * 2) + 1);
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
      pv_to_doc: totals.pv > 0 ? (totals.doc_req / totals.pv) * 100 : 0,
      doc_to_warm: totals.doc_req > 0 ? (totals.warm_call / totals.doc_req) * 100 : 0,
      warm_to_appt: totals.warm_call > 0 ? (totals.appt / totals.warm_call) * 100 : 0,
      appt_to_won: totals.appt > 0 ? (totals.won / totals.appt) * 100 : 0,
      sample_approval: totals.sample_presented > 0 ? (totals.sample_approved / totals.sample_presented) * 100 : 0,
      sla_compliance: totals.delivery_total > 0 ? (totals.delivery_on_sla / totals.delivery_total) * 100 : 0,
      valid_rate: totals.delivery_total > 0 ? (totals.leads_valid / totals.delivery_total) * 100 : 0,
      exchange_rate: totals.delivery_total > 0 ? (totals.leads_exchanged / totals.delivery_total) * 100 : 0,
      ...totals
    };
  };

  const currentMetrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);
  const previousMetrics = useMemo(() => calculateMetrics(previousPeriodData), [previousPeriodData]);
  const compareMetrics = useMemo(() => compareMode ? calculateMetrics(compareData) : null, [compareData, compareMode]);

  const calculateChange = (current, previous) => {
    if (!isFinite(previous) || previous === 0) return NaN;
    return ((current - previous) / previous) * 100;
  };

  const detectAnomalies = () => {
    const anomalies = [];
    const activeThresholds = thresholds.global;
    
    if (currentMetrics.ctr < activeThresholds.ctr_min) {
      anomalies.push({ type: 'CTR', value: currentMetrics.ctr, threshold: activeThresholds.ctr_min, status: 'low', unit: '%' });
    }
    if (currentMetrics.cpl > activeThresholds.cpl_max) {
      anomalies.push({ type: 'CPL', value: currentMetrics.cpl, threshold: activeThresholds.cpl_max, status: 'high', unit: '円' });
    }
    if (currentMetrics.valid_rate < activeThresholds.valid_rate_min) {
      anomalies.push({ type: '有効率', value: currentMetrics.valid_rate, threshold: activeThresholds.valid_rate_min, status: 'low', unit: '%' });
    }
    if (currentMetrics.cvr < activeThresholds.cvr_min) {
      anomalies.push({ type: 'CVR', value: currentMetrics.cvr, threshold: activeThresholds.cvr_min, status: 'low', unit: '%' });
    }
    if (currentMetrics.exchange_rate > activeThresholds.exch_rate_max) {
      anomalies.push({ type: '交換率', value: currentMetrics.exchange_rate, threshold: activeThresholds.exch_rate_max, status: 'high', unit: '%' });
    }
    return anomalies;
  };

  const anomalies = detectAnomalies();

  const findBottleneck = () => {
    const rates = [
      { name: 'PV→資料請求', rate: currentMetrics.pv_to_doc, hint: 'コピーの見直しまたはCTAの強化を検討' },
      { name: '資料請求→ウォームコール', rate: currentMetrics.doc_to_warm, hint: 'リード品質の精査またはフォロースピード改善' },
      { name: 'ウォームコール→アポ', rate: currentMetrics.warm_to_appt, hint: 'トークスクリプト改善またはセグメント縮小' },
      { name: 'アポ→受注', rate: currentMetrics.appt_to_won, hint: '提案内容の見直しまたは価格設定の再検討' }
    ];
    return rates.reduce((min, r) => r.rate < min.rate ? r : min, rates[0]);
  };

  const bottleneck = findBottleneck();

  const aggregatedData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(d => {
      let key;
      const date = new Date(d.date);
      
      if (aggregationView === 'daily') {
        key = d.date;
      } else if (aggregationView === 'weekly') {
        const weekNum = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `${date.getFullYear()}-W${weekNum}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          impressions: 0,
          clicks: 0,
          spend: 0,
          pv: 0,
          doc_req: 0,
          warm_call: 0,
          appt: 0,
          won: 0
        };
      }
      
      grouped[key].impressions += d.impressions || 0;
      grouped[key].clicks += d.clicks || 0;
      grouped[key].spend += d.spend || 0;
      grouped[key].pv += d.pv || 0;
      grouped[key].doc_req += d.doc_req || 0;
      grouped[key].warm_call += d.warm_call || 0;
      grouped[key].appt += d.appt || 0;
      grouped[key].won += d.won || 0;
    });
    
    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredData, aggregationView]);

  const themeDistribution = useMemo(() => {
    const distribution = {};
    filteredData.forEach(d => {
      distribution[d.theme] = (distribution[d.theme] || 0) + (d.pv || 0);
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const channelDistribution = useMemo(() => {
    const distribution = {};
    filteredData.forEach(d => {
      distribution[d.channel] = (distribution[d.channel] || 0) + (d.clicks || 0);
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const funnelData = useMemo(() => [
    { stage: 'ターゲット', value: currentMetrics.target, percentage: 100 },
    { stage: 'PV', value: currentMetrics.pv, percentage: currentMetrics.pv_reach },
    { stage: '資料請求', value: currentMetrics.doc_req, percentage: currentMetrics.doc_reach },
    { stage: 'ウォームコール', value: currentMetrics.warm_call, percentage: currentMetrics.warm_reach },
    { stage: 'アポ', value: currentMetrics.appt, percentage: currentMetrics.appt_reach },
    { stage: '受注', value: currentMetrics.won, percentage: currentMetrics.won_reach }
  ], [currentMetrics]);

  const metricsCards = useMemo(() => [
    {
      id: 'sample_approval',
      label: 'サンプル承認率',
      value: currentMetrics.sample_approval.toFixed(1) + '%',
      numerator: currentMetrics.sample_approved,
      denominator: currentMetrics.sample_presented,
      change: calculateChange(currentMetrics.sample_approval, previousMetrics.sample_approval),
      color: 'indigo',
      icon: CheckCircle
    },
    {
      id: 'sla_compliance',
      label: 'SLA遵守率',
      value: currentMetrics.sla_compliance.toFixed(1) + '%',
      numerator: currentMetrics.delivery_on_sla,
      denominator: currentMetrics.delivery_total,
      change: calculateChange(currentMetrics.sla_compliance, previousMetrics.sla_compliance),
      color: 'teal',
      icon: Clock
    },
    {
      id: 'target',
      label: 'ターゲット数',
      value: currentMetrics.target.toLocaleString(),
      reach: 100,
      change: calculateChange(currentMetrics.target, previousMetrics.target),
      color: 'blue',
      icon: Target
    },
    {
      id: 'pv',
      label: 'PV数',
      value: currentMetrics.pv.toLocaleString(),
      reach: currentMetrics.pv_reach,
      change: calculateChange(currentMetrics.pv, previousMetrics.pv),
      goal: goals.pv,
      color: 'blue',
      icon: Users
    },
    {
      id: 'doc_req',
      label: '資料請求数',
      value: currentMetrics.doc_req.toLocaleString(),
      reach: currentMetrics.doc_reach,
      change: calculateChange(currentMetrics.doc_req, previousMetrics.doc_req),
      goal: goals.doc_req,
      color: 'green',
      icon: Calendar
    },
    {
      id: 'warm_call',
      label: 'ウォームコール数',
      value: currentMetrics.warm_call.toLocaleString(),
      reach: currentMetrics.warm_reach,
      change: calculateChange(currentMetrics.warm_call, previousMetrics.warm_call),
      goal: goals.warm_call,
      color: 'orange',
      icon: Phone
    },
    {
      id: 'appt',
      label: 'アポ数',
      value: currentMetrics.appt.toLocaleString(),
      reach: currentMetrics.appt_reach,
      change: calculateChange(currentMetrics.appt, previousMetrics.appt),
      goal: goals.appt,
      color: 'red',
      icon: CheckCircle,
      hideInV1: true
    },
    {
      id: 'won',
      label: '受注',
      value: currentMetrics.won.toLocaleString(),
      reach: currentMetrics.won_reach,
      change: calculateChange(currentMetrics.won, previousMetrics.won),
      goal: goals.won,
      color: 'purple',
      icon: CheckCircle,
      hideInV1: true
    }
  ], [currentMetrics, previousMetrics, goals]);

  const conversionRates = useMemo(() => [
    {
      label: 'ターゲット→PV',
      rate: currentMetrics.pv_reach.toFixed(1) + '%',
      numerator: currentMetrics.pv,
      denominator: currentMetrics.target,
      change: calculateChange(currentMetrics.pv_reach, previousMetrics.pv_reach),
      isBottleneck: false
    },
    {
      label: 'PV→資料請求',
      rate: currentMetrics.pv_to_doc.toFixed(1) + '%',
      numerator: currentMetrics.doc_req,
      denominator: currentMetrics.pv,
      change: calculateChange(currentMetrics.pv_to_doc, previousMetrics.pv_to_doc),
      isBottleneck: bottleneck.name === 'PV→資料請求'
    },
    {
      label: '資料請求→ウォームコール',
      rate: currentMetrics.doc_to_warm.toFixed(1) + '%',
      numerator: currentMetrics.warm_call,
      denominator: currentMetrics.doc_req,
      change: calculateChange(currentMetrics.doc_to_warm, previousMetrics.doc_to_warm),
      isBottleneck: bottleneck.name === '資料請求→ウォームコール'
    },
    {
      label: 'ウォームコール→アポ',
      rate: currentMetrics.warm_to_appt.toFixed(1) + '%',
      numerator: currentMetrics.appt,
      denominator: currentMetrics.warm_call,
      change: calculateChange(currentMetrics.warm_to_appt, previousMetrics.warm_to_appt),
      isBottleneck: bottleneck.name === 'ウォームコール→アポ',
      hideInV1: true
    },
    {
      label: 'アポ→受注',
      rate: currentMetrics.appt_to_won.toFixed(1) + '%',
      numerator: currentMetrics.won,
      denominator: currentMetrics.appt,
      change: calculateChange(currentMetrics.appt_to_won, previousMetrics.appt_to_won),
      isBottleneck: bottleneck.name === 'アポ→受注',
      hideInV1: true
    }
  ], [currentMetrics, previousMetrics, bottleneck]);

  const visibleConversionRates = useMemo(
    () => showPaidSections ? conversionRates : conversionRates.filter(r => !r.hideInV1),
    [conversionRates, showPaidSections]
  );

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
                onClick={() => setShowThresholdModal(true)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                閾値
              </button>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Target className="w-4 h-4" />
                目標
              </button>
              <button 
                onClick={saveTemplate}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                保存
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
            <div className="ml-auto">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  compareMode ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                比較モード
              </button>
            </div>
          </div>

          {compareMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">比較フィルター</h3>
              <div className="flex gap-3 items-center flex-wrap">
                <select value={compareFilters.theme} onChange={(e) => setCompareFilters({...compareFilters, theme: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option value="all">全テーマ</option>
                  <option value="Sansan">Sansan</option>
                  <option value="ビズリーチ">ビズリーチ</option>
                  <option value="SmartHR">SmartHR</option>
                </select>
                <select value={compareFilters.channel} onChange={(e) => setCompareFilters({...compareFilters, channel: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option value="all">全チャネル</option>
                  <option value="Meta">Meta</option>
                  <option value="Google">Google</option>
                </select>
                <select value={compareFilters.campaign} onChange={(e) => setCompareFilters({...compareFilters, campaign: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option value="all">全キャンペーン</option>
                  <option value="キャンペーンA">キャンペーンA</option>
                  <option value="キャンペーンB">キャンペーンB</option>
                  <option value="キャンペーンC">キャンペーンC</option>
                </select>
              </div>
            </div>
          )}

          {anomalies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">異常検知</h3>
                  <div className="space-y-1">
                    {anomalies.map((a, i) => {
                      const cmpText = a.status === 'high' ? '以下' : '以上';
                      return (
                        <p key={i} className="text-sm text-red-800">
                          {a.type}: {a.value.toFixed(2)}{a.unit} （閾値: {a.threshold}{a.unit}{cmpText}）
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">ボトルネック検出</h3>
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">{bottleneck.name}</span> の遷移率が最も低くなっています（{bottleneck.rate.toFixed(1)}%）
                </p>
                <p className="text-sm text-amber-700 mt-1">💡 {bottleneck.hint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {metricsCards.slice(0, 2).map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.change >= 0;
            return (
              <div key={metric.id} className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{metric.label}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={isPositive ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                    {isPositive ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                    {' '}{isNaN(metric.change) ? 'N/A' : Math.abs(metric.change).toFixed(1) + '%'}
                  </span>
                  <span className="text-gray-500 text-xs">vs 前同期間</span>
                </div>
                <div className="text-xs text-gray-500">
                  分子/分母: {metric.numerator} / {metric.denominator}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`grid gap-4 mb-6 ${showPaidSections ? 'grid-cols-6' : 'grid-cols-4'}`}>
          {metricsCards.slice(2).filter(m => showPaidSections || !m.hideInV1).map((metric, idx) => {
            const Icon = metric.icon;
            const isPositive = metric.change >= 0;
            const filtered = metricsCards.slice(2).filter(m => showPaidSections || !m.hideInV1);
            const goalProgress = metric.goal ? (parseFloat(metric.value.replace(/,/g, '')) / metric.goal) * 100 : null;
            
            return (
              <div 
                key={metric.id}
                className="bg-white rounded-lg p-5 shadow-sm border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all relative"
              >
                <div className="flex items-center gap-2 mb-3 text-gray-600 text-xs">
                  <Icon className="w-4 h-4" />
                  <span>{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="flex items-center gap-1 mb-2">
                  <span className={isPositive ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                    {isPositive ? '▲' : '▼'} {isNaN(metric.change) ? 'N/A' : Math.abs(metric.change).toFixed(1) + '%'}
                  </span>
                </div>
                {goalProgress && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>目標達成率</span>
                      <span className={goalProgress >= 100 ? 'text-green-600 font-semibold' : ''}>{goalProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${goalProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, goalProgress)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-600">到達率: {metric.reach?.toFixed(1)}%</div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                  style={{ backgroundColor: getColorCode(metric.color) }}
                ></div>
                {idx < filtered.length - 1 && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-4 border-l-gray-600 border-b-4 border-b-transparent"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showPaidSections && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600">
              💡 v1.1モードに切り替えると、アポ数・受注数が表示されます
            </p>
          </div>
        )}

        {compareMode && compareMetrics && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">比較分析</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">PV数</div>
                <div className="text-2xl font-bold text-gray-900">{currentMetrics.pv.toLocaleString()}</div>
                <div className="text-xs text-gray-500">vs</div>
                <div className="text-2xl font-bold text-blue-600">{compareMetrics.pv.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {((currentMetrics.pv / compareMetrics.pv - 1) * 100).toFixed(1)}% 差
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">資料請求</div>
                <div className="text-2xl font-bold text-gray-900">{currentMetrics.doc_req.toLocaleString()}</div>
                <div className="text-xs text-gray-500">vs</div>
                <div className="text-2xl font-bold text-blue-600">{compareMetrics.doc_req.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {((currentMetrics.doc_req / compareMetrics.doc_req - 1) * 100).toFixed(1)}% 差
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">ウォームコール</div>
                <div className="text-2xl font-bold text-gray-900">{currentMetrics.warm_call.toLocaleString()}</div>
                <div className="text-xs text-gray-500">vs</div>
                <div className="text-2xl font-bold text-blue-600">{compareMetrics.warm_call.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {((currentMetrics.warm_call / compareMetrics.warm_call - 1) * 100).toFixed(1)}% 差
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">CTR</div>
                <div className="text-2xl font-bold text-gray-900">{currentMetrics.ctr.toFixed(2)}%</div>
                <div className="text-xs text-gray-500">vs</div>
                <div className="text-2xl font-bold text-blue-600">{compareMetrics.ctr.toFixed(2)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">CPL</div>
                <div className="text-2xl font-bold text-gray-900">¥{fmtN(currentMetrics.cpl)}</div>
                <div className="text-xs text-gray-500">vs</div>
                <div className="text-2xl font-bold text-blue-600">¥{fmtN(compareMetrics.cpl)}</div>
              </div>
            </div>
          </div>
        )}
        <div className={`grid gap-4 mb-8 ${showPaidSections ? 'grid-cols-5' : 'grid-cols-3'}`}>
          {visibleConversionRates.map((rate, idx) => {
            const isBottleneck = rate.isBottleneck;
            const isPositive = rate.change >= 0;
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-lg p-6 shadow-sm transition-all ${isBottleneck ? 'border-2 border-red-500 ring-2 ring-red-200' : 'border border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">{rate.label}</div>
                  {isBottleneck && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-gray-900">{rate.rate}</div>
                  <div className={`px-3 py-1 rounded-full text-sm ${isPositive ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'}`}>
                    {isPositive ? '+' : ''}{rate.change.toFixed(1)}%
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {rate.numerator} / {rate.denominator}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">営業プロセス分析</h2>
            <p className="text-sm text-gray-600 mb-6">各段階での数値と状況</p>
            <div className="space-y-4">
             {metricsCards.slice(2).filter(m => showPaidSections || !m.hideInV1).map((item, idx) => {
                const Icon = item.icon;
                const filteredCards = metricsCards.slice(2).filter(m => showPaidSections || !m.hideInV1);
                const maxValue = Math.max(...filteredCards.map(m => parseFloat(m.value.replace(/,/g, '')) || 0));
                const currentValue = parseFloat(item.value.replace(/,/g, ''));
                const percentage = Math.max(0, Math.min(100, (currentValue / maxValue) * 100));
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-44">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getColorCode(item.color)
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-500">{item.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">トレンド分析</h2>
            <p className="text-sm text-gray-600 mb-6">時系列推移</p>
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
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">CTR</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.ctr, 2)}</div>
            <div className={`text-sm mt-2 ${currentMetrics.ctr >= thresholds.global.ctr_min ? 'text-green-600' : 'text-red-600'}`}>
              {currentMetrics.ctr >= thresholds.global.ctr_min ? '✓ 正常' : '⚠ 閾値以下'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fmtN(currentMetrics.clicks)} / {fmtN(currentMetrics.impressions)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">CPL</div>
            <div className="text-2xl font-bold text-gray-900">¥{fmtN(currentMetrics.cpl)}</div>
            <div className={`text-sm mt-2 ${currentMetrics.cpl <= thresholds.global.cpl_max ? 'text-green-600' : 'text-red-600'}`}>
              {currentMetrics.cpl <= thresholds.global.cpl_max ? '✓ 正常' : '⚠ 閾値超過'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ¥{fmtN(currentMetrics.spend)} / {fmtN(currentMetrics.leads_total)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">有効率</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.valid_rate)}</div>
            <div className={`text-sm mt-2 ${currentMetrics.valid_rate >= thresholds.global.valid_rate_min ? 'text-green-600' : 'text-red-600'}`}>
              {currentMetrics.valid_rate >= thresholds.global.valid_rate_min ? '✓ 正常' : '⚠ 閾値以下'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fmtN(currentMetrics.leads_valid)} / {fmtN(currentMetrics.delivery_total)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">交換率</div>
            <div className="text-2xl font-bold text-gray-900">{fmtP(currentMetrics.exchange_rate)}</div>
            <div className={`text-sm mt-2 ${currentMetrics.exchange_rate <= thresholds.global.exch_rate_max ? 'text-green-600' : 'text-red-600'}`}>
              {currentMetrics.exchange_rate <= thresholds.global.exch_rate_max ? '✓ 正常' : '⚠ 閾値超過'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fmtN(currentMetrics.leads_exchanged)} / {fmtN(currentMetrics.delivery_total)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">集計表示</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setAggregationView('daily')}
                className={`px-3 py-1 rounded text-sm ${
                  aggregationView === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                日別
              </button>
              <button
                onClick={() => setAggregationView('weekly')}
                className={`px-3 py-1 rounded text-sm ${
                  aggregationView === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                週別
              </button>
              <button
                onClick={() => setAggregationView('monthly')}
                className={`px-3 py-1 rounded text-sm ${
                  aggregationView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                月別
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">期間</th>
                  <th className="px-4 py-2 text-right">IMP</th>
                  <th className="px-4 py-2 text-right">クリック</th>
                  <th className="px-4 py-2 text-right">費用</th>
                  <th className="px-4 py-2 text-right">PV</th>
                  <th className="px-4 py-2 text-right">資料請求</th>
                  <th className="px-4 py-2 text-right">ウォームコール</th>
                  {showPaidSections && <th className="px-4 py-2 text-right">アポ</th>}
                  {showPaidSections && <th className="px-4 py-2 text-right">受注</th>}
                </tr>
              </thead>
              <tbody>
                {aggregatedData.slice(-10).map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{row.period}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.impressions)}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.clicks)}</td>
                    <td className="px-4 py-2 text-right">¥{fmtN(row.spend)}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.pv)}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.doc_req)}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.warm_call)}</td>
                    {showPaidSections && <td className="px-4 py-2 text-right">{fmtN(row.appt)}</td>}
                    {showPaidSections && <td className="px-4 py-2 text-right">{fmtN(row.won)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              テーマ別PV分布
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart>
                <Pie
                  data={themeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {themeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              チャネル別クリック分布
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart>
                <Pie
                  data={channelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              ファネル分析
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">データ管理</h2>
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              {showDataTable ? 'テーブルを閉じる' : 'データテーブルを表示'}
            </button>
          </div>
          
          {showDataTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">日付</th>
                    <th className="px-4 py-2 text-left">テーマ</th>
                    <th className="px-4 py-2 text-left">チャネル</th>
                    <th className="px-4 py-2 text-right">IMP</th>
                    <th className="px-4 py-2 text-right">クリック</th>
                    <th className="px-4 py-2 text-right">PV</th>
                    <th className="px-4 py-2 text-right">資料請求</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 20).map((row) => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">{row.theme}</td>
                      <td className="px-4 py-2">{row.channel}</td>
                      <td className="px-4 py-2 text-right">{fmtN(row.impressions)}</td>
                      <td className="px-4 py-2 text-right">{fmtN(row.clicks)}</td>
                      <td className="px-4 py-2 text-right">{fmtN(row.pv)}</td>
                      <td className="px-4 py-2 text-right">{fmtN(row.doc_req)}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingData(row);
                              setShowEditModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteData(row.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  最初の20件を表示中（全{filteredData.length}件）
                </div>
              )}
            </div>
          )}
        </div>

        {savedTemplates.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">保存済みテンプレート</h3>
            <div className="space-y-2">
              {savedTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600">
                      期間: {template.period}日
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => applyTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      適用
                    </button>
                    <button 
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mb-4">
          <p>Supabase連動ダッシュボード | 最終更新: {new Date().toLocaleString('ja-JP')}</p>
        </div>
        /span>
                    </div>
                  <div className="flex-1">
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getColorCode(item.color)
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-500">{item.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">広告パフォーマンス</h2>
            <p className="text-sm text-gray-600 mb-6">主要指標のトレンド</p>
            <div className="space-y-4">
              {adMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                const isAlert = metric.hasAlert;
                return (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{metric.label}</span>
                      {isAlert && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                      <div className={`text-xs ${metric.isGood ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedMetric && trendData.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedMetric}のトレンド</h2>
              <button
                onClick={() => setSelectedMetric(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="今期"
                    dot={{ fill: '#3b82f6', r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="previous" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="前期"
                    dot={{ fill: '#94a3b8', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showThresholdModal && (
        <ThresholdModal 
          thresholds={thresholds}
          onSave={(newThresholds) => {
            setThresholds(newThresholds);
            setShowThresholdModal(false);
          }}
          onClose={() => setShowThresholdModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
const ThresholdModal = ({ thresholds, onSave, onClose }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [thresholdMode, setThresholdMode] = useState('global');
  const [selectedTheme, setSelectedTheme] = useState('sansan');

  const themes = ['sansan', 'bizreach', 'smarthr'];

  const handleSave = () => {
    onSave(localThresholds);
  };

  const handleRecommend = () => {
    // 過去データから推奨値を計算（デモ用の簡易実装）
    const recommended = {
      ctr_min: 1.2,
      cpl_max: 3500,
      valid_rate_min: 65,
      exch_rate_max: 75,
      cvr_min: 2.5
    };
    setLocalThresholds(recommended);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">閾値設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setThresholdMode('global')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                thresholdMode === 'global'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全体基準
            </button>
            <button
              onClick={() => setThresholdMode('theme')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                thresholdMode === 'theme'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              テーマ別基準
            </button>
          </div>

          {thresholdMode === 'theme' && (
            <div className="flex gap-2 mb-4">
              {themes.map(theme => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedTheme === theme
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTR 最小値 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={localThresholds.ctr_min}
              onChange={(e) => setLocalThresholds({
                ...localThresholds,
                ctr_min: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPL 最大値 (円)
            </label>
            <input
              type="number"
              step="100"
              value={localThresholds.cpl_max}
              onChange={(e) => setLocalThresholds({
                ...localThresholds,
                cpl_max: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有効率 最小値 (%)
            </label>
            <input
              type="number"
              step="1"
              value={localThresholds.valid_rate_min}
              onChange={(e) => setLocalThresholds({
                ...localThresholds,
                valid_rate_min: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              架電交換率 最大値 (%)
            </label>
            <input
              type="number"
              step="1"
              value={localThresholds.exch_rate_max}
              onChange={(e) => setLocalThresholds({
                ...localThresholds,
                exch_rate_max: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVR 最小値 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={localThresholds.cvr_min}
              onChange={(e) => setLocalThresholds({
                ...localThresholds,
                cvr_min: parseFloat(e.target.value) || 0
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRecommend}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            過去データから推奨値を計算
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
const AuditLog = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">監査ログ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ログがまだありません</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {log.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {log.details}
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;