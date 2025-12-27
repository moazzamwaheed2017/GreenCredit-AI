
import React, { useState, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie
} from 'recharts';
import { 
  ChevronRight, ChevronLeft, ShieldCheck, Leaf, Activity, 
  TrendingUp, FileText, AlertTriangle, CheckCircle, ArrowRight,
  Settings, Database, Scale
} from 'lucide-react';
import { 
  AppStep, BorrowerInput, NormalizedData, FinancialRiskResponse, 
  SustainabilityRiskResponse, DecisionResponse, UpliftPlan, 
  ClimateScenario, ReviewSummary 
} from './types';
import * as gemini from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Input);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [input, setInput] = useState<BorrowerInput>({
    businessType: 'SME',
    industry: 'Manufacturing',
    revenue: '$5,000,000',
    cashFlowStability: 'Moderate volatility',
    debtToIncomeRatio: '35%',
    creditHistory: '7 years clean',
    energySource: 'Grid Mix (Coal heavy)',
    carbonIntensity: 'High',
    laborCompliance: 'Good',
    regulatoryIssues: 'None'
  });

  const [normalized, setNormalized] = useState<NormalizedData | null>(null);
  const [financialRisk, setFinancialRisk] = useState<FinancialRiskResponse | null>(null);
  const [sustainabilityRisk, setSustainabilityRisk] = useState<SustainabilityRiskResponse | null>(null);
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [uplift, setUplift] = useState<UpliftPlan | null>(null);
  const [simulations, setSimulations] = useState<ClimateScenario[]>([]);
  const [review, setReview] = useState<ReviewSummary | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // Sequence the "Agents"
      const norm = await gemini.normalizeData(input);
      setNormalized(norm);
      setStep(AppStep.Normalization);

      const [fin, sust] = await Promise.all([
        gemini.assessFinancialRisk(norm),
        gemini.assessSustainabilityRisk(norm)
      ]);
      setFinancialRisk(fin);
      setSustainabilityRisk(sust);

      const dec = await gemini.getDecision(fin, sust);
      setDecision(dec);

      const [up, sim] = await Promise.all([
        gemini.planUplift(sust),
        gemini.simulateClimate(fin, sust)
      ]);
      setUplift(up);
      setSimulations(sim);

      const rev = await gemini.getReview({ norm, fin, sust, dec, up, sim });
      setReview(rev);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, AppStep.Review));
  const prevStep = () => setStep(prev => Math.max(prev - 1, AppStep.Input));

  const renderStep = () => {
    switch (step) {
      case AppStep.Input:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-50">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Database className="text-emerald-500" /> Borrower Data Entry
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Business Type</label>
                  <select name="businessType" value={input.businessType} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>SME</option>
                    <option>Startup</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Industry</label>
                  <input name="industry" value={input.industry} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Annual Revenue</label>
                  <input name="revenue" value={input.revenue} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Debt-to-Income Ratio</label>
                  <input name="debtToIncomeRatio" value={input.debtToIncomeRatio} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Sustainability Profile (Energy/Carbon/Labor)</label>
                  <textarea name="energySource" value={input.energySource} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Describe energy usage, labor compliance, etc." />
                </div>
              </div>
              <button 
                onClick={runAnalysis} 
                disabled={loading}
                className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Multi-Agent Analysis...
                  </>
                ) : (
                  <>Analyze & Run GreenCredit Engine <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>
        );

      case AppStep.Normalization:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">1. Data Normalization</h2>
            <p className="text-slate-500">Converting raw inputs into structured risk features.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-emerald-700">Financial Vectors</h3>
                <div className="space-y-4">
                  {Object.entries(normalized?.financial || {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold">{val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-emerald-700">Sustainability Vectors</h3>
                <div className="space-y-4">
                  {Object.entries(normalized?.sustainability || {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold">{val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case AppStep.FinancialRisk:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <ShieldCheck className="text-blue-500" /> 2. Financial Risk Profile
              </h2>
              <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                financialRisk?.band === 'Low' ? 'bg-green-100 text-green-700' : 
                financialRisk?.band === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {financialRisk?.band} Risk
              </span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialRisk?.breakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-5xl font-black text-slate-800">{financialRisk?.score}</span>
                    <p className="text-slate-400 font-medium">Financial Credit Score</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm leading-relaxed italic">
                    "{financialRisk?.summary}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case AppStep.SustainabilityRisk:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Leaf className="text-emerald-500" /> 3. SDG Alignment & Risk
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sustainabilityRisk?.sdgs}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                      <Radar name="SDG Contribution" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-black text-emerald-600">{sustainabilityRisk?.score}</span>
                    <span className="text-slate-400 font-bold mb-2">/ 100</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {sustainabilityRisk?.impactDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {sustainabilityRisk?.sdgs.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-800">{s.subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case AppStep.Decision:
        return (
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800">4. GreenCredit Decision</h2>
            <div className="relative inline-block py-10">
              <div className="w-48 h-48 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl font-black text-slate-800">{decision?.greenCreditScore}</span>
                  <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">G-Score</div>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-xl">
                {decision?.status}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100 space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Approval Justification</h3>
              <p className="text-slate-600 leading-relaxed italic">"{decision?.justification}"</p>
              <div className="pt-4 border-t border-slate-100 flex justify-center gap-8">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Base Rate</div>
                  <div className="text-xl font-bold text-slate-800">4.50%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Green Discount</div>
                  <div className="text-xl font-bold text-emerald-600">{decision?.aprAdjustment}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Final APR</div>
                  <div className="text-xl font-bold text-slate-800">{(4.5 - parseFloat(decision?.aprAdjustment || '0')).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
        );

      case AppStep.Uplift:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-blue-500" /> 5. Sustainability Uplift Planner
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-center gap-12 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-400">{uplift?.currentScore}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase">Current</div>
                </div>
                <ArrowRight size={32} className="text-emerald-500 animate-pulse" />
                <div className="text-center">
                  <div className="text-6xl font-black text-emerald-600">{uplift?.projectedScore}</div>
                  <div className="text-sm font-bold text-emerald-600 uppercase">Potential</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uplift?.recommendations.map((rec, i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-200 transition-all group">
                    <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Settings size={20} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">{rec.title}</h4>
                    <p className="text-sm text-slate-500 mb-4">{rec.action}</p>
                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} /> Impact: {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case AppStep.Simulation:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Activity className="text-orange-500" /> 6. Climate Transition Simulator
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">Future Scenario</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">Financial Impact</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">ESG Impact</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-600">Adjusted Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {simulations.map((sim, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{sim.scenario}</td>
                      <td className={`px-6 py-4 font-bold ${sim.financialImpact < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {sim.financialImpact > 0 ? '+' : ''}{sim.financialImpact}%
                      </td>
                      <td className={`px-6 py-4 font-bold ${sim.sustainabilityImpact < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {sim.sustainabilityImpact > 0 ? '+' : ''}{sim.sustainabilityImpact}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-slate-400 h-full" style={{ width: `${sim.totalScore}%` }}></div>
                           </div>
                           <span className="font-bold text-slate-800">{sim.totalScore}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case AppStep.Review:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="text-indigo-500" /> 7. Human Review Assistant
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" /> Executive Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {review?.keyDrivers.map((driver, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl text-sm font-medium border border-slate-100">
                        {driver}
                      </div>
                    ))}
                  </div>
                  <h4 className="font-bold mb-2">Ethical Consideration</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {review?.ethicalConsiderations}
                  </p>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-1">Suggested Next Steps</h4>
                    <p className="text-indigo-800 text-sm">{review?.suggestedNextSteps}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest px-2">Risk Highlights</h3>
                {review?.riskHighlights.map((hl, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex gap-3 ${
                    hl.type === 'Warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                    hl.type === 'Info' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                    'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                    <div className="mt-0.5">
                      {hl.type === 'Warning' ? <AlertTriangle size={18} /> : 
                       hl.type === 'Info' ? <Activity size={18} /> : 
                       <CheckCircle size={18} />}
                    </div>
                    <span className="text-sm font-medium">{hl.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">GreenCredit AI</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Intelligent ESG Lending</p>
            </div>
          </div>
          <div className="hidden md:flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-1.5 rounded-full transition-all ${step === s ? 'bg-emerald-500 w-12' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold text-sm">
              JS
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Step {step} of 8</p>
              <h2 className="text-2xl font-bold text-slate-800">
                {step === 1 ? 'Start Assessment' : 
                 step === 2 ? 'Normalization View' :
                 step === 3 ? 'Credit Risk Analysis' :
                 step === 4 ? 'ESG Metrics' :
                 step === 5 ? 'Lending Decision' :
                 step === 6 ? 'Optimization Path' :
                 step === 7 ? 'Stress Testing' : 'Final Review'}
              </h2>
           </div>
           {step > 1 && (
             <div className="flex gap-2">
               <button 
                 onClick={prevStep} 
                 className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-all text-sm"
               >
                 <ChevronLeft size={18} /> Back
               </button>
               <button 
                 onClick={nextStep} 
                 disabled={step === AppStep.Review}
                 className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-bold transition-all text-sm disabled:opacity-50"
               >
                 Next <ChevronRight size={18} />
               </button>
             </div>
           )}
        </div>

        <div className="min-h-[500px]">
          {renderStep()}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 border-t border-slate-200 pt-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© 2024 GreenCredit AI • Built with Google Gemini 3</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Compliance</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
