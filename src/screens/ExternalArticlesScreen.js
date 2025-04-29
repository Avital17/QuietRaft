

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, get } from "firebase/database"; 

const imageMapping = {
  "family.jpg": require("../assets/images/family.jpg"),
  "air.jpg": require("../assets/images/air.jpg"),
  "smile.jpg": require("../assets/images/smile.jpg"),
  "calm.jpg": require("../assets/images/calm.jpg"),
  "huge.jpg": require("../assets/images/huge.jpg"),
  "positive.jpg": require("../assets/images/positive.jpg"),
  "yoga.jpg": require("../assets/images/yoga.jpg"),
  "flower.jpg": require("../assets/images/flower.jpg"),
};

const ExternalArticlesScreen = () => {
  const navigation = useNavigation();
  const [articles, setArticles] = useState([]); 
  const [filteredArticles, setFilteredArticles] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      console.log("🔹 מנסה לטעון את רשימת הכתבות");

      try {
        const db = getDatabase();
        const articlesRef = ref(db, "articles"); 
        const snapshot = await get(articlesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("✅ כתבות נטענו בהצלחה:", data);

          const articlesList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          setArticles(articlesList);
          setFilteredArticles(articlesList.slice(0, 4)); 
        } else {
          console.log("❌ אין נתונים להצגה");
        }
      } catch (error) {
        console.error("❌ שגיאה בטעינת כתבות:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // **סינון כתבות לפי חיפוש**
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredArticles(articles.slice(0, 4)); 
    } else {
      const filtered = articles.filter(
        (article) =>
          article.title.includes(query) 
      );
      setFilteredArticles(filtered.slice(0, 4)); 
    }
  };

    // **סגירת החיפוש אם המשתמש לא הקליד כלום וניסה לגלול**
    const handleScroll = () => {
      if (!searchQuery) {
        setShowSearch(false);
        Keyboard.dismiss();
      }
    };
 
  // **פתיחת הכתבה באתר חיצוני**
  const openArticleLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("❌ שגיאה בפתיחת הקישור:", err));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>מאמרים חיצוניים</Text>
        </View>

        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchIcon}>
          <Ionicons name="search" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/*חיפוש */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש מאמרים..."
            placeholderTextColor="#007AFF"
            value={searchQuery}
            onChangeText={handleSearch}
            onBlur={handleScroll} // אם המשתמש לוחץ מחוץ לחיפוש הוא ייסגר
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")} style={styles.clearSearch}>
              <Ionicons name="close" size={22} color="#007AFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}


      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : filteredArticles.length > 0 ? (
        <ScrollView contentContainerStyle={styles.articlesContainer} onScroll={handleScroll}>
          {filteredArticles.map((article) => (
            <View key={article.id} style={styles.articleBox}>
              {article.image && imageMapping[article.image] ? (
                <Image source={imageMapping[article.image]} style={styles.articleImage} />
              ) : (
                <View style={styles.noImagePlaceholder} /> // אם אין תמונה, שומר על מבנה אחיד
              )}

              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDescription}>{article.description}</Text>

              {article.link && (
                <TouchableOpacity onPress={() => openArticleLink(article.link)}>
                  <Text style={styles.readMore}>להמשך קריאה באתר &gt;</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noArticleText}> לא נמצאו נתונים</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#005A8D",
    paddingTop: 100,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    top: 40,
    left: "50%",
    transform: [{ translateX: -50 }],
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    paddingTop: 10,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: { position: "absolute", left: 20, top: 50 },
  searchIcon: { position: "absolute", right: 20, top: 50 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
  },
 
  searchInput: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    paddingBottom: 8,
    width: "85%",
    backgroundColor: "#fff",
    textAlign: "right",
  },
  clearSearch: { marginLeft: 10 },
 
  articlesContainer: { paddingHorizontal: 15, paddingTop: 10 },
  articleBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  articleImage: { width: "100%", height: 150, borderRadius: 10 },
  noImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
  articleTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 10, textAlign: "right" },
  articleDescription: { fontSize: 14, color: "#555", textAlign: "right", marginTop: 5 },
  readMore: { fontSize: 14, color: "#007AFF", textAlign: "right", marginTop: 10 },
  noArticleText: { textAlign: "center", marginTop: 20, color: "#555" },
});

export default ExternalArticlesScreen;
