import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    Download,
    Filter,
    Search,
    Calendar,
    CreditCard,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    ExternalLink,
    Copy,
    Eye,
    RefreshCw,
    Shield,
    Trophy,
    Star,
    Users,
    Video,
    Globe,
    UserCheck,
    Zap
} from 'lucide-react';

const TransactionHistoryPage = () => {
    const BASE_URL = "https://shadii-com.onrender.com"

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentuserId = currentUser.id;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalSpent: 0,
        successfulPayments: 0,
        failedPayments: 0,
        activePlan: 'Free'
    });




    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BASE_URL}/api/payment/history/TransactionHistory/${currentuserId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            //  console.log("thiss is the resposne 000000000000000000000000000000000000000000000000",response)

            if (response.data.success) {
                setTransactions(response.data.transactions);
                calculateStats(response.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (transactions) => {
        const totalSpent = transactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const successfulPayments = transactions.filter(t => t.status === 'success').length;
        const failedPayments = transactions.filter(t => t.status === 'failed').length;

        // Find active plan from latest successful payment
        const latestSuccess = transactions
            .filter(t => t.status === 'success')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        setStats({
            totalSpent,
            successfulPayments,
            failedPayments,
            activePlan: latestSuccess?.planId ? latestSuccess.planId.charAt(0).toUpperCase() + latestSuccess.planId.slice(1) : 'Free'
        });
    };

    const filteredTransactions = transactions.filter(transaction => {
        // Filter by status
        if (filter !== 'all' && transaction.status !== filter) return false;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                transaction.orderId.toLowerCase().includes(term) ||
                transaction.paymentId?.toLowerCase().includes(term) ||
                transaction.status.toLowerCase().includes(term) ||
                transaction.planId?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'created':
                return <Clock className="w-5 h-5 text-amber-500" />;
            default:
                return <Clock className="w-5 h-5 text-slate-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'failed':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'created':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getPlanIcon = (planId) => {
        switch (planId) {
            case 'platinum':
                return <Trophy className="w-4 h-4 text-purple-400" />;
            case 'gold':
                return <Star className="w-4 h-4 text-amber-400" />;
            case 'silver':
                return <Shield className="w-4 h-4 text-slate-400" />;
            default:
                return <Zap className="w-4 h-4 text-blue-400" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amountInPaise) => {
        if (typeof amountInPaise !== "number") return "₹0";

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0
        }).format(amountInPaise / 100);
    };


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You can add a toast notification here
        toast.success('Copied to clipboard!');
    };

    const downloadReceipt = async (transactionId) => {
        // Implement receipt download functionality
        toast.success('Receipt download feature would be implemented here');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
                        <p className="text-slate-400">View all your premium subscription payments and invoices</p>
                    </div>
                    <button
                        onClick={fetchTransactions}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-xl">
                                <CreditCard className="w-6 h-6 text-purple-400" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
                        <div className="text-sm text-slate-400">Total Spent</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-lg font-bold text-emerald-400">{stats.successfulPayments}</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.successfulPayments}</div>
                        <div className="text-sm text-slate-400">Successful Payments</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-rose-600/20 to-pink-600/20 rounded-xl">
                                <XCircle className="w-6 h-6 text-rose-400" />
                            </div>
                            <span className="text-lg font-bold text-rose-400">{stats.failedPayments}</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.failedPayments}</div>
                        <div className="text-sm text-slate-400">Failed Payments</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                                Active
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{stats.activePlan}</div>
                        <div className="text-sm text-slate-400">Current Plan</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, Payment ID, or Plan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['all', 'success', 'failed', 'created'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${filter === status
                                        ? 'bg-gradient-to-r from-purple-600 to-violet-600'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="capitalize">{status}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Transactions Found</h3>
                            <p className="text-slate-400">You haven't made any payments yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Date & Time</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Order Details</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Amount</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Plan</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Duration</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((transaction) => (
                                        <tr
                                            key={transaction._id}
                                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-slate-400">Order:</span>
                                                        <code className="text-xs bg-white/5 px-2 py-1 rounded">
                                                            {transaction.orderId}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(transaction.orderId)}
                                                            className="text-slate-500 hover:text-white"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    {transaction.paymentId && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-slate-400">Payment:</span>
                                                            <code className="text-xs bg-white/5 px-2 py-1 rounded">
                                                                {transaction.paymentId.substring(0, 12)}...
                                                            </code>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="font-semibold">
                                                    {formatCurrency(transaction.amount)}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    {getPlanIcon(transaction.planId)}
                                                    <span className="capitalize">
                                                        {transaction.planId || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>



                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    {(transaction.duration)}

                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                                                    {getStatusIcon(transaction.status)}
                                                    <span className="text-sm capitalize">{transaction.status}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => downloadReceipt(transaction._id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(transaction._id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Copy Transaction ID"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    {transaction.status === 'failed' && (
                                                        <button
                                                            onClick={() => window.location.href = '/premium'}
                                                            className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg"
                                                        >
                                                            Retry
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Current Plan Benefits */}
                {stats.activePlan !== 'Free' && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Your {stats.activePlan} Plan Benefits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.activePlan === 'Silver' && [
                                { icon: <MessageSquare className="w-6 h-6" />, feature: 'Unlimited Messaging', color: 'from-violet-500 to-purple-500' },
                                { icon: <Eye className="w-6 h-6" />, feature: 'Profile Visitors', color: 'from-cyan-400 to-blue-500' },
                                { icon: <Shield className="w-6 h-6" />, feature: 'Privacy Guard', color: 'from-emerald-400 to-green-500' },
                                { icon: <Users className="w-6 h-6" />, feature: 'Priority Support', color: 'from-amber-400 to-orange-500' },
                            ].map((benefit, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.color} w-fit mb-4`}>
                                        {benefit.icon}
                                    </div>
                                    <h4 className="font-semibold">{benefit.feature}</h4>
                                </div>
                            ))}

                            {stats.activePlan === 'Gold' && [
                                { icon: <Video className="w-6 h-6" />, feature: 'Video Connect', color: 'from-pink-500 to-rose-500' },
                                { icon: <Users className="w-6 h-6" />, feature: 'Priority Matching', color: 'from-amber-400 to-orange-500' },
                                { icon: <Trophy className="w-6 h-6" />, feature: 'Premium Badge', color: 'from-purple-500 to-violet-600' },
                                { icon: <UserCheck className="w-6 h-6" />, feature: 'Verified Only Filter', color: 'from-blue-400 to-indigo-500' },
                            ].map((benefit, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.color} w-fit mb-4`}>
                                        {benefit.icon}
                                    </div>
                                    <h4 className="font-semibold">{benefit.feature}</h4>
                                </div>
                            ))}

                            {stats.activePlan === 'Platinum' && [
                                { icon: <Globe className="w-6 h-6" />, feature: 'Global Search', color: 'from-teal-400 to-emerald-500' },
                                { icon: <Shield className="w-6 h-6" />, feature: 'Dedicated Support', color: 'from-purple-500 to-violet-600' },
                                { icon: <Zap className="w-6 h-6" />, feature: 'Profile Boost', color: 'from-amber-500 to-orange-500' },
                                { icon: <Star className="w-6 h-6" />, feature: 'Advanced Analytics', color: 'from-blue-500 to-indigo-600' },
                            ].map((benefit, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.color} w-fit mb-4`}>
                                        {benefit.icon}
                                    </div>
                                    <h4 className="font-semibold">{benefit.feature}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default TransactionHistoryPage;

