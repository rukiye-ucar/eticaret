import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

// Web'deki category veri yapısıyla aynı
const categories = [
    {
        id: 1,
        title: 'Sensors',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        emoji: '📡',
        gradientStart: '#8ba8cc',
        gradientEnd: '#050b14',
    },
    {
        id: 2,
        title: 'Mechanical',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        emoji: '⚙️',
        gradientStart: '#050b14',
        gradientEnd: '#8ba8cc',
    },
    {
        id: 3,
        title: 'Electronics',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        emoji: '🔌',
        gradientStart: '#8ba8cc',
        gradientEnd: '#050b14',
    },
];

export default function HomeScreen({ navigation }) {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.pageTitle}>Kategoriler</Text>

            {categories.map((cat) => (
                <Pressable
                    key={cat.id}
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                    onPress={() => navigation.navigate('Ürünler')}
                >
                    <View style={styles.cardInner}>
                        {/* Text Section */}
                        <View style={styles.textSection}>
                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                            <Text style={styles.categoryDesc}>{cat.description}</Text>
                            <View style={styles.shopBtn}>
                                <Text style={styles.shopBtnText}>Ürünleri Gör →</Text>
                            </View>
                        </View>

                        {/* Image / Emoji Section */}
                        <View style={styles.imageSection}>
                            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                        </View>
                    </View>
                </Pressable>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgBase,   // #2d2250
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textBase,
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.bgContainer,  // #576f9d
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        // Android
        elevation: 6,
        marginBottom: spacing.sm,
    },
    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
        justifyContent: 'space-between',
    },
    textSection: {
        flex: 1,
        paddingRight: spacing.md,
    },
    categoryTitle: {
        color: colors.primary,  // #f9b17a
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    categoryDesc: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 14,
    },
    shopBtn: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.button,
    },
    shopBtnText: {
        color: colors.bgBase,
        fontWeight: '700',
        fontSize: 13,
    },
    imageSection: {
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 35,
    },
    categoryEmoji: {
        fontSize: 36,
    },
});
