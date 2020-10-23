import React, { Component } from "react";
import {
  View,
  Text,
  Button,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
} from "react-native";
import Tuner from "./tuner";
import Note from "./note";
import Meter from "./meter";

export default class App extends Component {
  state = {
    scale: 0,
    note: {
      name: "A",
      octave: 4,
      frequency: 440,
    },
  };

  noteStrings = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
  ];


  _update(note) {
    this.setState({ note });
  }

  /**
   * converts the alpha note to number 1 to 7 depending on the scale
   * if scale = 2 (i.e. D),
   * then 1=D(noteStrings[2]), 2=E(ns[4]), 3=F#(ns[6]) 4=G(ns[7]) 5=A(ns[9]) 6=B(ns[11]) 7=C#(ns[1])
   * if scale = 5 (i.e. F),
   * then 1=F(noteStrings[5]), 2=G(ns[7]), 3=A(ns[9]) 4=A#(ns[10]) 5=C(ns[0]) 6=D(ns[2]) 7=E(ns[4])
   * i.e.
   * +0, +2, +4, +5, +7, +9, +11 (2+11 = 13 == 1),
   */

  toJianPuNote(scale, note) {
    diff = (note.value - scale)%12
    jianpu = 0
    scaleDiff = [0, 2, 4, 5, 7, 9, 11]
    for (i = 0; i < scaleDiff.length; i++) {
      if (diff == scaleDiff[i]) {
        jianpu = i+1
      }
    }
    return {
      name: jianpu.toString(),
      octave: note.octave,
      frequency: note.frequency,
    }
  }

  async componentDidMount() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }

    const tuner = new Tuner();
    tuner.start();
    tuner.onNoteDetected = (note) => {
      if (this._lastNoteName === note.name) {
        this._update(note);
      } else {
        this._lastNoteName = note.name;
      }
    };
  }

  render() {
    return (
      <View style={style.body}>
        <StatusBar backgroundColor="#000" translucent />
        <Meter cents={this.state.note.cents} />
        <Note {...this.state.note} />
        <Note {...this.toJianPuNote(this.state.scale, this.state.note)} />
        <Text style={style.frequency}>
          {this.state.note.frequency.toFixed(1)} Hz,
          1={this.noteStrings[this.state.scale]}
        </Text>
        <View style={style.scale}>
          <View style={style.button}>
            <Button
            style={this.state.button}
            title="1=D"
            onPress={() => this.setState({scale:2})}
            />
          </View>
          <View style={style.button}>
            <Button
            style={this.state.button}
            title="1=F"
            onPress={() => this.setState({scale:5})}
            />
          </View>
          <View style={style.button}>
            <Button
            style={this.state.button}
            title="1=G"
            onPress={() => this.setState({scale:7})}
            />
          </View>
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  scale:{
    width: "100%",
    display:"flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  button:{
    flex:1,
    padding:10,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frequency: {
    fontSize: 28,
    color: "#37474f",
  },
});
