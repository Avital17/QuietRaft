import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getDatabase, ref, get } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SupportCentersScreen = () => {
  const navigation = useNavigation();
  const [supportCenters, setSupportCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchSupportCenters();
    requestLocation();
  }, []);

  // בקשת גישה למיקום
  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("גישה למיקום נדחתה");
      return;
    }
    let userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
  };

  // שליפת הנתונים מה-Database
  const fetchSupportCenters = async () => {
    try {
      const db = getDatabase();
      const centersRef = ref(db, "supportCenters");
      const snapshot = await get(centersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const centersArray = [];

        Object.keys(data).forEach((region) => {
          Object.keys(data[region]).forEach((id) => {
            centersArray.push({
              id: `${region}-${id}`, // זיהוי ייחודי
              ...data[region][id],
              region,
            });
          });
        });

        setSupportCenters(centersArray);
        setFilteredCenters(centersArray);
      }
    } catch (error) {
      console.error("שגיאה בטעינת הנתונים:", error);
    } finally {
      setLoading(false);
    }
  };

  // חיפוש מרכזי תמיכה לפי עיר/כתובת
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredCenters(supportCenters);
    } else {
      const filtered = supportCenters.filter((center) =>
        center.address.includes(query)
      );
      setFilteredCenters(filtered);
    }
  };

  // פתיחת מרכז ניווט לפי Google Maps או Waze
  const openNavigation = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const wazeUrl = `https://waze.com/ul?q=${encodedAddress}`;

    Linking.openURL(googleMapsUrl).catch(() =>
      Linking.openURL(wazeUrl).catch((err) =>
        console.error("שגיאה בניווט:", err)
      )
    );
  };

  // הצגת חלון אישור לפני חיוג
  const handleCall = (phoneNumber) => {
    Alert.alert(
      "אישור חיוג",
      `האם ברצונך לחייג למספר ${phoneNumber}?`,
      [
        { text: "ביטול", style: "cancel" },
        { text: "חייג", onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* כותרת וחיפוש */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>מרכזי תמיכה</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="חפש לפי עיר או כתובת..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView>
          {/* מפה */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 32.0853, // ברירת מחדל - תל אביב
                longitude: location?.longitude || 34.7818,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
            >
              {filteredCenters.map((center) => (
                <Marker
                  key={center.id}
                  coordinate={{
                    latitude: center.latitude || 32.0853,
                    longitude: center.longitude || 34.7818,
                  }}
                  title={center.name}
                  description={center.address}
                />
              ))}
            </MapView>
          </View>

          {/* רשימת מרכזים */}
          {filteredCenters.map((center) => (
            <View key={center.id} style={styles.centerBox}>
              <View style={styles.infoContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.centerName}>{center.name}</Text>
                  <Text style={styles.centerAddress}>{center.address}</Text>

                  {/* שורת טלפון + אייקון */}
                  <TouchableOpacity
                    style={styles.phoneContainer}
                    onPress={() => handleCall(center.phone)}
                  >
                    <Ionicons name="call" size={18} color="#007AFF" />
                    <Text style={styles.centerPhone}>{center.phone}</Text>
                  </TouchableOpacity>

                  {/* הצגת כפתור מעבר לאתר רק אם קיים URL */}
                  {center.url ? (
                    <TouchableOpacity onPress={() => Linking.openURL(center.url)}>
                      <Text style={styles.centerUrl}>🔗 לאתר המרכז</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* כפתור ניווט */}
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => openNavigation(center.address)}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.navButtonText}>פתח ניווט</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// 🎨 עיצוב
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#005A8D",
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  backButton: { padding: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    margin: 10,
    textAlign: "right",
    backgroundColor: "#fff",
  },
  mapContainer: { height: 250, width: "100%" },
  map: { flex: 1 },
  centerBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoContainer: { flexDirection: "row", justifyContent: "space-between" },
  textContainer: { flex: 1, marginRight: 10 },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  centerPhone: { fontSize: 14, color: "#555" },
  navButton: {
    backgroundColor: "#004080",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 8,
    width: 100,
  },
  navButtonText: { color: "#fff", fontSize: 14, marginLeft: 5 },
});

export default SupportCentersScreen;
