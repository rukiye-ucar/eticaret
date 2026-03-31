import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

const getImageUrl = (img, contentType) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `data:${contentType || 'image/png'};base64,${img}`;
};

export default function CartScreen({ navigation }) {
    const { cartItems, removeFromCart, updateQuantity } = useCart();

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
                <Text style={styles.emptySubtitle}>Ürünleri keşfetmeye başlayın</Text>
                <Pressable
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('Ürünler')}
                >
                    <Text style={styles.browseBtnText}>Ürünlere Git →</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>🛒 Sepetim ({cartItems.length} ürün)</Text>

            <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
            >
                {cartItems.map(({ product, quantity }) => {
                    const imgUrl = getImageUrl(product.image, product.imageContentType);
                    return (
                        <View key={product.id} style={styles.item}>
                            {imgUrl ? (
                                <Image source={{ uri: imgUrl }} style={styles.itemImage} />
                            ) : (
                                <View style={[styles.itemImage, styles.noImage]}>
                                    <Text style={{ fontSize: 22 }}>📦</Text>
                                </View>
                            )}

                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
                                <Text style={styles.itemPrice}>${product.price}</Text>
                            </View>

                            {/* Miktar Kontrol */}
                            <View style={styles.qtyRow}>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(product.id, quantity - 1)}
                                >
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </Pressable>
                                <Text style={styles.qtyValue}>{quantity}</Text>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(product.id, quantity + 1)}
                                >
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </Pressable>
                            </View>

                            {/* Ara Toplam + Sil */}
                            <View style={styles.itemRight}>
                                <Text style={styles.subtotal}>${(product.price * quantity).toFixed(2)}</Text>
                                <Pressable
                                    onPress={() =>
                                        Alert.alert('Ürünü Kaldır', `${product.name} sepetten kaldırılsın mı?`, [
                                            { text: 'Vazgeç', style: 'cancel' },
                                            { text: 'Kaldır', style: 'destructive', onPress: () => removeFromCart(product.id) },
                                        ])
                                    }
                                >
                                    <Text style={styles.deleteBtn}>🗑️</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Alt Özet Bar */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Toplam</Text>
                    <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => Alert.alert('Ödeme', 'Checkout sayfası yakında!')}
                >
                    <Text style={styles.checkoutBtnText}>Siparişi Tamamla →</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgBase,
    },
    pageTitle: {
        color: colors.textBase,
        fontSize: 20,
        fontWeight: '700',
        padding: spacing.lg,
        paddingBottom: spacing.sm,
    },
    list: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgContainer,
        borderRadius: radius.card,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    noImage: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: colors.textBase,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(249,177,122,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 20,
    },
    qtyValue: {
        color: colors.textBase,
        fontWeight: '700',
        fontSize: 15,
        minWidth: 20,
        textAlign: 'center',
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    subtotal: {
        color: colors.textBase,
        fontWeight: '700',
        fontSize: 14,
    },
    deleteBtn: {
        fontSize: 18,
    },
    // Alt bar
    summary: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.secondary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(249,177,122,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    totalLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    totalPrice: {
        color: colors.primary,
        fontSize: 22,
        fontWeight: '800',
    },
    checkoutBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.button,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: colors.bgBase,
        fontWeight: '800',
        fontSize: 16,
    },
    // Boş sepet
    emptyContainer: {
        flex: 1,
        backgroundColor: colors.bgBase,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
    },
    emptyTitle: {
        color: colors.textBase,
        fontSize: 22,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    browseBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: radius.button,
        marginTop: 8,
    },
    browseBtnText: {
        color: colors.bgBase,
        fontWeight: '700',
        fontSize: 15,
    },
});
