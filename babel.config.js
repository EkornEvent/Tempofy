module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "api": ["./src/api"],
          "components": ["./src/components"],
          "hooks": ["./src/hooks"],
          "screens": ["./src/screens"]
        }
      }
    ]
  ]
}