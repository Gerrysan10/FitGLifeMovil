import React from "react";
import Navigation from "./Navigation";
import { AuthProvider } from './AuthContext';
import { useFonts,Poppins_500Medium,Poppins_600SemiBold, Poppins_400Regular} from '@expo-google-fonts/poppins';


export default function App() {
  const poppins500 = Poppins_500Medium;
  const poppins600 = Poppins_600SemiBold;
  const poppins400 = Poppins_400Regular;
  let [fontsLoaded] = useFonts({
    poppins500,
    poppins600,
    poppins400
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

