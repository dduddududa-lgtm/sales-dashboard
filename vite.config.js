import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, Phone, Calendar, CheckCircle, Target, AlertTriangle, Download, Save, Clock, Filter, X, Upload, Plus, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blmbcmyzwokxfxzlhwtf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWJjbXl6d29reGZ4emxod3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTU1MDksImV4cCI6MjA3NTk5MTUwOX0.JTVTP-YAXIQBBChTExqApyjJ50ECL9svsOta82bfswg';
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('接続中...');

  useEffect(() => {
    loadData();
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
      console.error('データロード失敗:', error);
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
    
    const { error } = await supabase
      .from('sales_data')
      .insert(sampleData);
    
    if (!error) {
      await loadData();
    }
  };

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
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {connectionStatus}
                </span>
              </div>
              <p className="text-gray-600">Supabase連携ダッシュボード</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">接続成功！</h2>
            <p className="text-gray-600 mb-4">
              データベースに {rawData.length} 件のデータがあります
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                🎉 バックエンド連携が完了しました！<br/>
                次のステップで完全なダッシュボードUIを追加します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;