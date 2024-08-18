const path = require("path");

const taskBoard = {
  entry: {
    index: "./src/features/kanban_board/app/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "resources/task_board"),
    filename: "[name].js"
  },
  devtool: "eval-source-map",
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {}
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
};

const mainPanel = {
  entry: {
    index: "./src/features/main_panel/webview/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "resources/main_panel"),
    filename: "[name].js"
  },
  devtool: "eval-source-map",
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {}
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
};

module.exports = [taskBoard, mainPanel];