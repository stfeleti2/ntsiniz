import "react-native-gesture-handler"
import { LogBox } from "react-native"
import { registerRootComponent } from "expo"

LogBox.ignoreLogs([
  "[expo-av]: Expo AV has been deprecated",
])

const originalWarn = console.warn.bind(console)
console.warn = (...args) => {
  const first = String(args?.[0] ?? "")
  if (first.includes("[expo-av]: Expo AV has been deprecated")) return
  originalWarn(...args)
}

const App = require("./App").default

registerRootComponent(App)
