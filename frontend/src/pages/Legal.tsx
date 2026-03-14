import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  tab: 'tos' | 'privacy';
}

const LegalPage: React.FC<LegalPageProps> = ({ onBack, tab }) => {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-black selection:text-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold hover:opacity-60 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
          <div className="flex gap-4">
            <span className={`text-xs font-bold uppercase tracking-widest ${tab === 'tos' ? 'text-black' : 'text-black/20'}`}>Terms</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${tab === 'privacy' ? 'text-black' : 'text-black/20'}`}>Privacy</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl shadow-black/5 border border-black/5"
        >
          {tab === 'tos' ? (
            <div className="prose prose-slate max-w-none">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-8">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-8">Terms of Service</h1>
              <p className="text-lg text-black/60 leading-relaxed mb-8 italic">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="space-y-6">
                <h2 className="text-2xl font-bold pt-4 text-black">1. Agreement to Terms</h2>
                <p className="text-black/60 leading-relaxed">By accessing CleanShop, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">2. Use of Service</h2>
                <p className="text-black/60 leading-relaxed">Our platform is provided to browse and contact sellers for products. We do not handle payments directly; all transactions are organized between the buyer and the seller.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">3. User Conduct</h2>
                <p className="text-black/60 leading-relaxed">Users are expected to communicate respectfully. We reserve the right to remove any reviews or content that violates our community standards.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">4. Disclaimer</h2>
                <p className="text-black/60 leading-relaxed">CleanShop is not responsible for the quality, safety, or legality of the products listed. Buyers should exercise due diligence when contacting sellers.</p>
              </section>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-8">Privacy Policy</h1>
              <p className="text-lg text-black/60 leading-relaxed mb-8 italic">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="space-y-6">
                <h2 className="text-2xl font-bold pt-4 text-black">1. Information Collection</h2>
                <p className="text-black/60 leading-relaxed">We collect minimal information required to facilitate contact between buyers and sellers, such as your name and contact details if provided during a review or inquiry.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">2. Cookies</h2>
                <p className="text-black/60 leading-relaxed">We use essential cookies to keep you logged in to the admin panel and to improve your browsing experience.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">3. Data Sharing</h2>
                <p className="text-black/60 leading-relaxed">We do not sell your data. Your contact inquiries are sent directly to the sellers of the products you are interested in.</p>
                
                <h2 className="text-2xl font-bold pt-4 text-black">4. Your Rights</h2>
                <p className="text-black/60 leading-relaxed">You have the right to request deletion of your data or reviews at any time by contacting our support team.</p>
              </section>
            </div>
          )}
        </motion.div>
      </main>
      
      <footer className="py-10 text-center text-black/20 text-xs font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} CleanShop &bull; Pure Quality
      </footer>
    </div>
  );
};

export default LegalPage;
