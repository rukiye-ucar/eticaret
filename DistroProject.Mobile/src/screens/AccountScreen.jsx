import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosInstance';
import { colors, radius, spacing } from '../theme';

// Sipariş durum bilgileri (web MyAccount ile aynı)
const statusConfig = {
    Pending: { emoji: '⏳', text: 'Onay Bekliyor', color: '#f59e0b' },
    Approved: { emoji: '✅', text: 'Onaylandı', color: '#3b82f6' },
    Shipped: { emoji: '🚚', text: 'Kargoda', color: '#06b6d4' },
    Delivered: { emoji: '📦', text: 'Teslim Edildi', color: '#22c55e' },
    PartialDelivered: { emoji: '📫', text: 'Kısmi Teslim', color: '#a855f7' },
};

export default function AccountScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                // Kullanıcı giriş yapmamış → login ekranına yönlendir (ileride eklenecek)
                setLoading(false);
                return;
            }

            // Paralel çekme
            const [userRes, ordersRes] = await Promise.all([
                axiosInstance.get('/users/me'),
                axiosInstance.get('/orders/my-orders'),
            ]);
            setUser(userRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error('Hesap verisi çekme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
                text: 'Çıkış Yap',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    Alert.alert('Başarılı', 'Oturumunuz kapatıldı.');
                },
            },
        ]);
    };

    // İstatistikler  
    const totalOrders = orders.length;
    const pendingCount = orders.filter((o) => o.status === 'Pending').length;
    const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
    const deliveredCount = orders.filter((o) =>
        o.status === 'Delivered' || o.status === 'PartialDelivered'
    ).length;
    const totalSpent = orders.reduce((s, o) => s + o.totalPrice, 0);

    // Siparişleri tarihe göre grupla
    const groupedByDate = orders.reduce((acc, order) => {
        const date = new Date(order.orderDate).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.loggedOutIcon}>👤</Text>
                <Text style={styles.loggedOutTitle}>Giriş yapılmadı</Text>
                <Text style={styles.loggedOutSub}>Hesabınızı görüntülemek için giriş yapın</Text>
                <Pressable style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>Giriş Yap</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Kullanıcı Başlığı */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.name ? user.name[0].toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.userName}>{user.name || 'Kullanıcı'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>👑 Premium</Text>
                        </View>
                    )}
                </View>
                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutBtnText}>Çıkış</Text>
                </Pressable>
            </View>

            {/* İstatistik Kartları */}
            <View style={styles.statsRow}>
                {[
                    { label: 'Toplam', value: totalOrders, emoji: '🛍️' },
                    { label: 'Bekliyor', value: pendingCount, emoji: '⏳' },
                    { label: 'Kargoda', value: shippedCount, emoji: '🚚' },
                    { label: 'Teslim', value: deliveredCount, emoji: '📦' },
                ].map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                        <Text style={styles.statEmoji}>{stat.emoji}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Toplam Harcama */}
            <View style={styles.spentBar}>
                <Text style={styles.spentLabel}>Toplam Harcama</Text>
                <Text style={styles.spentAmount}>${totalSpent.toFixed(2)}</Text>
            </View>

            {/* Premium Bakiye */}
            {user.isPremium && (
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceTitle}>👑 Premium Bakiye</Text>
                    <Text style={[
                        styles.balanceAmount,
                        { color: user.balance < 0 ? '#ef4444' : '#22c55e' }
                    ]}>
                        {user.balance < 0
                            ? `-$${Math.abs(user.balance).toFixed(2)}`
                            : `$${user.balance.toFixed(2)}`}
                    </Text>
                    {user.balance < 0 && (
                        <Text style={styles.debtText}>
                            Toplam borcunuz: ${Math.abs(user.balance).toFixed(2)}
                        </Text>
                    )}
                </View>
            )}

            {/* Sipariş Geçmişi */}
            <Text style={styles.sectionTitle}>Sipariş Geçmişi</Text>

            {orders.length === 0 ? (
                <View style={styles.emptyOrders}>
                    <Text style={{ fontSize: 40 }}>📋</Text>
                    <Text style={styles.emptyText}>Henüz siparişiniz yok</Text>
                </View>
            ) : (
                Object.entries(groupedByDate).map(([date, dateOrders]) => (
                    <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateLabel}>📅 {date}</Text>
                        {dateOrders.map((order) => {
                            const cfg = statusConfig[order.status] || { emoji: '❓', text: order.status, color: '#888' };
                            return (
                                <View key={order.id} style={styles.orderCard}>
                                    <View style={styles.orderLeft}>
                                        <Text style={styles.orderProductName} numberOfLines={1}>
                                            {order.product?.name || `Ürün #${order.productId}`}
                                        </Text>
                                        <Text style={styles.orderQty}>
                                            Adet: {order.quantity}
                                            {order.deliveredQuantity > 0 && order.deliveredQuantity !== order.quantity
                                                ? ` (Teslim: ${order.deliveredQuantity})`
                                                : ''}
                                        </Text>

                                        {/* Durum Zaman Çizelgesi */}
                                        <View style={styles.timeline}>
                                            {['Pending', 'Approved', 'Shipped', 'Delivered'].map((step, idx) => {
                                                const stepOrder = ['Pending', 'Approved', 'Shipped', 'Delivered'];
                                                const currentIdx = stepOrder.indexOf(
                                                    order.status === 'PartialDelivered' ? 'Delivered' : order.status
                                                );
                                                const isActive = idx <= currentIdx;
                                                return (
                                                    <View key={step} style={styles.timelineStep}>
                                                        <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
                                                        {idx < 3 && (
                                                            <View style={[styles.timelineLine, isActive && styles.timelineLineActive]} />
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View style={styles.orderRight}>
                                        <Text style={styles.orderPrice}>${order.totalPrice}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
                                            <Text style={[styles.statusText, { color: cfg.color }]}>
                                                {cfg.emoji} {cfg.text}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgBase,
    },
    content: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        backgroundColor: colors.bgBase,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgContainer,
        borderRadius: radius.card,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.bgBase,
        fontSize: 22,
        fontWeight: '800',
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        color: colors.textBase,
        fontSize: 17,
        fontWeight: '700',
    },
    userEmail: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        marginTop: 2,
    },
    premiumBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(249,177,122,0.15)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 4,
    },
    premiumBadgeText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '700',
    },
    logoutBtn: {
        backgroundColor: 'rgba(239,68,68,0.15)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
    },
    logoutBtnText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '700',
    },
    // İstatistikler
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgContainer,
        borderRadius: radius.card,
        padding: spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 4,
    },
    statEmoji: { fontSize: 18 },
    statValue: {
        color: colors.textBase,
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
    },
    // Toplam harcama
    spentBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: radius.card,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    spentLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    spentAmount: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: '800',
    },
    // Premium bakiye
    balanceCard: {
        backgroundColor: 'rgba(249,177,122,0.08)',
        borderRadius: radius.card,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(249,177,122,0.25)',
        gap: 6,
    },
    balanceTitle: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: '800',
    },
    debtText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
    },
    // Sipariş geçmişi
    sectionTitle: {
        color: colors.textBase,
        fontSize: 18,
        fontWeight: '700',
        marginVertical: spacing.sm,
    },
    dateGroup: {
        marginBottom: spacing.md,
    },
    dateLabel: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: colors.bgContainer,
        borderRadius: radius.card,
        padding: spacing.sm,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 10,
    },
    orderLeft: { flex: 1, gap: 4 },
    orderProductName: {
        color: colors.textBase,
        fontSize: 14,
        fontWeight: '600',
    },
    orderQty: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
    },
    timeline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    timelineStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    timelineDotActive: {
        backgroundColor: colors.primary,
    },
    timelineLine: {
        width: 18,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    timelineLineActive: {
        backgroundColor: colors.primary,
    },
    orderRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    orderPrice: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '800',
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    // Boş sipariş
    emptyOrders: {
        alignItems: 'center',
        padding: spacing.xl,
        gap: 10,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
    },
    // Giriş yapılmamış
    loggedOutIcon: { fontSize: 60 },
    loggedOutTitle: {
        color: colors.textBase,
        fontSize: 20,
        fontWeight: '700',
    },
    loggedOutSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    loginBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: radius.button,
        marginTop: 8,
    },
    loginBtnText: {
        color: colors.bgBase,
        fontWeight: '700',
        fontSize: 15,
    },
});
