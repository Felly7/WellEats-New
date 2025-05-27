// app/help/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Linking, useColorScheme } from 'react-native';

export default function HelpScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={[styles.container, isDarkMode && styles.darkBg]}>
      <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#000' }]}>
        Need Help?
      </Text>
      <Text style={[styles.paragraph, { color: isDarkMode ? '#CCC' : '#333' }]}>
        Email us at{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('mailto:support@welleats.app')}
        >
          support@welleats.app
        </Text>
        {'\n'}or visit our FAQs on the website.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#FFF' },
  darkBg:    { backgroundColor:'#121212' },
  header:    { fontSize:22, fontWeight:'bold', marginBottom:16 },
  paragraph: { fontSize:16, lineHeight:24 },
  link:      { color:'#358600', textDecorationLine:'underline' },
});
