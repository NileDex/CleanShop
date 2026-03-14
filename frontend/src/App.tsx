import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Mail, 
  Settings, 
  Home,
  Package,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  Lock,
  LogOut,
  AlertTriangle,
  Star,
  User,
  Send,
  Calendar,
  MessageSquare
} from 'lucide-react';
import LegalPage from './pages/Legal';

const API_URL = import.meta.env.VITE_API_URL || '';

interface AdRequest {
  _id?: string;
  name: string;
  email: string;
  whatsapp?: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Review {
  _id?: string;
  productId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface Seller {
  _id?: string;
  name: string;
  email: string;
  whatsapp: string;
}

interface Ad {
  _id?: string;
  title: string;
  image: string;
  link?: string;
  startDate?: string;
  endDate?: string;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  fullInfo?: string;
  price: number;
  image: string;
  inStock: boolean;
  sellerId?: string;
  seller?: {
    name: string;
    email: string;
    whatsapp: string;
  };
}

const AdCarousel = ({ ads, onBookAd }: { ads: Ad[], onBookAd: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const activeAds = ads.filter(ad => {
    if (!ad.startDate || !ad.endDate) return true;
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    return now >= start && now <= end;
  });

  if (activeAds.length === 0) return null;

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-3xl mb-12 shadow-xl shadow-black/5 group">
      {activeAds.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex % activeAds.length}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <a href={activeAds[currentIndex % activeAds.length].link || "#"} target="_blank" rel="noopener noreferrer">
              <img
                src={activeAds[currentIndex % activeAds.length].image}
                alt={activeAds[currentIndex % activeAds.length].title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                  {activeAds[currentIndex % activeAds.length].title}
                </h2>
              </div>
            </a>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="w-full h-full bg-black/5 flex flex-col items-center justify-center p-8 text-center">
          <ImageIcon className="w-12 h-12 text-black/10 mb-4" />
          <h3 className="text-xl font-bold text-black/20">Your Ad Here</h3>
          <p className="text-black/30 text-sm mt-2">Promote your brand to our curated audience.</p>
        </div>
      )}
      
      <button 
        onClick={onBookAd}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
      >
        <Calendar className="w-3 h-3" />
        Book an Ad
      </button>

      {activeAds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeAds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex % activeAds.length ? "bg-white w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewSection = ({ productId, isAdmin, adminToken }: { productId: string, isAdmin?: boolean, adminToken?: string | null }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ userName: '', comment: '', rating: 5 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setNewReview({ userName: '', comment: '', rating: 5 });
        setShowModal(false);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error posting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !adminToken) return;
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-black/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Reviews ({reviews.length})
        </h4>
        <button 
          onClick={() => setShowModal(true)}
          className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors px-2 py-1 rounded-md border border-black/10 hover:border-black/20"
        >
          Rate & Review
        </button>
      </div>

      <div className="space-y-4 mb-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-black/20" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-black/30 italic">No reviews yet. Be the first to share your opinion!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-black/5 p-3 rounded-xl transition-all hover:bg-black/10 flex justify-between items-start group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold">{review.userName}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-2.5 h-2.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-black/10'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-black/60 leading-relaxed">{review.comment}</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => review._id && handleDelete(review._id)}
                  className="ml-2 p-1 text-black/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Write a Review</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5 text-black/20" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">Your Name</label>
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">Rating</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer transition-all"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">Review</label>
                  <textarea 
                    placeholder="What did you think of this product?"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none min-h-[100px] resize-none transition-all"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Review</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSellerPanel, setShowSellerPanel] = useState(false);
  const [showAdPanel, setShowAdPanel] = useState(false);
  const [showAdBookingModal, setShowAdBookingModal] = useState(false);
  const [showAdRequestsPanel, setShowAdRequestsPanel] = useState(false);
  const [adRequests, setAdRequests] = useState<AdRequest[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newAdRequest, setNewAdRequest] = useState({
    name: '',
    email: '',
    whatsapp: '',
    details: ''
  });
  const [newSeller, setNewSeller] = useState<Seller>({
    name: '',
    email: '',
    whatsapp: ''
  });
  const [newAd, setNewAd] = useState<Ad>({
    title: '',
    image: '',
    link: '',
    startDate: '',
    endDate: ''
  });
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    fullInfo: '',
    price: 0,
    image: '',
    inStock: true,
    sellerId: ''
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [currentView, setCurrentView] = useState<'shop' | 'tos' | 'privacy'>('shop');

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  useEffect(() => {
    fetchProducts();
    fetchAds();
    if (adminToken) {
      fetchSellers();
      fetchAdRequests();
    }
    // Check DB status periodically
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [adminToken]);

  const fetchAdRequests = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_URL}/api/ad-requests`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdRequests(data);
      }
    } catch (err) {
      console.error('Error fetching ad requests:', err);
    }
  };

  const submitAdRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/ad-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdRequest)
      });
      if (res.ok) {
        setNewAdRequest({ name: '', email: '', whatsapp: '', details: '' });
        setShowAdBookingModal(false);
        alert('Ad request submitted successfully! We will contact you soon.');
      }
    } catch (err) {
      console.error('Error submitting ad request:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteAdRequest = async (id: string) => {
    if (!adminToken) return;
    requestConfirm(
      'Delete Ad Request',
      'Are you sure you want to delete this request?',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/ad-requests/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (res.ok) fetchAdRequests();
        } catch (err) {
          console.error('Error deleting ad request:', err);
        }
      }
    );
  };

  const fetchAds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ads`);
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
    }
  };

  const addAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_URL}/api/ads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newAd)
      });
      if (res.ok) {
        setNewAd({ title: '', image: '', link: '' });
        fetchAds();
      }
    } catch (err) {
      console.error('Error adding ad:', err);
    }
  };

  const deleteAd = async (id: string) => {
    if (!adminToken) return;
    requestConfirm(
      'Delete Advertisement',
      'Are you sure you want to delete this ad? This action cannot be undone.',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/ads/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (res.ok) fetchAds();
        } catch (err) {
          console.error('Error deleting ad:', err);
        }
      }
    );
  };

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAd({ ...newAd, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchSellers = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_URL}/api/sellers`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
      }
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const addSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_URL}/api/sellers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newSeller)
      });
      if (res.ok) {
        setNewSeller({ name: '', email: '', whatsapp: '' });
        fetchSellers();
      }
    } catch (err) {
      console.error('Error adding seller:', err);
    }
  };

  const deleteSeller = async (id: string) => {
    if (!adminToken) return;
    requestConfirm(
      'Delete Seller',
      'Are you sure? This will not delete products assigned to this seller, but they will no longer have contact info associated.',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/sellers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (res.ok) fetchSellers();
        } catch (err) {
          console.error('Error deleting seller:', err);
        }
      }
    );
  };

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) setDbStatus('connected');
      else if (res.status === 503) setDbStatus('connecting');
      else setDbStatus('error');
    } catch {
      setDbStatus('error');
    }
  };

  const fetchProducts = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const contentType = res.headers.get("content-type");
      
      if (!res.ok) {
        if (res.status === 503) {
          setDbStatus('connecting');
          throw new Error("Database is still connecting. Please wait...");
        }
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          setDbStatus('error');
          throw new Error(errorData.details || errorData.error || `Server error: ${res.status}`);
        }
        
        throw new Error(`Server error: ${res.status}`);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response.");
      }

      const data = await res.json();
      setProducts(data);
      setDbStatus('connected');
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setShowLoginModal(false);
        setAdminPassword('');
        setIsAdmin(true);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server error. Please try again.');
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      if (adminToken) {
        setIsAdmin(true);
      } else {
        setShowLoginModal(true);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ name: '', description: '', fullInfo: '', price: 0, image: '', inStock: true, sellerId: '' });
        fetchProducts();
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleStock = async (id: string, currentStatus: boolean) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ inStock: !currentStatus })
      });
      if (res.status === 401) handleLogout();
      else fetchProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!adminToken) return;
    requestConfirm(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/products/${id}`, { 	
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          if (res.status === 401) handleLogout();
          else fetchProducts();
        } catch (err) {
          console.error('Error deleting product:', err);
        }
      }
    );
  };

  const contactWhatsApp = (product: Product) => {
    const number = product.seller?.whatsapp || '';
    const message = encodeURIComponent(`Hello, I'm interested in your product: ${product.name}`);
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const contactEmail = (product: Product) => {
    const email = product.seller?.email || '';
    const subject = encodeURIComponent(`Inquiry about ${product.name}`);
    const body = encodeURIComponent(`Hello, I would like to know more about ${product.name}.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (currentView !== 'shop') {
    return <LegalPage onBack={() => setCurrentView('shop')} tab={currentView === 'tos' ? 'tos' : 'privacy'} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-black selection:text-white relative overflow-hidden">
      {/* Decorative Global Gradients */}
      <div className="fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/5 overflow-hidden">
        {/* Decorative Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">CLEANSHOP</h1>
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">Pure Quality</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {adminToken && isAdmin && (
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-32 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {selectedProduct ? (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-black/5"
            >
              <div className="p-4 md:p-8 border-b border-black/5 flex items-center justify-between bg-black/5">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors group"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Back to Shop
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Product Details</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                  <motion.img 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={selectedProduct.image || 'https://picsum.photos/seed/product/800/800'} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-contain rounded-2xl shadow-xl"
                  />
                </div>
                <div className="p-8 md:p-12 lg:p-16 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-4xl font-bold leading-tight mb-2 tracking-tight">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedProduct.inStock ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {selectedProduct.inStock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <span className="text-3xl font-mono font-medium text-emerald-600">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-8 flex-1">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-3 flex items-center gap-2">
                        Description
                      </h3>
                      <p className="text-black/60 leading-relaxed text-lg">{selectedProduct.description}</p>
                    </div>

                    {selectedProduct.fullInfo && (
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-3">Technical Specifications</h3>
                        <div className="bg-black/5 p-6 rounded-2xl border border-black/5">
                          <p className="text-black/60 leading-relaxed whitespace-pre-wrap text-sm italic font-medium">
                            {selectedProduct.fullInfo}
                          </p>
                        </div>
                      </div>
                    )}

                    {!isAdmin && (
                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/5">
                        <button 
                          onClick={() => contactWhatsApp(selectedProduct)}
                          disabled={!selectedProduct.inStock}
                          className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Chat on WhatsApp
                        </button>
                        <button 
                          onClick={() => contactEmail(selectedProduct)}
                          disabled={!selectedProduct.inStock}
                          className="flex-1 flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Mail className="w-5 h-5" />
                          Send Email
                        </button>
                      </div>
                    )}

                    <div className="pt-8 border-t border-black/5">
                      <ReviewSection 
                        productId={selectedProduct._id!} 
                        isAdmin={isAdmin} 
                        adminToken={adminToken} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Admin Quick Actions - Fully Responsive */}
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                  >
                    <Plus className="w-4 h-4" />
                    New Product
                  </button>
                  <button 
                    onClick={() => setShowSellerPanel(true)}
                    className="flex items-center gap-2 bg-white border border-black/5 text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/5"
                  >
                    <User className="w-4 h-4 text-black/20" />
                    Sellers
                  </button>
                  <button 
                    onClick={() => setShowAdPanel(true)}
                    className="flex items-center gap-2 bg-white border border-black/5 text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/5"
                  >
                    <ImageIcon className="w-4 h-4 text-black/20" />
                    Ads
                  </button>
                  <button 
                    onClick={() => setShowAdRequestsPanel(true)}
                    className="flex items-center gap-2 bg-white border border-black/5 text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/5 relative"
                  >
                    <MessageCircle className="w-4 h-4 text-black/20" />
                    Requests
                    {adRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                    )}
                  </button>
                </div>
              )}

              {/* Ad Carousel */}
              {!isAdmin && <AdCarousel ads={ads} onBookAd={() => setShowAdBookingModal(true)} />}

              {/* Header Section */}
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    {isAdmin ? 'Product Management' : 'Curated Collection'}
                  </h1>
                  <p className="text-black/60 max-w-2xl text-lg">
                    {isAdmin 
                      ? 'Manage your inventory, update stock status, and add new products to your store.' 
                      : 'Discover our handpicked selection of premium products. Quality meets simplicity.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-red-600 font-bold">
                    <XCircle className="w-5 h-5" />
                    Connection Issue Detected
                  </div>
                  <p className="text-red-500/80 text-sm leading-relaxed">
                    {error.includes("CONFIGURATION_ERROR") ? (
                      <>
                        <strong>Setup Required:</strong> The <code>MONGODB_URI</code> secret is missing. 
                        Please go to <strong>Settings &gt; Secrets</strong> and add your MongoDB connection string.
                      </>
                    ) : error.includes("AUTHENTICATION_FAILED") ? (
                      <>
                        <strong>Authentication Failed:</strong> The password in your connection string is incorrect. 
                        Please update the <strong>MONGODB_URI</strong> in your <strong>Settings &gt; Secrets</strong> 
                        with the correct password from your MongoDB Atlas dashboard.
                      </>
                    ) : error.includes("SSL") || dbStatus === 'error' ? (
                      <>
                        <strong>Action Required:</strong> Your MongoDB Atlas cluster is rejecting the connection. 
                        Please go to <strong>Network Access</strong> in your MongoDB dashboard and 
                        add <strong>0.0.0.0/0</strong> to your allowlist.
                      </>
                    ) : error}
                  </p>
                  <button 
                    onClick={fetchProducts}
                    className="w-fit px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-black/20" />
                  <p className="text-black/40 font-medium">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-black/10">
                  <Package className="w-12 h-12 mx-auto mb-4 text-black/20" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-black/40">Start by adding your first product in the admin panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <motion.div 
                      layout
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col h-full"
                    >
                      <div 
                        className="aspect-square overflow-hidden bg-gray-100 relative cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <img 
                          src={product.image || 'https://picsum.photos/seed/product/800/800'} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-black/5">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(product._id!);
                              }}
                              className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div 
                          className="cursor-pointer flex-1"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                            <span className="font-mono font-medium text-black/60">${product.price.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-black/50 line-clamp-2 mb-4 h-10">
                            {product.description}
                          </p>
                        </div>

                        {isAdmin ? (
                          <button 
                            onClick={() => toggleStock(product._id!, product.inStock)}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all mt-auto ${
                              product.inStock 
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {product.inStock ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                          </button>
                        ) : (
                          <div className="flex gap-2 mt-auto">
                            <button 
                              onClick={() => contactWhatsApp(product)}
                              disabled={!product.inStock}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </button>
                            <button 
                              onClick={() => contactEmail(product)}
                              disabled={!product.inStock}
                              className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ad Booking Modal */}
      <AnimatePresence>
        {showAdBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdBookingModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Book an Advertisement</h2>
                  <button onClick={() => setShowAdBookingModal(false)} className="p-2 hover:bg-black/5 rounded-full">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={submitAdRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={newAdRequest.name}
                        onChange={(e) => setNewAdRequest({ ...newAdRequest, name: e.target.value })}
                        className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Email Address</label>
                      <input 
                        type="email"
                        required
                        value={newAdRequest.email}
                        onChange={(e) => setNewAdRequest({ ...newAdRequest, email: e.target.value })}
                        className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">WhatsApp Number (Optional)</label>
                    <input 
                      type="text"
                      value={newAdRequest.whatsapp}
                      onChange={(e) => setNewAdRequest({ ...newAdRequest, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Ad Details / Requirements</label>
                    <textarea 
                      required
                      value={newAdRequest.details}
                      onChange={(e) => setNewAdRequest({ ...newAdRequest, details: e.target.value })}
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none min-h-[120px]"
                      placeholder="Tell us about your brand and what you'd like to promote..."
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg mt-4 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ad Requests Sidepanel */}
      <AnimatePresence>
        {showAdRequestsPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdRequestsPanel(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center">
                <h2 className="text-xl font-bold">Ad Requests</h2>
                <button onClick={() => setShowAdRequestsPanel(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <XCircle className="w-6 h-6 text-black/20" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {adRequests.map(request => (
                  <div key={request._id} className="p-4 bg-black/5 rounded-2xl space-y-3 relative group">
                    <button 
                      onClick={() => deleteAdRequest(request._id!)}
                      className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                        {request.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{request.name}</p>
                        <p className="text-xs text-black/40">{request.email}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-black/5 text-xs text-black/60 leading-relaxed">
                      {request.details}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-black/30">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      {request.whatsapp && (
                        <a 
                          href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          className="text-[10px] font-bold text-emerald-600 hover:underline"
                        >
                          WhatsApp: {request.whatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {adRequests.length === 0 && (
                  <div className="text-center py-20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-black/10" />
                    <p className="text-black/40 italic">No ad requests yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAdPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdPanel(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center">
                <h2 className="text-xl font-bold">Advertisement Management</h2>
                <button onClick={() => setShowAdPanel(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <XCircle className="w-6 h-6 text-black/20" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={addAd} className="space-y-4 mb-8 p-4 bg-black/5 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">Add New Advertisement</h3>
                  <input 
                    required
                    type="text"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="Ad Title (e.g. Summer Sale 50% Off)"
                    className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <input 
                    type="text"
                    value={newAd.link || ''}
                    onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
                    placeholder="Link URL (Optional)"
                    className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Start Date</label>
                      <input 
                        type="date"
                        value={newAd.startDate}
                        onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">End Date</label>
                      <input 
                        type="date"
                        value={newAd.endDate}
                        onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-2 focus:ring-black transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Ad Image</label>
                    <div className="relative group">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleAdImageUpload}
                        className="hidden"
                        id="ad-image-upload"
                      />
                      <label 
                        htmlFor="ad-image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/10 rounded-2xl cursor-pointer hover:bg-black/5 transition-all overflow-hidden"
                      >
                        {newAd.image ? (
                          <img src={newAd.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-black/20 mb-2" />
                            <span className="text-sm text-black/40 font-medium">Click to upload ad image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                    Save Advertisement
                  </button>
                </form>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">Active Advertisements</h3>
                  {ads.map(ad => (
                    <div key={ad._id} className="p-4 bg-white border border-black/5 rounded-2xl flex flex-col gap-3">
                      <img src={ad.image} alt={ad.title} className="w-full h-24 object-cover rounded-xl" />
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{ad.title}</p>
                          {ad.link && <p className="text-xs text-black/40 truncate max-w-[200px]">{ad.link}</p>}
                          {ad.startDate && ad.endDate && (
                            <p className="text-[10px] text-black/30 mt-1">
                              {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button onClick={() => deleteAd(ad._id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {ads.length === 0 && (
                    <p className="text-center text-black/20 py-8 italic">No advertisements added yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seller Management Sidepanel */}
      <AnimatePresence>
        {showSellerPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSellerPanel(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center">
                <h2 className="text-xl font-bold">Seller Management</h2>
                <button onClick={() => setShowSellerPanel(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <XCircle className="w-6 h-6 text-black/20" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={addSeller} className="space-y-4 mb-8 p-4 bg-black/5 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">Add New Seller</h3>
                  <input 
                    required
                    type="text"
                    value={newSeller.name}
                    onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                    placeholder="Seller Name"
                    className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <input 
                    required
                    type="email"
                    value={newSeller.email}
                    onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                    placeholder="Email Address"
                    className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <input 
                    required
                    type="text"
                    value={newSeller.whatsapp}
                    onChange={(e) => setNewSeller({ ...newSeller, whatsapp: e.target.value })}
                    placeholder="WhatsApp Number (e.g. +123456789)"
                    className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                  <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                    Save Seller
                  </button>
                </form>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">Existing Sellers</h3>
                  {sellers.map(seller => (
                    <div key={seller._id} className="p-4 bg-white border border-black/5 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold">{seller.name}</p>
                        <p className="text-xs text-black/40">{seller.email}</p>
                        <p className="text-xs text-black/40">{seller.whatsapp}</p>
                      </div>
                      <button onClick={() => deleteSeller(seller._id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {sellers.length === 0 && (
                    <p className="text-center text-black/20 py-8 italic">No sellers added yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold">Admin Access</h2>
                  <p className="text-black/40 text-sm mt-1">Please enter your password to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Password</label>
                    <input 
                      required
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                    />
                  </div>

                  {loginError && (
                    <p className="text-red-500 text-xs font-medium px-1">{loginError}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Login
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New Product</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-black/20" />
                  </button>
                </div>

                <form onSubmit={addProduct} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Product Name</label>
                    <input 
                      required
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Minimalist Desk Lamp"
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Price ($)</label>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        placeholder="49.99"
                        className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Assign Seller</label>
                      <select 
                        required
                        value={newProduct.sellerId}
                        onChange={(e) => setNewProduct({ ...newProduct, sellerId: e.target.value })}
                        className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none appearance-none"
                      >
                        <option value="">Select a Seller</option>
                        {sellers.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Description</label>
                    <textarea 
                      required
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="A beautiful addition to any workspace..."
                      rows={3}
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Full Information (Optional)</label>
                    <textarea 
                      value={newProduct.fullInfo}
                      onChange={(e) => setNewProduct({ ...newProduct, fullInfo: e.target.value })}
                      placeholder="Detailed specifications, dimensions, care instructions..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 px-1">Product Image</label>
                    <div className="relative group">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/10 rounded-2xl cursor-pointer hover:bg-black/5 transition-all overflow-hidden"
                      >
                        {newProduct.image ? (
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-black/20 mb-2" />
                            <span className="text-sm text-black/40 font-medium">Click to upload image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg mt-4 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Product
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold">{confirmModal.title}</h2>
                  <p className="text-black/40 text-sm mt-2 leading-relaxed">{confirmModal.message}</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                    className="flex-1 px-4 py-3 bg-black/5 text-black rounded-xl font-bold text-sm hover:bg-black/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal({ ...confirmModal, show: false });
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <footer className="bg-white border-t border-black/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <button onClick={() => setCurrentView('tos')} className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Terms of Service</button>
            <button onClick={() => setCurrentView('privacy')} className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Privacy Policy</button>
            {!isAdmin && (
              <button 
                onClick={handleAdminToggle}
                className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Admin Panel
              </button>
            )}
          </div>
          <p className="text-sm text-black/20 font-medium">
            &copy; {new Date().getFullYear()} CLEANSHOP. Pure Quality.
          </p>
        </div>
      </footer>
    </div>
  );
}
