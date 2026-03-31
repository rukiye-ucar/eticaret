import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { colors } from './src/theme';
import { CartProvider } from './src/context/CartContext';

// Sayfalar
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import AccountScreen from './src/screens/AccountScreen';

const Tab = createBottomTabNavigator();

// Basit emoji ikonlar — isterseniz @expo/vector-icons ile değiştirin
const icon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: focused ? 24 : 20 }}>{emoji}</Text>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: colors.bgBase,      // #2d2250
                borderTopColor: 'rgba(255,255,255,0.1)',
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
              },
              tabBarActiveTintColor: colors.primary,    // #f9b17a
              tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
          >
            <Tab.Screen name="Ana Sayfa" component={HomeScreen} options={{ tabBarIcon: icon('🏠') }} />
            <Tab.Screen name="Ürünler" component={ProductsScreen} options={{ tabBarIcon: icon('🛍️') }} />
            <Tab.Screen name="Sepet" component={CartScreen} options={{ tabBarIcon: icon('🛒') }} />
            <Tab.Screen name="Hesabım" component={AccountScreen} options={{ tabBarIcon: icon('👤') }} />
          </Tab.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
