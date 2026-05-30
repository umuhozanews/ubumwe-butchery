import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../constants/theme';

type ProductCardProps = {
  title: string;
  subtitle: string;
  price: string;
  image: ImageSourcePropType;
  width?: number;
};

export default function ProductCard({ title, subtitle, price, image, width }: ProductCardProps) {
  return (
    <View style={[styles.card, width ? { width } : {}]}>
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {price} <Text style={styles.unit}>RWF/kg</Text>
          </Text>
          <View style={styles.addBtn}>
            <Ionicons name="add" size={18} color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  imageWrapper: { backgroundColor: '#f5f5f5', height: 130, width: '100%' },
  image: { width: '100%', height: '100%' },
  body: { padding: 10 },
  title: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 2 },
  subtitle: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight, marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  unit: { fontFamily: fonts.regular, fontSize: 10, color: colors.textLight },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
