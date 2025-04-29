import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Modal, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Meditation = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);  // משך המדיטציה
  const [isMeditating, setMeditating] = useState(false);  // מצב המדיטציה (האם התחלנו או עצרנו)
  const [audioSound, setAudioSound] = useState(null);  // אובייקט המוזיקה
  const [isPlayingAudio, setPlayingAudio] = useState(false);  // מצב השמעת המוזיקה
  const [isModalVisible, setModalVisible] = useState(false);  // מצב המודאל
  const navigation = useNavigation();

  useEffect(() => {
    let timerId;

    // עצירה של הטיימר כאשר הגענו ל-0
    if (secondsRemaining === 0) {
      if (isPlayingAudio) audioSound?.pauseAsync();
      setMeditating(false);
      setPlayingAudio(false);
      return;
    }

    if (isMeditating) {
      // עדכון הטיימר כל שנייה
      timerId = setTimeout(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    }

    return () => clearTimeout(timerId);  // ניקוי ה-Timer אם השתנה המצב
  }, [secondsRemaining, isMeditating]);

  // הפונקציה המאתחלת את המוזיקה
  const initializeSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/audio/HoliznaPATREON - loving-kindness.mp3')  
    );
    setAudioSound(sound);
    return sound;
  };

  // פונקציה להשהות או להפעיל את המוזיקה
  const togglePlayPause = async () => {
    const sound = audioSound || await initializeSound();
    const status = await sound?.getStatusAsync();

    if (status?.isLoaded && !isPlayingAudio) {
      await sound?.playAsync();
      setPlayingAudio(true);
    } else {
      await sound?.pauseAsync();
      setPlayingAudio(false);
    }
  };

  // התחלת או הפסקת מדיטציה
  const toggleMeditationSessionStatus = () => {
    if (secondsRemaining === 0) setSecondsRemaining(15);  // אם הגענו ל-0, נתחיל מחדש
    setMeditating(!isMeditating);  // אם המדיטציה פועלת, נעצור, אם לא – נתחיל
    togglePlayPause();  // השמעה/הפסקה של המוזיקה
  };

  // עיצוב זמן שנותר בפורמט של דקות ושניות
  const formattedTimeMinutes = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const formattedTimeSeconds = String(secondsRemaining % 60).padStart(2, "0");

  // עדכון הזמן בתפריט
  const updateDuration = (time) => {
    setSecondsRemaining(time);
    setModalVisible(false); // סוגר את המודאל אחרי שבחרנו זמן
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/images/raft.jpeg')} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={40} color="white" />
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formattedTimeMinutes}:{formattedTimeSeconds}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {/* כפתור להתאמת זמן */}
            <TouchableOpacity style={styles.adjustButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.adjustButtonText}>התאמה</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMeditationSessionStatus} style={styles.button}>
              <Text style={styles.buttonText}>{isMeditating ? "עצור" : "התחל ספירה לאחור"}</Text>
            </TouchableOpacity>
          </View>

          {/* מודאל להתאמת זמן */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>התאם לזמן המדיטציה הרצוי</Text>

                {/* כפתורים להתאמת זמן */}
                <TouchableOpacity style={styles.modalButton} onPress={() => updateDuration(30)}>
                  <Text style={styles.modalButtonText}> 30 שניות  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => updateDuration(180)}>
                  <Text style={styles.modalButtonText}>3 דקות</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => updateDuration(300)}>
                  <Text style={styles.modalButtonText}>5  דקות</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => updateDuration(600)}>
                  <Text style={styles.modalButtonText}>10 דקות</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>סגור</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 41, 41, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0a4d4a',
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#005A8D',
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // מסך כהה מעל התמונה
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a4d4a',
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%',
  },
  adjustButton: {
    backgroundColor: '#0a4d4a',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0a4d4a',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Meditation;
