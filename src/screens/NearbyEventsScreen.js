import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import * as Location from "expo-location"; // ייבוא expo-location
import MapView, { Marker } from "react-native-maps"; // ייבוא של המפה וסמלים
import eventsData from "../assets/data/events.json"; // אירועים מדמה

const NearbyEventsScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null); // מיקום המשתמש
  const [errorMsg, setErrorMsg] = useState(null); // שגיאה
  const [filteredEvents, setFilteredEvents] = useState([]); // אירועים מסוננים
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // האירוע שנבחר לצפייה

  const netivotCoordinates = {
    latitude: 31.5073,
    longitude: 34.5777,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("גישה למיקום נדחתה");
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setLoading(false);

      // סינון אירועים לפי קרבה
      const nearbyEvents = eventsData.filter((event) => {
        const distance = calculateDistance(
          netivotCoordinates.latitude,
          netivotCoordinates.longitude,
          event.latitude,
          event.longitude
        );
        return distance <= 50; // 50 ק"מ
      });

      setFilteredEvents(nearbyEvents);
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // רדיוס כדור הארץ בק"מ
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // מרחק בק"מ
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event); // הצגת פרטי האירוע שנבחר
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>טוען נתונים...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* כפתור חזרה */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* מודל פרטי אירוע */}
      {selectedEvent && (
        <Modal
          visible={selectedEvent !== null}
          animationType="slide"
          onRequestClose={() => setSelectedEvent(null)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
            <Text style={styles.modalDate}>{selectedEvent.date}</Text>
            <Text style={styles.modalLocation}>{selectedEvent.location}</Text>
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <Text style={styles.closeButton}>סגור</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* כותרת מעל המפה */}
      <View style={styles.header}>
        <Text style={styles.headerText}>אירועים ומופעים בקרבתך</Text>
      </View>

      {/* המפה תופסת חצי מהמסך בתחתית */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: netivotCoordinates.latitude,
            longitude: netivotCoordinates.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              title={event.title}
              description={event.location}
              onPress={() => handleEventPress(event)} // הצגת פרטי האירוע
            />
          ))}
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 19,
  },
  header: {
    position: "absolute", // ממקם את הטקסט בצורה מוחלטת
    top: 60, // קצת מעל המפה
    left: 150,
    right: 20,
    flexDirection: "row", // כדי להניח את החץ והטקסט באותו קו אופקי
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1, // המפה תופסת את כל השטח הנותר
    width: "100%",
    marginTop: 400, // לא תהיה רווח מלמעלה
  },
  map: {
    flex: 1,
    width: "100%",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  modalDate: {
    fontSize: 18,
    color: "#555",
  },
  modalLocation: {
    fontSize: 16,
    color: "#777",
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
    marginTop: 10,
  },
});

export default NearbyEventsScreen;