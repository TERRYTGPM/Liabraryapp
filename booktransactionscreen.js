import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../configfiles';
import { ToastAndroid } from 'react-native';

export default class BookTransaction extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      scannedStudentID: '',
      scannedBookID: '',
      buttonState: 'normal',
      transactionmessage: '',
    };
  }

  getCameraPermissions = async (ID) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermission: status === 'granted',
      buttonState: ID,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state;
    if (buttonState === 'bookID') {
      this.setState({
        scanned: true,
        scannedBookID: data,
        buttonState: 'normal',
      });
    } else if (buttonState === 'studentID') {
      this.setState({
        scanned: true,
        scannedStudentID: data,
        buttonState: 'normal',
      });
    }

  };

  initiateBookIssue = async () => {
    db.collection('transactions').add({
      studentId: this.state.scannedStudentID,
      bookId: this.state.scannedBookID,
      dateIssued: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'issue',
    });
    db.collection('books').doc(this.state.scannedBookID).update({
      bookAvailability: false,
    });
    db.collection('students')
      .doc(this.state.scannedStudentID)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });
    Alert.alert('book issued');
    this.setState({
      scannedBookID: '',
      scannedStudentID: '',
    });
  };

  initiateBookReturn = async () => {
    db.collection('transactions').add({
      studentId: this.state.scannedStudentID,
      bookId: this.state.scannedBookID,
      dateIssued: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'return',
    });
    db.collection('books').doc(this.state.scannedBookID).update({
      bookAvailability: true,
    });
    db.collection('students')
      .doc(this.state.scannedStudentID)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });
    Alert.alert('Book returned');
    this.setState({
      scannedBookID: '',
      scannedStudentID: '',
    });
  };





  checkStudentEligibility = async()=>{

    const studentref = db.collection("students").where("studentId", "==", this.state.scannedStudentID).get();
    var isStudentEligible = "";
    if(studentref.docs.length === 0){

      this.setState({
        scannedBookID: '',
        scannedStudentID: ''
      })
      ToastAndroid.show("no", ToastAndroid.SHORT);
      isStudentEligible = false;
    }else {
      studentref.docs.map((doc)=>{
        var student = doc.data();
        if(student.numberOfBooksIssued < 2){
          isStudentEligible = true;

        }else{
          isStudentEligible = false;
          Alert.alert("The student alredy has tow books issued");
          this.setState({
            scannedStudentID: '',
            scannedBookID: ''
          })
        }
      })
    }
    return isStudentEligible
  }

  checkStudentEligibilityForBookReturn = async()=>{
    const transactionref = db.collection("transactions").where("bookId", "==", this.state.scannedBookID).limit(1).get();
    var isStudentEligiblepart2 = "";
    transactionref.docs.map((doc)=>{
      var lasttransaction = doc.data();
      if(lasttransaction.studentId === this.state.scannedStudentID){
          isStudentEligiblepart2 = true;
      }else {
        isStudentEligiblepart2 = false;
        this.setState({
          scannedBookID: '',
          scannedStudentID: ''
        })
        Alert.alert("This student is not eligible for book return")
      }
    })
    return isStudentEligiblepart2
  }

  checkBookEligibility = async()=>{
    
    db.collection("books").where("bookId" , "==" , this.state.scannedBookID).get().then((doc)=>{
      
var transactionType = '';
    
        var book = doc.data();
        console.log(book);
        if(book.bookAvailability === true){
          transactionType = "issue"
        } else {
          transactionType = "return";
        }
      })
      return transactionType;
    }





  handleTransactions = async () => {

    var transactionType = await this.checkBookEligibility();
    if(transactionType === false){

      Alert.alert("This book does not exist.");
      this.setState({
        scannedBookID: '',
        scannedStudentID: ''
      })

    }else if(transactionType === "issue"){
      var isStudentEligible = await this.checkStudentEligibility();
        if(isStudentEligible === true){
          this.initiateBookIssue();
          ToastAndroid.show("book issued", ToastAndroid.SHORT);
        }
    } else {
        var makeavariable = await this.checkStudentEligibilityForBookReturn();
        if(makeavariable === true){
          this.initiateBookReturn();
          ToastAndroid.show("Book Returned", ToastAndroid.SHORT);
        }
    }

  };

  render() {
    const hasCameraPermission = this.state.hasCameraPermission;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== 'normal' && hasCameraPermission === true) {
      return (
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={
            scanned ? undefined : this.handleBarCodeScanned
          }></BarCodeScanner>
      );
    } else if (buttonState === 'normal') {
          console.log(this.state.scannedBookID);
           console.log(this.state.scannedStudentID);
      return (
        
        <View style={styles.container}>
          <View>
            <Image
              source={require('../assets/booklogo.jpg')}
              style={{ width: 200, height: 200 }}></Image>
          </View>
          <View style={{ flexDirection: 'row', margin: 20 }}>
            <TextInput
              placeholder="enter book ID"
              value={this.state.scannedBookID}
              style={{
                width: 200,
                height: 40,
                borderWidth: 1.5,
                borderRightWidth: 0,
                fontSize: 20,
              }}
              onChangeText={(text) => {
                this.setState({
                  scannedBookID: text,
                });
              }}></TextInput>

            <TouchableOpacity
              onPress={() => {
                this.getCameraPermissions('bookID');
              }}
              style={{
                backgroundColor: 'blue',
                width: 50,
                borderWidth: 1.5,
                borderLeftWidth: 0,
              }}>
              <Text
                style={{ fontSize: 15, textAlign: 'center', marginTop: 10 }}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', margin: 20 }}>
            <TextInput
              placeholder="enter student ID"
              value={this.state.scannedStudentID}
              style={{
                width: 200,
                height: 40,
                borderWidth: 1.5,
                borderRightWidth: 0,
                fontSize: 20,
              }}
              onChangeText={(text) => {
                this.setState({
                  scannedStudentID: text,
                });
              }}></TextInput>

            <TouchableOpacity
              onPress={() => {
                this.getCameraPermissions('studentID');
              }}
              style={{
                backgroundColor: 'blue',
                width: 50,
                borderWidth: 1.5,
                borderLeftWidth: 0,
              }}>
              <Text
                style={{ textAlign: 'center', marginTop: 10, fontSize: 15 }}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              width: 100,
              height: 50,
            }}
            onPress={this.handleTransactions}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'purple',
                padding: 10,
              }}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
