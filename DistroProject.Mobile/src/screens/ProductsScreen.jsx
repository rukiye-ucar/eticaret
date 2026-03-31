import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    Image,
    TextInput,
    ScrollView,
} from 'react-native';
import { getProducts, getCategories } from '../api/productService';
import { colors, radius, spacing } from '../theme';

const getImageUrl = (img, contentType) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `data:${contentType || 'image/png'};base64,${img}`;
};

export default function ProductsScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategoriesList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, selectedCategory, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
            setProducts(prods);
            const names = [...new Set(cats.map((c) => c.name))];
            setCategoriesList(names);
        } catch (e) {
            console.error('Veri çekme hatası:', e);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let temp = [...products];
        if (selectedCategory) {
            temp = temp.filter((p) =>
                p.categories?.some((c) => c.name === selectedCategory)
            );
        }
        if (search.trim()) {
            temp = temp.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredProducts(temp);
    };

    const renderProduct = ({ item }) => {
        const imgUrl = getImageUrl(item.image, item.imageContentType);
        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
                {imgUrl ? (
                    <Image source={{ uri: imgUrl }} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, styles.noImage]}>
                        <Text style={{ fontSize: 32 }}>📦</Text>
                    </View>
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.cardPrice}>${item.price}</Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Arama Kutusu */}
            <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Ürün ara..."
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Kategori Filtreleri */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
            >
                <Pressable
                    style={[styles.catChip, !selectedCategory && styles.catChipActive]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <Text style={[styles.catChipText, !selectedCategory && styles.catChipTextActive]}>
                        Tümü
                    </Text>
                </Pressable>
                {categories.map((cat) => (
                    <Pressable
                        key={cat}
                        style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                        onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    >
                        <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                            {cat}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Ürün Sayısı */}
            {!loading && (
                <Text style={styles.countText}>
                    {filteredProducts.length} ürün bulundu
                </Text>
            )}

            {/* Ürün Listesi */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
                </View>
            ) : filteredProducts.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ fontSize: 40 }}>🔍</Text>
                    <Text style={styles.emptyText}>Ürün bulunamadı</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgBase,
        paddingTop: spacing.md,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: radius.input,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: colors.textBase,
        fontSize: 14,
        paddingVertical: 10,
    },
    catRow: {
        paddingHorizontal: spacing.md,
        gap: 8,
        paddingBottom: spacing.sm,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'transparent',
        marginRight: 8,
    },
    catChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    catChipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    catChipTextActive: {
        color: colors.bgBase,
        fontWeight: '700',
    },
    countText: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xs,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        width: '48%',
        backgroundColor: colors.bgContainer,
        borderRadius: radius.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    cardImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    noImage: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        padding: spacing.sm,
    },
    cardName: {
        color: colors.textBase,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardPrice: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 8,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontWeight: '600',
    },
});
