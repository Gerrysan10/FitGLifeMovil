import NetInfo from '@react-native-community/netinfo';

export const Verificar_conexion = async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected;
    } catch (error) {
      return false;
    }
  }