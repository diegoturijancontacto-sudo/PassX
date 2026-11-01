import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL =
  'https://accesoqr.buap.mx/api/infoqr/cGdwdnd1V0puUzZzNCtmREZ4MExZMk9Ib0FnTXI5dmVJK2FsKytZa2dXZz0=';

export default function WalletCard() {
  const [token, setToken] = useState<string | null>(null);
  const [fechas, setFechas] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  // Valores animados
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current; // Zoom x2 de la tarjeta al girar
  const qrZoomAnim = useRef(new Animated.Value(0.4)).current;  // Estampa inicial para el QR
  const qrOpacityAnim = useRef(new Animated.Value(0)).current; // Revelación del QR

  useEffect(() => {
    fetchToken();
  }, []);

  async function fetchToken() {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();

      if (data?.token?.token) {
        setToken(data.token.token);
        setFechas(data.fechas || '—');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFlip = () => {
    if (loading || !token) return;

    const nextFlipped = !isFlipped;
    const toValue = nextFlipped ? 180 : 0;

    if (nextFlipped) {
      // Giramos y hacemos zoom x2 a la tarjeta
      Animated.parallel([
        Animated.timing(flipAnim, {
          toValue,
          duration: 650,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 2.0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de la estampa QR revelándose
      qrZoomAnim.setValue(0.5);
      qrOpacityAnim.setValue(0);

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(qrZoomAnim, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(qrOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);

    } else {
      // Regresamos la tarjeta y el QR a su estado original
      Animated.parallel([
        Animated.timing(flipAnim, {
          toValue,
          duration: 650,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      qrZoomAnim.setValue(0.4);
      qrOpacityAnim.setValue(0);
    }

    setIsFlipped(nextFlipped);
  };

  // Interpolaciones de rotación 3D
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.mainContainer}>
      {/* Halo de luz difusa exterior suavizado */}
      <View style={styles.externalGlowBackground} pointerEvents="none" />

      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleFlip}
        style={styles.cardWrapper}
      >
        {/* ================= CARA FRONTAL ================= */}
        <Animated.View
          style={[
            styles.card,
            styles.cardGlowFront,
            {
              transform: [
                { perspective: 1200 },
                { rotateY: frontInterpolate },
                { scale: cardScaleAnim },
              ],
            },
          ]}
        >
          <ImageBackground
            source={require('../../assets/images/CartBackground.jpg')}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.blueTintContainer}>
              <View style={styles.glassBorder} />

              {/* Reflejo azul difuso inferior atenuado */}
              <LinearGradient
                colors={['transparent', 'rgba(0, 122, 255, 0.2)', 'rgba(0, 198, 255, 0.35)']}
                style={styles.bottomGlowOutward}
                pointerEvents="none"
              />

              <View style={styles.header}>
                <View>
                  <Text style={styles.institutionFront}>BUAP</Text>
                  <Text style={styles.logoFront}>Credencial Digital</Text>
                </View>
                <View style={styles.chip}>
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </View>
              </View>

              <View style={styles.body}>
                <Text style={styles.labelFront}>ESTADO</Text>
                <Text style={styles.statusTextFront}>
                  {loading ? 'Sincronizando...' : 'Acceso Autorizado'}
                </Text>
                {fechas ? (
                  <Text style={styles.fechasFront}>Vigencia: {fechas}</Text>
                ) : null}
              </View>

              <View style={styles.footer}>
                <Text style={styles.tapHintFront}>Toca para voltear ↺</Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* ================= CARA TRASERA (QR) ================= */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            styles.cardGlowBack,
            {
              transform: [
                { perspective: 1200 },
                { rotateY: backInterpolate },
                { scale: cardScaleAnim },
              ],
            },
          ]}
        >
          <ImageBackground
            source={require('../../assets/images/CartBackground.jpg')}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={['rgba(10, 20, 35, 0.95)', 'rgba(5, 10, 20, 0.99)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.glassBorder} />

              {/* Reflejo azul eléctrico inferior atenuado */}
              <LinearGradient
                colors={['transparent', 'rgba(0, 140, 255, 0.25)', 'rgba(100, 210, 255, 0.4)']}
                style={styles.bottomGlowOutward}
                pointerEvents="none"
              />

              {/* Contenedor del QR con zoom de estampa */}
              <View style={styles.qrContainer}>
                {token ? (
                  <Animated.View
                    style={[
                      styles.qrWrapper,
                      {
                        transform: [{ scale: qrZoomAnim }],
                        opacity: qrOpacityAnim,
                      },
                    ]}
                  >
                    <QRCode
                      value={token}
                      size={120}
                      backgroundColor="#FFFFFF"
                      color="#002D62"
                    />
                  </Animated.View>
                ) : (
                  <ActivityIndicator color="#00C6FF" size="large" />
                )}
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#040810',
  },
  // Halo exterior reducido de intensidad (opacidad y radio ajustados)
  externalGlowBackground: {
    position: 'absolute',
    width: 300,
    height: 180,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 100,
    transform: [{ scale: 1.8 }],
    opacity: 0.35,
  },
  cardWrapper: {
    width: 320,
    height: 202,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    overflow: 'visible',
  },
  // Sombras y resplandores exteriores reducidos 2.5 veces en opacidad
  cardGlowFront: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  cardGlowBack: {
    shadowColor: '#00C6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 16,
  },
  blueTintContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 102, 204, 0.15)',
  },
  gradientOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 210, 255, 0.35)', // Borde exterior más sutil
    pointerEvents: 'none',
  },
  // Reflejo difuso inferior expansivo más suave
  bottomGlowOutward: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    right: -10,
    height: 65,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.5,
  },
  // Estilos Cara Frontal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  institutionFront: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 122, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  logoFront: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.4,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#38BDF8',
    justifyContent: 'space-evenly',
    paddingHorizontal: 6,
    opacity: 0.9,
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0, 30, 80, 0.4)',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 8,
  },
  labelFront: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(186, 230, 253, 0.9)',
    fontWeight: '600',
  },
  statusTextFront: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0, 122, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  fechasFront: {
    color: 'rgba(224, 242, 254, 0.9)',
    fontSize: 11,
    marginTop: 4,
  },
  footer: {
    alignItems: 'flex-start',
  },
  tapHintFront: {
    color: 'rgba(186, 230, 253, 0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
  // Estilos Cara Trasera
  cardBack: {
    alignItems: 'center',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#00C6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
