import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import SearchScreen from './screens/shearchscreen';
import BookTransaction from './screens/booktransactionscreen';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createAppContainer } from 'react-navigation';

export default class App extends React.Component {
  render(){
  return (
      <AppContainer></AppContainer>
  );}
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {
    screen: BookTransaction
  },
  Search: {
    screen: SearchScreen
  }
},{
  defaultNavigationOptions: ({navigation})=>({
    tabBarIcon: ()=>{
      const RouteName = navigation.state.routeName
      if(RouteName === "Transaction"){
        return(
          <Image source={require("./assets/book.png")} style={{height: 40, width: 40}}></Image>
        )
      } else if(RouteName === "Search"){
          return <Image source={require("./assets/searchingbook.png")} style={{height: 40, width: 40}}></Image>
      }
    }
  })
})

const AppContainer = createAppContainer(TabNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

