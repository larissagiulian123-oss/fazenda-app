import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { initDb } from './src/database/db';
import HomeScreen from './src/screens/HomeScreen';
import FuncionariosScreen from './src/screens/FuncionariosScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import LancamentoScreen from './src/screens/LancamentoScreen';
import FechamentoScreen from './src/screens/FechamentoScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'Início':      'home',
            'Lançamento':  'calendar',
            'Funcionários':'people',
            'Fechamento':  'cash',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#27ae60',
        tabBarLabelStyle: { fontSize: 13 },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Lançamento" component={LancamentoScreen} />
      <Tab.Screen name="Funcionários" component={FuncionariosScreen} />
      <Tab.Screen name="Fechamento" component={FechamentoScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => { initDb(); }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ title: 'Funcionário' }}
        />
        <Stack.Screen
          name="Relatórios"
          component={RelatoriosScreen}
          options={{ title: 'Relatórios' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}