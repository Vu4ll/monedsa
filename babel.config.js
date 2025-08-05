module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    ["module-resolver", {
      root: ["./src"],
      alias: {
        "@components": "./src/components",
        "@screens": "./src/screens",
        "@services": "./src/services",
        "@utils": "./src/utils"
      }
    }],
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ]
};
