import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, Send, ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-purple-600 shadow-md shadow-purple-500/20 text-white">
              <MailCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">MailPulse</span>
              <span className="block text-[10px] text-purple-600 font-bold tracking-wider uppercase">
                {t.landing.platform}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t.landing.signIn}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t.landing.getStarted}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[400px] w-[600px] bg-purple-200/50 blur-[120px] rounded-full" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 text-purple-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-2xs">
          <Zap className="h-3.5 w-3.5" /> {t.landing.badge}
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight mb-6">
          {t.landing.title}{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {t.landing.titleAccent}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
          {t.landing.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register">
            <Button size="lg" className="shadow-lg shadow-purple-600/25" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {t.landing.launchCampaign}
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              {t.landing.demoSignIn}
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20 text-left">
          <Card className="hover:border-purple-200">
            <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 font-bold">
              <Send className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t.landing.queueTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.landing.queueDescription}
            </p>
          </Card>

          <Card className="hover:border-purple-200">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t.landing.analyticsTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.landing.analyticsDescription}
            </p>
          </Card>

          <Card className="hover:border-purple-200">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t.landing.securityTitle}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.landing.securityDescription}
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs font-medium text-slate-500">
        {t.landing.footer}
      </footer>
    </div>
  );
};
