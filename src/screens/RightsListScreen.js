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
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, get } from "firebase/database";

const RightsListScreen = () => {
  const navigation = useNavigation();
  const [rights, setRights] = useState([]);
  const [filteredRights, setFilteredRights] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRights = async () => {
      try {
        const db = getDatabase();
        const rightsRef = ref(db, "rights");
        const snapshot = await get(rightsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const rightsList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setRights(rightsList);
          setFilteredRights(rightsList.slice(0, 6)); // הצגת 6 זכויות ראשונות כברירת מחדל
        } else {
          console.log("אין נתונים להצגה");
        }
      } catch (error) {
        console.error("❌ שגיאה בטעינת זכויות:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRights();
  }, []);

  // **סינון זכויות לפי חיפוש**
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredRights(rights.slice(0, 6));
    } else {
      const filtered = rights.filter((right) =>
        right.title.includes(query)
      );
      setFilteredRights(filtered);
    }
  };

  // **סגירת החיפוש אם המשתמש גולל או לא מקליד**
  const handleScroll = () => {
    if (!searchQuery) {
      setShowSearch(false);
      Keyboard.dismiss();
    }
  };

    // **פתיחת הקישור של הזכות**
    const openRightLink = (url) => {
      if (url) {
        Linking.openURL(url).catch((err) =>
          console.error("שגיאה בפתיחת הקישור:", err)
        );
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>רשימת זכויות</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchIcon}>
          <Ionicons name="search" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* 🔍 חיפוש */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש זכויות..."
            placeholderTextColor="#007AFF"
            value={searchQuery}
            onChangeText={handleSearch}
            onBlur={handleScroll}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")} style={styles.clearSearch}>
              <Ionicons name="close" size={22} color="#007AFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

{loading ? (
        <ActivityIndicator size="large" color="#005A8D" style={{ marginTop: 20 }} />
      ) : filteredRights.length > 0 ? (
        <ScrollView contentContainerStyle={styles.rightsContainer} onScroll={handleScroll}>
          {filteredRights.map((right) => (
            <View key={right.id} style={styles.rightBox}>
              <Text style={styles.rightTitle}>{right.title}</Text>
              <Text style={styles.rightDescription}>{right.description}</Text>

              {right.link && (
                <TouchableOpacity onPress={() => openRightLink(right.link)} style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>מידע על הזכות</Text>
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
  rightsContainer: { paddingHorizontal: 15, paddingTop: 10 },
  rightBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rightTitle: { fontSize: 18, fontWeight: "bold", color: "#005A8D", marginTop: 10, textAlign: "right" },
  rightDescription: { fontSize: 14, color: "#555", textAlign: "right", marginTop: 5 },
  moreInfo: { fontSize: 14, color: "#007AFF", textAlign: "left", marginTop: -6 },
  noArticleText: { textAlign: "center", marginTop: 20, color: "#555" },
});

export default RightsListScreen;
